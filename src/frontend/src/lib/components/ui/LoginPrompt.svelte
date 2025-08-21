<script lang="ts">
	import Button from './Button.svelte';
	import { login } from '$lib/auth';
</script>

<div class="bg-white border border-gray-200 rounded-lg p-8 text-center mb-8 shadow-sm">
	<div class="mb-6">
		<svg
			class="w-16 h-16 mx-auto text-gray-400 mb-4"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
			></path>
		</svg>
		<h3 class="text-xl font-semibold text-gray-900 mb-2">Login Required</h3>
		<p class="text-gray-600">Please login to access this content</p>
	</div>
	<Button variant="primary" on:click={login}>Login</Button>
</div>
