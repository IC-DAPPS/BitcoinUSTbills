<script lang="ts">
  import { onMount } from "svelte";
  import { authStore } from "$lib/stores/auth.store";
  import { userSate, fetchUserProfile } from "$lib/state/user.svelte";
  import { getKYCStatus } from "$lib/api";
  import Button from "$lib/components/ui/Button.svelte";
  import StatusBadge from "$lib/components/ui/StatusBadge.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import type { FreeKYCSession } from "$lib/types";
  import { handleKYCFileUpload } from "$lib/services/kyc.service";

  // Component state - converted to $state()
  let loading = $state(true);
  let submitting = $state(false);
  let error = $state<string | null>(null);
  let success = $state<string | null>(null);

  // KYC status from detailed API call (for users who have started KYC process)
  let kycSession = $state<FreeKYCSession | null>(null);

  // File upload state - converted to $state()
  let documentFrontFile = $state<File | null>(null);
  let documentBackFile = $state<File | null>(null);
  let selfieFile = $state<File | null>(null);

  // Drag state for visual feedback - converted to $state()
  let dragOverFront = $state(false);
  let dragOverBack = $state(false);
  let dragOverSelfie = $state(false);

  // File validation
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  // Computed states - converted to $derived()
  let isAuthenticated = $derived($authStore.isAuthenticated);
  let userProfile = $derived(userSate.profile);
  let basicKYCStatus = $derived(userProfile?.kyc_status);

  // Determine if user has started KYC process based on userSate.profile.kyc_status
  // - 'Pending' = new user who hasn't started KYC (show upload form)
  // - Anything else = user has started KYC process (call getKYCStatus for details)
  let hasStartedKYC = $derived(basicKYCStatus && basicKYCStatus !== "Pending");

  // Check if all files are uploaded and valid
  let allFilesUploaded = $derived(
    documentFrontFile && documentBackFile && selfieFile
  );
  let canSubmit = $derived(allFilesUploaded && !submitting);

  onMount(async () => {
    if (!isAuthenticated) {
      loading = false;
      return;
    }

    // Ensure user profile is loaded first
    if (!userProfile) {
      await fetchUserProfile();
    }

    await loadKYCStatus();
  });

  async function loadKYCStatus() {
    try {
      loading = true;
      error = null;

      // Always check for existing KYC session first, regardless of basic status
      if (userProfile?.principal) {
        const principalText = userProfile.principal.toString();
        try {
          kycSession = await getKYCStatus(principalText);
        } catch (e) {
          // If no KYC session found, that's fine - user hasn't started KYC yet
          console.error("No existing KYC session found");
          kycSession = null;
        }
      }
    } catch (e) {
      console.error("Error loading KYC status:", e);
      error = "Failed to load KYC status. Please try again.";
    } finally {
      loading = false;
    }
  }

  function validateFile(
    file: File,
    fieldName: string
  ): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: `${fieldName} is required` };
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `${fieldName} must be an image file (JPEG, PNG, WebP)`,
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `${fieldName} must be smaller than 10MB`,
      };
    }

    return { valid: true };
  }

  function handleFileSelect(
    event: Event,
    fileType: "front" | "back" | "selfie"
  ) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    processFile(file, fileType);
    input.value = ""; // Clear the input to allow re-selecting the same file
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  function handleDragEnter(
    event: DragEvent,
    fileType: "front" | "back" | "selfie"
  ) {
    event.preventDefault();
    event.stopPropagation();

    switch (fileType) {
      case "front":
        dragOverFront = true;
        break;
      case "back":
        dragOverBack = true;
        break;
      case "selfie":
        dragOverSelfie = true;
        break;
    }
  }

  function handleDragLeave(
    event: DragEvent,
    fileType: "front" | "back" | "selfie"
  ) {
    event.preventDefault();
    event.stopPropagation();

    switch (fileType) {
      case "front":
        dragOverFront = false;
        break;
      case "back":
        dragOverBack = false;
        break;
      case "selfie":
        dragOverSelfie = false;
        break;
    }
  }

  function handleDrop(event: DragEvent, fileType: "front" | "back" | "selfie") {
    event.preventDefault();
    event.stopPropagation();

    // Reset drag state
    switch (fileType) {
      case "front":
        dragOverFront = false;
        break;
      case "back":
        dragOverBack = false;
        break;
      case "selfie":
        dragOverSelfie = false;
        break;
    }

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      processFile(files[0], fileType);
    }
  }

  function processFile(file: File, fileType: "front" | "back" | "selfie") {
    const fieldNames = {
      front: "Passport Front Page",
      back: "Passport Back Page",
      selfie: "Selfie with Document",
    };

    const validation = validateFile(file, fieldNames[fileType]);

    if (!validation.valid) {
      error = validation.error || "Invalid file";
      return;
    }

    // Clear any previous errors
    error = null;

    // Store the file
    switch (fileType) {
      case "front":
        documentFrontFile = file;
        break;
      case "back":
        documentBackFile = file;
        break;
      case "selfie":
        selfieFile = file;
        break;
    }
  }

  function removeFile(fileType: "front" | "back" | "selfie") {
    switch (fileType) {
      case "front":
        documentFrontFile = null;
        break;
      case "back":
        documentBackFile = null;
        break;
      case "selfie":
        selfieFile = null;
        break;
    }
    error = null;
  }

  async function handleKYCSubmit() {
    if (!canSubmit || !documentFrontFile || !documentBackFile || !selfieFile) {
      error = "Please upload all required documents";
      return;
    }

    try {
      submitting = true;
      error = null;
      success = null;

      // Upload KYC documents using the service
      await handleKYCFileUpload(
        documentFrontFile,
        documentBackFile,
        selfieFile
      );

      success =
        "Documents uploaded successfully! Your KYC is now under review.";

      // Refresh user profile to get updated KYC status
      await fetchUserProfile();

      // Reload KYC status after successful upload
      await loadKYCStatus();

      // Clear uploaded files since they've been submitted
      documentFrontFile = null;
      documentBackFile = null;
      selfieFile = null;
    } catch (e) {
      console.error("Error submitting KYC:", e);
      error = "Failed to submit KYC documents. Please try again.";
    } finally {
      submitting = false;
    }
  }

  function getKYCStatusText(session: FreeKYCSession): string {
    const status = session.status;
    if ("Processing" in status) return "Processing";
    if ("PendingReview" in status) return "Under Review";
    if ("AutoApproved" in status) return "Approved";
    if ("ManualApproved" in status) return "Approved";
    if ("Rejected" in status) return "Rejected";
    if ("Expired" in status) return "Expired";
    return "Unknown";
  }

  function getKYCStatusBadgeType(session: FreeKYCSession): string {
    const status = session.status;
    if ("Processing" in status) return "pending";
    if ("PendingReview" in status) return "pending";
    if ("AutoApproved" in status || "ManualApproved" in status)
      return "Completed";
    if ("Rejected" in status) return "SoldOut"; // Using red styling
    if ("Expired" in status) return "SoldOut"; // Using red styling
    return "pending";
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  function createImagePreview(file: File): string {
    return URL.createObjectURL(file);
  }
</script>

<svelte:head>
  <title>KYC Verification - BitcoinUSTbills</title>
  <meta
    name="description"
    content="Complete your Know Your Customer (KYC) verification to start investing in tokenized US Treasury Bills."
  />
</svelte:head>

<div class="min-h-screen bg-section">
  <div class="container mx-auto px-6 py-8">
    <!-- Page Header -->
    <div class="kyc-header">
      <h1 class="kyc-title">KYC Verification</h1>
      <p class="kyc-subtitle">
        Complete your identity verification to start investing in US Treasury
        Bills
      </p>
    </div>

    {#if !isAuthenticated}
      <!-- Not logged in -->
      <div class="kyc-card">
        <div class="kyc-icon-container">
          <svg
            class="kyc-icon"
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
        </div>
        <h2 class="kyc-card-title">Authentication Required</h2>
        <p class="kyc-card-text">Please log in to access KYC verification</p>
        <Button variant="primary" href="/">Go to Home</Button>
      </div>
    {:else if loading}
      <!-- Loading state -->
      <div class="kyc-loading">
        <div class="kyc-loading-content">
          <LoadingSpinner />
          <p class="kyc-loading-text">Loading KYC status...</p>
        </div>
      </div>
    {:else if kycSession}
      <!-- User has started KYC - show status (prioritize this over basic status) -->
      <div class="kyc-status-container">
        <!-- Status Card -->
        <div class="kyc-card">
          <div class="kyc-status-header">
            <h2 class="kyc-card-title">KYC Status</h2>
            <StatusBadge status={getKYCStatusBadgeType(kycSession)} />
          </div>

          <div class="kyc-status-details">
            <div class="kyc-status-item">
              <span class="kyc-status-label">Status:</span>
              <span class="kyc-status-value"
                >{getKYCStatusText(kycSession)}</span
              >
            </div>

            <div class="kyc-status-item">
              <span class="kyc-status-label">Submitted:</span>
              <span class="kyc-status-value">
                {new Date(
                  Number(kycSession.created_at) * 1000
                ).toLocaleDateString()}
              </span>
            </div>

            {#if kycSession.reviewed_at[0]}
              <div class="kyc-status-item">
                <span class="kyc-status-label">Reviewed:</span>
                <span class="kyc-status-value">
                  {new Date(
                    Number(kycSession.reviewed_at[0]) * 1000
                  ).toLocaleDateString()}
                </span>
              </div>
            {/if}

            {#if kycSession.reviewer_notes[0]}
              <div class="kyc-notes">
                <h4 class="kyc-notes-title">Reviewer Notes:</h4>
                <p class="kyc-notes-text">{kycSession.reviewer_notes[0]}</p>
              </div>
            {/if}
          </div>
        </div>

        <!-- OCR Results (if available) -->
        {#if kycSession.ocr_result}
          <div class="kyc-card">
            <h3 class="kyc-card-title">Document Information</h3>
            <div class="kyc-document-grid">
              <div class="kyc-document-item">
                <span class="kyc-document-label">Name:</span>
                <p class="kyc-document-value">
                  {kycSession.ocr_result.extracted_name || "Not available"}
                </p>
              </div>
              <div class="kyc-document-item">
                <span class="kyc-document-label">Date of Birth:</span>
                <p class="kyc-document-value">
                  {kycSession.ocr_result.extracted_dob || "Not available"}
                </p>
              </div>
              <div class="kyc-document-item">
                <span class="kyc-document-label">Country:</span>
                <p class="kyc-document-value">
                  {kycSession.ocr_result.extracted_country || "Not available"}
                </p>
              </div>
              <div class="kyc-document-item">
                <span class="kyc-document-label">Document Number:</span>
                <p class="kyc-document-value">
                  {kycSession.ocr_result.extracted_document_number ||
                    "Not available"}
                </p>
              </div>
            </div>
          </div>
        {/if}
      </div>
    {:else if basicKYCStatus === "Verified"}
      <!-- KYC already verified -->
      <div class="kyc-card">
        <div class="kyc-icon-container kyc-success-icon">
          <svg
            class="kyc-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <h2 class="kyc-card-title">KYC Verification Completed</h2>
        <p class="kyc-card-text">
          Your identity has been successfully verified. You can now invest in US
          Treasury Bills.
        </p>
        <div class="kyc-button-group">
          <Button variant="primary" href="/marketplace"
            >Browse Marketplace</Button
          >
          <Button variant="secondary" href="/dashboard">View Dashboard</Button>
        </div>
      </div>
    {:else}
      <!-- New KYC process - show integrated upload form -->
      <div class="kyc-upload-container">
        <!-- Alert Messages -->
        {#if error}
          <div class="kyc-alert kyc-alert-error">
            <div class="kyc-alert-content">
              <svg
                class="kyc-alert-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <p class="kyc-alert-text">{error}</p>
            </div>
          </div>
        {/if}

        {#if success}
          <div class="kyc-alert kyc-alert-success">
            <div class="kyc-alert-content">
              <svg
                class="kyc-alert-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <p class="kyc-alert-text">{success}</p>
            </div>
          </div>
        {/if}

        <!-- Integrated Document Upload Requirements with Upload Areas -->
        <div class="kyc-upload-card">
          <h2 class="kyc-upload-title">Document Upload Requirements</h2>

          <!-- Step 1: Passport Front Page -->
          <div class="kyc-upload-step">
            <div class="kyc-step-header">
              <div class="kyc-step-number">
                <span class="kyc-step-number-text">1</span>
              </div>
              <div class="kyc-step-content">
                <h4 class="kyc-step-title">Passport Front Page</h4>
                <p class="kyc-step-description">
                  Clear photo of your passport's information page showing your
                  name, photo, date of birth, and nationality.
                </p>

                <!-- Upload Area for Step 1 -->
                {#if documentFrontFile}
                  <div
                    class="border-2 border-dashed border-green-300 bg-green-50 rounded-lg p-4"
                  >
                    <!-- Image Preview -->
                    <div class="flex justify-center mb-3">
                      <img
                        src={createImagePreview(documentFrontFile)}
                        alt="Passport Front Preview"
                        class="w-32 h-24 object-cover rounded-lg border border-green-200"
                      />
                    </div>
                    <div class="text-center">
                      <svg
                        class="w-6 h-6 text-green-500 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                      <p class="text-sm font-medium text-green-700">
                        {documentFrontFile.name}
                      </p>
                      <p class="text-xs text-green-600 mb-3">
                        {formatFileSize(documentFrontFile.size)}
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onclick={() => removeFile("front")}
                        class="flex items-center gap-2 mx-auto"
                      >
                        <svg
                          class="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                        Remove File
                      </Button>
                    </div>
                  </div>
                {:else}
                  <label
                    for="front-upload"
                    class="upload-area border-3 border-dashed border-blue rounded-lg p-12 text-center cursor-pointer block w-full bg-blue-50 hover:bg-blue-100 {dragOverFront
                      ? 'drag-over'
                      : ''}"
                    ondragover={handleDragOver}
                    ondragenter={(e) => handleDragEnter(e, "front")}
                    ondragleave={(e) => handleDragLeave(e, "front")}
                    ondrop={(e) => handleDrop(e, "front")}
                  >
                    <div
                      class="flex flex-col items-center justify-center min-h-[120px]"
                    >
                      <svg
                        class="w-20 h-20 text-blue mb-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        ></path>
                      </svg>
                      <p class="text-xl font-bold text-blue mb-3">
                        Click to upload or drag and drop
                      </p>
                      <p class="text-lg text-blue opacity-80">
                        JPEG, PNG, WebP up to 10MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      class="hidden"
                      onchange={(e) => handleFileSelect(e, "front")}
                      id="front-upload"
                    />
                  </label>
                {/if}
              </div>
            </div>
          </div>

          <!-- Step 2: Passport Back Page -->
          <div class="kyc-upload-step">
            <div class="kyc-step-header">
              <div class="kyc-step-number">
                <span class="kyc-step-number-text">2</span>
              </div>
              <div class="kyc-step-content">
                <h4 class="kyc-step-title">Passport Back Page</h4>
                <p class="kyc-step-description">
                  Photo of the back page showing any additional information and
                  endorsements.
                </p>

                <!-- Upload Area for Step 2 -->
                {#if documentBackFile}
                  <div
                    class="border-2 border-dashed border-green-300 bg-green-50 rounded-lg p-4"
                  >
                    <!-- Image Preview -->
                    <div class="flex justify-center mb-3">
                      <img
                        src={createImagePreview(documentBackFile)}
                        alt="Passport Back Preview"
                        class="w-32 h-24 object-cover rounded-lg border border-green-200"
                      />
                    </div>
                    <div class="text-center">
                      <svg
                        class="w-6 h-6 text-green-500 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                      <p class="text-sm font-medium text-green-700">
                        {documentBackFile.name}
                      </p>
                      <p class="text-xs text-green-600 mb-3">
                        {formatFileSize(documentBackFile.size)}
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onclick={() => removeFile("back")}
                        class="flex items-center gap-2 mx-auto"
                      >
                        <svg
                          class="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                        Remove File
                      </Button>
                    </div>
                  </div>
                {:else}
                  <label
                    for="back-upload"
                    class="upload-area border-3 border-dashed border-blue rounded-lg p-12 text-center cursor-pointer block w-full bg-blue-50 hover:bg-blue-100 {dragOverBack
                      ? 'drag-over'
                      : ''}"
                    ondragover={handleDragOver}
                    ondragenter={(e) => handleDragEnter(e, "back")}
                    ondragleave={(e) => handleDragLeave(e, "back")}
                    ondrop={(e) => handleDrop(e, "back")}
                  >
                    <div
                      class="flex flex-col items-center justify-center min-h-[120px]"
                    >
                      <svg
                        class="w-20 h-20 text-blue mb-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        ></path>
                      </svg>
                      <p class="text-xl font-bold text-blue mb-3">
                        Click to upload or drag and drop
                      </p>
                      <p class="text-lg text-blue opacity-80">
                        JPEG, PNG, WebP up to 10MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      class="hidden"
                      onchange={(e) => handleFileSelect(e, "back")}
                      id="back-upload"
                    />
                  </label>
                {/if}
              </div>
            </div>
          </div>

          <!-- Step 3: Selfie with Passport -->
          <div class="kyc-upload-step">
            <div class="kyc-step-header">
              <div class="kyc-step-number">
                <span class="kyc-step-number-text">3</span>
              </div>
              <div class="kyc-step-content">
                <h4 class="kyc-step-title">Selfie with Passport</h4>
                <p class="kyc-step-description">
                  A selfie of yourself holding the front page of your passport
                  next to your face for verification.
                </p>

                <!-- Upload Area for Step 3 -->
                {#if selfieFile}
                  <div
                    class="border-2 border-dashed border-green-300 bg-green-50 rounded-lg p-4"
                  >
                    <!-- Image Preview -->
                    <div class="flex justify-center mb-3">
                      <img
                        src={createImagePreview(selfieFile)}
                        alt="Selfie Preview"
                        class="w-32 h-24 object-cover rounded-lg border border-green-200"
                      />
                    </div>
                    <div class="text-center">
                      <svg
                        class="w-6 h-6 text-green-500 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                      <p class="text-sm font-medium text-green-700">
                        {selfieFile.name}
                      </p>
                      <p class="text-xs text-green-600 mb-3">
                        {formatFileSize(selfieFile.size)}
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onclick={() => removeFile("selfie")}
                        class="flex items-center gap-2 mx-auto"
                      >
                        <svg
                          class="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                        Remove File
                      </Button>
                    </div>
                  </div>
                {:else}
                  <label
                    for="selfie-upload"
                    class="upload-area border-3 border-dashed border-blue rounded-lg p-12 text-center cursor-pointer block w-full bg-blue-50 hover:bg-blue-100 {dragOverSelfie
                      ? 'drag-over'
                      : ''}"
                    ondragover={handleDragOver}
                    ondragenter={(e) => handleDragEnter(e, "selfie")}
                    ondragleave={(e) => handleDragLeave(e, "selfie")}
                    ondrop={(e) => handleDrop(e, "selfie")}
                  >
                    <div
                      class="flex flex-col items-center justify-center min-h-[120px]"
                    >
                      <svg
                        class="w-20 h-20 text-blue mb-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        ></path>
                      </svg>
                      <p class="text-xl font-bold text-blue mb-3">
                        Click to upload or drag and drop
                      </p>
                      <p class="text-lg text-blue opacity-80">
                        JPEG, PNG, WebP up to 10MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      class="hidden"
                      onchange={(e) => handleFileSelect(e, "selfie")}
                      id="selfie-upload"
                    />
                  </label>
                {/if}
              </div>
            </div>
          </div>

          <!-- File Requirements -->
          <div class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 class="font-semibold text-blue-800 mb-2">File Requirements:</h4>
            <ul class="text-blue-700 text-sm space-y-1">
              <li>• Supported formats: JPEG, PNG, WebP</li>
              <li>• Maximum file size: 10MB per file</li>
              <li>• Images should be clear and well-lit</li>
              <li>• All text should be clearly readable</li>
            </ul>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="kyc-card">
          <div class="kyc-submit-container">
            <Button
              variant="primary"
              size="lg"
              disabled={!canSubmit}
              loading={submitting}
              onclick={handleKYCSubmit}
              fullWidth
            >
              {#if submitting}
                Uploading Documents...
              {:else if allFilesUploaded}
                Submit KYC Documents
              {:else}
                Please Upload All Documents
              {/if}
            </Button>

            {#if allFilesUploaded}
              <p class="kyc-submit-text">
                By submitting, you confirm that all documents are genuine and
                belong to you.
              </p>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  /* Custom CSS for KYC page - laptop view optimization */

  .kyc-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .kyc-title {
    font-size: 2rem;
    font-weight: bold;
    color: #1e293b !important;
    margin-bottom: 0.5rem;
  }

  .kyc-subtitle {
    color: #64748b !important;
    font-size: 1.125rem;
  }

  .kyc-card {
    background: #2563eb !important;
    border-radius: 0.75rem;
    padding: 2rem 3rem;
    box-shadow:
      0 1px 3px 0 rgb(0 0 0 / 0.1),
      0 1px 2px -1px rgb(0 0 0 / 0.1);
    border: 1px solid #2563eb;
    margin-bottom: 1.5rem;
    text-align: center;
    width: 700px;
    min-height: 180px;
    margin-left: auto;
    margin-right: auto;
  }

  .kyc-card-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #000000 !important;
    margin-bottom: 1.5rem;
  }

  .kyc-card-text {
    color: #000000 !important;
    margin-bottom: 1.5rem;
  }

  .kyc-icon-container {
    width: 4rem;
    height: 4rem;
    background: #1e293b !important;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem auto;
  }

  .kyc-success-icon {
    background: #059669 !important;
  }

  .kyc-icon {
    width: 2rem;
    height: 2rem;
    color: #ffffff !important;
  }

  .kyc-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 16rem;
  }

  .kyc-loading-content {
    text-align: center;
  }

  .kyc-loading-text {
    color: #64748b !important;
    margin-top: 1rem;
  }

  .kyc-status-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .kyc-status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .kyc-status-details {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 400px;
    margin: 0 auto;
    text-align: center;
  }

  .kyc-status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .kyc-status-item:last-child {
    border-bottom: none;
  }

  .kyc-status-label {
    color: #000000 !important;
    font-size: 0.875rem;
    font-weight: 500;
    text-align: left;
  }

  .kyc-status-value {
    color: #000000 !important;
    font-weight: 600;
    font-size: 0.875rem;
    text-align: right;
  }

  .kyc-notes {
    margin-top: 1rem;
    padding: 1rem;
    background: #f59e0b;
    border-radius: 0.5rem;
  }

  .kyc-notes-title {
    font-weight: 600;
    color: #1e293b !important;
    margin-bottom: 0.5rem;
  }

  .kyc-notes-text {
    color: #1e293b !important;
  }

  .kyc-document-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    max-width: 400px;
    margin: 0 auto;
  }

  .kyc-document-item {
    text-align: left;
  }

  .kyc-document-label {
    color: #000000 !important;
    font-size: 0.875rem;
    display: block;
    margin-bottom: 0.25rem;
  }

  .kyc-document-value {
    color: #000000 !important;
    font-weight: 500;
  }

  .kyc-button-group {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .kyc-upload-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .kyc-upload-card {
    background: #2563eb !important;
    border-radius: 0.75rem;
    padding: 2rem;
    box-shadow:
      0 1px 3px 0 rgb(0 0 0 / 0.1),
      0 1px 2px -1px rgb(0 0 0 / 0.1);
    border: 1px solid #2563eb;
    margin-bottom: 1.5rem;
    text-align: center;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }

  .kyc-upload-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #000000 !important;
    margin-bottom: 2rem;
  }

  .kyc-upload-step {
    margin-bottom: 2rem;
    text-align: center;
  }

  .kyc-step-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .kyc-step-number {
    width: 3rem;
    height: 3rem;
    background: #000000 !important;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .kyc-step-number-text {
    color: #ffffff !important;
    font-size: 1.25rem;
    font-weight: bold;
  }

  .kyc-step-content {
    text-align: center;
    max-width: 600px;
  }

  .kyc-step-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #000000 !important;
    margin-bottom: 0.75rem;
  }

  .kyc-step-description {
    color: #000000 !important;
    font-size: 1rem;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }

  .kyc-alert {
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
  }

  .kyc-alert-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
  }

  .kyc-alert-success {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
  }

  .kyc-alert-content {
    display: flex;
    align-items: center;
  }

  .kyc-alert-icon {
    width: 1.25rem;
    height: 1.25rem;
    margin-right: 0.75rem;
    flex-shrink: 0;
  }

  .kyc-alert-error .kyc-alert-icon {
    color: #ef4444;
  }

  .kyc-alert-success .kyc-alert-icon {
    color: #22c55e;
  }

  .kyc-alert-text {
    color: #000000 !important;
    font-weight: 500;
  }

  .kyc-submit-container {
    text-align: center;
  }

  .kyc-submit-text {
    font-size: 0.875rem;
    color: #000000 !important;
    margin-top: 0.5rem;
  }

  /* Enhanced drag and drop styling */
  .upload-area {
    transition: all 0.3s ease;
    background-color: #eff6ff;
    border-width: 3px !important;
    border-color: var(--primary-blue) !important;
    position: relative;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
  }

  .upload-area:hover {
    border-color: var(--primary-blue-dark) !important;
    background-color: #dbeafe !important;
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(37, 99, 235, 0.2);
  }

  .upload-area.drag-over {
    border-color: var(--primary-blue-dark) !important;
    background-color: #bfdbfe !important;
    transform: scale(1.02);
    box-shadow: 0 12px 35px rgba(37, 99, 235, 0.3);
  }

  /* Force white text in numbered circles */
  :global(.bg-blue) {
    background-color: var(--primary-blue) !important;
  }

  :global(.bg-blue span) {
    color: white !important;
  }

  /* Custom border utilities */
  .border-3 {
    border-width: 3px;
  }

  /* Blue background utilities */
  .bg-blue-50 {
    background-color: #eff6ff;
  }

  /* Image preview styling */
  img[alt*="Preview"] {
    border: 2px solid #bbf7d0;
    box-shadow: 0 2px 8px rgba(22, 163, 74, 0.15);
    transition: all 0.2s ease;
  }

  img[alt*="Preview"]:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(22, 163, 74, 0.25);
  }

  /* Upload area text styling */
  .upload-area p {
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .kyc-card {
      background: #1f2937;
      border-color: #374151;
    }

    .kyc-title,
    .kyc-card-title,
    .kyc-status-value,
    .kyc-document-value,
    .kyc-alert-text {
      color: #000000;
    }

    .kyc-subtitle,
    .kyc-card-text,
    .kyc-status-label,
    .kyc-document-label,
    .kyc-submit-text {
      color: #000000;
    }

    .kyc-icon-container {
      background: #374151;
    }

    .kyc-success-icon {
      background: #059669;
    }
  }
</style>
