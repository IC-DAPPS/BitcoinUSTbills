<script>
  import { onMount } from "svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";

  let loading = true;
  let error = null;

  // Simple mock data for demo
  let user = {
    username: "demo_user",
    totalInvested: 1890,
    totalYieldEarned: 125,
    walletBalance: 2500,
  };

  let holdings = [
    {
      id: "holding-1",
      cusip: "912797JK5",
      billType: "4-week",
      purchasePrice: 950,
      currentValue: 975,
      projectedYield: 50,
      purchaseDate: "2024-01-05",
      maturityDays: 15,
      status: "Active",
    },
    {
      id: "holding-2",
      cusip: "912797JL3",
      billType: "13-week",
      purchasePrice: 940,
      currentValue: 952,
      projectedYield: 75,
      purchaseDate: "2024-01-12",
      maturityDays: 83,
      status: "Active",
    },
  ];

  let totalCurrentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  let totalProjectedYield = holdings.reduce(
    (sum, h) => sum + h.projectedYield,
    0
  );
  let portfolioReturn =
    user.totalInvested > 0
      ? ((totalCurrentValue - user.totalInvested) / user.totalInvested) * 100
      : 0;

  onMount(async () => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    loading = false;
  });
</script>

<svelte:head>
  <title>My Portfolio - BitcoinUSTbills</title>
</svelte:head>

<div class="container mx-auto px-6 py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-primary mb-2">My Portfolio</h1>
    <p class="text-secondary">Track your UST Bill investments and yields</p>
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
    <!-- Performance Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-primary mb-2">Total Invested</h3>
        <p class="text-3xl font-bold text-secondary">
          ${user.totalInvested.toFixed(2)}
        </p>
      </div>

      <div class="card p-6">
        <h3 class="text-lg font-semibold text-primary mb-2">Current Value</h3>
        <p class="text-3xl font-bold text-success">
          ${totalCurrentValue.toFixed(2)}
        </p>
      </div>

      <div class="card p-6">
        <h3 class="text-lg font-semibold text-primary mb-2">Total Return</h3>
        <p
          class="text-3xl font-bold {portfolioReturn >= 0
            ? 'text-success'
            : 'text-red-600'}"
        >
          {portfolioReturn >= 0 ? "+" : ""}{portfolioReturn.toFixed(2)}%
        </p>
      </div>

      <div class="card p-6">
        <h3 class="text-lg font-semibold text-primary mb-2">Projected Yield</h3>
        <p class="text-3xl font-bold text-blue-600">
          ${totalProjectedYield.toFixed(2)}
        </p>
      </div>
    </div>

    <!-- User Info -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-primary mb-4">
          Account Overview
        </h3>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-secondary">Username:</span>
            <span class="font-medium">{user.username}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-secondary">Wallet Balance:</span>
            <span class="font-medium text-success"
              >${user.walletBalance.toFixed(2)}</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-secondary">Total Yield Earned:</span>
            <span class="font-medium text-blue-600"
              >${user.totalYieldEarned.toFixed(2)}</span
            >
          </div>
        </div>
      </div>

      <div class="card p-6">
        <h3 class="text-lg font-semibold text-primary mb-4">
          Portfolio Summary
        </h3>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-secondary">Active Holdings:</span>
            <span class="font-medium">{holdings.length}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-secondary">Avg Return:</span>
            <span class="font-medium text-success"
              >{portfolioReturn.toFixed(2)}%</span
            >
          </div>
        </div>
      </div>

      <div class="card p-6">
        <h3 class="text-lg font-semibold text-primary mb-4">Quick Actions</h3>
        <div class="space-y-2">
          <Button
            variant="primary"
            class="w-full"
            on:click={() => (window.location.href = "/marketplace")}
          >
            Browse Bills
          </Button>
          <Button
            variant="secondary"
            class="w-full"
            on:click={() => (window.location.href = "/wallet")}
          >
            Manage Funds
          </Button>
        </div>
      </div>
    </div>

    <!-- Holdings Table -->
    <div class="card p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-primary">My Holdings</h3>
        <Button
          variant="primary"
          on:click={() => (window.location.href = "/marketplace")}
        >
          Browse Bills
        </Button>
      </div>

      {#if holdings.length === 0}
        <div class="text-center py-8">
          <h4 class="text-xl font-semibold text-secondary mb-2">
            No Holdings Yet
          </h4>
          <p class="text-gray-500 mb-4">
            Start building your portfolio by purchasing UST Bills
          </p>
          <Button
            variant="primary"
            on:click={() => (window.location.href = "/marketplace")}
          >
            Explore Marketplace
          </Button>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left py-3 px-4 font-semibold text-secondary"
                  >Bill Details</th
                >
                <th class="text-left py-3 px-4 font-semibold text-secondary"
                  >Purchase Info</th
                >
                <th class="text-left py-3 px-4 font-semibold text-secondary"
                  >Current Value</th
                >
                <th class="text-left py-3 px-4 font-semibold text-secondary"
                  >Yield Projection</th
                >
                <th class="text-left py-3 px-4 font-semibold text-secondary"
                  >Status</th
                >
              </tr>
            </thead>
            <tbody>
              {#each holdings as holding}
                <tr class="border-b hover:bg-gray-50">
                  <td class="py-3 px-4">
                    <div>
                      <div class="font-medium text-primary">
                        {holding.cusip}
                      </div>
                      <div class="text-sm text-secondary">
                        {holding.billType} Treasury Bill
                      </div>
                      <div class="text-sm text-secondary">
                        Maturity: {holding.maturityDays} days
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <div>
                      <div class="font-medium">
                        ${holding.purchasePrice.toFixed(2)}
                      </div>
                      <div class="text-sm text-secondary">
                        on {holding.purchaseDate}
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <div>
                      <div class="font-medium text-success">
                        ${holding.currentValue.toFixed(2)}
                      </div>
                      <div
                        class="text-sm {holding.currentValue >=
                        holding.purchasePrice
                          ? 'text-success'
                          : 'text-red-600'}"
                      >
                        {holding.currentValue >= holding.purchasePrice
                          ? "+"
                          : ""}${(
                          holding.currentValue - holding.purchasePrice
                        ).toFixed(2)}
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <div>
                      <div class="font-medium text-blue-600">
                        ${holding.projectedYield.toFixed(2)}
                      </div>
                      <div class="text-sm text-secondary">at maturity</div>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <span
                      class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {holding.status}
                    </span>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  {/if}
</div>
