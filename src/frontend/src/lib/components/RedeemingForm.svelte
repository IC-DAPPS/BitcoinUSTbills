<script lang="ts">
	import { authStore } from '$lib/stores/auth.store';
	import { userSate } from '$lib/state/user.svelte';
	import { ousgBalance, fetchOUSGBalance } from '$lib/state/ousg-balance.svelte';
	import { redeemOUSG } from '$lib/services/redeeming.service';
	import { getCurrentBTCPrice } from '$lib/services/minting.service';
	import { toast } from 'svelte-sonner';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';

	let ousgAmount = $state('');
	let btcPrice = $state(0);
	let expectedCkBTC = $state(0n);
	let isRedeeming = $state(false);

	// Fetch BTC price on component mount
	$effect(() => {
		if ($authStore.isAuthenticated) {
			getCurrentBTCPrice().then((price) => {
				if (price) {
					btcPrice = price;
				}
			});
		}
	});

	// Calculate expected ckBTC when OUSG amount changes
	$effect(() => {
		if (ousgAmount && btcPrice > 0) {
			const amount = parseFloat(ousgAmount);
			if (amount > 0) {
				const usdValue = amount; // OUSG is 1:1 with USD
				const btcValue = usdValue / btcPrice;
				expectedCkBTC = BigInt(Math.floor(btcValue * 100_000_000)); // Convert to satoshis
			}
		}
	});

	const handleRedeem = async () => {
		if (!$authStore.isAuthenticated) {
			toast.error('Please log in to redeem OUSG tokens');
			return;
		}

		if (!userSate.profile || userSate.profile.kyc_status !== 'Verified') {
			toast.error('KYC verification is required to redeem OUSG tokens');
			return;
		}

		const amount = parseFloat(ousgAmount);
		if (!amount || amount <= 0) {
			toast.error('Please enter a valid OUSG amount');
			return;
		}

		const ousgAmountBigInt = BigInt(Math.floor(amount * 1_000_000)); // Convert to units

		if (ousgBalance.balance < ousgAmountBigInt) {
			toast.error('Insufficient OUSG balance');
			return;
		}

		isRedeeming = true;

		try {
			const result = await redeemOUSG(ousgAmountBigInt);
			if (result.success) {
				ousgAmount = '';
				expectedCkBTC = 0n;
			}
		} catch (error) {
			console.error('Redeeming error:', error);
			toast.error('Failed to redeem OUSG tokens');
		} finally {
			isRedeeming = false;
		}
	};

	const setMaxAmount = () => {
		if (ousgBalance.balance > 0n) {
			ousgAmount = (Number(ousgBalance.balance) / 1_000_000).toString();
		}
	};

	const isDisabled = $derived(
		!$authStore.isAuthenticated ||
			!userSate.profile ||
			userSate.profile.kyc_status !== 'Verified' ||
			!ousgAmount ||
			parseFloat(ousgAmount) <= 0 ||
			parseFloat(ousgAmount) < 1 ||
			ousgBalance.balance < BigInt(Math.floor((parseFloat(ousgAmount) || 0) * 1_000_000)) ||
			isRedeeming
	);

	const buttonText = $derived(() => {
		if (!$authStore.isAuthenticated) return 'Connect to redeem';
		if (!userSate.profile || userSate.profile.kyc_status !== 'Verified') return 'KYC required';
		if (isRedeeming) return 'Redeeming...';
		return 'Redeem OUSG';
	});
</script>

<div class="card p-6">
	<h2 class="text-xl font-semibold text-primary mb-6">Redeem OUSG Tokens</h2>

	<div class="space-y-4">
		<!-- OUSG Amount Input -->
		<div>
			<label for="ousg-amount" class="block text-sm font-medium text-primary mb-2">
				OUSG Amount
			</label>
			<div class="relative">
				<Input
					id="ousg-amount"
					type="number"
					step="0.000001"
					min="1"
					bind:value={ousgAmount}
					placeholder="Enter OUSG amount (minimum 1)"
					disabled={isRedeeming}
					class="pr-20"
				/>
				<button
					type="button"
					onclick={setMaxAmount}
					disabled={isRedeeming || ousgBalance.balance === 0n}
					class="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					MAX
				</button>
			</div>
			<p class="text-xs text-secondary mt-1">
				Balance: {(Number(ousgBalance.balance) / 1_000_000).toFixed(6)} OUSG
			</p>
		</div>

		<!-- Expected ckBTC Display -->
		{#if expectedCkBTC > 0n}
			<div class="bg-green-50 border border-green-200 rounded-lg p-4">
				<div class="flex justify-between items-center">
					<span class="text-sm font-medium text-green-800">Expected ckBTC:</span>
					<span class="text-lg font-bold text-green-900">
						{(Number(expectedCkBTC) / 100_000_000).toFixed(8)} ckBTC
					</span>
				</div>
				{#if btcPrice > 0}
					<p class="text-xs text-green-600 mt-1">
						Based on BTC price: ${btcPrice.toLocaleString()}
					</p>
				{/if}
			</div>
		{/if}

		{#if !$authStore.isAuthenticated}
			<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
				<p class="text-sm text-yellow-800">Please connect your wallet to redeem OUSG tokens.</p>
			</div>
		{:else if !userSate.profile || userSate.profile.kyc_status !== 'Verified'}
			<div class="bg-red-50 border border-red-200 rounded-lg p-4">
				<p class="text-sm text-red-800">KYC verification is required to redeem OUSG tokens.</p>
			</div>
		{/if}

		<Button onclick={handleRedeem} disabled={isDisabled} class="w-full">
			{#if isRedeeming}
				<LoadingSpinner />
			{/if}
			{buttonText}
		</Button>
	</div>
</div>
