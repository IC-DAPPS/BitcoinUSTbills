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
			{...$$restProps}
			bind:this={dialogEl}
			class={`modal-content ${sizeClass}`}
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
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(2px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		z-index: 1000;
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-20px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	/* Modal content container */
	.modal-content {
		width: 100%;
		max-width: fit-content;
		margin: auto;
		animation: slideIn 0.3s ease-out;
	}

	/* Surface */
	.modal-surface {
		background-color: var(--background-card);
		color: var(--text-primary);
		border: 1px solid var(--border-light);
		border-radius: var(--radius-xl);
		box-shadow:
			var(--shadow-large),
			0 25px 50px -12px rgba(0, 0, 0, 0.25);
		display: flex;
		flex-direction: column;
		max-height: 90vh;
		overflow: hidden;
		position: relative;
	}

	/* Header */
	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem 2rem;
		border-bottom: 1px solid var(--border-light);
		background-color: var(--background-card);
		border-radius: var(--radius-xl) var(--radius-xl) 0 0;
	}

	.modal-title {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.modal-close {
		background: transparent;
		border: 1px solid var(--border-medium);
		border-radius: var(--radius-md);
		padding: 0.5rem;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
	}

	.modal-close:hover {
		background: var(--background-section);
		border-color: var(--border-medium);
		color: var(--text-primary);
	}

	.modal-close svg {
		width: 16px;
		height: 16px;
	}

	/* Body */
	.modal-body {
		padding: 1.5rem 2rem;
		overflow: auto;
		flex: 1;
	}

	/* Footer */
	.modal-footer {
		padding: 1.5rem 2rem;
		border-top: 1px solid var(--border-light);
		background-color: var(--background-section);
		border-radius: 0 0 var(--radius-xl) var(--radius-xl);
	}

	.modal-footer:empty {
		display: none;
	}

	/* Sizes */
	.modal-sm .modal-surface {
		max-width: 24rem;
		width: 24rem;
	}
	.modal-md .modal-surface {
		max-width: 32rem;
		width: 32rem;
	}
	.modal-lg .modal-surface {
		max-width: 48rem;
		width: 48rem;
	}
	.modal-xl .modal-surface {
		max-width: 64rem;
		width: 64rem;
	}
	.modal-full .modal-surface {
		max-width: 95vw;
		width: 95vw;
		height: 90vh;
	}

	/* Small screens: ensure good spacing */
	@media (max-width: 768px) {
		.modal-backdrop {
			padding: 0.5rem;
		}

		.modal-header,
		.modal-body,
		.modal-footer {
			padding-left: 1rem;
			padding-right: 1rem;
		}

		.modal-sm .modal-surface,
		.modal-md .modal-surface,
		.modal-lg .modal-surface,
		.modal-xl .modal-surface {
			width: 100%;
			max-width: calc(100vw - 1rem);
		}

		.modal-footer {
			flex-direction: column;
			align-items: stretch;
			gap: 0.5rem;
		}
	}
</style>
