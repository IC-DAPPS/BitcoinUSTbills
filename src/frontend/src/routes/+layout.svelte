<script lang="ts">
	import '../app.css';
	import Toasts from '$lib/components/ui/Toasts.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onDestroy, onMount, tick } from 'svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { fetchUserProfile } from '$lib/state/user.svelte';
	import { page } from '$app/state';
	import { navigating } from '$app/state';
	import { Toaster } from 'svelte-sonner';
	import { fetchCkbtcBalance } from '$lib/state/ckbtc-balance.svelte';
	import { adminList, fetchAdminList } from '$lib/state/admin-list.svelte';
	import { subscribeToAuthChanges as subscribeToOUSGBalance } from '$lib/state/ousg-balance.svelte';
	import { goto } from '$app/navigation';

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
		if ($authStore.principal) {
			const principal = $authStore.principal.toString();

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
	
	onDestroy(() => {
		authUnsubscriber();
		ousgBalanceUnsubscriber();
	});
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
					<a href="/" class="text-secondary hover:text-primary transition-colors">Home</a>
					<a href="/dashboard" class="text-secondary hover:text-primary transition-colors"
						>Dashboard</a
					>
					<a href="/marketplace" class="text-secondary hover:text-primary transition-colors"
						>Marketplace</a
					>
					<a href="/portfolio" class="text-secondary hover:text-primary transition-colors"
						>Portfolio</a
					>
					<a href="/wallet" class="text-secondary hover:text-primary transition-colors">Wallet</a>
					<a href="/purchased" class="text-secondary hover:text-primary transition-colors"
						>Purchased</a
					>
					<a href="/kyc" class="text-secondary hover:text-primary transition-colors">KYC</a>
				</div>

				<!-- Desktop Auth Section -->
				<div class="desktop-only flex items-center space-x-4">
					{#if $authStore.isAuthenticated}
						<span class="text-sm text-secondary">
							{$authStore.principal?.toString().slice(0, 8)}...
						</span>
						<Button variant="secondary" onclick={() => authStore.signOut()}>Logout</Button>
					{:else}
						<Button variant="primary" onclick={() => authStore.signIn({ identityProvider: 'ii' })}
							>Login</Button
						>
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
							onclick={closeMobileMenu}
						>
							Home
						</a>
						<a
							href="/dashboard"
							class="text-secondary hover:text-primary transition-colors py-2 px-2 rounded hover:bg-gray-50"
							onclick={closeMobileMenu}
						>
							Dashboard
						</a>
						<a
							href="/marketplace"
							class="text-secondary hover:text-primary transition-colors py-2 px-2 rounded hover:bg-gray-50"
							onclick={closeMobileMenu}
						>
							Marketplace
						</a>
						<a
							href="/portfolio"
							class="text-secondary hover:text-primary transition-colors py-2 px-2 rounded hover:bg-gray-50"
							onclick={closeMobileMenu}
						>
							Portfolio
						</a>
						<a
							href="/wallet"
							class="text-secondary hover:text-primary transition-colors py-2 px-2 rounded hover:bg-gray-50"
							onclick={closeMobileMenu}
						>
							Wallet
						</a>
						<a
							href="/purchased"
							class="text-secondary hover:text-primary transition-colors py-2 px-2 rounded hover:bg-gray-50"
							onclick={closeMobileMenu}
						>
							Purchased
						</a>
						<a
							href="/kyc"
							class="text-secondary hover:text-primary transition-colors py-2 px-2 rounded hover:bg-gray-50"
							onclick={closeMobileMenu}
						>
							KYC
						</a>

						<!-- Mobile Auth Section -->
						<div class="flex flex-col space-y-3 pt-4 border-t border-light">
							{#if $authStore.isAuthenticated}
								<span class="text-sm text-secondary px-2">
									{$authStore.principal?.toString().slice(0, 8)}...
								</span>
								<Button
									variant="secondary"
									onclick={() => {
										authStore.signOut();
										closeMobileMenu();
									}}
								>
									Logout
								</Button>
							{:else}
								<Button
									variant="primary"
									onclick={() => {
										authStore.signIn({ identityProvider: 'ii' });
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
