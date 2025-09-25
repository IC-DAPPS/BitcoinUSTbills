<script lang="ts">
	import { transactions } from '$lib/state/transactions.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	import StatusBadge from '$lib/components/ui/StatusBadge.svelte';

	function formatOUSGAmount(amount: bigint): string {
		const formatted = Number(amount) / 1_000_000; // Convert from units to tokens
		return formatted.toFixed(6);
	}

	function formatCKBTCAmount(amount: bigint): string {
		const formatted = Number(amount) / 100_000_000; // Convert from satoshis to BTC
		return formatted.toFixed(8);
	}

	function formatDate(timestamp: number): string {
		return new Date(timestamp * 1000).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getTransactionIcon(type: string): string {
		switch (type) {
			case 'mint':
				return '🟢';
			case 'redeem':
				return '🔴';
			case 'deposit':
				return '📥';
			case 'withdraw':
				return '📤';
			default:
				return '📋';
		}
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'completed':
				return 'green';
			case 'pending':
				return 'yellow';
			case 'failed':
				return 'red';
			default:
				return 'gray';
		}
	}
</script>

<div class="bg-white rounded-lg shadow-lg p-6">
	<div class="flex items-center justify-between mb-6">
		<h2 class="text-xl font-bold text-gray-900">Transaction History</h2>
		{#if transactions.loading}
			<LoadingSpinner />
		{/if}
	</div>

	{#if transactions.error}
		<div class="text-center py-8">
			<div class="text-red-500 text-sm">
				{transactions.error}
			</div>
		</div>
	{:else if transactions.list.length === 0}
		<div class="text-center py-8">
			<div class="text-gray-500 text-sm">No transactions found</div>
		</div>
	{:else}
		<div class="space-y-4">
			{#each transactions.list as transaction (transaction.id)}
				<div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
					<div class="flex items-center justify-between">
						<div class="flex items-center space-x-3">
							<span class="text-2xl">
								{getTransactionIcon(transaction.type)}
							</span>
							<div>
								<div class="font-medium text-gray-900">
									{transaction.description}
								</div>
								<div class="text-sm text-gray-500">
									{formatDate(transaction.timestamp)}
								</div>
							</div>
						</div>
						<div class="text-right">
							<div class="font-semibold text-gray-900">
								{formatOUSGAmount(transaction.amount)} OUSG
							</div>
							<StatusBadge status={transaction.status} size="sm" />
						</div>
					</div>

					{#if transaction.ckbtcAmount || transaction.usdValue}
						<div class="mt-3 pt-3 border-t border-gray-100">
							<div class="flex justify-between text-sm text-gray-600">
								{#if transaction.ckbtcAmount}
									<span>
										ckBTC: {formatCKBTCAmount(transaction.ckbtcAmount)}
									</span>
								{/if}
								{#if transaction.usdValue}
									<span>
										USD Value: ${transaction.usdValue.toLocaleString()}
									</span>
								{/if}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
