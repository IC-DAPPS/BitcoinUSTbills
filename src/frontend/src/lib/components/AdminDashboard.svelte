<script lang="ts">
  import { authStore } from "$lib/stores/auth.store";
  import { onMount } from "svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import Button from "$lib/components/ui/Button.svelte";

  let stats = $state({
    totalOUSGSupply: 0n,
    ckbtcBalance: 0n,
    totalMints: 0,
    totalRedeems: 0,
    loading: true,
    error: null as string | null,
  });

  onMount(async () => {
    await fetchStats();
  });

  async function fetchStats() {
    const { backend } = $authStore;

    if (!backend) {
      stats.error = "Backend actor not available";
      stats.loading = false;
      return;
    }

    try {
      stats.loading = true;
      stats.error = null;

      // Fetch OUSG balance (this represents the total supply for the backend)
      const ousgResponse = await backend.get_ousg_balance();
      if ("Ok" in ousgResponse) {
        stats.totalOUSGSupply = ousgResponse.Ok;
      }

      // Fetch deposit stats
      const depositStatsResponse = await backend.get_deposit_stats();
      stats.totalMints = depositStatsResponse.length;

      // TODO: Add redeem stats when backend supports it
      stats.totalRedeems = 0;

      // TODO: Add ckBTC balance when backend supports it
      stats.ckbtcBalance = 0n;
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      stats.error = "Failed to fetch statistics";
    } finally {
      stats.loading = false;
    }
  }

  function formatAmount(amount: bigint, decimals: number = 6): string {
    return (Number(amount) / Math.pow(10, decimals)).toFixed(decimals);
  }
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h2 class="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
    <Button variant="secondary" onclick={fetchStats} disabled={stats.loading}
      >Refresh Stats</Button
    >
  </div>

  {#if stats.loading}
    <div class="flex justify-center py-12">
      <LoadingSpinner />
    </div>
  {:else if stats.error}
    <div class="text-center py-12">
      <p class="text-red-600 mb-4">{stats.error}</p>
      <Button variant="primary" onclick={fetchStats}>Retry</Button>
    </div>
  {:else}
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total OUSG Supply -->
      <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600">Total OUSG Supply</p>
            <p class="text-2xl font-bold text-slate-800">
              {formatAmount(stats.totalOUSGSupply)}
            </p>
          </div>
          <div
            class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"
          >
            <span class="text-blue-600 text-xl">🪙</span>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-2">
          Equivalent to ${formatAmount(stats.totalOUSGSupply)} USD
        </p>
      </div>

      <!-- ckBTC Balance -->
      <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600">ckBTC Balance</p>
            <p class="text-2xl font-bold text-slate-800">
              {formatAmount(stats.ckbtcBalance, 8)}
            </p>
          </div>
          <div
            class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center"
          >
            <span class="text-orange-600 text-xl">₿</span>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-2">Backend reserve balance</p>
      </div>

      <!-- Total Mints -->
      <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600">Total Mints</p>
            <p class="text-2xl font-bold text-slate-800">
              {stats.totalMints}
            </p>
          </div>
          <div
            class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"
          >
            <span class="text-green-600 text-xl">⬆️</span>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-2">
          Successful minting transactions
        </p>
      </div>

      <!-- Total Redeems -->
      <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600">Total Redeems</p>
            <p class="text-2xl font-bold text-slate-800">
              {stats.totalRedeems}
            </p>
          </div>
          <div
            class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center"
          >
            <span class="text-red-600 text-xl">⬇️</span>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-2">
          Successful redemption transactions
        </p>
      </div>
    </div>

    <!-- Additional Admin Actions -->
    <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-slate-800 mb-4">Admin Actions</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button variant="outline" href="/admin/kyc" class="w-full"
          >Manage KYC Applications</Button
        >
        <Button variant="outline" disabled class="w-full">
          View All Transactions (Coming Soon)
        </Button>
      </div>
    </div>
  {/if}
</div>
