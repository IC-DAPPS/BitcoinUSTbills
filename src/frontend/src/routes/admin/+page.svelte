<script lang="ts">
  import { onMount } from "svelte";
  import {
    adminGetPendingReviews,
    adminReviewFreeKyc,
    getErrorMessage,
  } from "$lib/api";
  import { downloadFile } from "$lib/services/file-store.service";
  import { authStore } from "$lib/stores/auth.store";
  import { adminList, fetchAdminList } from "$lib/state/admin-list.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import { User, FileCheck, CloudUpload, ClipboardCheck } from "@lucide/svelte";
  import type { UserAndFreeKYCSession } from "../../../../declarations/backend/backend.did";
  import { toast } from "svelte-sonner";

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
    selfie: false,
  });
  let downloadProgress = $state(0);
  let reviewNotes = $state("");
  let isSubmittingReview = $state(false);

  onMount(async () => {
    if (!$authStore.isAuthenticated) {
      errorMessage = "Please log in as an admin to view this page.";
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
      errorMessage = "You are not authorized to view this page.";
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
    reviewNotes = "";

    // Reset image states
    documentFrontImage = null;
    documentBackImage = null;
    selfieImage = null;
    imageLoadingStates = { front: false, back: false, selfie: false };
    downloadProgress = 0;

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
            console.error("Failed to load front document:", error);
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
            console.error("Failed to load back document:", error);
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
            console.error("Failed to load selfie:", error);
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
      await adminReviewFreeKyc(
        selectedReview.user.principal.toText(),
        approved,
        reviewNotes.trim() || undefined
      );

      // Remove from pending reviews
      pendingReviews = pendingReviews.filter(
        (review) =>
          review.user.principal.toText() !==
          selectedReview!.user.principal.toText()
      );

      showModal = false;
      selectedReview = null;

      // Show success message
      toast.success(`KYC ${approved ? "approved" : "rejected"} successfully!`);
    } catch (e) {
      console.error(e);
      toast.error(getErrorMessage(e));
    } finally {
      isSubmittingReview = false;
    }
  }

  function openImageInNewWindow(imageUrl: string) {
    if (imageUrl) {
      window.open(imageUrl, "_blank");
    }
  }

  function formatDate(timestamp: bigint): string {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  }

  function getKYCStatusText(status: any): string {
    if (typeof status === "object" && status !== null) {
      const keys = Object.keys(status);
      return keys[0] || "Unknown";
    }
    return String(status);
  }

  function getStatusBadgeClass(status: any): string {
    const statusText = getKYCStatusText(status).toLowerCase();
    switch (statusText) {
      case "pending":
      case "pendingreview":
        return "status-badge status-pending";
      case "verified":
        return "status-badge status-verified";
      case "rejected":
        return "status-badge status-rejected";
      case "expired":
        return "status-badge status-expired";
      default:
        return "status-badge status-pending";
    }
  }
</script>

<svelte:head>
  <title>Admin Panel - KYC Reviews</title>
</svelte:head>

<div class="admin-container">
  <div class="header">
    <h1>🔐 Admin Panel</h1>
    <p class="subtitle">Review and manage KYC applications</p>
  </div>

  {#if isLoading}
    <div class="loading-container">
      <LoadingSpinner />
      <p>Loading pending KYC reviews...</p>
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
              <p class="user-principal">
                {review.user.principal.toText().substring(0, 20)}...
              </p>
            </div>
            <div class={getStatusBadgeClass(review.kyc_session.status)}>
              {getKYCStatusText(review.kyc_session.status)}
            </div>
          </div>

          <div class="card-content">
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">{review.user.email}</span>
            </div>
            <div class="info-row">
              <span class="label">Phone:</span>
              <span class="value"
                >{review.user.phone_number.length > 0
                  ? review.user.phone_number[0]
                  : "Not provided"}</span
              >
            </div>
            <div class="info-row">
              <span class="label">Country:</span>
              <span class="value">{review.user.country}</span>
            </div>
            <div class="info-row">
              <span class="label">Created:</span>
              <span class="value"
                >{formatDate(review.kyc_session.created_at)}</span
              >
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
            <label>Phone:</label>
            <span
              >{selectedReview.user.phone_number.length > 0
                ? selectedReview.user.phone_number[0]
                : "Not provided"}</span
            >
          </div>
          <div class="detail-item">
            <label>Country:</label>
            <span>{selectedReview.user.country}</span>
          </div>
          <div class="detail-item">
            <label>Principal:</label>
            <span class="principal-text"
              >{selectedReview.user.principal.toText()}</span
            >
          </div>
          <div class="detail-item">
            <label>Current Status:</label>
            <span class={getStatusBadgeClass(selectedReview.user.kyc_status)}
              >{getKYCStatusText(selectedReview.user.kyc_status)}</span
            >
          </div>
          <div class="detail-item">
            <label>Created:</label>
            <span>{formatDate(selectedReview.kyc_session.created_at)}</span>
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
              onclick={() =>
                documentFrontImage && openImageInNewWindow(documentFrontImage)}
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
              onclick={() =>
                documentBackImage && openImageInNewWindow(documentBackImage)}
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
      <p class="image-hint">Click on any image to open in full size</p>
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
        <p class="progress-text">
          Loading documents: {Math.round(downloadProgress)}%
        </p>
      </div>
    {/if}

    <!-- Modal Footer -->
    <div class="modal-actions">
      <Button
        variant="secondary"
        onclick={async () => await submitReview(false)}
        disabled={isSubmittingReview}
      >
        {isSubmittingReview ? "Rejecting..." : "❌ Reject KYC"}
      </Button>
      <Button
        variant="primary"
        onclick={async () => await submitReview(true)}
        disabled={isSubmittingReview}
      >
        {isSubmittingReview ? "Approving..." : "✅ Approve KYC"}
      </Button>
    </div>
  {/if}
</Modal>

<style>
  .admin-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    min-height: 100vh;
    background-color: var(--background-main);
  }

  .header {
    text-align: center;
    margin-bottom: 2rem;
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    color: white;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .header h1 {
    margin-bottom: 0.5rem;
    font-size: 2.5rem;
    font-weight: 700;
  }

  .subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
  }

  .loading-container {
    text-align: center;
    padding: 4rem 2rem;
  }

  .loading-container p {
    margin-top: 1rem;
    color: var(--text-secondary);
  }

  .error-container {
    text-align: center;
    padding: 2rem;
    background-color: #fef2f2;
    border-radius: 12px;
    border: 1px solid #fecaca;
    margin: 2rem 0;
  }

  .error-message {
    color: #dc2626;
    margin-bottom: 1rem;
    font-weight: 500;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background-color: #f9fafb;
    border-radius: 16px;
    margin: 2rem 0;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .empty-state h3 {
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
  }

  .empty-state p {
    color: var(--text-secondary);
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }

  .stats-bar {
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    color: white;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-number {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    font-size: 1rem;
    opacity: 0.9;
    font-weight: 500;
  }

  .reviews-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 2rem;
  }

  .review-card {
    background: var(--background-card);
    border: 1px solid var(--border-light);
    border-radius: 16px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    word-wrap: break-word;
    word-break: break-word;
  }

  .review-card:hover {
    border-color: var(--primary-blue);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    gap: 1rem;
  }

  .user-info {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .user-email {
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
    font-size: 1.2rem;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-principal {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-family: monospace;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .status-badge {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border: 1px solid transparent;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 0;
    white-space: nowrap;
  }

  .status-pending {
    background-color: #fef3c7;
    color: #92400e;
    border-color: #fbbf24;
  }

  .status-verified {
    background-color: #dcfce7;
    color: #166534;
    border-color: #22c55e;
  }

  .status-rejected {
    background-color: #fee2e2;
    color: #dc2626;
    border-color: #ef4444;
  }

  .status-expired {
    background-color: #f3f4f6;
    color: #6b7280;
    border-color: #9ca3af;
  }

  .card-content {
    margin-bottom: 1.5rem;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border-light);
  }

  .info-row:last-child {
    border-bottom: none;
  }

  .label {
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .value {
    color: var(--text-primary);
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-footer {
    text-align: right;
    padding-top: 1rem;
    border-top: 1px solid var(--border-light);
  }

  .review-prompt {
    color: var(--primary-blue);
    font-size: 0.9rem;
    font-weight: 600;
  }

  /* Modal Styles */
  .user-section,
  .images-section,
  .notes-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background-color: var(--background-section);
    border-radius: 12px;
    border: 1px solid var(--border-light);
  }

  .user-section:last-child,
  .images-section:last-child,
  .notes-section:last-child {
    margin-bottom: 0;
  }

  .user-section h2,
  .images-section h2,
  .notes-section h2 {
    margin: 0 0 1.5rem 0;
    color: var(--text-primary);
    font-size: 1.25rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .section-icon {
    width: 20px;
    height: 20px;
    color: var(--primary-blue);
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    background-color: var(--background-card);
    border-radius: 8px;
    border: 1px solid var(--border-light);
    transition: all 0.2s ease;
  }

  .detail-item:hover {
    border-color: var(--primary-blue-light);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .detail-item label {
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.25rem;
  }

  .detail-item span {
    color: var(--text-primary);
    font-weight: 500;
    word-break: break-word;
  }

  .principal-text {
    font-family: monospace;
    font-size: 0.875rem;
    word-break: break-all;
  }

  .images-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 1.5rem;
  }

  .image-container {
    text-align: center;
    background-color: var(--background-card);
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid var(--border-light);
    transition: all 0.2s ease;
  }

  .image-container:hover {
    border-color: var(--primary-blue-light);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .image-container h3 {
    margin: 0 0 1rem 0;
    color: var(--text-primary);
    font-size: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .document-image {
    width: 100%;
    max-width: 300px;
    height: auto;
    border: 2px solid var(--border-light);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .document-image:hover {
    border-color: var(--primary-blue);
    transform: scale(1.02);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .image-skeleton {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    background-color: var(--background-section);
    border: 2px dashed var(--border-medium);
    border-radius: 8px;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  .image-skeleton p {
    margin-top: 1rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .image-error {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    background-color: #fef2f2;
    border: 2px dashed #fca5a5;
    border-radius: 8px;
    color: #dc2626;
    font-weight: 500;
  }

  .image-hint {
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-style: italic;
    margin-top: 1rem;
    padding: 1rem;
    background-color: var(--background-card);
    border-radius: 8px;
    border: 1px solid var(--border-light);
  }

  .notes-textarea {
    width: 100%;
    min-height: 120px;
    padding: 1rem;
    border: 1px solid var(--border-light);
    border-radius: 8px;
    font-family: inherit;
    font-size: 0.875rem;
    resize: vertical;
    background-color: var(--background-card);
    color: var(--text-primary);
    transition: all 0.2s ease;
  }

  .notes-textarea:focus {
    outline: none;
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .notes-textarea::placeholder {
    color: var(--text-muted);
  }

  .progress-section {
    margin-top: 1.5rem;
    padding: 1.5rem;
    background-color: var(--background-card);
    border-radius: 12px;
    border: 1px solid var(--border-light);
  }

  .progress-bar {
    width: 100%;
    height: 12px;
    background-color: var(--background-section);
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 1rem;
    border: 1px solid var(--border-light);
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(
      90deg,
      var(--primary-blue) 0%,
      var(--primary-blue-light) 100%
    );
    transition: width 0.3s ease;
    border-radius: 6px;
  }

  .progress-text {
    margin: 0;
    color: var(--text-primary);
    font-size: 0.875rem;
    text-align: center;
    font-weight: 500;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .admin-container {
      padding: 1rem;
    }

    .reviews-grid {
      grid-template-columns: 1fr;
    }

    .detail-grid {
      grid-template-columns: 1fr;
    }

    .images-grid {
      grid-template-columns: 1fr;
    }

    .modal-actions {
      flex-direction: column;
    }

    .header h1 {
      font-size: 2rem;
    }

    .stats-bar {
      gap: 1rem;
    }
  }
</style>
