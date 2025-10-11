<script lang="ts">
  import "../app.css";
  import Toasts from "$lib/components/ui/Toasts.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import { onDestroy, onMount, tick } from "svelte";
  import { authStore } from "$lib/stores/auth.store";
  import { fetchUserProfile } from "$lib/state/user.svelte";
  import { page } from "$app/state";
  import { navigating } from "$app/state";
  import { Toaster } from "svelte-sonner";
  import { fetchCkbtcBalance } from "$lib/state/ckbtc-balance.svelte";
  import { adminList, fetchAdminList } from "$lib/state/admin-list.svelte";
  import { subscribeToAuthChanges as subscribeToOUSGBalance } from "$lib/state/ousg-balance.svelte";
  import { subscribeToAuthChanges as subscribeToTransactions } from "$lib/state/transactions.svelte";
  import { goto } from "$app/navigation";

  // Mobile menu state - converted to $state()
  let isMobileMenuOpen = $state(false);

  // Loading and page transition states - converted to $state()
  let isInitialLoading = $state(true);
  let isPageLoaded = $state(false);
  let isFooterVisible = $state(false);
  let contentElement = $state<HTMLElement>();

  const toggleMobileMenu = () => {
    isMobileMenuOpen = !isMobileMenuOpen;
  };

  const closeMobileMenu = () => {
    console.log("Closing mobile menu");
    isMobileMenuOpen = false;
  };

  const handleMobileNavClick = (href: string) => {
    console.log("Mobile nav clicked:", href);
    closeMobileMenu();
    // Use SvelteKit's goto for proper client-side navigation
    goto(href);
  };

  // Handle page transitions - converted to $effect()
  $effect(() => {
    if (navigating) {
      isPageLoaded = false;
      isFooterVisible = false;
    }
  });

  // Handle page load completion - converted to $effect()
  $effect(() => {
    if (!navigating && !isInitialLoading) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        isPageLoaded = true;
        // Show footer after content is visible
        setTimeout(() => {
          isFooterVisible = true;
        }, 150);
      }, 50);
    }
  });

  // Effect to handle admin routing based on authentication and admin status
  $effect(() => {
    // Only restrict access to /admin/kyc, allow /admin to be open
    if (page.url.pathname === "/admin/kyc") {
      // Check if user is authenticated
      if ($authStore.principal) {
        const principal = $authStore.principal.toString();

        // Check if authenticated user is an admin
        if (!adminList.includes(principal)) {
          // Redirect non-admins away from admin/kyc page
          goto("/");
        }
      } else {
        // Redirect unauthenticated users away from admin/kyc page
        goto("/");
      }
    }
  });

  onMount(async () => {
    await authStore.sync();

    // Wait for initial render to complete
    await tick();

    await fetchAdminList();

    // Mark initial loading as complete
    setTimeout(() => {
      isInitialLoading = false;
      isPageLoaded = true;

      // Show footer after content
      setTimeout(() => {
        isFooterVisible = true;
      }, 200);
    }, 100);
  });

  // Subscribe to auth store changes
  const authUnsubscriber = authStore.subscribe(async (authState) => {
    if (authState.isAuthenticated) {
      // Only fetch data after authentication
      await fetchUserProfile();
      // Temporarily disable ckBTC balance fetch to avoid canister errors
      await fetchCkbtcBalance();
    }
  });

  // Subscribe to OUSG balance changes
  const ousgBalanceUnsubscriber = subscribeToOUSGBalance();

  // Subscribe to transaction changes
  const transactionsUnsubscriber = subscribeToTransactions();

  onDestroy(() => {
    authUnsubscriber();
    ousgBalanceUnsubscriber();
    transactionsUnsubscriber();
  });
</script>

<Toaster />

