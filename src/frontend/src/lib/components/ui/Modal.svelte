<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';

	// Visibility (bindable)
	export let open = false;

	// Sizes aligned with app's design system
	export let size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';

	// Accessibility
	export let title: string | undefined = undefined;
	export let ariaLabel: string | undefined = undefined;

	// Behavior
	export let closeOnBackdrop = true;
	export let closeOnEsc = true;
	export let showClose = true;
	export let preventScroll = true;

	// Optional width override (e.g., '700px' or '80%')
	export let width: string | undefined = undefined;

	const dispatch = createEventDispatcher<{ open: boolean; close: void }>();

	let dialogEl: HTMLDivElement | null = null;

	function handleBackdropClick(event: MouseEvent) {
		if (!closeOnBackdrop) return;
		// Only close if the click is on the backdrop, not inside the dialog
		if (event.target === event.currentTarget) {
			close();
		}
	}

	function onKeydown(event: KeyboardEvent) {
		if (!open) return;
		if (closeOnEsc && event.key === 'Escape') {
			event.preventDefault();
			close();
		}
	}

	function close() {
		open = false;
		dispatch('close');
	}

	function lockBodyScroll(lock: boolean) {
		if (!preventScroll) return;
		const { body } = document;
		if (!body) return;
		if (lock) {
			// Store previous overflow to restore precisely
			if (!body.dataset.prevOverflow) body.dataset.prevOverflow = body.style.overflow;
			body.style.overflow = 'hidden';
		} else {
			body.style.overflow = body.dataset.prevOverflow ?? '';
			delete body.dataset.prevOverflow;
		}
	}

	// Manage global listeners and scroll lock
	let initialized = false;
	onMount(() => {
		if (!initialized) {
			window.addEventListener('keydown', onKeydown, true);
			initialized = true;
		}
		if (open) lockBodyScroll(true);
	});

	onDestroy(() => {
		if (initialized) window.removeEventListener('keydown', onKeydown, true);
		lockBodyScroll(false);
	});

	$: if (typeof document !== 'undefined') {
		lockBodyScroll(open);
		if (open) dispatch('open', true);
	}

	$: sizeClass =
		size === 'full'
			? 'modal-full'
			: size === 'xl'
				? 'modal-xl'
				: size === 'lg'
					? 'modal-lg'
					: size === 'sm'
						? 'modal-sm'
						: 'modal-md';
</script>

{#if open}
	<div
		class="modal-backdrop"
		style="z-index: 1000;"
		on:click={handleBackdropClick}
		aria-hidden="true"
	>
		<div
			bind:this={dialogEl}
			class={`modal-dialog ${sizeClass}`}
			role="dialog"
			aria-modal="true"
			aria-labelledby={title ? 'modal-title' : undefined}
			aria-label={!title ? ariaLabel : undefined}
			style={width ? `max-width:${width}` : ''}
		>
			<div class="modal-surface">
				<header class="modal-header">
					<slot name="header">
						{#if title}
							<h3 id="modal-title" class="modal-title">{title}</h3>
						{/if}
					</slot>
					{#if showClose}
						<button class="modal-close" type="button" aria-label="Close" on:click={close}>
							<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					{/if}
				</header>

				<section class="modal-body">
					<slot />
				</section>

				<footer class="modal-footer">
					<slot name="footer" />
				</footer>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Backdrop */
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	/* Dialog container */
	.modal-dialog {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Surface */
	.modal-surface {
		background-color: var(--background-card);
		color: var(--text-primary);
		border: 1px solid var(--border-light);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-large);
		display: flex;
		flex-direction: column;
		max-height: 90vh;
		overflow: hidden;
	}

	/* Header */
	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid var(--border-light);
	}

	.modal-title {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
	}

	.modal-close {
		background: transparent;
		border: 1px solid var(--border-medium);
		border-radius: var(--radius-sm);
		padding: 0.25rem;
		color: var(--text-secondary);
		cursor: pointer;
	}

	.modal-close:hover {
		background: var(--background-section);
	}

	/* Body */
	.modal-body {
		padding: 1rem 1.25rem;
		overflow: auto;
	}

	/* Footer */
	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		border-top: 1px solid var(--border-light);
	}

	/* Sizes */
	.modal-sm .modal-surface {
		max-width: 24rem;
	}
	.modal-md .modal-surface {
		max-width: 32rem;
	}
	.modal-lg .modal-surface {
		max-width: 40rem;
	}
	.modal-xl .modal-surface {
		max-width: 56rem;
	}
	.modal-full .modal-surface {
		max-width: 95vw;
		height: 90vh;
	}

	/* Small screens: ensure good spacing */
	@media (max-width: 640px) {
		.modal-footer {
			flex-direction: column;
			align-items: stretch;
		}
	}
</style>
