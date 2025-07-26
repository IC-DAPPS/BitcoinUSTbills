<script>
  import { onMount } from "svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";

  let loading = true;
  let error = null;

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
    await new Promise((resolve) => setTimeout(resolve, 400));
    loading = false;
  });

  function getTransactionIcon(type) {
    switch (type) {
      case "Deposit":
        return "↗️";
      case "Purchase":
        return "💰";
      case "Fee":
        return "📋";
      case "Withdrawal":
        return "↙️";
      default:
        return "📄";
    }
  }

  function getAmountColor(amount) {
    return amount >= 0 ? "text-success" : "text-red-600";
  }
</script>

<svelte:head>
  <title>My Wallet - BitcoinUSTbills</title>
</svelte:head>

<div class="container mx-auto px-6 py-8">
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
  {:else}
    <!-- Wallet Balance -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- ICP Balance -->
      <div class="card p-8 text-center">
        <h2 class="text-lg font-semibold text-secondary mb-2">ICP Balance</h2>
        <p class="text-3xl font-bold text-blue-600 mb-1">
          {user.walletBalance.toFixed(4)} ICP
        </p>
        <p class="text-lg text-secondary mb-4">
          ≈ ${icpValueUSD.toFixed(2)} USD
        </p>
        <div class="flex gap-2 justify-center">
          <Button
            variant="primary"
            class="flex-1"
            on:click={() => alert("Deposit ICP functionality would be here")}
          >
            💳 Deposit
          </Button>
          <Button
            variant="secondary"
            class="flex-1"
            on:click={() => alert("Withdraw ICP functionality would be here")}
          >
            💸 Withdraw
          </Button>
        </div>
      </div>

      <!-- ckBTC Balance -->
      <div class="card p-8 text-center">
        <h2 class="text-lg font-semibold text-secondary mb-2">ckBTC Balance</h2>
        <p class="text-3xl font-bold text-orange-600 mb-1">
          {user.ckbtcBalance.toFixed(6)} ckBTC
        </p>
        <p class="text-lg text-secondary mb-4">
          ≈ ${ckbtcValueUSD.toFixed(2)} USD
        </p>
        <div class="flex gap-2 justify-center">
          <Button
            variant="primary"
            class="flex-1"
            on:click={() => alert("Deposit ckBTC functionality would be here")}
          >
            ₿ Deposit
          </Button>
          <Button
            variant="secondary"
            class="flex-1"
            on:click={() => alert("Withdraw ckBTC functionality would be here")}
          >
            💸 Withdraw
          </Button>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="card p-6 text-center">
        <div class="text-2xl mb-2">🏪</div>
        <h3 class="text-lg font-semibold text-primary mb-2">Invest in Bills</h3>
        <p class="text-sm text-secondary mb-4">
          Browse available Treasury Bills
        </p>
        <Button
          variant="primary"
          class="w-full"
          on:click={() => (window.location.href = "/marketplace")}
        >
          Go to Marketplace
        </Button>
      </div>

      <div class="card p-6 text-center">
        <div class="text-2xl mb-2">📊</div>
        <h3 class="text-lg font-semibold text-primary mb-2">View Portfolio</h3>
        <p class="text-sm text-secondary mb-4">Track your investments</p>
        <Button
          variant="secondary"
          class="w-full"
          on:click={() => (window.location.href = "/portfolio")}
        >
          View Holdings
        </Button>
      </div>

      <div class="card p-6 text-center">
        <div class="text-2xl mb-2">📈</div>
        <h3 class="text-lg font-semibold text-primary mb-2">Dashboard</h3>
        <p class="text-sm text-secondary mb-4">Overview of your account</p>
        <Button
          variant="secondary"
          class="w-full"
          on:click={() => (window.location.href = "/dashboard")}
        >
          Go to Dashboard
        </Button>
      </div>
    </div>

    <!-- Transaction History -->
    <div class="card p-6">
      <h3 class="text-xl font-semibold text-primary mb-4">
        Recent Transactions
      </h3>

      {#if transactions.length === 0}
        <div class="text-center py-8">
          <p class="text-secondary">No transactions yet</p>
        </div>
      {:else}
        <div class="space-y-3">
          {#each transactions as transaction}
            <div
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center gap-3">
                <div class="text-xl">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <p class="font-medium text-primary">
                    {transaction.description}
                  </p>
                  <p class="text-sm text-secondary">
                    {transaction.timestamp} • {transaction.status}
                  </p>
                </div>
              </div>
                              <div class="text-right">
                  <p class="font-semibold {getAmountColor(transaction.amount)}">
                    {transaction.amount >= 0 ? "+" : ""}{Math.abs(transaction.amount).toFixed(transaction.currency === 'ckBTC' ? 6 : 4)} {transaction.currency}
                  </p>
                  <p class="text-xs text-secondary">
                    ≈ ${transaction.currency === 'ICP' ? (Math.abs(transaction.amount) * icpPriceUSD).toFixed(2) : (Math.abs(transaction.amount) * ckbtcPriceUSD).toFixed(2)} USD
                  </p>
                </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
