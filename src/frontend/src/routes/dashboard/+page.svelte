<script lang="ts">
  import { onMount } from "svelte";
  import { authStore } from "$lib/auth";
  import {
    getUserProfile,
    getUserHoldings,
    getActiveUSTBills,
    getTradingMetrics,
    centsToDoller,
    formatYieldPercentage,
    getErrorMessage,
    formatTimestamp,
  } from "$lib/api";
  import USTBillCard from "$lib/components/USTBillCard.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import StatusBadge from "$lib/components/ui/StatusBadge.svelte";
  import type { User, TokenHolding, USTBill, TradingMetrics } from "$lib/types";
  import { goto } from "$app/navigation";

  let user: User | null = null;
  let holdings: TokenHolding[] = [];
  let ustbills: USTBill[] = [];
  let tradingMetrics: TradingMetrics | null = null;
  let loading = true;
  let error: string | null = null;

  // Mock data for transactions and yield payments (until implemented)
  let recentTransactions = [
    { type: "Buy", amount: "$1,250", token: "TB-001", status: "completed" },
    { type: "Sell", amount: "$800", token: "TB-002", status: "completed" },
    { type: "Buy", amount: "$2,000", token: "TB-003", status: "pending" },
    { type: "Buy", amount: "$500", token: "TB-001", status: "completed" },
  ];

  let upcomingYieldPayments = [
    {
      date: "1/20/2024",
      amount: "$52.3",
      description: "Monthly yield payment",
      status: "upcoming",
    },
    {
      date: "2/20/2024",
      amount: "$48.9",
      description: "Monthly yield payment",
      status: "upcoming",
    },
    {
      date: "3/20/2024",
      amount: "$55.15",
      description: "Monthly yield payment",
      status: "upcoming",
    },
    {
      date: "4/20/2024",
      amount: "$51.8",
      description: "Monthly yield payment",
      status: "upcoming",
    },
  ];

  $: portfolioValue = user ? user.total_invested : 0;
  $: totalYieldEarned = user ? user.total_yield_earned : 0;
  $: walletBalance = user ? user.wallet_balance : 0;

  // Mock data for demo
  const mockUser = {
    username: "demo_user",
    email: "demo@example.com",
    wallet_balance: 2500,
    total_invested: 1890,
    total_yield_earned: 125,
    created_at: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updated_at: Date.now(),
  };

  const mockHoldings: TokenHolding[] = [
    {
      id: "holding-1",
      user_principal: "mock-principal",
      ustbill_id: "1",
      token_id: 1,
      purchase_price: 95000, // $950
      purchase_date: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
      yield_option: { Reinvest: null },
      status: { Active: null },
      current_value: 97500, // $975
      projected_yield: 5000, // $50
    },
    {
      id: "holding-2",
      user_principal: "mock-principal",
      ustbill_id: "2",
      token_id: 2,
      purchase_price: 94000, // $940
      purchase_date: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
      yield_option: { Payout: null },
      status: { Active: null },
      current_value: 95200, // $952
      projected_yield: 7500, // $75
    },
  ];

  const mockTradingMetrics: TradingMetrics = {
    total_volume: 1250000, // $12,500
    active_bills: 5,
    avg_yield: 6.75,
    total_users: 150,
  };

  onMount(async () => {
    // Skip auth check for demo
    console.log("Dashboard loading mock data for demo");

    try {
      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      user = mockUser;
      holdings = mockHoldings;
      ustbills = []; // Keep empty for demo focus
      tradingMetrics = mockTradingMetrics;

      console.log("Mock data loaded successfully");
    } catch (e) {
      console.error("Error in dashboard:", e);
      error = getErrorMessage(e);
    } finally {
      console.log("Setting loading to false");
      loading = false;
    }
  });

  function handleInvestClick(ustbillId: string) {
    // TODO: Implement investment modal
    console.log("Invest in:", ustbillId);
  }

  function handleBuyTokens() {
    // TODO: Implement buy tokens modal
    console.log("Buy tokens clicked");
  }

  function handleSellTokens() {
    // TODO: Implement sell tokens modal
    console.log("Sell tokens clicked");
  }

  function handleViewAnalytics() {
    goto("/analytics");
  }
