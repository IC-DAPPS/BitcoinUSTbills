<script lang="ts">
	import '../app.css';
	import Toasts from '$lib/components/ui/Toasts.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onDestroy, onMount, tick } from 'svelte';
	import { authStore, initAuth, login, logout, type AuthState } from '$lib/auth';
	import { fetchUserProfile } from '$lib/state/user.svelte';
	import { page } from '$app/state';
	import { navigating } from '$app/state';
	import { Toaster } from 'svelte-sonner';
	import { fetchCkbtcBalance } from '$lib/state/ckbtc-balance.svelte';
	import { getAgent } from '$lib/actors/agents.ic';
	import { actor, createActor } from '$lib/agent';
	import { adminList, fetchAdminList } from '$lib/state/admin-list.svelte';
	import { goto } from '$app/navigation';
	import { AnonymousIdentity } from '@dfinity/agent';

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
		isMobileMenuOpen = false;
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
		// Check if user is authenticated
		if ($authStore.identity) {
			const principal = $authStore.identity.getPrincipal().toString();

			// Check if authenticated user is an admin
			if (adminList.includes(principal)) {
				// Redirect admins to KYC management page if not already there
				if (page.url.pathname !== '/admin/kyc') {
					goto('/admin/kyc');
				}
			} else {
				// Redirect non-admins away from admin pages
				if (page.url.pathname === '/admin/kyc') {
					goto('/');
				}
			}
		} else {
			// Redirect unauthenticated users away from admin pages
			if (page.url.pathname === '/admin/kyc') {
				goto('/');
			}
		}
	});

	onMount(async () => {
		await initAuth();

		// Wait for initial render to complete
		await tick();

		await createActorBasedOnIdentity($authStore);

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

	const createActorBasedOnIdentity = async ({ identity, isLoggedIn }: AuthState) => {
		if (identity && isLoggedIn) {
			console.log('principal', identity.getPrincipal().toString());
			const agent = await getAgent({ identity });
			const newActor = await createActor(agent);
			actor.set(newActor);
		} else {
			console.log('creating new actor with anonymous identity');
			const agent = await getAgent({ identity: new AnonymousIdentity() });
			const newActor = await createActor(agent);
			actor.set(newActor);
		}
	};

	const newActorUnsubscriber = authStore.subscribe(async (authState) => {
		await createActorBasedOnIdentity(authState);

		if (authState.isLoggedIn) {
			// Only fetch data after actor is initialized
			await fetchUserProfile();
			// Temporarily disable ckBTC balance fetch to avoid canister errors
			await fetchCkbtcBalance();
		}
	});
	onDestroy(newActorUnsubscriber);
</script>

<Toaster />

<div class="layout-stable">
	<header class="bg-white shadow-sm border-b border-light sticky top-0 z-50">
		<nav class="container mx-auto px-6 py-4">
			<div class="flex justify-between items-center">
				<!-- Logo Section -->
				<div class="flex items-center space-x-2">
					<div class="w-10 h-10 bg-primary-blue rounded-lg flex items-center justify-center">
						<span class="text-white font-bold text-lg">B</span>
					</div>
					<span class="text-xl font-semibold text-primary">BitcoinUSTbills</span>
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
            href="/purchased"
            class="text-secondary hover:text-primary transition-colors"
            >Purchased</a
          >
          <a
            href="/kyc"
            class="text-secondary hover:text-primary transition-colors">KYC</a
          >
          
        </div>

				<!-- Desktop Auth Section -->
				<div class="desktop-only flex items-center space-x-4">
					{#if $authStore.isLoggedIn}
						<span class="text-sm text-secondary">
							{$authStore.identity?.getPrincipal().toString().slice(0, 8)}...
						</span>
						<Button variant="secondary" onclick={logout}>Logout</Button>
					{:else}
						<Button variant="primary" onclick={login}>Login</Button>
					{/if}
				</div>

				<!-- Mobile Menu Button -->
				<div class="mobile-only">
					<button class="text-secondary hover:text-primary p-2" onclick={toggleMobileMenu}>
						{#if !isMobileMenuOpen}
							<!-- Hamburger Icon -->
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 6h16M4 12h16M4 18h16"
								></path>
							</svg>
						{:else}
							<!-- Close Icon -->
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              href="/purchased"
              class="text-secondary hover:text-primary transition-colors py-2 px-2 rounded hover:bg-gray-50"
              on:click={closeMobileMenu}
            >
              Purchased
            </a>
            <a
              href="/kyc"
              class="text-secondary hover:text-primary transition-colors py-2 px-2 rounded hover:bg-gray-50"
              on:click={closeMobileMenu}
            >
              KYC
            </a>
            

						<!-- Mobile Auth Section -->
						<div class="flex flex-col space-y-3 pt-4 border-t border-light">
							{#if $authStore.isLoggedIn}
								<span class="text-sm text-secondary px-2">
									{$authStore.identity?.getPrincipal().toString().slice(0, 8)}...
								</span>
								<Button
									variant="secondary"
									onclick={() => {
										logout();
										closeMobileMenu();
									}}
								>
									Logout
								</Button>
							{:else}
								<Button
									variant="primary"
									onclick={() => {
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
			<div class={isPageLoaded ? 'page-transition-enter-active' : 'page-transition-enter'}>
				<slot />
			</div>
		{/if}
	</main>

	<!-- Footer with controlled visibility -->
	<!-- <div class="footer-container {isFooterVisible ? 'visible' : ''}">
		<Footer />
	</div> -->
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
