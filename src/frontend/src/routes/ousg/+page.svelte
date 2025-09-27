<script lang="ts">
  import { onMount } from "svelte";
  import { authStore } from "$lib/stores/auth.store";
  import { userSate } from "$lib/state/user.svelte";
  import { ckbtcBalance } from "$lib/state/ckbtc-balance.svelte";
  import {
    ousgBalance,
    subscribeToAuthChanges,
  } from "$lib/state/ousg-balance.svelte";
  import { mintOUSGAutomatic } from "$lib/services/minting.service";
  import {
    redeemOUSG,
    approveOUSGForRedemption,
  } from "$lib/services/redeeming.service";
  import { toast } from "svelte-sonner";

  let ckbtcAmount = $state("");
  let ousgAmount = $state("");
  let isMinting = $state(false);
  let isApproving = $state(false);
  let isRedeeming = $state(false);
  let approvalPending = $state(false);
  let btcPrice = $state(100000); // Default BTC price
  let ckBtcAmount = $state(0.5); // Default value
  let expectedOusg = $state(0);
  let isSubmitting = $state(false);

  // Calculate expected OUSG tokens for minting
  const expectedOUSG = $derived(() => {
    const amount = parseFloat(ckbtcAmount);
    if (!amount || amount <= 0) return 0n;

    const ckbtcInSatoshis = amount * 100_000_000;
    const usdValue = (ckbtcInSatoshis / 100_000_000) * btcPrice;
    const ousgTokens = usdValue / 5000; // Each OUSG = $5000
    return BigInt(Math.floor(ousgTokens * 1_000_000)); // Convert to OUSG units
  });

  // Calculate expected ckBTC for redemption
  const expectedCkBTC = $derived(() => {
    const amount = parseFloat(ousgAmount);
    if (!amount || amount <= 0) return 0n;

    const ousgInUnits = amount * 1_000_000;
    const usdValue = (ousgInUnits / 1_000_000) * 5000; // Each OUSG = $5000
    const ckbtcAmount = usdValue / btcPrice;
    return BigInt(Math.floor(ckbtcAmount * 100_000_000)); // Convert to satoshis
  });

  // Get current BTC price
  const fetchBTCPrice = async () => {
    try {
      const { backend } = $authStore;
      if (backend) {
        const response = await backend.get_current_btc_price();
        if ("Ok" in response) {
          btcPrice = response.Ok;
        }
      }
    } catch (error) {
      console.error("Failed to fetch BTC price:", error);
    }
  };

  onMount(() => {
    fetchBTCPrice();
    subscribeToAuthChanges();
  });

  const handleMint = async () => {
    if (!$authStore.isAuthenticated) {
      toast.error("Please log in to mint OUSG tokens");
      return;
    }

    if (!userSate.profile || userSate.profile.kyc_status !== "Verified") {
      toast.error("KYC verification is required to mint OUSG tokens");
      return;
    }

    const amount = parseFloat(ckbtcAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid ckBTC amount");
      return;
    }

    const ckbtcAmountBigInt = BigInt(Math.floor(amount * 100_000_000));

    const ckbtcBalanceBigInt = BigInt(
      Math.floor(ckbtcBalance.number * 100_000_000)
    );
    if (ckbtcBalanceBigInt < ckbtcAmountBigInt) {
      toast.error("Insufficient ckBTC balance");
      return;
    }

    isMinting = true;

    try {
      // Use automatic minting - no need for manual block index!
      const result = await mintOUSGAutomatic(ckbtcAmountBigInt);
      if (result.success) {
        ckbtcAmount = "";
        toast.success("OUSG tokens minted successfully!");
      }
    } catch (error) {
      console.error("Minting error:", error);
      toast.error("Failed to mint OUSG tokens");
    } finally {
      isMinting = false;
    }
  };

  const handleApprove = async () => {
    if (!$authStore.isAuthenticated) {
      toast.error("Please log in to approve OUSG tokens");
      return;
    }

    if (!userSate.profile || userSate.profile.kyc_status !== "Verified") {
      toast.error("KYC verification is required");
      return;
    }

    const amount = parseFloat(ousgAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid OUSG amount");
      return;
    }

    if (amount < 1) {
      toast.error("Minimum redemption amount is 1 OUSG token");
      return;
    }

    const ousgAmountBigInt = BigInt(Math.floor(amount * 1_000_000));

    if (ousgBalance.balance < ousgAmountBigInt) {
      toast.error("Insufficient OUSG balance");
      return;
    }

    isApproving = true;

    try {
      const result = await approveOUSGForRedemption(ousgAmountBigInt);
      if (result.success) {
        approvalPending = true;
        toast.success("OUSG tokens approved! You can now redeem them.");
      }
    } catch (error) {
      console.error("Approval error:", error);
      toast.error("Failed to approve OUSG tokens");
    } finally {
      isApproving = false;
    }
  };

  const handleRedeem = async () => {
    if (!approvalPending) {
      toast.error("Please approve OUSG tokens first");
      return;
    }

    if (!$authStore.isAuthenticated) {
      toast.error("Please log in to redeem OUSG tokens");
      return;
    }

    if (!userSate.profile || userSate.profile.kyc_status !== "Verified") {
      toast.error("KYC verification is required to redeem OUSG tokens");
      return;
    }

    const amount = parseFloat(ousgAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid OUSG amount");
      return;
    }

    const ousgAmountBigInt = BigInt(Math.floor(amount * 1_000_000));

    if (ousgBalance.balance < ousgAmountBigInt) {
      toast.error("Insufficient OUSG balance");
      return;
    }

    isRedeeming = true;

    try {
      const result = await redeemOUSG(ousgAmountBigInt);
      if (result.success) {
        ousgAmount = "";
        approvalPending = false;
        toast.success("OUSG tokens redeemed successfully!");
      }
    } catch (error) {
      console.error("Redeeming error:", error);
      toast.error("Failed to redeem OUSG tokens");
    } finally {
      isRedeeming = false;
    }
  };

  const setMaxCkBTC = () => {
    if (ckbtcBalance.number > 0) {
      ckbtcAmount = ckbtcBalance.number.toString();
    }
  };

  const setMaxOUSG = () => {
    if (ousgBalance.balance > 0n) {
      ousgAmount = (Number(ousgBalance.balance) / 1_000_000).toString();
    }
  };

  const mintDisabled = $derived(
    !$authStore.isAuthenticated ||
      !userSate.profile ||
      userSate.profile.kyc_status !== "Verified" ||
      !ckbtcAmount ||
      parseFloat(ckbtcAmount) <= 0 ||
      isMinting
  );

  const approveDisabled = $derived(
    !$authStore.isAuthenticated ||
      !userSate.profile ||
      userSate.profile.kyc_status !== "Verified" ||
      !ousgAmount ||
      parseFloat(ousgAmount) <= 0 ||
      parseFloat(ousgAmount) < 1 ||
      ousgBalance.balance <
        BigInt(Math.floor((parseFloat(ousgAmount) || 0) * 1_000_000)) ||
      isApproving ||
      approvalPending
  );

  const redeemDisabled = $derived(
    !approvalPending ||
      !$authStore.isAuthenticated ||
      !userSate.profile ||
      userSate.profile.kyc_status !== "Verified" ||
      !ousgAmount ||
      parseFloat(ousgAmount) <= 0 ||
      parseFloat(ousgAmount) < 1 ||
      ousgBalance.balance <
        BigInt(Math.floor((parseFloat(ousgAmount) || 0) * 1_000_000)) ||
      isRedeeming
  );
