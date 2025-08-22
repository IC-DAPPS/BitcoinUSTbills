<script lang="ts">
  import { onMount } from "svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import CkbtcDeposit from "$lib/components/wallet/CkbtcDeposit.svelte";
  import {
    ckbtcBalance,
    fetchCkbtcBalance,
  } from "$lib/state/ckbtc-balance.svelte";
  import Ckbtcwithdraw from "$lib/components/wallet/Ckbtcwithdraw.svelte";
  import { CKBTC_LEDGER_CANISTER_ID } from "$lib/constants";
  import { authStore } from "$lib/auth";
  import LoginPrompt from "$lib/components/ui/LoginPrompt.svelte";

  let loading = true;
  let error: string | null = null;

  // Simple mock user data for demo
  let user = {
    username: "demo_user",
    walletBalance: 45.75, // ICP balance
    ckbtcBalance: 0.0892, // ckBTC balance
  };

  // Mock exchange rates (in real app, fetch from API)
  let icpPriceUSD = 12.45; // ICP to USD
  let ckbtcPriceUSD = 43250.0; // ckBTC to USD

  // Calculate USD values
  $: icpValueUSD = user.walletBalance * icpPriceUSD;
  $: ckbtcValueUSD = user.ckbtcBalance * ckbtcPriceUSD;

  // Mock transaction history
  let transactions = [
    {
      id: "txn_001",
      type: "Deposit",
      amount: 12.5,
      currency: "ICP",
      timestamp: "2024-01-19",
      status: "Completed",
      description: "ICP deposit",
    },
    {
      id: "txn_002",
      type: "Purchase",
      amount: -8.25,
      currency: "ICP",
      timestamp: "2024-01-18",
      status: "Completed",
      description: "Purchase of UST Bill 912797JK5",
    },
    {
      id: "txn_003",
      type: "Fee",
      amount: -0.1,
      currency: "ICP",
      timestamp: "2024-01-18",
      status: "Completed",
      description: "Platform fee",
    },
    {
      id: "txn_004",
      type: "Deposit",
      amount: 0.05,
      currency: "ckBTC",
      timestamp: "2024-01-17",
      status: "Completed",
      description: "ckBTC deposit",
    },
  ];

  onMount(async () => {
    await fetchCkbtcBalance();
    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    loading = false;
  });

  function getTransactionIcon(type: string) {
    switch (type) {
      case "Deposit":
        return "⬇️";
      case "Withdraw":
        return "⬆️";
      case "Purchase":
        return "🛒";
      case "Fee":
        return "💳";
      default:
        return "📄";
    }
  }

  function getAmountColor(amount: number) {
    return amount >= 0 ? "text-success" : "text-red-600";
  }
</script>

<svelte:head>
  <title>My Wallet - BitcoinUSTbills</title>
</svelte:head>

