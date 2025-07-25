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

  $: portfolioValue = user ? centsToDoller(user.total_invested) : 0;
  $: totalYieldEarned = user ? centsToDoller(user.total_yield_earned) : 0;
  $: walletBalance = user ? centsToDoller(user.wallet_balance) : 0;

  onMount(async () => {
    console.log("Dashboard onMount called");
    console.log("Auth store state:", $authStore);

    // Add a small delay to ensure auth is initialized
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (!$authStore.isLoggedIn || !$authStore.identity) {
      console.log("User not logged in, redirecting to home");
      goto("/");
      return;
    }

    console.log("User is logged in, fetching data...");

    try {
      const principal = $authStore.identity.getPrincipal();
      console.log("User principal:", principal.toString());

      // For now, use mock data to ensure page renders
      user = {
        principal: principal,
        email: "demo@example.com",
        phone_number: [],
        country: "US",
        kyc_status: { Verified: null },
        is_active: true,
        wallet_balance: BigInt(100000), // $1000 in cents
        total_invested: BigInt(500000), // $5000 in cents
        total_yield_earned: BigInt(25000), // $250 in cents
        created_at: BigInt(Date.now() * 1000000),
        updated_at: BigInt(Date.now() * 1000000),
      };

      holdings = [];
      ustbills = [
        {
          id: "ustb_001",
          cusip: "TB-001-2024",
          face_value: BigInt(100000), // $1000
          purchase_price: BigInt(9850), // $98.50
          annual_yield: 5.2,
          maturity_date: BigInt(
            (Date.now() + 90 * 24 * 60 * 60 * 1000) * 1000000
          ),
          bill_type: "91-Day Treasury Bill",
          status: { Active: null },
          total_tokens: BigInt(1000),
          tokens_sold: BigInt(250),
          issuer: "US Treasury",
          created_at: BigInt(Date.now() * 1000000),
          updated_at: BigInt(Date.now() * 1000000),
        },
        {
          id: "ustb_002",
          cusip: "TB-002-2024",
          face_value: BigInt(500000), // $5000
          purchase_price: BigInt(4900), // $49.00
          annual_yield: 5.35,
          maturity_date: BigInt(
            (Date.now() + 180 * 24 * 60 * 60 * 1000) * 1000000
          ),
          bill_type: "182-Day Treasury Bill",
          status: { Active: null },
          total_tokens: BigInt(5000),
          tokens_sold: BigInt(1200),
          issuer: "US Treasury",
          created_at: BigInt(Date.now() * 1000000),
          updated_at: BigInt(Date.now() * 1000000),
        },
      ];

      tradingMetrics = {
        total_volume: BigInt(1000000000), // $10M in cents
        total_transactions: BigInt(5000),
        average_price: BigInt(9850),
        highest_price: BigInt(10000),
        lowest_price: BigInt(9500),
        last_updated: BigInt(Date.now() * 1000000),
      };

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
        <h1 class="text-3xl font-bold text-primary mb-2">
          Treasury Tokenizer Dashboard
        </h1>
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
