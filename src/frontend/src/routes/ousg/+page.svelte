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

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-primary mb-4">OUSG Token Management</h1>
    <p class="text-gray-600 dark:text-gray-300">
      Mint OUSG tokens with ckBTC or redeem them back to ckBTC. Each OUSG token
      represents $5,000 USD in value.
    </p>
  </div>

  <!-- Balance Overview -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <div class="card p-6 text-center">
      <h3 class="text-lg font-semibold mb-2">ckBTC Balance</h3>
      <p class="text-2xl font-bold text-orange-500">
        {ckbtcBalance.number.toFixed(8)} ckBTC
      </p>
    </div>
    <div class="card p-6 text-center">
      <h3 class="text-lg font-semibold mb-2">OUSG Balance</h3>
      <p class="text-2xl font-bold text-blue-500">
        {(Number(ousgBalance.balance) / 1_000_000).toFixed(6)} OUSG
      </p>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Minting Section -->
    <div class="card p-6">
      <h2 class="text-xl font-semibold text-primary mb-6">Mint OUSG Tokens</h2>

      <div class="space-y-4">
        <div>
          <label for="ckbtc-amount" class="block text-sm font-medium mb-2">
            ckBTC Amount
          </label>
          <div class="relative">
            <input
              id="ckbtc-amount"
              type="number"
              step="0.00000001"
              min="0"
              bind:value={ckbtcAmount}
              placeholder="Enter ckBTC amount"
              class="input w-full pr-16"
            />
            <button
              type="button"
              onclick={setMaxCkBTC}
              class="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-primary hover:text-primary-dark"
            >
              MAX
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            ckBTC will be automatically transferred to mint OUSG tokens
          </p>
        </div>

        {#if expectedOUSG() > 0n}
          <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p class="text-sm text-blue-700 dark:text-blue-300">
              Expected OUSG: <strong
                >{(Number(expectedOUSG()) / 1_000_000).toFixed(6)} OUSG</strong
              >
            </p>
          </div>
        {/if}

        <button
          type="button"
          onclick={handleMint}
          disabled={mintDisabled}
          class="btn btn-primary w-full"
        >
          {#if isMinting}
            <span class="loading loading-spinner loading-sm"></span>
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
    <div class="card p-6">
      <h2 class="text-xl font-semibold text-primary mb-6">
        Redeem OUSG Tokens
      </h2>

      <div class="space-y-4">
        <div>
          <label for="ousg-amount" class="block text-sm font-medium mb-2">
            OUSG Amount (minimum 1 OUSG)
          </label>
          <div class="relative">
            <input
              id="ousg-amount"
              type="number"
              step="0.000001"
              min="1"
              bind:value={ousgAmount}
              placeholder="Enter OUSG amount"
              class="input w-full pr-16"
            />
            <button
              type="button"
              onclick={setMaxOUSG}
              class="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-primary hover:text-primary-dark"
            >
              MAX
            </button>
          </div>
        </div>

        {#if expectedCkBTC() > 0n}
          <div class="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
            <p class="text-sm text-orange-700 dark:text-orange-300">
              Expected ckBTC: <strong
                >{(Number(expectedCkBTC()) / 100_000_000).toFixed(8)} ckBTC</strong
              >
            </p>
          </div>
        {/if}

        {#if approvalPending}
          <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <p class="text-sm text-green-700 dark:text-green-300">
              ✅ OUSG tokens approved for redemption. You can now redeem them.
            </p>
          </div>
        {/if}

        <div class="flex gap-2">
          <button
            type="button"
            onclick={handleApprove}
            disabled={approveDisabled}
            class="btn btn-outline flex-1"
          >
            {#if isApproving}
              <span class="loading loading-spinner loading-sm"></span>
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
            class="btn btn-primary flex-1"
          >
            {#if isRedeeming}
              <span class="loading loading-spinner loading-sm"></span>
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
  <div class="mt-8 card p-6">
    <h3 class="text-lg font-semibold mb-4">Important Information</h3>
    <div class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
      <p>• Each OUSG token represents $5,000 USD in value</p>
      <p>• Minimum minting amount: $5,000 USD worth of ckBTC</p>
      <p>• Minimum redemption amount: 1 OUSG token</p>
      <p>• KYC verification is required for both minting and redemption</p>
      <p>
        • <strong>Automatic minting:</strong> Just enter ckBTC amount and click mint
        - no manual transaction needed!
      </p>
      <p>• Redemption requires two steps: approval and then redemption</p>
      <p>• BTC price is fetched from external sources and may vary</p>
    </div>
  </div>
</div>
