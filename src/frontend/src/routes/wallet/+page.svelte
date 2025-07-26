<script lang="ts">
  import { onMount } from "svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";

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
  {:else}
    <!-- Wallet Balance Cards - Better Desktop Layout -->
    <div
      class="wallet-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
    >
      <!-- ICP Balance Card -->
      <div class="card p-6 text-center">
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
      </div>

      <!-- ckBTC Balance Card -->
      <div class="card p-6 text-center">
        <h3 class="text-lg font-semibold text-secondary mb-4">ckBTC Balance</h3>
        <p class="text-4xl font-bold text-primary mb-4">
          {user.ckbtcBalance.toFixed(6)} ckBTC
        </p>
        <p class="text-sm text-secondary mb-6">
          ≈ ${(user.ckbtcBalance * ckbtcPriceUSD).toFixed(2)} USD
        </p>
        <div class="flex gap-2 justify-center">
          <Button
            variant="primary"
            class="flex-1"
            on:click={() => alert("Deposit ckBTC functionality would be here")}
          >
            ⬇ Deposit
          </Button>
          <Button
            variant="secondary"
            class="flex-1"
            on:click={() => alert("Withdraw ckBTC functionality would be here")}
          >
            ⬆ Withdraw
          </Button>
        </div>
      </div>

      <!-- Total Portfolio Value Card -->
      <div
        class="card p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100"
      >
        <h3 class="text-lg font-semibold text-secondary mb-4">
          Total Portfolio
        </h3>
        <p class="text-4xl font-bold text-primary mb-4">
          ${(icpValueUSD + ckbtcValueUSD).toFixed(2)}
        </p>
        <p class="text-sm text-secondary mb-6">Combined wallet value</p>
        <Button
          variant="primary"
          class="w-full"
          on:click={() => (window.location.href = "/marketplace")}
        >
          Invest Now
        </Button>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="card p-6 mb-8">
      <h3 class="text-lg font-semibold text-primary mb-4">Quick Actions</h3>
      <div class="flex flex-row gap-3">
        <Button
          variant="outline"
          class="flex-1 justify-center"
          on:click={() => (window.location.href = "/marketplace")}
        >
          🛒 Buy Treasury Bills
        </Button>
        <Button
          variant="outline"
          class="flex-1 justify-center"
          on:click={() => (window.location.href = "/portfolio")}
        >
          📊 View Portfolio
        </Button>
        <Button
          variant="outline"
          class="flex-1 justify-center"
          on:click={() => alert("Add Funds functionality would be here")}
        >
          💰 Add Funds
        </Button>
      </div>
    </div>

    <!-- Recent Transactions - Square Blocks -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold text-primary mb-6">
        Recent Transactions
      </h3>
      <div class="grid grid-cols-4 gap-4">
        {#each transactions.slice(0, 4) as transaction}
          <div
            class="card p-3 text-center h-32 w-full flex flex-col justify-center"
          >
            <div class="text-xl mb-1">
              {getTransactionIcon(transaction.type)}
            </div>
            <p class="text-xs font-medium text-secondary mb-1">
              {transaction.type}
            </p>
            <p class="text-sm font-bold {getAmountColor(transaction.amount)}">
              {transaction.amount >= 0 ? "+" : ""}{Math.abs(
                transaction.amount
              ).toFixed(0)}
            </p>
            <p class="text-xs text-secondary">
              {transaction.currency}
            </p>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
