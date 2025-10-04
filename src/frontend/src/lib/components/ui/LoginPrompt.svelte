<script lang="ts">
	import Button from './Button.svelte';
	import { authStore } from '$lib/stores/auth.store';
</script>

<div class="card p-6 text-center">
	<p class="text-secondary mb-4">Please login to view this page</p>
	<Button variant="primary" onclick={() => authStore.signIn({ identityProvider: 'ii' })}>
		Login
	</Button>
</div>
