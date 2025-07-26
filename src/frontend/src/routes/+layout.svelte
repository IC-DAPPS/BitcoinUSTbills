<script>
  import "../app.css";
  import Toasts from "$lib/components/ui/Toasts.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { onMount } from "svelte";
  import { authStore, initAuth, login, logout } from "$lib/auth";

  // Mobile menu state
  let isMobileMenuOpen = false;

  const toggleMobileMenu = () => {
    isMobileMenuOpen = !isMobileMenuOpen;
  };

  const closeMobileMenu = () => {
    isMobileMenuOpen = false;
  };

  onMount(async () => {
    await initAuth();
  });
</script>

<div class="min-h-screen flex flex-col">
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
          <span class="text-xl font-semibold text-primary">BitcoinUSTbills</span
          >
        </div>

        <!-- Desktop Navigation Links -->
        <div class="desktop-only flex items-center space-x-8">
          <a
            href="/"
            class="text-secondary hover:text-primary transition-colors">Home</a
          >
          <a
            href="/dashboard"
            class="text-secondary hover:text-primary transition-colors"
            >Dashboard</a
          >
          <a
            href="/marketplace"
            class="text-secondary hover:text-primary transition-colors"
            >Marketplace</a
          >
          <a
            href="/portfolio"
            class="text-secondary hover:text-primary transition-colors"
            >Portfolio</a
          >
          <a
            href="/wallet"
            class="text-secondary hover:text-primary transition-colors"
            >Wallet</a
          >
          <a
            href="/public-ledger"
            class="text-secondary hover:text-primary transition-colors"
            >Purchased</a
          >
        </div>

        <!-- Desktop Auth Section -->
        <div class="desktop-only flex items-center space-x-4">
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
        <div class="mobile-only">
          <button
            class="text-secondary hover:text-primary p-2"
            on:click={toggleMobileMenu}
          >
            {#if !isMobileMenuOpen}
              <!-- Hamburger Icon -->
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
            {:else}
              <!-- Close Icon -->
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
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            {/if}
          </button>
        </div>
      </div>

      <!-- Mobile Menu Drawer -->
      {#if isMobileMenuOpen}
        <div class="mobile-only mt-4 pb-4 border-t border-light">
          <div class="flex flex-col space-y-4 pt-4">
            <!-- Mobile Navigation Links -->
            <a
              href="/"
              class="text-secondary hover:text-primary transition-colors py-2 px-2 rounded hover:bg-gray-50"
              on:click={closeMobileMenu}
            >
              Home
            </a>
            <a
              href="/dashboard"
              class="text-secondary hover:text-primary transition-colors py-2 px-2 rounded hover:bg-gray-50"
              on:click={closeMobileMenu}
            >
              Dashboard
            </a>
            <a
              href="/marketplace"
              class="text-secondary hover:text-primary transition-colors py-2 px-2 rounded hover:bg-gray-50"
              on:click={closeMobileMenu}
            >
              Marketplace
            </a>
            <a
              href="/portfolio"
              class="text-secondary hover:text-primary transition-colors py-2 px-2 rounded hover:bg-gray-50"
              on:click={closeMobileMenu}
            >
              Portfolio
            </a>
            <a
              href="/wallet"
              class="text-secondary hover:text-primary transition-colors py-2 px-2 rounded hover:bg-gray-50"
              on:click={closeMobileMenu}
            >
              Wallet
            </a>
            <a
              href="/public-ledger"
              class="text-secondary hover:text-primary transition-colors py-2 px-2 rounded hover:bg-gray-50"
              on:click={closeMobileMenu}
            >
              Purchased
            </a>

            <!-- Mobile Auth Section -->
            <div class="flex flex-col space-y-3 pt-4 border-t border-light">
              {#if $authStore.isLoggedIn}
                <span class="text-sm text-secondary px-2">
                  {$authStore.identity
                    ?.getPrincipal()
                    .toString()
                    .slice(0, 8)}...
                </span>
                <Button
                  variant="secondary"
                  on:click={() => {
                    logout();
                    closeMobileMenu();
                  }}
                >
                  Logout
                </Button>
              {:else}
                <Button
                  variant="primary"
                  on:click={() => {
                    login();
                    closeMobileMenu();
                  }}
                >
                  Login
                </Button>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </nav>
  </header>

  <Toasts />

  <main class="flex-1">
    <slot />
  </main>

  <Footer />
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }

  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>
