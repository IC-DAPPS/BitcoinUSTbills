<script lang="ts">
	import { transactions, fetchTransactions } from '$lib/state/transactions.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	import StatusBadge from '$lib/components/ui/StatusBadge.svelte';

	function formatAmount(amount: bigint, decimals: number = 6): string {
		return (Number(amount) / Math.pow(10, decimals)).toFixed(decimals);
	}

	function formatTimestamp(timestamp: number): string {
		return new Date(timestamp).toLocaleString();
	}

	function getTransactionIcon(type: string): string {
		switch (type) {
			case 'mint':
				return '⬆️';
			case 'redeem':
				return '⬇️';
			case 'deposit':
				return '💰';
			case 'withdraw':
				return '💸';
			default:
				return '📄';
		}
	}

	function getStatusBadge(status: string): string {
		switch (status) {
			case 'completed':
				return 'Completed';
			case 'pending':
				return 'Pending';
			case 'failed':
				return 'Cancelled';
			default:
				return 'Pending';
		}
	}
</script>

<div class="card p-6">
	<h2 class="text-xl font-semibold text-primary mb-6">Transaction History</h2>

	{#if transactions.loading}
		<div class="flex justify-center py-8">
			<LoadingSpinner />
		</div>
	{:else if transactions.error}
		<div class="text-center py-8">
			<p class="text-red-600 mb-4">{transactions.error}</p>
			<button
				onclick={fetchTransactions}
				class="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
			>
				Retry
			</button>
		</div>
	{:else if transactions.list.length === 0}
		<div class="text-center py-8">
			<p class="text-secondary">No transactions yet</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each transactions.list as transaction}
				<div class="border border-light rounded-lg p-4 hover:bg-gray-50 transition-colors">
					<div class="flex items-center justify-between">
						<div class="flex items-center space-x-3">
							<span class="text-2xl">{getTransactionIcon(transaction.type)}</span>
							<div>
								<div class="font-semibold text-primary capitalize">
									{transaction.type}
								</div>
								<div class="text-sm text-secondary">
									{formatTimestamp(transaction.timestamp)}
								</div>
							</div>
						</div>

						<div class="text-right">
							<div class="font-semibold text-primary">
								{formatAmount(transaction.amount, 6)} OUSG
							</div>
							<StatusBadge status={getStatusBadge(transaction.status)} size="sm" />
						</div>
					</div>

					{#if transaction.description}
						<div class="mt-2 text-sm text-secondary">
							{transaction.description}
						</div>
					{/if}

					{#if transaction.ousgAmount || transaction.ckbtcAmount}
						<div class="mt-2 flex space-x-4 text-xs text-muted">
							{#if transaction.ousgAmount}
								<span>OUSG: {formatAmount(transaction.ousgAmount, 6)}</span>
							{/if}
							{#if transaction.ckbtcAmount}
								<span>ckBTC: {formatAmount(transaction.ckbtcAmount, 8)}</span>
							{/if}
							{#if transaction.usdValue}
								<span>USD: ${transaction.usdValue.toFixed(2)}</span>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
