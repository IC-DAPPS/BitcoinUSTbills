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
      <div class="py-6">
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
          class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
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
          class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
        >
          Complete Registration
        </a>
      </div>
    {:else if isAdmin()}
      <AdminDashboard />
    {:else}
      <!-- Balance Overview -->
      <div class="dashboard-balance-grid">
        <div class="dashboard-balance-card">
          <h3 class="dashboard-balance-title">ckBTC Balance</h3>
          <p class="dashboard-balance-amount dashboard-balance-ckbtc">
            {ckbtcBalance.number.toFixed(8)} ckBTC
          </p>
        </div>
        <div class="dashboard-balance-card">
          <h3 class="dashboard-balance-title">OUSG Balance</h3>
          <p class="dashboard-balance-amount dashboard-balance-ousg">
            {(Number(ousgBalance.balance) / 1_000_000).toFixed(6)} OUSG
          </p>
        </div>
      </div>

      <!-- Account Status -->
      <div class="dashboard-status-grid">
        <div class="dashboard-status-card">
          <h3 class="dashboard-status-title">KYC Status</h3>
          <p
            class="dashboard-status-amount {userSate.profile?.kyc_status ===
            'Verified'
              ? 'dashboard-status-verified'
              : 'dashboard-status-pending'}"
          >
            {userSate.profile?.kyc_status || "Pending"}
          </p>
        </div>
        <div class="dashboard-status-card">
          <h3 class="dashboard-status-title">Trading Access</h3>
          <p
            class="dashboard-status-amount {canTrade()
              ? 'dashboard-status-enabled'
              : 'dashboard-status-disabled'}"
          >
            {canTrade() ? "Enabled" : "Disabled"}
          </p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="dashboard-actions-grid">
        <div class="dashboard-action-card">
          <h3 class="dashboard-action-title">Mint/Redeem OUSG</h3>
          <a href="/ousg" class="dashboard-action-btn dashboard-action-primary">
            Go to OUSG
          </a>
        </div>
        <div class="dashboard-action-card">
          <h3 class="dashboard-action-title">View Wallet</h3>
          <a
            href="/wallet"
            class="dashboard-action-btn dashboard-action-secondary"
          >
            Go to Wallet
          </a>
        </div>
        {#if !canTrade()}
          <div class="dashboard-action-card">
            <h3 class="dashboard-action-title">Complete KYC</h3>
            <a
              href="/kyc"
              class="dashboard-action-btn dashboard-action-outline"
            >
              Go to KYC
            </a>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  /* Custom CSS for Dashboard - laptop view optimization */

  .dashboard-balance-grid,
  .dashboard-status-grid,
  .dashboard-actions-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  @media (min-width: 768px) {
    .dashboard-balance-grid,
    .dashboard-status-grid,
    .dashboard-actions-grid {
      grid-template-columns: 1fr 1fr;
      max-width: 800px;
      margin: 0 auto 1.5rem auto;
    }
  }

  .dashboard-balance-card,
  .dashboard-status-card,
  .dashboard-action-card {
    background: #2563eb !important;
    border-radius: 0.75rem;
    padding: 1.5rem;
    text-align: center;
    border: 1px solid #2563eb;
  }

  .dashboard-balance-title,
  .dashboard-status-title,
  .dashboard-action-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #1e293b !important;
  }

  .dashboard-balance-amount,
  .dashboard-status-amount {
    font-size: 1.5rem;
    font-weight: bold;
    color: #1e293b !important;
  }

  .dashboard-balance-ckbtc {
    color: #1e293b !important;
  }

  .dashboard-balance-ousg {
    color: #1e293b !important;
  }

  .dashboard-status-verified {
    color: #1e293b !important;
    background: #10b981;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 600;
  }

  .dashboard-status-pending {
    color: #1e293b !important;
    background: #f59e0b;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 600;
  }

  .dashboard-status-enabled {
    color: #1e293b !important;
    background: #10b981;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 600;
  }

  .dashboard-status-disabled {
    color: #1e293b !important;
    background: #ef4444;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 600;
  }

  .dashboard-action-btn {
    display: block;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    font-size: 1rem;
    text-align: center;
    text-decoration: none;
    transition: all 0.2s;
    border: none;
    cursor: pointer;
    margin-top: 0.5rem;
  }

  .dashboard-action-primary {
    background-color: #1e293b !important;
    color: #ffffff !important;
    border: 1px solid #1e293b !important;
  }

  .dashboard-action-primary:hover {
    background-color: #334155 !important;
    color: #ffffff !important;
  }

  .dashboard-action-secondary {
    background-color: #1e293b !important;
    color: #ffffff !important;
    border: 1px solid #1e293b !important;
  }

  .dashboard-action-secondary:hover {
    background-color: #334155 !important;
    color: #ffffff !important;
  }

  .dashboard-action-outline {
    background-color: #1e293b !important;
    color: #ffffff !important;
    border: 1px solid #1e293b !important;
  }

  .dashboard-action-outline:hover {
    background-color: #334155 !important;
    color: #ffffff !important;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .dashboard-balance-card,
    .dashboard-status-card,
    .dashboard-action-card {
      background: #1f2937;
      border-color: #374151;
    }

    .dashboard-balance-title,
    .dashboard-status-title,
    .dashboard-action-title {
      color: #f9fafb;
    }

    .dashboard-balance-amount,
    .dashboard-status-amount {
      color: #f9fafb;
    }

    .dashboard-balance-ckbtc,
    .dashboard-balance-ousg {
      color: #f9fafb;
    }
  }
</style>
