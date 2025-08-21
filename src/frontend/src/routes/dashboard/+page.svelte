<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/auth';
	import {
		getUserProfile,
		getUserHoldings,
		getActiveUSTBills,
		getTradingMetrics,
		centsToDoller,
		formatYieldPercentage,
		getErrorMessage,
		formatTimestamp
	} from '$lib/api';
	import USTBillCard from '$lib/components/USTBillCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
	import LoginPrompt from '$lib/components/ui/LoginPrompt.svelte';
	import type { User, TokenHolding, USTBill, TradingMetrics } from '$lib/types';
	import { goto } from '$app/navigation';

	let user: User | null = null;
	let holdings: TokenHolding[] = [];
	let ustbills: USTBill[] = [];
	let tradingMetrics: TradingMetrics | null = null;
	let loading = true;
	let error: string | null = null;

	// Mock data for transactions and yield payments (until implemented)
	let recentTransactions = [
		{ type: 'Buy', amount: '$1,250', token: 'TB-001', status: 'completed' },
		{ type: 'Sell', amount: '$800', token: 'TB-002', status: 'completed' },
		{ type: 'Buy', amount: '$2,000', token: 'TB-003', status: 'pending' },
		{ type: 'Buy', amount: '$500', token: 'TB-001', status: 'completed' }
	];

	let upcomingYieldPayments = [
		{
			date: '1/20/2024',
			amount: '$52.3',
			description: 'Monthly yield payment',
			status: 'upcoming'
		},
		{
			date: '2/20/2024',
			amount: '$48.9',
			description: 'Monthly yield payment',
			status: 'upcoming'
		},
		{
			date: '3/20/2024',
			amount: '$55.15',
			description: 'Monthly yield payment',
			status: 'upcoming'
		},
		{
			date: '4/20/2024',
			amount: '$51.8',
			description: 'Monthly yield payment',
			status: 'upcoming'
		}
	];

	$: portfolioValue = user ? user.total_invested : 0;
	$: totalYieldEarned = user ? user.total_yield_earned : 0;
	$: walletBalance = user ? user.wallet_balance : 0;

	// Mock data for demo
	const mockUser = {
		username: 'demo_user',
		email: 'demo@example.com',
		wallet_balance: 2500,
		total_invested: 1890,
		total_yield_earned: 125,
		created_at: Date.now() - 30 * 24 * 60 * 60 * 1000,
		updated_at: Date.now()
	};

	const mockHoldings: TokenHolding[] = [
		{
			id: 'holding-1',
			user_principal: 'mock-principal',
			ustbill_id: '1',
			token_id: 1,
			purchase_price: 95000, // $950
			purchase_date: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
			yield_option: { Reinvest: null },
			status: { Active: null },
			current_value: 97500, // $975
			projected_yield: 5000 // $50
		},
		{
			id: 'holding-2',
			user_principal: 'mock-principal',
			ustbill_id: '2',
			token_id: 2,
			purchase_price: 94000, // $940
			purchase_date: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
			yield_option: { Payout: null },
			status: { Active: null },
			current_value: 95200, // $952
			projected_yield: 7500 // $75
		}
	];

	const mockTradingMetrics: TradingMetrics = {
		total_volume: 1250000, // $12,500
		active_bills: 5,
		avg_yield: 6.75,
		total_users: 150
	};

	onMount(async () => {
		if (!$authStore.isLoggedIn) {
			loading = false;
			return;
		}

		// Skip auth check for demo
		console.log('Dashboard loading mock data for demo');

		try {
			// Simulate loading delay
			await new Promise((resolve) => setTimeout(resolve, 800));

			user = mockUser;
			holdings = mockHoldings;
			ustbills = []; // Keep empty for demo focus
			tradingMetrics = mockTradingMetrics;

			console.log('Mock data loaded successfully');
		} catch (e) {
			console.error('Error in dashboard:', e);
			error = getErrorMessage(e);
		} finally {
			console.log('Setting loading to false');
			loading = false;
		}
	});

	function handleInvestClick(ustbillId: string) {
		// TODO: Implement investment modal
		console.log('Invest in:', ustbillId);
	}

	function handleBuyTokens() {
		// TODO: Implement buy tokens modal
		console.log('Buy tokens clicked');
	}

	function handleSellTokens() {
		// TODO: Implement sell tokens modal
		console.log('Sell tokens clicked');
	}

	function handleViewAnalytics() {
		goto('/analytics');
	}

	function goToTransactions() {
		goto('/transactions');
	}
</script>

<svelte:head>
	<title>Dashboard - BitcoinUSTbills</title>
</svelte:head>

