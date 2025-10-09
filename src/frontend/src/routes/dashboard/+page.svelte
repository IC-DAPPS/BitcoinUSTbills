<script lang="ts">
  import { authStore } from "$lib/stores/auth.store";
  import { userSate } from "$lib/state/user.svelte";
  import { adminList } from "$lib/state/admin-list.svelte";
  import { ckbtcBalance } from "$lib/state/ckbtc-balance.svelte";
  import { ousgBalance } from "$lib/state/ousg-balance.svelte";
  import AdminDashboard from "$lib/components/AdminDashboard.svelte";
  import { onMount } from "svelte";

  const isAdmin = $derived(() => {
    if (!$authStore.isAuthenticated || !$authStore.principal) return false;
    return adminList.includes($authStore.principal.toString());
  });

  const canTrade = $derived(() => {
    return (
      $authStore.isAuthenticated &&
      userSate.profile &&
      userSate.profile.kyc_status === "Verified"
    );
  });

  onMount(() => {
    // Dashboard initialization
  });
</script>

<svelte:head>
  <title>Dashboard - Bitcoin UST Bills</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <div class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="py-6 text-center">
        <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
        {#if userSate.profile}
          <p class="text-gray-600 mt-1">
            Welcome back, {userSate.profile.email}
          </p>
        {/if}
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {#if !$authStore.isAuthenticated}
      <div class="text-center py-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
        <p class="text-gray-600 mb-6">
          You need to be signed in to access the dashboard.
        </p>
        <button
          onclick={() => authStore.signIn({ identityProvider: "ii" })}
          class="px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600"
        >
          Sign In
        </button>
      </div>
    {:else if !userSate.profile}
      <div class="text-center py-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          Complete Registration
        </h2>
        <p class="text-gray-600 mb-6">
          Please complete your registration to access the dashboard.
        </p>
        <a
          href="/register"
          class="px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600"
        >
          Complete Registration
        </a>
      </div>
    {:else if isAdmin()}
      <AdminDashboard />
    {:else}
      <!-- Balance Overview -->
      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 max-w-4xl mx-auto"
      >
        <div
          class="bg-white rounded-xl p-4 sm:p-6 text-center border border-gray-200 shadow-sm"
        >
          <h3 class="text-base sm:text-lg font-semibold mb-2 text-gray-900">
            ckBTC Balance
          </h3>
          <p class="text-xl sm:text-2xl font-bold text-gray-900">
            {ckbtcBalance.number.toFixed(8)} ckBTC
          </p>
        </div>
        <div
          class="bg-white rounded-xl p-4 sm:p-6 text-center border border-gray-200 shadow-sm"
        >
          <h3 class="text-base sm:text-lg font-semibold mb-2 text-gray-900">
            OUSG Balance
          </h3>
          <p class="text-xl sm:text-2xl font-bold text-gray-900">
            {(Number(ousgBalance.balance) / 1_000_000).toFixed(6)} OUSG
          </p>
        </div>
      </div>

      <!-- Account Status -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 max-w-4xl mx-auto">
        <div
          class="bg-white rounded-xl p-4 sm:p-6 text-center border border-gray-200 shadow-sm"
        >
          <h3 class="text-lg font-semibold mb-2 text-gray-900">KYC Status</h3>
          <p
            class="text-2xl font-bold {userSate.profile?.kyc_status ===
            'Verified'
              ? 'text-black bg-white px-4 py-2 rounded-lg font-semibold'
              : 'text-gray-900 bg-amber-500 px-4 py-2 rounded-lg font-semibold'}"
          >
            {userSate.profile?.kyc_status || "Pending"}
          </p>
        </div>
        <div
          class="bg-white rounded-xl p-4 sm:p-6 text-center border border-gray-200 shadow-sm"
        >
          <h3 class="text-lg font-semibold mb-2 text-gray-900">
            Trading Access
          </h3>
          <p
            class="text-2xl font-bold {canTrade()
              ? 'text-black bg-white px-4 py-2 rounded-lg font-semibold'
              : 'text-gray-900 bg-red-500 px-4 py-2 rounded-lg font-semibold'}"
          >
            {canTrade() ? "Enabled" : "Disabled"}
          </p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 max-w-4xl mx-auto">
        <div
          class="bg-white rounded-xl p-4 sm:p-6 text-center border border-gray-200 shadow-sm"
        >
          <h3 class="text-lg font-semibold mb-2 text-gray-900">
            Mint/Redeem OUSG
          </h3>
          <a
            href="/ousg"
            class="block px-4 py-3 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors mt-2"
          >
            Go to OUSG
          </a>
        </div>
        <div
          class="bg-white rounded-xl p-4 sm:p-6 text-center border border-gray-200 shadow-sm"
        >
          <h3 class="text-lg font-semibold mb-2 text-gray-900">View Wallet</h3>
          <a
            href="/wallet"
            class="block px-4 py-3 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors mt-2"
          >
            Go to Wallet
          </a>
        </div>
        {#if !canTrade()}
          <div
            class="bg-white rounded-xl p-4 sm:p-6 text-center border border-gray-200 shadow-sm"
          >
            <h3 class="text-lg font-semibold mb-2 text-gray-900">
              Complete KYC
            </h3>
            <a
              href="/kyc"
              class="block px-4 py-3 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors mt-2"
            >
              Go to KYC
            </a>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
