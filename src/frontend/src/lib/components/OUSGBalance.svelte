<script lang="ts">
	import { ousgBalance, fetchOUSGBalance } from '$lib/state/ousg-balance.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
</script>

<div class="card p-6">
	<h2 class="text-xl font-semibold text-primary mb-6">OUSG Token Balance</h2>

	<div class="text-center">
		{#if ousgBalance.loading}
			<LoadingSpinner />
		{:else if ousgBalance.error}
			<div class="text-red-600">
				<p class="text-sm">{ousgBalance.error}</p>
				<button
					onclick={fetchOUSGBalance}
					class="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
				>
					Retry
				</button>
			</div>
		{:else}
			<div class="space-y-4">
				<div class="text-4xl font-bold text-primary">
					{(Number(ousgBalance.balance) / 1_000_000).toFixed(6)}
				</div>
				<div class="text-lg text-secondary">OUSG Tokens</div>
				<div class="text-sm text-muted">
					Equivalent to ${(Number(ousgBalance.balance) / 1_000_000).toFixed(2)} USD
				</div>
			</div>
		{/if}
	</div>
</div>
