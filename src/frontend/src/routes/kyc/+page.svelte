<script lang="ts">
  import { onMount } from "svelte";
  import { AuthClient } from "@dfinity/auth-client";
  import { Principal } from "@dfinity/principal";
  import { 
    uploadDocumentFreeKyc,
    getFreeKycStatus,
    getErrorMessage 
  } from "$lib/api";

  let principal: Principal | null = null;
  let kycStatus: string | null = null; // 'Not Started', 'Under Verification', 'Approved', 'Rejected', 'Failed'
  let documentFile: FileList;
  let selfieFile: FileList;
  let documentType = "passport";
  let isLoading = true;
  let errorMessage: string | null = null;

  onMount(async () => {
    const authClient = await AuthClient.create();
    if (await authClient.isAuthenticated()) {
      const identity = authClient.getIdentity();
      principal = identity.getPrincipal();
      // You might want to check existing KYC status here
      kycStatus = "Not Started"; 
    } else {
      kycStatus = "Not Logged In";
    }
    isLoading = false;
  });

  async function handleSubmit() {
    if (!documentFile || !selfieFile || !principal) {
      errorMessage = "Please select both document and selfie files.";
      return;
    }

    isLoading = true;
    errorMessage = null;
    kycStatus = "Uploading...";

    try {
      const docArrayBuffer = await documentFile[0].arrayBuffer();
      const selfieArrayBuffer = await selfieFile[0].arrayBuffer();

      const doc = new Uint8Array(docArrayBuffer);
      const selfie = new Uint8Array(selfieArrayBuffer);

      const result = await uploadDocumentFreeKyc(
        doc,
        documentType,
        selfie
      );
      
      console.log("Upload result:", result);
      kycStatus = "Under Verification";

    } catch (error) {
      console.error("Error uploading documents:", error);
      errorMessage = getErrorMessage(error);
      kycStatus = "Failed";
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="container">
  <h1>KYC Verification</h1>

  {#if isLoading}
    <p>Loading...</p>
  {:else if kycStatus === 'Not Logged In'}
    <p>Please log in with Internet Identity to proceed with KYC verification.</p>
  {:else if principal}
    <p>Welcome, {principal.toText()}</p>

    {#if kycStatus === 'Not Started'}
      <form on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
          <label for="document-type">Document Type</label>
          <select id="document-type" bind:value={documentType}>
            <option value="passport">Passport</option>
            <option value="drivers_license">Driver's License</option>
            <option value="national_id">National ID</option>
          </select>
        </div>
        <div class="form-group">
          <label for="document">Upload Document</label>
          <input id="document" type="file" bind:files={documentFile} accept="image/*" required />
        </div>
        <div class="form-group">
          <label for="selfie">Upload Selfie</label>
          <input id="selfie" type="file" bind:files={selfieFile} accept="image/*" required />
        </div>
        <button type="submit" disabled={isLoading}>Submit for Verification</button>
      </form>
    {:else if kycStatus === 'Uploading...'}
      <p>Uploading documents, please wait...</p>
    {:else if kycStatus === 'Under Verification'}
      <p>Your documents have been submitted and are now under verification. We will notify you once the process is complete.</p>
    {:else if kycStatus === 'Approved'}
       <p>Your KYC has been approved!</p>
    {:else if kycStatus === 'Rejected'}
       <p>Your KYC has been rejected. Please contact support.</p>
    {:else if kycStatus === 'Failed'}
      <p class="error">There was an error uploading your documents: {errorMessage}</p>
      <button on:click={() => kycStatus = 'Not Started'}>Try Again</button>
    {/if}

    {#if errorMessage && kycStatus !== 'Failed'}
      <p class="error">{errorMessage}</p>
    {/if}

  {/if}
</div>

<style>
  .container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 2rem;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
  .form-group {
    margin-bottom: 1rem;
  }
  label {
    display: block;
    margin-bottom: 0.5rem;
  }
  input, select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  button {
    padding: 0.75rem 1.5rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  button:hover {
    background-color: #0056b3;
  }
  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  .error {
    color: red;
  }
</style>
