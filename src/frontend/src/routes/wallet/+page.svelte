<script lang="ts">
  import { onMount } from "svelte";
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

  let loading = $state(true);
  let error = $state<string | null>(null);

  // Real transaction history will be fetched from backend
  let transactions = $state([]);

  onMount(async () => {
    await fetchCkbtcBalance();
    // TODO: Fetch real transaction history from backend
    loading = false;
  });
</script>

<svelte:head>
  <title>My Wallet - BitcoinUSTbills</title>
</svelte:head>

<div class="container mx-auto px-6 py-8 max-w-7xl">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-slate-800 mb-2">My Wallet</h1>
    <p class="text-slate-600">Manage your funds and view transaction history</p>
  </div>

  {#if error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-800">{error}</p>
      <button
        class="text-red-600 underline mt-2"
        onclick={() => (error = null)}
      >
        Dismiss
      </button>
    </div>
  {/if}

  {#if loading}
    <div class="flex justify-center py-12">
      <LoadingSpinner />
    </div>
  {:else if $authStore.isAuthenticated}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div
        class="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-200"
      >
        <h3 class="text-lg font-semibold text-slate-600 mb-4">ckBTC Balance</h3>
        <p class="text-4xl font-bold text-slate-800 mb-4">
          {ckbtcBalance.format} ckBTC
        </p>
        <div class="flex space-x-2 justify-center">
          <CkbtcDeposit />
          <Ckbtcwithdraw ledgerId={CKBTC_LEDGER_CANISTER_ID} />
        </div>
      </div>
    </div>

    <div class="mb-8">
      <h3 class="text-lg font-semibold text-slate-800 mb-6">
        Recent Transactions
      </h3>

      {#if transactions.length === 0}
        <div
          class="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-200"
        >
          <p class="text-slate-600">No transactions yet</p>
        </div>
      {:else}
        <!-- Transaction history will be implemented here -->
        <div
          class="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-200"
        >
          <p class="text-slate-600">Transaction history coming soon...</p>
        </div>
      {/if}
    </div>
  {:else}
    <div
      class="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-200"
    >
      <LoginPrompt />
    </div>
  {/if}
</div>
