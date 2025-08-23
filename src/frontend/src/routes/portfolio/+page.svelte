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
    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    loading = false;
  });
</script>

<svelte:head>
  <title>Portfolio - BitcoinUSTbills</title>
</svelte:head>

<div class="container-wide mx-auto px-6 py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-primary mb-2">My Portfolio</h1>
    <p class="text-secondary">Track your UST Bill investments and yields</p>
  </div>

  {#if loading}
    <div class="flex justify-center py-12">
      <LoadingSpinner />
    </div>
  {:else if error}
    <div class="card p-6 text-center">
      <h2 class="text-xl font-semibold text-primary mb-4">
        Error Loading Portfolio
      </h2>
      <p class="text-red-500 mb-4">{error}</p>
      <Button variant="primary" onclick={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  {:else}
    <!-- Portfolio Summary Cards -->
    <div
      class="portfolio-summary-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      <div class="card p-6">
        <h3 class="text-sm font-medium text-secondary mb-2">Total Invested</h3>
        <p class="text-3xl font-bold text-primary">
          ${user.totalInvested.toFixed(2)}
        </p>
      </div>

      <div class="card p-6">
        <h3 class="text-sm font-medium text-secondary mb-2">Current Value</h3>
        <p class="text-3xl font-bold text-success">
          ${totalCurrentValue.toFixed(2)}
        </p>
      </div>

      <div class="card p-6">
        <h3 class="text-sm font-medium text-secondary mb-2">Total Return</h3>
        <p class="text-3xl font-bold text-success">
          {portfolioReturn >= 0 ? "+" : ""}{portfolioReturn.toFixed(2)}%
        </p>
      </div>

      <div class="card p-6">
        <h3 class="text-sm font-medium text-secondary mb-2">Projected Yield</h3>
        <p class="text-3xl font-bold text-primary">
          ${totalProjectedYield.toFixed(2)}
        </p>
      </div>
    </div>

    <!-- Portfolio Performance Section -->
    <div
      class="portfolio-performance-grid grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
    >
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-primary mb-4">Performance</h3>
        <div class="space-y-4">
          <div class="flex justify-between">
            <span class="text-secondary">Total Return</span>
            <span class="font-semibold text-success"
              >+{portfolioReturn.toFixed(2)}%</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-secondary">30-Day Return</span>
            <span class="font-semibold text-success">+1.2%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-secondary">Best Performing</span>
            <span class="font-semibold">{holdings[0]?.cusip || "N/A"}</span>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <h3 class="text-lg font-semibold text-primary mb-4">Yield Summary</h3>
        <div class="space-y-4">
          <div class="flex justify-between">
            <span class="text-secondary">Earned This Month</span>
            <span class="font-semibold text-success"
              >${user.totalYieldEarned.toFixed(2)}</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-secondary">Expected Next Month</span>
            <span class="font-semibold"
              >${(totalProjectedYield * 0.25).toFixed(2)}</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-secondary">Annual Projection</span>
            <span class="font-semibold">${totalProjectedYield.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <h3 class="text-lg font-semibold text-primary mb-4">
          Portfolio Health
        </h3>
        <div class="space-y-4">
          <div class="flex justify-between">
            <span class="text-secondary">Diversification</span>
            <span class="font-semibold text-success">Good</span>
          </div>
          <div class="flex justify-between">
            <span class="text-secondary">Risk Level</span>
            <span class="font-semibold text-blue">Low</span>
          </div>
          <div class="flex justify-between">
            <span class="text-secondary">Holdings Count</span>
            <span class="font-semibold">{holdings.length}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Holdings Table -->
    <div class="card p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-primary">My Holdings</h2>
        <Button
          variant="outline"
          onclick={() => (window.location.href = "/marketplace")}
        >
          Browse More Bills
        </Button>
      </div>

      {#if holdings.length === 0}
        <div class="text-center py-8">
          <h3 class="text-xl font-semibold text-secondary mb-2">
            No Holdings Yet
          </h3>
          <p class="text-gray-500 mb-6">
            Start investing to see your holdings here
          </p>
          <Button
            variant="primary"
            onclick={() => (window.location.href = "/marketplace")}
          >
            Browse Treasury Bills
          </Button>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Treasury Bill
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Purchase Price
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Current Value
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Projected Yield
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Days to Maturity
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each holdings as holding}
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {holding.cusip}
                      </div>
                      <div class="text-sm text-gray-500">
                        {holding.billType} Treasury Bill
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${holding.purchasePrice.toLocaleString()}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-success font-semibold"
                  >
                    ${holding.currentValue.toLocaleString()}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-primary font-semibold"
                  >
                    ${holding.projectedYield.toLocaleString()}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {holding.maturityDays} days
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
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
