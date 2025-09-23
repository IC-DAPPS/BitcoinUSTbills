<script lang="ts">
	import { authStore } from '$lib/stores/auth.store';
	import { userSate } from '$lib/state/user.svelte';
	import { adminList } from '$lib/state/admin-list.svelte';
	import MintingForm from '$lib/components/MintingForm.svelte';
	import RedeemingForm from '$lib/components/RedeemingForm.svelte';
	import OUSGBalance from '$lib/components/OUSGBalance.svelte';
	import TransactionHistory from '$lib/components/TransactionHistory.svelte';
	import AdminDashboard from '$lib/components/AdminDashboard.svelte';
	import { onMount } from 'svelte';

	let activeTab = $state('mint');

	const isAdmin = $derived(() => {
		if (!authStore.isAuthenticated || !authStore.principal) return false;
		return adminList.includes(authStore.principal.toString());
	});

	const canTrade = $derived(() => {
		return (
			authStore.isAuthenticated && userSate.profile && userSate.profile.kyc_status === 'Verified'
		);
	});

	onMount(() => {
		// Set default tab based on user status
		if (isAdmin) {
			activeTab = 'admin';
		} else if (canTrade) {
			activeTab = 'mint';
		} else {
			activeTab = 'balance';
		}
	});
</script>

<svelte:head>
	<title>Dashboard - Bitcoin UST Bills</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<div class="bg-white shadow-sm border-b">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center py-6">
				<div>
					<h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
					{#if userSate.profile}
						<p class="text-gray-600 mt-1">
							Welcome back, {userSate.profile.email}
						</p>
					{/if}
				</div>
				<div class="flex items-center space-x-4">
					{#if authStore.isAuthenticated}
						<button
							onclick={() => authStore.signOut()}
							class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
						>
							Sign Out
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if !authStore.isAuthenticated}
			<div class="text-center py-12">
				<h2 class="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
				<p class="text-gray-600 mb-6">You need to be signed in to access the dashboard.</p>
				<button
					onclick={() => authStore.signIn({ identityProvider: 'ii' })}
					class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
				>
					Sign In
				</button>
			</div>
		{:else if !userSate.profile}
			<div class="text-center py-12">
				<h2 class="text-2xl font-bold text-gray-900 mb-4">Complete Registration</h2>
				<p class="text-gray-600 mb-6">Please complete your registration to access the dashboard.</p>
				<a
					href="/register"
					class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
				>
					Complete Registration
				</a>
			</div>
		{:else}
			<!-- Navigation Tabs -->
			<div class="mb-8">
				<nav class="flex space-x-8">
					{#if isAdmin}
						<button
							onclick={() => (activeTab = 'admin')}
							class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'admin'
								? 'border-blue-500 text-blue-600'
								: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
						>
							Admin Dashboard
						</button>
					{/if}

					<button
						onclick={() => (activeTab = 'balance')}
						class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'balance'
							? 'border-blue-500 text-blue-600'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
					>
						Balance
					</button>

					{#if canTrade}
						<button
							onclick={() => (activeTab = 'mint')}
							class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'mint'
								? 'border-blue-500 text-blue-600'
								: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
						>
							Mint OUSG
						</button>

						<button
							onclick={() => (activeTab = 'redeem')}
							class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'redeem'
								? 'border-blue-500 text-blue-600'
								: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
						>
							Redeem OUSG
						</button>
					{/if}

					<button
						onclick={() => (activeTab = 'transactions')}
						class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'transactions'
							? 'border-blue-500 text-blue-600'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
					>
						Transactions
					</button>
				</nav>
			</div>

			<!-- Tab Content -->
			<div class="space-y-8">
				{#if activeTab === 'admin' && isAdmin}
					<AdminDashboard />
				{:else if activeTab === 'balance'}
					<div class="max-w-md mx-auto">
						<OUSGBalance />
					</div>
				{:else if activeTab === 'mint' && canTrade}
					<div class="max-w-md mx-auto">
						<MintingForm />
					</div>
				{:else if activeTab === 'redeem' && canTrade}
					<div class="max-w-md mx-auto">
						<RedeemingForm />
					</div>
				{:else if activeTab === 'transactions'}
					<TransactionHistory />
				{:else if !canTrade}
					<div class="text-center py-12">
						<h2 class="text-2xl font-bold text-gray-900 mb-4">KYC Verification Required</h2>
						<p class="text-gray-600 mb-6">
							You need to complete KYC verification to mint and redeem OUSG tokens.
						</p>
						<a
							href="/kyc"
							class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
						>
							Complete KYC
						</a>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