</script>

<svelte:head>
  <title>Dashboard - BitcoinUSTbills</title>
</svelte:head>

<div class="min-h-screen bg-section">
  <div class="container mx-auto px-6 py-8">
    {#if loading}
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
        <h2 class="text-xl font-semibold text-primary mb-4">
          Error Loading Dashboard
        </h2>
        <p class="text-red-500 mb-4">{error}</p>
        <Button variant="primary" on:click={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    {:else}
      <!-- Dashboard Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-primary mb-2">Dashboard</h1>
        <p class="text-secondary">
          Manage your tokenized Treasury Bill investments
        </p>
      </div>

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

        <div class="grid md:grid-cols-3 gap-6">
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
            <h2 class="text-xl font-semibold text-primary">
              Treasury Bills Marketplace
            </h2>
          </div>
        </div>

        <p class="text-secondary mb-6">Available tokenized Treasury Bills</p>

        <div class="grid lg:grid-cols-2 gap-6">
          {#each ustbills.slice(0, 4) as ustbill}
            <USTBillCard {ustbill} onInvest={handleInvestClick} />
          {/each}
        </div>
      </div>

      <!-- Recent Transactions & Upcoming Yield Payments -->
      <div class="grid lg:grid-cols-2 gap-8 mb-8">
        <!-- Recent Transactions -->
        <div class="card p-6">
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
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              ></path>
            </svg>
            <h2 class="text-xl font-semibold text-primary">
              Recent Transactions
            </h2>
          </div>

          <div class="space-y-4">
            {#each recentTransactions as transaction}
              <div
                class="flex justify-between items-center py-3 border-b border-light last:border-b-0"
              >
                <div class="flex items-center">
                  <div
                    class="w-8 h-8 rounded-full {transaction.type === 'Buy'
                      ? 'bg-green-100'
                      : 'bg-red-100'} flex items-center justify-center mr-3"
                  >
                    {#if transaction.type === "Buy"}
                      <svg
                        class="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M7 16l-4-4m0 0l4-4m-4 4h18"
                        ></path>
                      </svg>
                    {:else}
                      <svg
                        class="w-4 h-4 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        ></path>
                      </svg>
                    {/if}
                  </div>
                  <div>
                    <p class="font-medium text-primary">{transaction.type}</p>
                    <p class="text-sm text-secondary">{transaction.token}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-primary">{transaction.amount}</p>
                  <StatusBadge status={transaction.status} size="sm" />
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Upcoming Yield Payments -->
        <div class="card p-6">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
            <h2 class="text-xl font-semibold text-primary">
              Upcoming Yield Payments
            </h2>
          </div>

          <div class="space-y-4">
            {#each upcomingYieldPayments as payment}
              <div
                class="flex justify-between items-center py-3 border-b border-light last:border-b-0"
              >
                <div>
                  <p class="font-semibold text-primary">{payment.date}</p>
                  <p class="text-sm text-secondary">{payment.description}</p>
                  <span class="text-xs text-muted">{payment.status}</span>
                </div>
                <div class="text-right">
                  <p class="text-lg font-semibold text-success">
                    {payment.amount}
                  </p>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card p-6">
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
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h2 class="text-xl font-semibold text-primary">Quick Actions</h2>
        </div>

        <div class="grid md:grid-cols-3 gap-4">
          <Button
            variant="primary"
            size="lg"
            on:click={handleBuyTokens}
            class="h-16"
          >
            Buy Tokens
          </Button>
          <Button
            variant="secondary"
            size="lg"
            on:click={handleSellTokens}
            class="h-16"
          >
            Sell Tokens
          </Button>
          <Button
            variant="outline"
            size="lg"
            on:click={handleViewAnalytics}
            class="h-16"
          >
            View Analytics
          </Button>
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
