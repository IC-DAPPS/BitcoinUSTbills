<script lang="ts">
  import { onMount } from "svelte";
  import { getAllVerifiedBrokerPurchases } from "$lib/api";
  import type { VerifiedBrokerPurchase } from "$lib/types";

  let purchases: VerifiedBrokerPurchase[] = [];
  let isLoading = true;
  let error: string | null = null;

  // Mock user purchase history for demo
  const mockPurchases: VerifiedBrokerPurchase[] = [
    {
      ustbill_type: "4-week",
      broker_txn_id: "TXN-USR-001-2024",
      timestamp: BigInt(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      price: BigInt(95000), // $950
      amount: BigInt(100000), // $1000
    },
    {
      ustbill_type: "13-week",
      broker_txn_id: "TXN-USR-002-2024",
      timestamp: BigInt(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      price: BigInt(94000), // $940
      amount: BigInt(100000), // $1000
    },
    {
      ustbill_type: "26-week",
      broker_txn_id: "TXN-USR-003-2024",
      timestamp: BigInt(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      price: BigInt(92000), // $920
      amount: BigInt(100000), // $1000
    },
  ];

  onMount(async () => {
    try {
      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 600));
      purchases = mockPurchases;
    } catch (e) {
      error = "Error loading your purchase history.";
      console.error(e);
    } finally {
      isLoading = false;
    }
  });
</script>

<div class="container mx-auto p-8">
  <h1 class="text-3xl font-bold mb-6">My Purchased Bills</h1>
  <p class="mb-8 text-gray-600">
    Your complete purchase history of T-Bills. Each transaction is securely
    recorded on the blockchain and verified by our partner brokers.
  </p>

  {#if isLoading}
    <p>Loading your purchase history...</p>
  {:else if error}
    <p class="text-red-500">{error}</p>
  {:else if purchases.length === 0}
    <p>
      You haven't made any T-Bill purchases yet. Visit the marketplace to get
      started!
    </p>
  {:else}
    <div class="overflow-x-auto shadow-md sm:rounded-lg">
      <table class="min-w-full bg-white">
        <thead class="bg-gray-800 text-white">
          <tr>
            <th class="py-3 px-6 text-left">Timestamp</th>
            <th class="py-3 px-6 text-left">T-Bill Type</th>
            <th class="py-3 px-6 text-left">Amount</th>
            <th class="py-3 px-6 text-left">Price</th>
            <th class="py-3 px-6 text-left">Broker Txn ID</th>
          </tr>
        </thead>
        <tbody class="text-gray-700">
          {#each purchases as purchase, i}
            <tr
              class="border-b hover:bg-gray-100 {i % 2 === 0
                ? 'bg-gray-50'
                : ''}"
            >
              <td class="py-3 px-6"
                >{new Date(
                  Number(purchase.timestamp) * 1000
                ).toLocaleString()}</td
              >
              <td class="py-3 px-6">{purchase.ustbill_type}</td>
              <td class="py-3 px-6">{purchase.amount}</td>
              <td class="py-3 px-6"
                >${(Number(purchase.price) / 100).toFixed(2)}</td
              >
              <td class="py-3 px-6 font-mono">{purchase.broker_txn_id}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
