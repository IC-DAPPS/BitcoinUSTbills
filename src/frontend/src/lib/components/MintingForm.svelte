<script lang="ts">
  import { authStore } from "$lib/stores/auth.store";
  import { userSate } from "$lib/state/user.svelte";
  import { ckbtcBalance } from "$lib/state/ckbtc-balance.svelte";
  import {
    mintOUSG,
    getCurrentBTCPrice,
    calculateOUSGForUSD,
  } from "$lib/services/minting.service";
  import { toast } from "svelte-sonner";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";

  let ckbtcAmount = $state("");
  let btcPrice = $state(0);
  let expectedOUSG = $state(0n);
  let isMinting = $state(false);
  let blockIndex = $state("");

  // Fetch BTC price on component mount
  $effect(() => {
    if ($authStore.isAuthenticated) {
      getCurrentBTCPrice().then((price) => {
        if (price) {
          btcPrice = price;
        }
      });
    }
  });

  // Calculate expected OUSG when ckBTC amount changes
  $effect(() => {
    if (ckbtcAmount && btcPrice > 0) {
      const amount = parseFloat(ckbtcAmount);
      if (amount > 0) {
        const usdValue = (amount * btcPrice) / 100_000_000; // Convert from satoshis to BTC, then to USD
        calculateOUSGForUSD(usdValue).then((ousgAmount) => {
          if (ousgAmount) {
            expectedOUSG = ousgAmount;
          }
        });
      }
    }
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

    const ckbtcAmountBigInt = BigInt(Math.floor(amount * 100_000_000)); // Convert to satoshis

    const ckbtcBalanceBigInt = BigInt(
      Math.floor(ckbtcBalance.number * 100_000_000)
    );
    if (ckbtcBalanceBigInt < ckbtcAmountBigInt) {
      toast.error("Insufficient ckBTC balance");
      return;
    }

    isMinting = true;

    try {
      const result = await mintOUSG(
        ckbtcAmountBigInt,
        BigInt(blockIndex || "0")
      );
      if (result.success) {
        ckbtcAmount = "";
        expectedOUSG = 0n;
      }
    } catch (error) {
      console.error("Minting error:", error);
      toast.error("Failed to mint OUSG tokens");
    } finally {
      isMinting = false;
    }
  };

  const setMaxAmount = () => {
    if (ckbtcBalance.number > 0) {
      ckbtcAmount = ckbtcBalance.number.toString();
    }
  };

  const isDisabled = $derived(
    !$authStore.isAuthenticated ||
      !userSate.profile ||
      userSate.profile.kyc_status !== "Verified" ||
      !ckbtcAmount ||
      parseFloat(ckbtcAmount) <= 0 ||
      isMinting
  );

  const buttonText = $derived(() => {
    if (!$authStore.isAuthenticated) return "Connect to mint";
    if (!userSate.profile || userSate.profile.kyc_status !== "Verified")
      return "KYC required";
    if (isMinting) return "Minting...";
    return "Mint OUSG";
  });
</script>

<div class="card p-6">
  <h2 class="text-xl font-semibold text-primary mb-6">Mint OUSG Tokens</h2>

  <div class="space-y-4">
    <!-- ckBTC Amount Input -->
    <div>
      <label
        for="ckbtc-amount"
        class="block text-sm font-medium text-primary mb-2"
      >
        ckBTC Amount
      </label>
      <div class="relative">
        <Input
          id="ckbtc-amount"
          type="number"
          step="0.00000001"
          min="0"
          bind:value={ckbtcAmount}
          placeholder="Enter ckBTC amount"
          disabled={isMinting}
          class="pr-20"
        />
        <button
          type="button"
          onclick={setMaxAmount}
          disabled={isMinting || ckbtcBalance.number === 0}
          class="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          MAX
        </button>
      </div>
      <p class="text-xs text-secondary mt-1">
        Balance: {ckbtcBalance.format} ckBTC
      </p>
    </div>

    <!-- Block Index Input -->
    <div>
      <label
        for="block-index"
        class="block text-sm font-medium text-primary mb-2"
      >
        Block Index (Transaction ID)
      </label>
      <Input
        id="block-index"
        type="number"
        min="0"
        bind:value={blockIndex}
        placeholder="Enter ckBTC transaction block index"
        disabled={isMinting}
      />
      <p class="text-xs text-secondary mt-1">
        Enter the block index from your ckBTC transfer transaction
      </p>
    </div>

    <!-- Expected OUSG Display -->
    {#if expectedOUSG > 0n}
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex justify-between items-center">
          <span class="text-sm font-medium text-blue-800">Expected OUSG:</span>
          <span class="text-lg font-bold text-blue-900">
            {(Number(expectedOUSG) / 1_000_000).toFixed(6)} OUSG
          </span>
        </div>
        {#if btcPrice > 0}
          <p class="text-xs text-blue-600 mt-1">
            Based on BTC price: ${btcPrice.toLocaleString()}
          </p>
        {/if}
      </div>
    {/if}

    {#if !$authStore.isAuthenticated}
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p class="text-sm text-yellow-800">
          Please connect your wallet to mint OUSG tokens.
        </p>
      </div>
    {:else if !userSate.profile || userSate.profile.kyc_status !== "Verified"}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-sm text-red-800">
          KYC verification is required to mint OUSG tokens.
        </p>
      </div>
    {/if}

    <Button onclick={handleMint} disabled={isDisabled} class="w-full">
      {#if isMinting}
        <LoadingSpinner />
      {/if}
      {buttonText}
    </Button>
  </div>
</div>
