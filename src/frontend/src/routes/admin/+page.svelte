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
        return "px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full";
      case "verified":
        return "px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full";
      case "rejected":
        return "px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full";
      case "expired":
        return "px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full";
      default:
        return "px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full";
    }
  }
</script>

<svelte:head>
  <title>Admin Panel - KYC Reviews</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">🔐 Admin Panel</h1>
      <p class="text-lg text-gray-600">Review and manage KYC applications</p>
    </div>

    {#if isLoading}
      <div class="flex flex-col items-center justify-center py-12">
        <LoadingSpinner />
        <p class="mt-4 text-gray-600">Loading pending KYC reviews...</p>
      </div>
    {:else if errorMessage}
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p class="text-red-800 font-medium">{errorMessage}</p>
        <Button variant="secondary" onclick={fetchPendingReviews} class="mt-4"
          >Retry</Button
        >
      </div>
    {:else if pendingReviews.length === 0}
      <div class="bg-white rounded-xl shadow-lg p-8 text-center">
        <div class="text-6xl mb-4">✅</div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">All caught up!</h3>
        <p class="text-gray-600 mb-6">No pending KYC reviews found.</p>
        <Button variant="secondary" onclick={fetchPendingReviews}
          >Refresh</Button
        >
      </div>
    {:else}
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-center">
          <span class="text-3xl font-bold text-blue-600 mr-2"
            >{pendingReviews.length}</span
          >
          <span class="text-lg text-blue-800 font-medium">Pending Reviews</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each pendingReviews as review}
          <div
            class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 cursor-pointer hover:shadow-xl transition-shadow"
            onclick={() => openReviewModal(review)}
          >
            <div class="flex justify-between items-start mb-4">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">
                  {review.user.email}
                </h3>
                <p class="text-sm text-gray-500 font-mono">
                  {review.user.principal.toText().substring(0, 20)}...
                </p>
              </div>
              <div class={getStatusBadgeClass(review.kyc_session.status)}>
                {getKYCStatusText(review.kyc_session.status)}
              </div>
            </div>

            <div class="space-y-2 mb-4">
              <div class="flex justify-between">
                <span class="text-sm font-medium text-gray-600">Email:</span>
                <span class="text-sm text-gray-900">{review.user.email}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm font-medium text-gray-600">Phone:</span>
                <span class="text-sm text-gray-900"
                  >{review.user.phone_number.length > 0
                    ? review.user.phone_number[0]
                    : "Not provided"}</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-sm font-medium text-gray-600">Country:</span>
                <span class="text-sm text-gray-900">{review.user.country}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm font-medium text-gray-600">Created:</span>
                <span class="text-sm text-gray-900"
                  >{formatDate(review.kyc_session.created_at)}</span
                >
              </div>
            </div>

            <div class="text-center pt-4 border-t border-gray-200">
              <span class="text-sm text-blue-600 font-medium"
                >Click to review →</span
              >
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Review Modal -->
<Modal bind:open={showModal} size="xl" title="KYC Review">
  {#if selectedReview}
    <!-- User Information Section -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center">
        <User class="w-6 h-6 mr-2 text-blue-600" />User Information
      </h2>
      <div class="bg-gray-50 rounded-lg p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-600 mb-1">Email:</label>
            <span class="text-gray-900">{selectedReview.user.email}</span>
          </div>
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-600 mb-1">Phone:</label>
            <span
              >{selectedReview.user.phone_number.length > 0
                ? selectedReview.user.phone_number[0]
                : "Not provided"}</span
            >
          </div>
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-600 mb-1"
              >Country:</label
            >
            <span class="text-gray-900">{selectedReview.user.country}</span>
          </div>
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-600 mb-1"
              >Principal:</label
            >
            <span class="text-gray-900 font-mono text-sm break-all"
              >{selectedReview.user.principal.toText()}</span
            >
          </div>
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-600 mb-1"
              >Current Status:</label
            >
            <span class={getStatusBadgeClass(selectedReview.user.kyc_status)}
              >{getKYCStatusText(selectedReview.user.kyc_status)}</span
            >
          </div>
          <div class="flex flex-col">
            <label class="text-sm font-medium text-gray-600 mb-1"
              >Created:</label
            >
            <span class="text-gray-900"
              >{formatDate(selectedReview.kyc_session.created_at)}</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Document Images Section -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center">
        <CloudUpload class="w-6 h-6 mr-2 text-blue-600" />Submitted Documents
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Document Front -->
        <div class="bg-white border border-gray-200 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            Document Front
          </h3>
          {#if imageLoadingStates.front}
            <div
              class="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg"
            >
              <LoadingSpinner />
              <p class="mt-2 text-gray-600">Loading document...</p>
            </div>
          {:else if documentFrontImage}
            <img
              src={documentFrontImage}
              alt="Document Front"
              class="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onclick={() =>
                documentFrontImage && openImageInNewWindow(documentFrontImage)}
            />
          {:else}
            <div
              class="flex items-center justify-center py-8 bg-red-50 text-red-600 rounded-lg"
            >
              Failed to load image
            </div>
          {/if}
        </div>

        <!-- Document Back -->
        <div class="bg-white border border-gray-200 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            Document Back
          </h3>
          {#if imageLoadingStates.back}
            <div
              class="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg"
            >
              <LoadingSpinner />
              <p class="mt-2 text-gray-600">Loading document...</p>
            </div>
          {:else if documentBackImage}
            <img
              src={documentBackImage}
              alt="Document Back"
              class="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onclick={() =>
                documentBackImage && openImageInNewWindow(documentBackImage)}
            />
          {:else}
            <div
              class="flex items-center justify-center py-8 bg-red-50 text-red-600 rounded-lg"
            >
              Failed to load image
            </div>
          {/if}
        </div>

        <!-- Selfie -->
        <div class="bg-white border border-gray-200 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            Selfie with Document
          </h3>
          {#if imageLoadingStates.selfie}
            <div
              class="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg"
            >
              <LoadingSpinner />
              <p class="mt-2 text-gray-600">Loading selfie...</p>
            </div>
          {:else if selfieImage}
            <img
              src={selfieImage}
              alt="Selfie with Document"
              class="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onclick={() => selfieImage && openImageInNewWindow(selfieImage)}
            />
          {:else}
            <div
              class="flex items-center justify-center py-8 bg-red-50 text-red-600 rounded-lg"
            >
              Failed to load image
            </div>
          {/if}
        </div>
      </div>
      <p class="text-sm text-gray-600 mt-4 text-center">
        Click on any image to open in full size
      </p>
    </div>

    <!-- Review Notes Section -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center">
        <ClipboardCheck class="w-6 h-6 mr-2 text-blue-600" />Review Notes
      </h2>
      <textarea
        bind:value={reviewNotes}
        placeholder="Enter optional notes for this review..."
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        rows="4"
      ></textarea>
    </div>

    <!-- Download Progress -->
    {#if downloadProgress < 100 && downloadProgress > 0}
      <div class="mb-8">
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style="width: {downloadProgress}%"
          ></div>
        </div>
        <p class="text-sm text-gray-600 mt-2 text-center">
          Loading documents: {Math.round(downloadProgress)}%
        </p>
      </div>
    {/if}

    <!-- Modal Footer -->
    <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
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
