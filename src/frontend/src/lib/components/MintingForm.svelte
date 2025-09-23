<script lang="ts">
	import { authStore } from '$lib/stores/auth.store';
	import { userSate } from '$lib/state/user.svelte';
	import { mintOUSG, getCurrentBTCPrice, calculateOUSGForUSD } from '$lib/services/minting.service';
	import { toast } from 'svelte-sonner';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';

	let ckbtcAmount = $state('');
	let btcPrice = $state(0);
	let expectedOUSG = $state(0n);
	let isMinting = $state(false);
	let isLoading = $state(false);

	// Fetch BTC price on component mount
	$effect(async () => {
		if (authStore.isAuthenticated) {
			const price = await getCurrentBTCPrice();
			if (price) {
				btcPrice = price;
			}
		}
	});

	// Calculate expected OUSG when ckBTC amount changes
	$effect(async () => {
		if (ckbtcAmount && btcPrice > 0) {
			const amount = parseFloat(ckbtcAmount);
			if (amount > 0) {
				const usdValue = (amount * btcPrice) / 100_000_000; // Convert from satoshis to BTC, then to USD
				const ousgAmount = await calculateOUSGForUSD(usdValue);
				if (ousgAmount) {
					expectedOUSG = ousgAmount;
				}
			}
		}
	});

	const handleMint = async () => {
		if (!authStore.isAuthenticated) {
			toast.error('Please log in to mint OUSG tokens');
			return;
		}

		if (!userSate.profile || userSate.profile.kyc_status !== 'Verified') {
			toast.error('KYC verification required to mint OUSG tokens');
			return;
		}

		if (!ckbtcAmount || parseFloat(ckbtcAmount) <= 0) {
			toast.error('Please enter a valid ckBTC amount');
			return;
		}

		isMinting = true;
		isLoading = true;

		try {
			// Convert ckBTC amount to bigint (assuming 8 decimals)
			const ckbtcAmountBigInt = BigInt(Math.floor(parseFloat(ckbtcAmount) * 100_000_000));

			// For now, we'll use a mock block index. In a real implementation,
			// this would come from the actual ckBTC deposit transaction
			const mockBlockIndex = BigInt(Date.now());

			const result = await mintOUSG(ckbtcAmountBigInt, mockBlockIndex);

			if (result.success) {
				toast.success(`Successfully minted ${formatOUSGAmount(result.ousgMinted!)} OUSG tokens`);
				ckbtcAmount = '';
				expectedOUSG = 0n;
			} else {
				toast.error(result.errorMessage || 'Failed to mint OUSG tokens');
			}
		} catch (error) {
			console.error('Error minting OUSG:', error);
			toast.error('Failed to mint OUSG tokens');
		} finally {
			isMinting = false;
			isLoading = false;
		}
	};

	function formatOUSGAmount(amount: bigint): string {
		const formatted = Number(amount) / 1_000_000; // Convert from units to tokens
		return formatted.toFixed(6);
	}

	function formatCKBTCAmount(amount: string): string {
		const num = parseFloat(amount);
		if (isNaN(num)) return '0';
		return (num / 100_000_000).toFixed(8); // Convert from satoshis to BTC
	}

	const isDisabled = $derived(
		!authStore.isAuthenticated ||
			!userSate.profile ||
			userSate.profile.kyc_status !== 'Verified' ||
			!ckbtcAmount ||
			parseFloat(ckbtcAmount) <= 0 ||
			isMinting
	);

	const buttonText = $derived(() => {
		if (!authStore.isAuthenticated) return 'Connect to mint';
		if (!userSate.profile || userSate.profile.kyc_status !== 'Verified') return 'KYC required';
		if (isMinting) return 'Minting...';
		return 'Mint OUSG';
	});
</script>

<div class="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
	<h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Mint OUSG Tokens</h2>

	<div class="space-y-4">
		<div>
			<label for="ckbtc-amount" class="block text-sm font-medium text-gray-700 mb-2">
				ckBTC Amount
			</label>
			<Input
				id="ckbtc-amount"
				type="number"
				bind:value={ckbtcAmount}
				placeholder="Enter ckBTC amount"
				disabled={isMinting}
				class="w-full"
			/>
			{#if ckbtcAmount}
				<p class="text-sm text-gray-500 mt-1">
					≈ {formatCKBTCAmount(ckbtcAmount)} BTC
				</p>
			{/if}
		</div>

		{#if btcPrice > 0}
			<div class="bg-gray-50 rounded-lg p-4">
				<div class="flex justify-between items-center mb-2">
					<span class="text-sm font-medium text-gray-700">BTC Price:</span>
					<span class="text-sm text-gray-900">${btcPrice.toLocaleString()}</span>
				</div>
				{#if expectedOUSG > 0}
					<div class="flex justify-between items-center">
						<span class="text-sm font-medium text-gray-700">Expected OUSG:</span>
						<span class="text-sm text-green-600 font-semibold">
							{formatOUSGAmount(expectedOUSG)}
						</span>
					</div>
				{/if}
			</div>
		{/if}

		{#if !authStore.isAuthenticated}
			<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
				<p class="text-sm text-yellow-800">Please connect your wallet to mint OUSG tokens.</p>
			</div>
		{:else if !userSate.profile || userSate.profile.kyc_status !== 'Verified'}
			<div class="bg-red-50 border border-red-200 rounded-lg p-4">
				<p class="text-sm text-red-800">KYC verification is required to mint OUSG tokens.</p>
			</div>
		{/if}

		<Button onclick={handleMint} disabled={isDisabled} class="w-full">
			{#if isLoading}
				<LoadingSpinner class="w-4 h-4 mr-2" />
			{/if}
			{buttonText}
		</Button>
	</div>
</div>
