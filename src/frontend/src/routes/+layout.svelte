<script>
  import "../app.css";
  import Toasts from "$lib/components/ui/Toasts.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import { onMount } from "svelte";
  import { authStore, initAuth, login, logout } from "$lib/auth";

  onMount(async () => {
    await initAuth();
  });
</script>

<header class="bg-white shadow-sm border-b border-light sticky top-0 z-50">
  <nav class="container mx-auto px-6 py-4">
    <div class="flex justify-between items-center">
      <!-- Logo Section -->
      <div class="flex items-center space-x-2">
        <div
          class="w-10 h-10 bg-primary-blue rounded-lg flex items-center justify-center"
        >
          <span class="text-white font-bold text-lg">B</span>
        </div>
        <span class="text-xl font-semibold text-primary">BitcoinUSTbills</span>
      </div>

      <!-- Navigation Links -->
      <div class="hidden md:flex items-center space-x-8">
        <a href="/" class="text-secondary hover:text-primary transition-colors"
          >Home</a
        >
        <a
          href="/dashboard"
          class="text-secondary hover:text-primary transition-colors"
          >Dashboard</a
        >
        <a
          href="/public-ledger"
          class="text-secondary hover:text-primary transition-colors"
          >Public Ledger</a
        >
        <a
          href="/about"
          class="text-secondary hover:text-primary transition-colors">About</a
        >
      </div>

      <!-- Auth Section -->
      <div class="flex items-center space-x-4">
        {#if $authStore.isLoggedIn}
          <span class="text-sm text-secondary">
            {$authStore.identity?.getPrincipal().toString().slice(0, 8)}...
          </span>
          <Button variant="secondary" on:click={logout}>Logout</Button>
        {:else}
          <Button variant="primary" on:click={login}>Login</Button>
        {/if}
      </div>

      <!-- Mobile Menu Button -->
      <div class="md:hidden">
        <button class="text-secondary hover:text-primary">
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  </nav>
</header>

<Toasts />

<main class="min-h-screen">
  <slot />
</main>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
</style>
