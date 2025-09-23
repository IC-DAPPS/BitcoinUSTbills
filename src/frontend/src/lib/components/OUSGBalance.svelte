<script lang="ts">
	import { ousgBalance } from '$lib/state/ousg-balance.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';

	function formatOUSGAmount(amount: bigint): string {
		const formatted = Number(amount) / 1_000_000; // Convert from units to tokens
		return formatted.toFixed(6);
	}

	function formatUSDValue(amount: bigint): string {
		const ousgTokens = Number(amount) / 1_000_000;
		const usdValue = ousgTokens * 5000; // Each OUSG = $5000
		return usdValue.toLocaleString('en-US', {
			style: 'currency',
			currency: 'USD'
		});
	}
</script>

<div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
	<div class="flex items-center justify-between mb-4">
		<h3 class="text-lg font-semibold">OUSG Balance</h3>
		{#if ousgBalance.loading}
			<LoadingSpinner class="w-5 h-5" />
		{/if}
	</div>

	{#if ousgBalance.error}
		<div class="text-red-200 text-sm">
			{ousgBalance.error}
		</div>
	{:else}
		<div class="space-y-2">
			<div class="text-3xl font-bold">
				{formatOUSGAmount(ousgBalance.balance)}
			</div>
			<div class="text-blue-100 text-sm">
				{formatUSDValue(ousgBalance.balance)}
			</div>
		</div>
	{/if}

	<div class="mt-4 pt-4 border-t border-blue-400">
		<p class="text-xs text-blue-100">1 OUSG = $5,000 USD</p>
	</div>
</div>
