<script lang="ts">
	import { onMount } from 'svelte';
	import { adminGetPendingReviews, adminReviewFreeKyc, getErrorMessage } from '$lib/api';
	import { downloadFile } from '$lib/services/file-store.service';
	import { authStore } from '$lib/stores/auth.store';
	import { adminList, fetchAdminList } from '$lib/state/admin-list.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	import { User, FileCheck, CloudUpload, ClipboardCheck } from '@lucide/svelte';
	import type { UserAndFreeKYCSession } from '../../../../../declarations/backend/backend.did';
	import { toast } from 'svelte-sonner';

	let pendingReviews = $state<UserAndFreeKYCSession[]>([]);
	let isLoading = $state(true);
	let errorMessage = $state<string | null>(null);
	let isAdmin = $state(false);
	let selectedReview = $state<UserAndFreeKYCSession | null>(null);
	let showModal = $state(false);

	// Modal state
	let documentFrontImage = $state<string | null>(null);
	let documentBackImage = $state<string | null>(null);
	let selfieImage = $state<string | null>(null);
	let imageLoadingStates = $state({
		front: false,
		back: false,
		selfie: false
	});
	let downloadProgress = $state(0);
	let reviewNotes = $state('');
	let isSubmittingReview = $state(false);

	onMount(async () => {
		if (!$authStore.isAuthenticated) {
			errorMessage = 'Please log in as an admin to view this page.';
			isLoading = false;
			return;
		}

		// Fetch admin list if not already loaded
		if (adminList.length === 0) {
			await fetchAdminList();
		}

		const currentUserPrincipal = $authStore.identity?.getPrincipal().toText();
		if (currentUserPrincipal && adminList.includes(currentUserPrincipal)) {
			isAdmin = true;
			await fetchPendingReviews();
		} else {
			errorMessage = 'You are not authorized to view this page.';
		}
		isLoading = false;
	});

	async function fetchPendingReviews() {
		isLoading = true;
		errorMessage = null;
		try {
			pendingReviews = await adminGetPendingReviews();
		} catch (e) {
			console.error(e);
			errorMessage = getErrorMessage(e);
		} finally {
			isLoading = false;
		}
	}

	async function openReviewModal(review: UserAndFreeKYCSession) {
		selectedReview = review;
		showModal = true;
		reviewNotes = '';

		// Reset image states
		documentFrontImage = null;
		documentBackImage = null;
		selfieImage = null;
		imageLoadingStates = { front: false, back: false, selfie: false };

		// Load images
		await loadImages();
	}

	async function loadImages() {
		if (!selectedReview) return;

		const session = selectedReview.kyc_session;
		const imagePromises = [];

		// Load document front page
		if (session.document_front_page) {
			imageLoadingStates.front = true;
			imagePromises.push(
				downloadFile(session.document_front_page, (progress) => {
					downloadProgress = Math.max(downloadProgress, progress / 3);
				})
					.then((file) => {
						documentFrontImage = URL.createObjectURL(file);
						imageLoadingStates.front = false;
					})
					.catch((error) => {
						console.error('Failed to load front document:', error);
						imageLoadingStates.front = false;
					})
			);
		}

		// Load document back page
		if (session.document_back_page) {
			imageLoadingStates.back = true;
			imagePromises.push(
				downloadFile(session.document_back_page, (progress) => {
					downloadProgress = Math.max(downloadProgress, (progress + 100) / 3);
				})
					.then((file) => {
						documentBackImage = URL.createObjectURL(file);
						imageLoadingStates.back = false;
					})
					.catch((error) => {
						console.error('Failed to load back document:', error);
						imageLoadingStates.back = false;
					})
			);
		}

		// Load selfie
		if (session.selfie_with_document) {
			imageLoadingStates.selfie = true;
			imagePromises.push(
				downloadFile(session.selfie_with_document, (progress) => {
					downloadProgress = Math.max(downloadProgress, (progress + 200) / 3);
				})
					.then((file) => {
						selfieImage = URL.createObjectURL(file);
						imageLoadingStates.selfie = false;
					})
					.catch((error) => {
						console.error('Failed to load selfie:', error);
						imageLoadingStates.selfie = false;
					})
			);
		}

		await Promise.all(imagePromises);
		downloadProgress = 100;
	}

	async function submitReview(approved: boolean) {
		if (!selectedReview) return;

		isSubmittingReview = true;
		try {
			console.log(
				'submitting review',
				selectedReview.user.principal.toText(),
				approved,
				reviewNotes.trim()
			);

			await adminReviewFreeKyc(
				selectedReview.user.principal.toText(),
				approved,
				reviewNotes.trim() || undefined
			);

			console.log('review submitted');

			// Remove from pending reviews
			pendingReviews = pendingReviews.filter(
				(review) => review.user.principal.toText() !== selectedReview!.user.principal.toText()
			);

			showModal = false;
			selectedReview = null;

			// Show success message
			toast.success(`KYC ${approved ? 'approved' : 'rejected'} successfully!`);
		} catch (e) {
			console.error(e);
			toast.error(getErrorMessage(e));
		} finally {
			isSubmittingReview = false;
		}
	}

	function openImageInNewWindow(imageUrl: string) {
		if (imageUrl) {
			window.open(imageUrl, '_blank');
		}
	}

	function formatDate(timestamp: bigint): string {
		return new Date(Number(timestamp) * 1000).toLocaleString();
	}

	function getKYCStatusText(status: any): string {
		if (typeof status === 'object' && status !== null) {
			const keys = Object.keys(status);
			return keys[0] || 'Unknown';
		}
		return String(status);
	}

	function getStatusBadgeClass(status: any): string {
		const statusText = getKYCStatusText(status).toLowerCase();
		switch (statusText) {
			case 'pending':
			case 'pendingreview':
				return 'status-badge status-pending';
			case 'verified':
				return 'status-badge status-verified';
			case 'rejected':
				return 'status-badge status-rejected';
			case 'expired':
				return 'status-badge status-expired';
			default:
				return 'status-badge status-pending';
		}
	}