<div class="layout-stable">
  <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
    <nav class="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex justify-between items-center">
        <!-- Logo Section -->
        <a
          href="/"
          class="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div
            class="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-lg flex items-center justify-center"
          >
            <span class="text-white font-bold text-base sm:text-lg">₿</span>
          </div>
          <span class="text-lg sm:text-xl font-bold text-gray-900"
            >BitcoinTBill</span
          >
        </a>

        <!-- Desktop Navigation Links -->
        <div class="hidden md:flex items-center space-x-6 lg:space-x-8">
          <a
            href="/"
            class="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm lg:text-base"
            >Home</a
          >
          <a
            href="/dashboard"
            class="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm lg:text-base"
            >Dashboard</a
          >
          <a
            href="/ousg"
            class="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm lg:text-base"
            >BBILL</a
          >
          <a
            href="/wallet"
            class="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm lg:text-base"
            >Wallet</a
          >
          <a
            href="/kyc"
            class="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm lg:text-base"
            >KYC</a
          >
        </div>

        <!-- Desktop Auth Section -->
        <div class="hidden md:flex items-center gap-3 lg:gap-4">
          {#if $authStore.isAuthenticated}
            <span class="text-xs lg:text-sm text-gray-600 font-mono">
              {$authStore.principal?.toString().slice(0, 8)}...
            </span>
            <button
              onclick={() => authStore.signOut()}
              class="px-4 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors text-sm"
            >
              Logout
            </button>
          {:else}
            <button
              onclick={() => authStore.signIn({ identityProvider: "ii" })}
              class="px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors text-sm"
            >
              Login
            </button>
          {/if}
        </div>

        <!-- Mobile Menu Button -->
        <div class="md:hidden">
          <button
            class="text-gray-600 hover:text-gray-900 p-2"
            onclick={toggleMobileMenu}
            aria-label="Toggle menu"
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
        <div
          class="md:hidden mt-4 pb-4 border-t border-gray-200 bg-white relative z-10"
        >
          <div class="flex flex-col space-y-3 pt-4">
            <!-- Mobile Navigation Links -->
            <a
              href="/"
              class="text-gray-600 hover:text-gray-900 transition-colors py-2.5 px-3 rounded-lg hover:bg-gray-50 font-medium"
              onclick={() => handleMobileNavClick("/")}
            >
              Home
            </a>
            <a
              href="/dashboard"
              class="text-gray-600 hover:text-gray-900 transition-colors py-2.5 px-3 rounded-lg hover:bg-gray-50 font-medium"
              onclick={() => handleMobileNavClick("/dashboard")}
            >
              Dashboard
            </a>
            <a
              href="/ousg"
              class="text-gray-600 hover:text-gray-900 transition-colors py-2.5 px-3 rounded-lg hover:bg-gray-50 font-medium"
              onclick={() => handleMobileNavClick("/ousg")}
            >
              BBILL
            </a>
            <a
              href="/wallet"
              class="text-gray-600 hover:text-gray-900 transition-colors py-2.5 px-3 rounded-lg hover:bg-gray-50 font-medium"
              onclick={() => handleMobileNavClick("/wallet")}
            >
              Wallet
            </a>
            <a
              href="/kyc"
              class="text-gray-600 hover:text-gray-900 transition-colors py-2.5 px-3 rounded-lg hover:bg-gray-50 font-medium"
              onclick={() => handleMobileNavClick("/kyc")}
            >
              KYC
            </a>

            <!-- Mobile Auth Section -->
            <div class="flex flex-col space-y-3 pt-4 border-t border-gray-200">
              {#if $authStore.isAuthenticated}
                <span class="text-sm text-gray-600 px-3 font-mono">
                  {$authStore.principal?.toString().slice(0, 8)}...
                </span>
                <button
                  onclick={() => {
                    authStore.signOut();
                    closeMobileMenu();
                  }}
                  class="px-4 py-2.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Logout
                </button>
              {:else}
                <button
                  onclick={() => {
                    authStore.signIn({ identityProvider: "ii" });
                    closeMobileMenu();
                  }}
                  class="px-4 py-2.5 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Login
                </button>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </nav>
  </header>

  <Toasts />

  <!-- Main content with loading states -->
  <main
    class="main-content-area {isPageLoaded ? 'main-content-loaded' : ''}"
    bind:this={contentElement}
  >
    {#if isInitialLoading}
      <!-- Initial loading skeleton -->
      <div class="content-skeleton"></div>
    {:else}
      <!-- Content with page transition -->
      <div
        class={isPageLoaded
          ? "page-transition-enter-active"
          : "page-transition-enter"}
      >
        <slot />
      </div>
    {/if}
  </main>

  <!-- Footer with controlled visibility -->
  <!-- <div class="footer-container {isFooterVisible ? 'visible' : ''}">
		<Footer />
	</div> -->
</div>
