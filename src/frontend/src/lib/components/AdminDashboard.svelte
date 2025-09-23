<script lang="ts">
	import { get } from 'svelte/store';
	import { authStore } from '$lib/stores/auth.store';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';

	let stats = $state({
		totalDeposits: 0,
		processedDeposits: 0,
		pendingDeposits: 0,
		totalOUSGSupply: 0n,
		btcPrice: 0,
		loading: false,
		error: null as string | null
	});

	const fetchStats = async () => {
		const { isAuthenticated, backend } = get(authStore);
		if (!isAuthenticated || !backend) return;

		stats.loading = true;
		stats.error = null;

		try {
			// Fetch deposit stats
			const depositStats = await backend.get_deposit_stats();
			if (Array.isArray(depositStats)) {
				const statsMap = new Map(depositStats);
				stats.totalDeposits = Number(statsMap.get('total_deposits') || 0);
				stats.processedDeposits = Number(statsMap.get('processed_deposits') || 0);
				stats.pendingDeposits = Number(statsMap.get('pending_deposits') || 0);
			}

			// Fetch BTC price
			const btcPriceResponse = await backend.get_current_btc_price();
			if ('Ok' in btcPriceResponse) {
				stats.btcPrice = btcPriceResponse.Ok;
			}

			// Fetch OUSG total supply (this would need to be implemented in backend)
			// For now, we'll calculate it from processed deposits
			stats.totalOUSGSupply = BigInt(stats.processedDeposits * 1000000); // Mock calculation
		} catch (error) {
			console.error('Error fetching admin stats:', error);
			stats.error = 'Failed to fetch statistics';
		} finally {
			stats.loading = false;
		}
	};

	// Fetch stats when component mounts
	$effect(() => {
		if (get(authStore).isAuthenticated) {
			fetchStats();
		}
	});

	function formatOUSGAmount(amount: bigint): string {
		const formatted = Number(amount) / 1_000_000; // Convert from units to tokens
		return formatted.toLocaleString('en-US', { maximumFractionDigits: 6 });
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

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
		{#if stats.loading}
			<LoadingSpinner />
		{/if}
	</div>

	{#if stats.error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4">
			<div class="text-red-800 text-sm">
				{stats.error}
			</div>
		</div>
	{:else}
		<!-- Stats Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			<!-- Total Deposits -->
			<div class="bg-white rounded-lg shadow-lg p-6">
				<div class="flex items-center">
					<div class="p-2 bg-blue-100 rounded-lg">
						<svg
							class="w-6 h-6 text-blue-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
							></path>
						</svg>
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-gray-600">Total Deposits</p>
						<p class="text-2xl font-semibold text-gray-900">{stats.totalDeposits}</p>
					</div>
				</div>
			</div>

			<!-- Processed Deposits -->
			<div class="bg-white rounded-lg shadow-lg p-6">
				<div class="flex items-center">
					<div class="p-2 bg-green-100 rounded-lg">
						<svg
							class="w-6 h-6 text-green-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-gray-600">Processed</p>
						<p class="text-2xl font-semibold text-gray-900">{stats.processedDeposits}</p>
					</div>
				</div>
			</div>

			<!-- Pending Deposits -->
			<div class="bg-white rounded-lg shadow-lg p-6">
				<div class="flex items-center">
					<div class="p-2 bg-yellow-100 rounded-lg">
						<svg
							class="w-6 h-6 text-yellow-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-gray-600">Pending</p>
						<p class="text-2xl font-semibold text-gray-900">{stats.pendingDeposits}</p>
					</div>
				</div>
			</div>

			<!-- BTC Price -->
			<div class="bg-white rounded-lg shadow-lg p-6">
				<div class="flex items-center">
					<div class="p-2 bg-orange-100 rounded-lg">
						<svg
							class="w-6 h-6 text-orange-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
							></path>
						</svg>
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-gray-600">BTC Price</p>
						<p class="text-2xl font-semibold text-gray-900">${stats.btcPrice.toLocaleString()}</p>
					</div>
				</div>
			</div>
		</div>

		<!-- OUSG Supply Card -->
		<div class="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-lg font-semibold mb-2">OUSG Total Supply</h3>
					<div class="text-3xl font-bold mb-1">
						{formatOUSGAmount(stats.totalOUSGSupply)}
					</div>
					<div class="text-purple-100 text-sm">
						{formatUSDValue(stats.totalOUSGSupply)}
					</div>
				</div>
				<div class="text-right">
					<div class="text-purple-100 text-sm mb-1">Token Value</div>
					<div class="text-xl font-semibold">$5,000</div>
					<div class="text-purple-100 text-xs">per OUSG</div>
				</div>
			</div>
		</div>

		<!-- Quick Actions -->
		<div class="bg-white rounded-lg shadow-lg p-6">
			<h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<button
					onclick={() => fetchStats()}
					class="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
						></path>
					</svg>
					Refresh Stats
				</button>

				<a
					href="/admin/kyc"
					class="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
				>
					<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						></path>
					</svg>
					Review KYC
				</a>

				<button
					onclick={() => window.open('/transactions', '_blank')}
					class="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
				>
					<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
						></path>
					</svg>
					View Transactions
				</button>
			</div>
		</div>
	{/if}
</div>
