<script>
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '../ui/Input.svelte';
	import Modal from '../ui/Modal.svelte';
	import { Copy } from 'lucide-svelte';

	let open = false;
</script>

<Button variant="primary" class="flex-1" on:click={() => (open = true)}>⬇ Deposit</Button>

<Modal bind:open size="lg" title="Confirm Action" on:close={() => console.log('closed')}>
	<label for="principal-id" class="w-full border rounded-lg p-3 md:p-4 space-y-3">
		<div class="flex justify-between items-center">
			<span class="font-medium text-base">Principal ID</span>
			<Button
				variant="secondary"
				class="text-xs py-1.5 px-2.5 text-gray-700 "
				on:click={copyPrincipalId}
			>
				<Copy size={18} class="mr-2" />Copy</Button
			>
		</div>
		<Input
			id="principal-id"
			type="text"
			value={principalId}
			readonly
			placeholder="Default input"
			size="md"
			class="outline-0 text-xs"
		/>
		<p class="text-xs text-gray-500">
			Use for all ICRC tokens when receiving from wallets, users, or other apps that support
			Principal ID.
		</p>
	</label>

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={() => (open = false)}>Cancel</Button>
		<Button
			variant="primary"
			on:click={() => {
				/* do action */ open = false;
			}}>Confirm</Button
		>
	</svelte:fragment>
</Modal>
