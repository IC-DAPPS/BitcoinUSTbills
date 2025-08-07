<script lang="ts">
  import { onMount } from "svelte";
  import { AuthClient } from "@dfinity/auth-client";
  import { Principal } from "@dfinity/principal";
  import { 
    adminGetPendingReviews,
    adminReviewFreeKyc,
    getErrorMessage 
  } from "$lib/api";
  import type { FreeKYCSession } from "$lib/types";

  let pendingReviews: FreeKYCSession[] = [];
  let isLoading = true;
  let errorMessage: string | null = null;
  let isAdmin = false;

  // This is the hardcoded admin principal from the backend guard.rs
  const ADMIN_PRINCIPAL = "6lzil-lzkgm-twmv5-rz5xg-a5nnm-togvj-mlu6s-p4xyl-5j3zi-6a6jy-yqe";

  onMount(async () => {
    const authClient = await AuthClient.create();
    if (await authClient.isAuthenticated()) {
      const identity = authClient.getIdentity();
      const principal = identity.getPrincipal();

      if (principal.toText() === ADMIN_PRINCIPAL) {
        isAdmin = true;
        fetchPendingReviews();
      } else {
        errorMessage = "You are not authorized to view this page.";
      }
    } else {
      errorMessage = "Please log in as an admin to view this page.";
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

  async function handleReview(uploadId: string, approve: boolean) {
    const notes = prompt(`Enter notes for this ${approve ? 'approval' : 'rejection'}:`);
    if (notes === null) return; // User cancelled

    try {
      await adminReviewFreeKyc(uploadId, approve, notes);
      // Refresh the list after review
      pendingReviews = pendingReviews.filter(review => review.upload_id !== uploadId);
      alert(`Review submitted successfully!`);
    } catch (e) {
      console.error(e);
      alert(getErrorMessage(e));
    }
  }

  function toBase64(bytes: Uint8Array | number[]): string {
    const uint8Array = new Uint8Array(bytes);
    const binary = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
    return btoa(binary);
  }
</script>

<div class="container">
  <h1>Admin - KYC Verification</h1>

  {#if isLoading}
    <p>Loading...</p>
  {:else if !isAdmin}
    <p class="error">{errorMessage || "You do not have permission to access this page."}</p>
  {:else if errorMessage}
    <p class="error">{errorMessage}</p>
    <button on:click={fetchPendingReviews}>Retry</button>
  {:else if pendingReviews.length === 0}
    <p>No pending KYC reviews found.</p>
  {:else}
    <div class="review-list">
      {#each pendingReviews as review}
        <div class="review-item">
          <h2>Review for: {review.user_principal.toText()}</h2>
          <p><strong>Upload ID:</strong> {review.upload_id}</p>
          <p><strong>Document Type:</strong> {review.document_type}</p>
          <div class="images">
            <div class="image-container">
              <h3>Document</h3>
              <img src="data:image/png;base64,{toBase64(review.document_bytes)}" alt="ID Document" />
            </div>
            <div class="image-container">
              <h3>Selfie</h3>
              <img src="data:image/png;base64,{toBase64(review.selfie_bytes)}" alt="Selfie" />
            </div>
          </div>
          <div class="ocr-details">
            <h3>OCR Extracted Details</h3>
            <p><strong>Name:</strong> {review.ocr_result.extracted_name}</p>
            <p><strong>DOB:</strong> {review.ocr_result.extracted_dob}</p>
            <p><strong>Country:</strong> {review.ocr_result.extracted_country}</p>
            <p><strong>Confidence:</strong> {(review.ocr_result.confidence_score * 100).toFixed(2)}%</p>
          </div>
          <div class="actions">
            <button class="approve" on:click={() => handleReview(review.upload_id, true)}>Approve</button>
            <button class="reject" on:click={() => handleReview(review.upload_id, false)}>Reject</button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 900px;
    margin: 2rem auto;
    padding: 2rem;
  }
  .error {
    color: red;
  }
  .review-list {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .review-item {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 1.5rem;
  }
  .images {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }
  .image-container {
    flex: 1;
    text-align: center;
  }
  .image-container img {
    max-width: 100%;
    height: auto;
    border: 1px solid #ddd;
  }
  .ocr-details {
    margin-top: 1rem;
    background-color: #f9f9f9;
    padding: 1rem;
    border-radius: 4px;
  }
  .actions {
    margin-top: 1.5rem;
    display: flex;
    gap: 1rem;
  }
  .actions button {
    padding: 0.75rem 1.5rem;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .approve {
    background-color: #28a745;
  }
  .approve:hover {
    background-color: #218838;
  }
  .reject {
    background-color: #dc3545;
  }
  .reject:hover {
    background-color: #c82333;
  }
</style>