<div class="min-h-screen bg-section">
	<div class="container-wide mx-auto px-6 py-8">
		{#if !$authStore.isLoggedIn}
			<LoginPrompt />
		{:else if loading}
			<div class="flex justify-center items-center h-64">
				<div class="text-center">
					<div
						class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto mb-4"
					></div>
					<p class="text-secondary">Loading your dashboard...</p>
				</div>
			</div>
		{:else if error}
			<div class="card p-6 text-center">
				<h2 class="text-xl font-semibold text-primary mb-4">Error Loading Dashboard</h2>
				<p class="text-red-500 mb-4">{error}</p>
				<Button variant="primary" on:click={() => window.location.reload()}>Try Again</Button>
			</div>
		{:else}
			<!-- Dashboard Header -->
			<div class="mb-8">
				<h1 class="text-3xl font-bold text-primary mb-2">Dashboard</h1>
				<p class="text-secondary">Manage your tokenized Treasury Bill investments</p>
			</div>

			<!-- Desktop Layout: Main content + Sidebar -->
			<div class="dashboard-layout">
				<div class="dashboard-main">
					<!-- Portfolio Overview -->
					<div class="card p-6 mb-8">
						<div class="flex items-center mb-6">
							<svg
								class="w-6 h-6 text-blue mr-3"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z"
								></path>
							</svg>
							<h2 class="text-xl font-semibold text-primary">Portfolio Overview</h2>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
							<!-- Total Portfolio Value -->
							<div>
								<p class="text-sm text-secondary mb-1">Total Portfolio Value</p>
								<p class="text-3xl font-bold text-primary">
									${portfolioValue.toLocaleString()}
								</p>
							</div>

							<!-- Current Yield -->
							<div>
								<p class="text-sm text-secondary mb-1">Current Yield</p>
								<p class="text-3xl font-bold text-success">4.2% APY</p>
							</div>

							<!-- 24h Change -->
							<div>
								<p class="text-sm text-secondary mb-1">24h Change</p>
								<div class="flex items-center">
									<p class="text-3xl font-bold text-success">+$45.20</p>
									<svg
										class="w-5 h-5 text-success ml-2 flex-shrink-0"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M7 14l9-9 3 3L19 8l-8 8-4-4z"
										></path>
									</svg>
								</div>
							</div>
						</div>
					</div>

					<!-- Treasury Bills Marketplace -->
					<div class="card p-6 mb-8">
						<div class="flex items-center justify-between mb-6">
							<div class="flex items-center">
								<svg
									class="w-6 h-6 text-blue mr-3"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
									></path>
								</svg>
								<h2 class="text-xl font-semibold text-primary">Treasury Bills Marketplace</h2>
							</div>
						</div>

						<p class="text-secondary mb-6">Available tokenized Treasury Bills</p>

						<div class="grid grid-cols-1 lg:desktop-grid-2 gap-6">
							{#each ustbills.slice(0, 4) as ustbill}
								<USTBillCard {ustbill} onInvest={handleInvestClick} />
							{/each}
						</div>
					</div>
				</div>

				<!-- Sidebar for Recent Transactions & Yield Payments -->
				<div class="dashboard-sidebar">
					<!-- Recent Transactions -->
					<div class="card p-6 mb-6">
						<div class="flex items-center justify-between mb-4">
							<h3 class="text-lg font-semibold text-primary">Recent Transactions</h3>
							<Button variant="outline" size="sm" on:click={goToTransactions}>View All</Button>
						</div>

						<div class="space-y-4">
							{#each recentTransactions.slice(0, 3) as transaction}
								<div class="flex items-center justify-between p-3 bg-gray-50 rounded">
									<div>
										<p class="font-medium text-sm">{transaction.type}</p>
										<p class="text-xs text-secondary">{transaction.bill_id}</p>
									</div>
									<div class="text-right">
										<p class="font-semibold">${transaction.amount}</p>
										<span
											class="inline-block px-2 py-1 text-xs rounded-full {transaction.status ===
											'completed'
												? 'bg-green-100 text-green-800'
												: transaction.status === 'pending'
													? 'bg-yellow-100 text-yellow-800'
													: 'bg-gray-100 text-gray-800'}"
										>
											{transaction.status}
										</span>
									</div>
								</div>
							{/each}
						</div>
					</div>

					<!-- Upcoming Yield Payments -->
					<div class="card p-6">
						<div class="flex items-center justify-between mb-4">
							<h3 class="text-lg font-semibold text-primary">Upcoming Yields</h3>
						</div>

						<div class="space-y-4">
							{#each upcomingYieldPayments.slice(0, 3) as payment}
								<div class="flex items-center justify-between p-3 bg-blue-50 rounded">
									<div>
										<p class="font-medium text-sm">{payment.bill_id}</p>
										<p class="text-xs text-secondary">
											Due: {payment.payment_date}
										</p>
									</div>
									<div class="text-right">
										<p class="font-semibold text-blue">
											${payment.expected_amount}
										</p>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<!-- Quick Actions - Horizontal Blocks -->
			<div class="mb-8">
				<h2 class="text-xl font-semibold text-primary mb-6">Quick Actions</h2>
				<div class="grid grid-cols-3 gap-6">
					<div
						class="card p-6 text-center cursor-pointer hover:bg-gray-50 h-32 flex flex-col justify-center"
						on:click={handleBuyTokens}
					>
						<div
							class="w-12 h-12 bg-blue rounded-full flex items-center justify-center mx-auto mb-4"
						>
							<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								></path>
							</svg>
						</div>
						<h3 class="text-sm font-semibold text-primary">Buy Tokens</h3>
					</div>

					<div
						class="card p-6 text-center cursor-pointer hover:bg-gray-50 h-32 flex flex-col justify-center"
						on:click={handleSellTokens}
					>
						<div
							class="w-12 h-12 bg-blue rounded-full flex items-center justify-center mx-auto mb-4"
						>
							<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
								></path>
							</svg>
						</div>
						<h3 class="text-sm font-semibold text-primary">Sell Tokens</h3>
					</div>

					<div
						class="card p-6 text-center cursor-pointer hover:bg-gray-50 h-32 flex flex-col justify-center"
						on:click={handleViewAnalytics}
					>
						<div
							class="w-12 h-12 bg-blue rounded-full flex items-center justify-center mx-auto mb-4"
						>
							<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z"
								></path>
							</svg>
						</div>
						<h3 class="text-sm font-semibold text-primary">View Analytics</h3>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.animate-spin {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
