<script lang="ts">
	import { authStore } from '$lib/stores/auth.store';
	import { userSate } from '$lib/state/user.svelte';

	let testValue = $state('Test Value');
</script>

<div class="card p-6">
	<h2 class="text-xl font-semibold text-primary mb-6">Test Minting Form</h2>

	<div class="space-y-4">
		<p>Auth Status: {$authStore.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
		<p>User Profile: {userSate.profile ? 'Loaded' : 'Not Loaded'}</p>
		<p>KYC Status: {userSate.profile?.kyc_status || 'Unknown'}</p>
		<p>Test Value: {testValue}</p>

		<button
			onclick={() => (testValue = 'Updated!')}
			class="px-4 py-2 bg-blue-600 text-white rounded"
		>
			Update Test Value
		</button>
	</div>
</div>