</script>

<div class="admin-kyc-container">
	<div class="header">
		<h1>Admin - KYC Verification</h1>
		<p class="subtitle">Review pending KYC applications</p>
	</div>

	{#if isLoading}
		<div class="loading-container">
			<LoadingSpinner />
			<p>Loading pending reviews...</p>
		</div>
	{:else if !isAdmin}
		<div class="error-container">
			<p class="error-message">
				{errorMessage || 'You do not have permission to access this page.'}
			</p>
		</div>
	{:else if errorMessage}
		<div class="error-container">
			<p class="error-message">{errorMessage}</p>
			<Button variant="secondary" onclick={fetchPendingReviews}>Retry</Button>
		</div>
	{:else if pendingReviews.length === 0}
		<div class="empty-state">
			<div class="empty-icon">✅</div>
			<h3>All caught up!</h3>
			<p>No pending KYC reviews found.</p>
			<Button variant="secondary" onclick={fetchPendingReviews}>Refresh</Button>
		</div>
	{:else}
		<div class="stats-bar">
			<div class="stat">
				<span class="stat-number">{pendingReviews.length}</span>
				<span class="stat-label">Pending Reviews</span>
			</div>
		</div>

		<div class="reviews-grid">
			{#each pendingReviews as review}
				<div class="review-card" onclick={() => openReviewModal(review)}>
					<div class="card-header">
						<div class="user-info">
							<h3 class="user-email">{review.user.email}</h3>
							<p class="user-principal">{review.user.principal.toText().substring(0, 20)}...</p>
						</div>
						<div class={getStatusBadgeClass(review.kyc_session.status)}>
							{getKYCStatusText(review.kyc_session.status)}
						</div>
					</div>

					<div class="card-content">
						<div class="info-row">
							<span class="label">Country:</span>
							<span class="value">{review.user.country}</span>
						</div>
						<div class="info-row">
							<span class="label">Created:</span>
							<span class="value">{formatDate(review.kyc_session.created_at)}</span>
						</div>
						<div class="info-row">
							<span class="label">KYC Tier:</span>
							<span class="value">{review.user.kyc_tier}</span>
						</div>
						<div class="info-row">
							<span class="label">Manual Review:</span>
							<span class="value">{review.kyc_session.needs_manual_review ? 'Yes' : 'No'}</span>
						</div>
					</div>

					<div class="card-footer">
						<span class="review-prompt">Click to review →</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Review Modal -->
<Modal bind:open={showModal} size="xl" title="KYC Review">
	{#if selectedReview}
		<!-- User Information Section -->
		<div class="user-section">
			<h2><User class="section-icon" />User Information</h2>
			<div class="user-details">
				<div class="detail-grid">
					<div class="detail-item">
						<label>Email:</label>
						<span>{selectedReview.user.email}</span>
					</div>
					<div class="detail-item">
						<label>Principal:</label>
						<span class="principal-text">{selectedReview.user.principal.toText()}</span>
					</div>
					<div class="detail-item">
						<label>Country:</label>
						<span>{selectedReview.user.country}</span>
					</div>
					<div class="detail-item">
						<label>Phone:</label>
						<span
							>{selectedReview.user.phone_number.length > 0
								? selectedReview.user.phone_number[0]
								: 'Not provided'}</span
						>
					</div>
					<div class="detail-item">
						<label>KYC Tier:</label>
						<span>{selectedReview.user.kyc_tier}</span>
					</div>
					<div class="detail-item">
						<label>Current Status:</label>
						<span class={getStatusBadgeClass(selectedReview.user.kyc_status)}
							>{getKYCStatusText(selectedReview.user.kyc_status)}</span
						>
					</div>
				</div>
			</div>
		</div>

		<!-- KYC Session Information -->
		<div class="kyc-section">
			<h2><FileCheck class="section-icon" />KYC Session Details</h2>
			<div class="kyc-details">
				<div class="detail-grid">
					<div class="detail-item">
						<label>Created:</label>
						<span>{formatDate(selectedReview.kyc_session.created_at)}</span>
					</div>
					<div class="detail-item">
						<label>Status:</label>
						<span class={getStatusBadgeClass(selectedReview.kyc_session.status)}
							>{getKYCStatusText(selectedReview.kyc_session.status)}</span
						>
					</div>
					<div class="detail-item">
						<label>Manual Review Required:</label>
						<span>{selectedReview.kyc_session.needs_manual_review ? 'Yes' : 'No'}</span>
					</div>
					<div class="detail-item">
						<label>Reviewed At:</label>
						<span
							>{selectedReview.kyc_session.reviewed_at.length > 0
								? formatDate(selectedReview.kyc_session.reviewed_at[0]!)
								: 'Not reviewed'}</span
						>
					</div>
				</div>
			</div>
		</div>

		<!-- Document Images Section -->
		<div class="images-section">
			<h2><CloudUpload class="section-icon" />Submitted Documents</h2>
			<div class="images-grid">
				<!-- Document Front -->
				<div class="image-container">
					<h3>Document Front</h3>
					{#if imageLoadingStates.front}
						<div class="image-skeleton">
							<LoadingSpinner />
							<p>Loading document...</p>
						</div>
					{:else if documentFrontImage}
						<img
							src={documentFrontImage}
							alt="Document Front"
							class="document-image"
							onclick={() => documentFrontImage && openImageInNewWindow(documentFrontImage)}
						/>
					{:else}
						<div class="image-error">Failed to load image</div>
					{/if}
				</div>

				<!-- Document Back -->
				<div class="image-container">
					<h3>Document Back</h3>
					{#if imageLoadingStates.back}
						<div class="image-skeleton">
							<LoadingSpinner />
							<p>Loading document...</p>
						</div>
					{:else if documentBackImage}
						<img
							src={documentBackImage}
							alt="Document Back"
							class="document-image"
							onclick={() => documentBackImage && openImageInNewWindow(documentBackImage)}
						/>
					{:else}
						<div class="image-error">Failed to load image</div>
					{/if}
				</div>

				<!-- Selfie -->
				<div class="image-container">
					<h3>Selfie with Document</h3>
					{#if imageLoadingStates.selfie}
						<div class="image-skeleton">
							<LoadingSpinner />
							<p>Loading selfie...</p>
						</div>
					{:else if selfieImage}
						<img
							src={selfieImage}
							alt="Selfie with Document"
							class="document-image"
							onclick={() => selfieImage && openImageInNewWindow(selfieImage)}
						/>
					{:else}
						<div class="image-error">Failed to load image</div>
					{/if}
				</div>
			</div>
			<p class="image-hint">Click on any image to open in a new window</p>
		</div>

		<!-- Review Notes Section -->
		<div class="notes-section">
			<h2><ClipboardCheck class="section-icon" />Review Notes</h2>
			<textarea
				bind:value={reviewNotes}
				placeholder="Enter optional notes for this review..."
				class="notes-textarea"
				rows="4"
			></textarea>
		</div>

		<!-- Download Progress -->
		{#if downloadProgress < 100 && downloadProgress > 0}
			<div class="progress-section">
				<div class="progress-bar">
					<div class="progress-fill" style="width: {downloadProgress}%"></div>
				</div>
				<p class="progress-text">Loading documents: {Math.round(downloadProgress)}%</p>
			</div>
		{/if}

		<!-- Modal Footer -->
		<div class="modal-actions">
			<Button
				variant="secondary"
				onclick={async () => await submitReview(false)}
				disabled={isSubmittingReview}
			>
				{isSubmittingReview ? 'Rejecting...' : 'Reject KYC'}
			</Button>
			<Button
				variant="primary"
				onclick={async () => await submitReview(true)}
				disabled={isSubmittingReview}
			>
				{isSubmittingReview ? 'Approving...' : 'Approve KYC'}
			</Button>
		</div>
	{/if}
</Modal>