<div class="container-wide mx-auto px-6 py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-primary mb-2">My Wallet</h1>
    <p class="text-secondary">Manage your funds and view transaction history</p>
  </div>

  {#if error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-800">{error}</p>
      <button
        class="text-red-600 underline mt-2"
        on:click={() => (error = null)}
      >
        Dismiss
      </button>
    </div>
  {/if}

  {#if loading}
    <div class="flex justify-center py-12">
      <LoadingSpinner />
    </div>
  {:else if $authStore.isLoggedIn}
    <!-- Wallet Balance Cards - Better Desktop Layout -->
    <div
      class="wallet-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
    >
      <!-- ICP Balance Card -->
      <!-- <div class="card p-6 text-center">
        <h3 class="text-lg font-semibold text-secondary mb-4">ICP Balance</h3>
        <p class="text-4xl font-bold text-primary mb-4">
          {user.walletBalance.toFixed(4)} ICP
        </p>
        <p class="text-sm text-secondary mb-6">
          ≈ ${(user.walletBalance * icpPriceUSD).toFixed(2)} USD
        </p>
        <div class="flex gap-2 justify-center">
          <Button
            variant="primary"
            class="flex-1"
            on:click={() => alert("Deposit ICP functionality would be here")}
          >
            ⬇ Deposit
          </Button>
          <Button
            variant="secondary"
            class="flex-1"
            on:click={() => alert("Withdraw ICP functionality would be here")}
          >
            ⬆ Withdraw
          </Button>
        </div>
      </div> -->

      <!-- ckBTC Balance Card -->
      <div class="card p-6 text-center">
        <h3 class="text-lg font-semibold text-secondary mb-4">ckBTC Balance</h3>
        <p class="text-4xl font-bold text-primary mb-4">
          {ckbtcBalance.format} ckBTC
        </p>
        <!-- <p class="text-sm text-secondary mb-6">
					≈ ${(user.ckbtcBalance * ckbtcPriceUSD).toFixed(2)} USD
				</p> -->
        <div class="flex space-x-2 justify-center">
          <CkbtcDeposit />
          <Ckbtcwithdraw ledgerId={CKBTC_LEDGER_CANISTER_ID} />
        </div>
      </div>

      <!-- Total Portfolio Value Card -->
      <!-- <div class="card p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100">
				<h3 class="text-lg font-semibold text-secondary mb-4">Total Portfolio</h3>
				<p class="text-4xl font-bold text-primary mb-4">
					${(icpValueUSD + ckbtcValueUSD).toFixed(2)}
				</p>
				<p class="text-sm text-secondary mb-6">Combined wallet value</p>
				<Button
					variant="primary"
					class="w-full"
					on:click={() => (window.location.href = '/marketplace')}
				>
					Invest Now
				</Button>
			</div> -->
    </div>

    <!-- Quick Actions -->
    <!-- <div class="card p-6 mb-8">
			<h3 class="text-lg font-semibold text-primary mb-4">Quick Actions</h3>
			<div class="flex flex-row gap-3">
				<Button
					variant="outline"
					class="flex-1 justify-center"
					on:click={() => (window.location.href = '/marketplace')}
				>
					🛒 Buy Treasury Bills
				</Button>
				<Button
					variant="outline"
					class="flex-1 justify-center"
					on:click={() => (window.location.href = '/portfolio')}
				>
					📊 View Portfolio
				</Button>
				<Button
					variant="outline"
					class="flex-1 justify-center"
					on:click={() => alert('Add Funds functionality would be here')}
				>
					💰 Add Funds
				</Button>
			</div>
		</div> -->

    <!-- Recent Transactions -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold text-primary mb-6">
        Recent Transactions
      </h3>

      <!-- Desktop Table View -->
      <div class="card desktop-only mb-8">
        <div class="overflow-x-auto shadow-md sm:rounded-lg">
          <table class="w-full text-sm text-left text-gray-500 table-fixed">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 w-1/6">Type</th>
                <th scope="col" class="px-6 py-3 w-1/6">Amount</th>
                <th scope="col" class="px-6 py-3 w-1/6">Currency</th>
                <th scope="col" class="px-6 py-3 w-1/4">Description</th>
                <th scope="col" class="px-6 py-3 w-1/6">Date</th>
                <th scope="col" class="px-6 py-3 w-1/6">Status</th>
              </tr>
            </thead>
            <tbody>
              {#each transactions as transaction}
                <tr class="bg-white border-b hover:bg-gray-50">
                  <td class="px-6 py-4 font-medium text-gray-900">
                    <div class="flex items-center space-x-2">
                      <span class="text-lg"
                        >{getTransactionIcon(transaction.type)}</span
                      >
                      <span>{transaction.type}</span>
                    </div>
                  </td>
                  <td
                    class="px-6 py-4 font-semibold {getAmountColor(
                      transaction.amount
                    )}"
                  >
                    {transaction.amount >= 0
                      ? "+"
                      : ""}{transaction.amount.toFixed(2)}
                  </td>
                  <td class="px-6 py-4 font-semibold">{transaction.currency}</td
                  >
                  <td class="px-6 py-4 text-gray-600">
                    {transaction.description}
                  </td>
                  <td class="px-6 py-4">{transaction.timestamp}</td>
                  <td class="px-6 py-4">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {transaction.status ===
                      'Completed'
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'}"
                    >
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile Card View -->
      <div class="mobile-only">
        <div class="space-y-6">
          {#each transactions as transaction}
            <div class="transaction-card card p-5">
              <!-- Transaction Header with Type and Status -->
              <div class="transaction-card-header mb-4">
                <div class="flex justify-between items-start">
                  <div class="transaction-timestamp">
                    <p
                      class="text-xs text-secondary font-medium uppercase tracking-wide mb-1"
                    >
                      Transaction Type
                    </p>
                    <div class="flex items-center space-x-2">
                      <span class="text-lg"
                        >{getTransactionIcon(transaction.type)}</span
                      >
                      <span class="text-base font-semibold text-primary"
                        >{transaction.type}</span
                      >
                    </div>
                  </div>
                  <div class="transaction-status">
                    <span
                      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium {transaction.status ===
                      'Completed'
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'}"
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Transaction Details Grid -->
              <div class="transaction-card-body">
                <div class="transaction-details-grid">
                  <div class="transaction-detail-item">
                    <p
                      class="text-xs text-secondary font-medium uppercase tracking-wide"
                    >
                      Amount
                    </p>
                    <p
                      class="text-sm font-semibold {getAmountColor(
                        transaction.amount
                      )}"
                    >
                      {transaction.amount >= 0
                        ? "+"
                        : ""}{transaction.amount.toFixed(2)}
                    </p>
                  </div>

                  <div class="transaction-detail-item">
                    <p
                      class="text-xs text-secondary font-medium uppercase tracking-wide"
                    >
                      Currency
                    </p>
                    <p class="text-sm font-semibold text-gray-900">
                      {transaction.currency}
                    </p>
                  </div>
                </div>

                <!-- Description - Full Width -->
                <div class="transaction-detail-item mt-3">
                  <p
                    class="text-xs text-secondary font-medium uppercase tracking-wide"
                  >
                    Description
                  </p>
                  <p class="text-sm text-gray-600">
                    {transaction.description}
                  </p>
                </div>

                <!-- Date - Full Width -->
                <div class="transaction-detail-item mt-3">
                  <p
                    class="text-xs text-secondary font-medium uppercase tracking-wide"
                  >
                    Date
                  </p>
                  <p class="text-sm font-semibold text-gray-900">
                    {transaction.timestamp}
                  </p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {:else}
    <div class="card p-6 text-center">
      <p class="text-secondary">Please login to view your wallet</p>
    </div>
  {/if}
</div>
