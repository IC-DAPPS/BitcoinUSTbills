<script lang="ts">
  import { onMount } from "svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import { goto } from "$app/navigation";

  let loading = true;
  let error: string | null = null;

  // Mock user purchase history for demo with proper structure
  let purchases = [
    {
      timestamp: "3/3/57496, 2:13:07 AM",
      tbillType: "4-week",
      amount: "100000",
      price: "$950.00",
      brokerTxnId: "TXN-USR-001-2024",
      status: "completed",
    },
    {
      timestamp: "1/28/57518, 2:13:07 AM",
      tbillType: "13-week",
      amount: "100000",
      price: "$940.00",
      brokerTxnId: "TXN-USR-002-2024",
      status: "completed",
    },
    {
      timestamp: "10/7/57531, 2:13:07 AM",
      tbillType: "26-week",
      amount: "100000",
      price: "$920.00",
      brokerTxnId: "TXN-USR-003-2024",
      status: "pending",
    },
  ];

  onMount(async () => {
    try {
      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 600));
    } catch (e) {
      error = "Error loading your purchase history.";
      console.error(e);
    } finally {
      loading = false;
    }
  });
</script>

<div class="container-wide mx-auto p-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-primary mb-2">My Purchased Bills</h1>
    <p class="text-secondary">
      Your complete purchase history of T-Bills. Each transaction is securely
      recorded on the blockchain and verified by our partner brokers.
    </p>
  </div>

  {#if loading}
    <div class="flex justify-center items-center h-64">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto mb-4"
        ></div>
        <p class="text-secondary">Loading purchase history...</p>
      </div>
    </div>
  {:else if error}
    <div class="card p-6 text-center">
      <h2 class="text-xl font-semibold text-primary mb-4">
        Error Loading Purchase History
      </h2>
      <p class="text-red-500 mb-4">{error}</p>
      <Button variant="primary" on:click={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  {:else if purchases.length === 0}
    <div class="card p-8 text-center">
      <div class="text-6xl mb-4">📋</div>
      <h2 class="text-2xl font-semibold text-primary mb-4">No Purchases Yet</h2>
      <p class="text-secondary mb-6">
        You haven't purchased any Treasury Bills yet. Start investing to see
        your purchase history here.
      </p>
      <Button variant="primary" on:click={() => goto("/marketplace")}>
        Browse Treasury Bills
      </Button>
    </div>
  {:else}
    <!-- Purchase Summary Cards -->
    <div
      class="purchase-summary-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      <div class="card p-6">
        <h3 class="text-sm font-medium text-secondary mb-2">Total Purchases</h3>
        <p class="text-3xl font-bold text-primary">{purchases.length}</p>
      </div>

      <div class="card p-6">
        <h3 class="text-sm font-medium text-secondary mb-2">Total Invested</h3>
        <p class="text-3xl font-bold text-primary">
          ${purchases
            .reduce(
              (sum, p) =>
                sum + parseFloat(p.price.replace("$", "").replace(",", "")),
              0
            )
            .toLocaleString()}
        </p>
      </div>

      <div class="card p-6">
        <h3 class="text-sm font-medium text-secondary mb-2">Completed</h3>
        <p class="text-3xl font-bold text-success">
          {purchases.filter((p) => p.status === "completed").length}
        </p>
      </div>

      <div class="card p-6">
        <h3 class="text-sm font-medium text-secondary mb-2">Pending</h3>
        <p class="text-3xl font-bold text-yellow-600">
          {purchases.filter((p) => p.status === "pending").length}
        </p>
      </div>
    </div>

    <!-- Purchases Table -->
    <div class="card desktop-only mb-12">
      <div class="overflow-x-auto shadow-md sm:rounded-lg">
        <table class="w-full text-sm text-left text-gray-500">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3">Timestamp</th>
              <th scope="col" class="px-6 py-3">T-Bill Type</th>
              <th scope="col" class="px-6 py-3">Amount</th>
              <th scope="col" class="px-6 py-3">Price</th>
              <th scope="col" class="px-6 py-3">Broker Txn ID</th>
              <th scope="col" class="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {#each purchases as purchase}
              <tr class="bg-white border-b hover:bg-gray-50">
                <td
                  class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                >
                  {purchase.timestamp}
                </td>
                <td class="px-6 py-4">{purchase.tbillType}</td>
                <td class="px-6 py-4 font-semibold">{purchase.amount}</td>
                <td class="px-6 py-4 font-semibold text-primary"
                  >{purchase.price}</td
                >
                <td class="px-6 py-4">
                  <code class="text-xs bg-gray-100 px-2 py-1 rounded">
                    {purchase.brokerTxnId}
                  </code>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {purchase.status ===
                    'completed'
                      ? 'bg-green-100 text-green-800'
                      : purchase.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'}"
                  >
                    {purchase.status}
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile Card View -->
    <div class="mobile-only mb-12">
      <div class="space-y-4">
        {#each purchases as purchase}
          <div class="transaction-card card p-4">
            <div class="transaction-card-header mb-3">
              <div class="flex justify-between items-start">
                <div class="transaction-timestamp">
                  <p class="text-xs text-secondary font-medium">
                    Transaction Date
                  </p>
                  <p class="text-sm font-semibold text-primary">
                    {purchase.timestamp}
                  </p>
                </div>
                <div class="transaction-status">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {purchase.status ===
                    'completed'
                      ? 'bg-green-100 text-green-800'
                      : purchase.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'}"
                  >
                    {purchase.status}
                  </span>
                </div>
              </div>
            </div>

            <div class="transaction-card-body">
              <div class="transaction-details-grid">
                <div class="transaction-detail-item">
                  <p class="text-xs text-secondary font-medium">T-Bill Type</p>
                  <p class="text-sm font-semibold">{purchase.tbillType}</p>
                </div>

                <div class="transaction-detail-item">
                  <p class="text-xs text-secondary font-medium">Amount</p>
                  <p class="text-sm font-semibold">{purchase.amount}</p>
                </div>

                <div class="transaction-detail-item">
                  <p class="text-xs text-secondary font-medium">Price</p>
                  <p class="text-sm font-semibold text-primary">
                    {purchase.price}
                  </p>
                </div>

                <div class="transaction-detail-item transaction-id-item">
                  <p class="text-xs text-secondary font-medium">
                    Broker Transaction ID
                  </p>
                  <code
                    class="text-xs bg-gray-100 px-2 py-1 rounded block mt-1"
                  >
                    {purchase.brokerTxnId}
                  </code>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
