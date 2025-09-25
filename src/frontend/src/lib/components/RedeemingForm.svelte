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
	let expectedCKBTC = $state(0n);
	let isRedeeming = $state(false);
	let isLoading = $state(false);

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
				const usdValue = amount * 5000; // Each OUSG = $5000
				const ckbtcValue = (usdValue / btcPrice) * 100_000_000; // Convert to satoshis
				expectedCKBTC = BigInt(Math.floor(ckbtcValue));
			}
		}
	});

	const handleRedeem = async () => {
		if (!$authStore.isAuthenticated) {
			toast.error('Please log in to redeem OUSG tokens');
			return;
		}

		if (!userSate.profile || userSate.profile.kyc_status !== 'Verified') {
			toast.error('KYC verification required to redeem OUSG tokens');
			return;
		}

		if (!ousgAmount || parseFloat(ousgAmount) <= 0) {
			toast.error('Please enter a valid OUSG amount');
			return;
		}

		if (parseFloat(ousgAmount) < 1) {
			toast.error('Minimum redeem amount is 1 OUSG token');
			return;
		}

		if (ousgBalance.balance < BigInt(Math.floor(parseFloat(ousgAmount) * 1_000_000))) {
			toast.error('Insufficient OUSG balance');
			return;
		}

		isRedeeming = true;
		isLoading = true;

		try {
			// Convert OUSG amount to bigint (assuming 6 decimals)
			const ousgAmountBigInt = BigInt(Math.floor(parseFloat(ousgAmount) * 1_000_000));

			const result = await redeemOUSG(ousgAmountBigInt);

			if (result.success) {
				toast.success(`Successfully redeemed ${ousgAmount} OUSG tokens`);
				ousgAmount = '';
				expectedCKBTC = 0n;
				// Refresh balance
				await fetchOUSGBalance();
			} else {
				toast.error(result.errorMessage || 'Failed to redeem OUSG tokens');
			}
		} catch (error) {
			console.error('Error redeeming OUSG:', error);
			toast.error('Failed to redeem OUSG tokens');
		} finally {
			isRedeeming = false;
			isLoading = false;
		}
	};

	function formatOUSGAmount(amount: bigint): string {
		const formatted = Number(amount) / 1_000_000; // Convert from units to tokens
		return formatted.toFixed(6);
	}

	function formatCKBTCAmount(amount: bigint): string {
		const formatted = Number(amount) / 100_000_000; // Convert from satoshis to BTC
		return formatted.toFixed(8);
	}

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

<div class="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
	<h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Redeem OUSG Tokens</h2>

	<div class="space-y-4">
		<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
			<div class="flex justify-between items-center">
				<span class="text-sm font-medium text-blue-700">Your OUSG Balance:</span>
				<span class="text-sm text-blue-900 font-semibold">
					{formatOUSGAmount(ousgBalance.balance)}
				</span>
			</div>
		</div>

		<div>
			<label for="ousg-amount" class="block text-sm font-medium text-gray-700 mb-2">
				OUSG Amount
			</label>
			<Input
				id="ousg-amount"
				type="number"
				bind:value={ousgAmount}
				placeholder="Enter OUSG amount"
				disabled={isRedeeming}
				class="w-full"
			/>
			<p class="text-sm text-gray-500 mt-1">Minimum: 1 OUSG token</p>
		</div>

		{#if btcPrice > 0}
			<div class="bg-gray-50 rounded-lg p-4">
				<div class="flex justify-between items-center mb-2">
					<span class="text-sm font-medium text-gray-700">BTC Price:</span>
					<span class="text-sm text-gray-900">${btcPrice.toLocaleString()}</span>
				</div>
				{#if expectedCKBTC > 0}
					<div class="flex justify-between items-center">
						<span class="text-sm font-medium text-gray-700">Expected ckBTC:</span>
						<span class="text-sm text-green-600 font-semibold">
							{formatCKBTCAmount(expectedCKBTC)}
						</span>
					</div>
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
			{#if isLoading}
				<LoadingSpinner />
			{/if}
			{buttonText}
		</Button>
	</div>
</div>