</script>

<div class="ousg-container">
  <div class="mb-8">
    <h1 class="ousg-title">OUSG Token Management</h1>
    <p class="ousg-subtitle">
      Mint OUSG tokens with ckBTC or redeem them back to ckBTC. Each OUSG token
      represents $5,000 USD in value.
    </p>
  </div>

  <!-- Balance Overview -->
  <div class="ousg-balance-grid">
    <div class="ousg-balance-card">
      <h3 class="ousg-balance-title">ckBTC Balance</h3>
      <p class="ousg-balance-amount ousg-balance-ckbtc">
        {ckbtcBalance.number.toFixed(8)} ckBTC
      </p>
    </div>
    <div class="ousg-balance-card">
      <h3 class="ousg-balance-title">OUSG Balance</h3>
      <p class="ousg-balance-amount ousg-balance-ousg">
        {(Number(ousgBalance.balance) / 1_000_000).toFixed(6)} OUSG
      </p>
    </div>
  </div>

  <div class="ousg-main-grid">
    <!-- Minting Section -->
    <div class="ousg-card">
      <h2 class="ousg-section-title">Mint OUSG Tokens</h2>

      <div>
        <div class="ousg-input-group">
          <label for="ckbtc-amount" class="ousg-label"> ckBTC Amount </label>
          <div class="ousg-input-container">
            <input
              id="ckbtc-amount"
              type="number"
              step="0.00000001"
              min="0"
              bind:value={ckbtcAmount}
              placeholder="Enter ckBTC amount"
              class="ousg-input"
            />
            <button type="button" onclick={setMaxCkBTC} class="ousg-max-btn">
              MAX
            </button>
          </div>
          <p class="ousg-info-text">
            ckBTC will be automatically transferred to mint OUSG tokens
          </p>
        </div>

        {#if expectedOUSG() > 0n}
          <div class="ousg-expected-box ousg-expected-blue">
            <p class="ousg-expected-text">
              Expected OUSG: <span class="ousg-expected-strong"
                >{(Number(expectedOUSG()) / 1_000_000).toFixed(6)} OUSG</span
              >
            </p>
          </div>
        {/if}

        <button
          type="button"
          onclick={handleMint}
          disabled={mintDisabled}
          class="ousg-btn ousg-btn-primary"
        >
          {#if isMinting}
            <span class="ousg-loading"></span>
            Minting...
          {:else if !$authStore.isAuthenticated}
            Connect to Mint
          {:else if !userSate.profile || userSate.profile.kyc_status !== "Verified"}
            KYC Required
          {:else}
            Mint OUSG Tokens
          {/if}
        </button>
      </div>
    </div>

    <!-- Redeeming Section -->
    <div class="ousg-card">
      <h2 class="ousg-section-title">Redeem OUSG Tokens</h2>

      <div>
        <div class="ousg-input-group">
          <label for="ousg-amount" class="ousg-label">
            OUSG Amount (minimum 1 OUSG)
          </label>
          <div class="ousg-input-container">
            <input
              id="ousg-amount"
              type="number"
              step="0.000001"
              min="1"
              bind:value={ousgAmount}
              placeholder="Enter OUSG amount"
              class="ousg-input"
            />
            <button type="button" onclick={setMaxOUSG} class="ousg-max-btn">
              MAX
            </button>
          </div>
        </div>

        {#if expectedCkBTC() > 0n}
          <div class="ousg-expected-box ousg-expected-orange">
            <p class="ousg-expected-text">
              Expected ckBTC: <span class="ousg-expected-strong"
                >{(Number(expectedCkBTC()) / 100_000_000).toFixed(8)} ckBTC</span
              >
            </p>
          </div>
        {/if}

        {#if approvalPending}
          <div class="ousg-expected-box ousg-expected-green">
            <p class="ousg-expected-text">
              ✅ OUSG tokens approved for redemption. You can now redeem them.
            </p>
          </div>
        {/if}

        <div class="ousg-btn-group">
          <button
            type="button"
            onclick={handleApprove}
            disabled={approveDisabled}
            class="ousg-btn ousg-btn-outline ousg-btn-flex"
          >
            {#if isApproving}
              <span class="ousg-loading"></span>
              Approving...
            {:else if approvalPending}
              Approved ✓
            {:else if !$authStore.isAuthenticated}
              Connect to Approve
            {:else if !userSate.profile || userSate.profile.kyc_status !== "Verified"}
              KYC Required
            {:else}
              1. Approve
            {/if}
          </button>

          <button
            type="button"
            onclick={handleRedeem}
            disabled={redeemDisabled}
            class="ousg-btn ousg-btn-primary ousg-btn-flex"
          >
            {#if isRedeeming}
              <span class="ousg-loading"></span>
              Redeeming...
            {:else if !approvalPending}
              2. Redeem
            {:else}
              2. Redeem OUSG
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Information Section -->
  <div class="ousg-info-section">
    <h3 class="ousg-info-title">Important Information</h3>
    <div class="ousg-info-list">
      <p class="ousg-info-item">
        • Each OUSG token represents $5,000 USD in value
      </p>
      <p class="ousg-info-item">
        • Minimum minting amount: $5,000 USD worth of ckBTC
      </p>
      <p class="ousg-info-item">• Minimum redemption amount: 1 OUSG token</p>
      <p class="ousg-info-item">
        • KYC verification is required for both minting and redemption
      </p>
      <p class="ousg-info-item">
        • <span class="ousg-info-bold">Automatic minting:</span> Just enter ckBTC
        amount and click mint - no manual transaction needed!
      </p>
      <p class="ousg-info-item">
        • Redemption requires two steps: approval and then redemption
      </p>
      <p class="ousg-info-item">
        • BTC price is fetched from external sources and may vary
      </p>
    </div>
  </div>
</div>

<style>
  /* Custom CSS for OUSG page - laptop view optimization */

  .ousg-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
    background-color: var(--background-main);
    min-height: 100vh;
  }

  .ousg-balance-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  @media (min-width: 768px) {
    .ousg-balance-grid {
      grid-template-columns: 1fr 1fr;
      max-width: 800px;
      margin: 0 auto 2rem auto;
    }
  }

  .ousg-main-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  @media (min-width: 1024px) {
    .ousg-main-grid {
      grid-template-columns: 1fr 1fr;
      max-width: 1000px;
      margin: 0 auto;
    }
  }

  .ousg-card {
    background: #2563eb !important;
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow:
      0 1px 3px 0 rgb(0 0 0 / 0.1),
      0 1px 2px -1px rgb(0 0 0 / 0.1);
    border: 1px solid #2563eb;
  }

  .ousg-balance-card {
    background: #2563eb !important;
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow:
      0 1px 3px 0 rgb(0 0 0 / 0.1),
      0 1px 2px -1px rgb(0 0 0 / 0.1);
    border: 1px solid #2563eb;
    text-align: center;
  }

  .ousg-title {
    font-size: 1.875rem;
    font-weight: bold;
    color: var(--text-primary);
    margin-bottom: 1rem;
  }

  .ousg-subtitle {
    color: #1e293b !important;
    margin-bottom: 2rem;
    text-align: center !important;
  }

  .ousg-section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #ffffff !important;
    margin-bottom: 1.5rem;
  }

  .ousg-balance-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #ffffff !important;
  }

  .ousg-balance-amount {
    font-size: 1.5rem;
    font-weight: bold;
  }

  .ousg-balance-ckbtc {
    color: #ffffff !important;
  }

  .ousg-balance-ousg {
    color: #ffffff !important;
  }

  .ousg-input-group {
    margin-bottom: 1rem;
  }

  .ousg-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: #ffffff !important;
  }

  .ousg-input-container {
    position: relative;
  }

  .ousg-input {
    width: 100%;
    padding: 0.75rem;
    padding-right: 4rem;
    border: 1px solid var(--border-medium);
    border-radius: var(--radius-md);
    font-size: 1rem;
    background-color: var(--background-card);
    color: var(--text-primary);
    transition: border-color 0.2s;
  }

  .ousg-input:focus {
    outline: none;
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .ousg-max-btn {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.875rem;
    color: var(--primary-blue);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
  }

  .ousg-max-btn:hover {
    color: var(--primary-blue-dark);
  }

  .ousg-info-text {
    font-size: 0.75rem;
    color: #ffffff !important;
    margin-top: 0.25rem;
  }

  .ousg-expected-box {
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .ousg-expected-blue {
    background-color: var(--primary-blue);
    color: var(--text-white);
  }

  .ousg-expected-orange {
    background-color: var(--primary-blue);
    color: var(--text-white);
  }

  .ousg-expected-green {
    background-color: var(--success-green);
    color: var(--text-white);
  }

  .ousg-expected-text {
    font-size: 0.875rem;
  }

  .ousg-expected-strong {
    font-weight: bold;
  }

  .ousg-btn {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: var(--radius-md);
    font-weight: 500;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .ousg-btn-primary {
    background-color: #9ca3af !important;
    color: #ffffff !important;
    border: 1px solid #9ca3af !important;
  }

  .ousg-btn-primary:hover:not(:disabled) {
    background-color: #6b7280 !important;
    color: #ffffff !important;
  }

  .ousg-btn-primary:disabled {
    background-color: #94a3b8 !important;
    color: #ffffff !important;
    cursor: not-allowed;
  }

  .ousg-btn-outline {
    background-color: #2563eb !important;
    color: #ffffff !important;
    border: 1px solid #2563eb !important;
  }

  .ousg-btn-outline:hover:not(:disabled) {
    background-color: #1d4ed8 !important;
    color: #ffffff !important;
  }

  .ousg-btn-outline:disabled {
    background-color: #94a3b8 !important;
    color: #ffffff !important;
    cursor: not-allowed;
  }

  .ousg-btn-group {
    display: flex;
    gap: 0.5rem;
  }

  .ousg-btn-flex {
    flex: 1;
  }

  .ousg-loading {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 0.5rem;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .ousg-info-section {
    margin-top: 2rem;
    background: transparent !important;
    background-color: transparent !important;
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    text-align: center !important;
  }

  .ousg-info-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #1e293b !important;
    text-align: center !important;
  }

  .ousg-info-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center !important;
  }

  .ousg-info-item {
    font-size: 0.875rem;
    color: #64748b !important;
    text-align: center !important;
    max-width: 600px;
  }

  .ousg-info-bold {
    font-weight: bold;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .ousg-card,
    .ousg-balance-card,
    .ousg-info-section {
      background: #1f2937;
      border-color: #374151;
    }

    .ousg-title,
    .ousg-section-title,
    .ousg-balance-title,
    .ousg-info-title {
      color: #f9fafb;
    }

    .ousg-subtitle,
    .ousg-info-item {
      color: #d1d5db;
    }

    .ousg-label {
      color: #e5e7eb;
    }

    .ousg-input {
      background: #374151;
      border-color: #4b5563;
      color: #f9fafb;
    }

    .ousg-input:focus {
      border-color: #3b82f6;
    }

    .ousg-expected-blue {
      background-color: rgba(59, 130, 246, 0.1);
      color: #93c5fd;
    }

    .ousg-expected-orange {
      background-color: rgba(249, 115, 22, 0.1);
      color: #fdba74;
    }

    .ousg-expected-green {
      background-color: rgba(34, 197, 94, 0.1);
      color: #86efac;
    }
  }
</style>
