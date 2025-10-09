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
  import Footer from "$lib/components/Footer.svelte";

  // State variables
  let activeTab = $state<"mint" | "redeem">("mint");
  let ckbtcAmount = $state("");
  let ousgAmount = $state("");
  let isMinting = $state(false);
  let isApproving = $state(false);
  let isRedeeming = $state(false);
  let approvalPending = $state(false);
  let btcPrice = $state(100000); // Default BTC price

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

  const handleConnectWallet = () => {
    if (!$authStore.isAuthenticated) {
      authStore.signIn({ identityProvider: "ii" });
    }
  };

  const handleMint = async () => {
    if (!$authStore.isAuthenticated) {
      toast.error("Please log in to mint OUSG tokens");
      return;
    }

    // TODO: Uncomment for KYC enforcement in production
    // if (!userSate.profile || userSate.profile.kyc_status !== "Verified") {
    //   toast.error("KYC verification is required to mint OUSG tokens");
    //   return;
    // }

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

    // TODO: Uncomment for KYC enforcement in production
    // if (!userSate.profile || userSate.profile.kyc_status !== "Verified") {
    //   toast.error("KYC verification is required");
    //   return;
    // }

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

    // TODO: Uncomment for KYC enforcement in production
    // if (!userSate.profile || userSate.profile.kyc_status !== "Verified") {
    //   toast.error("KYC verification is required to redeem OUSG tokens");
    //   return;
    // }

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
</script>

<svelte:head>
  <title>Btc Tbills - Bitcoin Liquidity To USTBILL Markets</title>
  <meta
    name="description"
    content="Built for the Bitcoin Economy. $btb offers exposure to short-term US Treasuries with 24/7 instant mints and redemptions."
  />
</svelte:head>

<!-- Main Hero Section -->
<section class="bg-gray-50 py-8 lg:py-12">
  <div class="container mx-auto px-6 max-w-7xl">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
      <!-- Left Section - Information -->
      <div class="space-y-6 lg:space-y-8">
        <!-- Badge -->
        <div
          class="inline-flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2 bg-white rounded-full border border-gray-200 shadow-sm"
        >
          <div
            class="w-6 h-6 lg:w-8 lg:h-8 bg-orange-500 rounded flex items-center justify-center flex-shrink-0"
          >
            <span class="text-white text-xs font-bold">₿</span>
          </div>
          <span class="text-xs lg:text-sm text-gray-700 font-medium">
            $TB: BTC based Short-Term US Treasuries Fund *
          </span>
        </div>

        <!-- Main Heading -->
        <div>
          <h1
            class="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight mb-3 lg:mb-4"
          >
            BITCOIN LIQUIDITY<br />
            To<br />
            USTBILL MARKETS
          </h1>
          <p
            class="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed"
          >
            Built for the Bitcoin Economy. $btb offers exposure to short-term US
            Treasuries with 24/7 instant mints and redemptions.
          </p>
        </div>

        <!-- Metrics -->
        <div class="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <div>
            <p class="text-xs sm:text-sm text-gray-600 mb-1">Price</p>
            <p class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              $ 112.0303
            </p>
            <p class="text-xs text-gray-500 hidden sm:block">$ 0.0000 today</p>
          </div>
          <div>
            <p class="text-xs sm:text-sm text-gray-600 mb-1">APY1</p>
            <p class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              4.11 %
            </p>
          </div>
          <div>
            <p class="text-xs sm:text-sm text-gray-600 mb-1">TVL</p>
            <p class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              $ 701.07M
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row flex-wrap gap-3 lg:gap-4">
          <button
            class="px-5 py-2.5 lg:px-6 lg:py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors text-sm lg:text-base"
          >
            Buy OUSG
          </button>
          <button
            class="px-5 py-2.5 lg:px-6 lg:py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors text-sm lg:text-base"
          >
            Redeem OUSG
          </button>
        </div>
      </div>

      <!-- Right Section - Widget Card -->
      <div
        class="bg-white rounded-2xl shadow-xl border-2 border-black p-4 sm:p-6 lg:p-8"
      >
        <!-- Mint/Redeem Toggle -->
        <div
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6"
        >
          <div class="flex gap-2">
            <button
              class={`px-4 sm:px-6 py-2 rounded-full font-medium transition-colors text-sm sm:text-base ${
                activeTab === "mint"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onclick={() => (activeTab = "mint")}
            >
              Mint
            </button>
            <button
              class={`px-4 sm:px-6 py-2 rounded-full font-medium transition-colors text-sm sm:text-base ${
                activeTab === "redeem"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onclick={() => (activeTab = "redeem")}
            >
              Redeem
            </button>
          </div>
          <div class="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <span class="w-2 h-2 bg-orange-500 rounded-full"></span>
            <span>BTC Network</span>
          </div>
        </div>

        {#if activeTab === "mint"}
          <!-- Mint Interface -->
          <div class="space-y-4">
            <!-- Pay Input -->
            <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div class="flex justify-between items-center mb-2">
                <label for="mint-ckbtc-input" class="text-sm text-gray-600"
                  >Pay</label
                >
                <button
                  onclick={setMaxCkBTC}
                  class="text-xs text-gray-500 hover:text-gray-700"
                >
                  Balance: {ckbtcBalance.number.toFixed(8)}
                  <span class="font-medium">Max</span>
                </button>
              </div>
              <div class="flex items-center gap-2 sm:gap-3">
                <input
                  id="mint-ckbtc-input"
                  type="number"
                  step="0.00000001"
                  bind:value={ckbtcAmount}
                  placeholder="0"
                  class="flex-1 bg-transparent text-xl sm:text-2xl font-semibold text-gray-900 outline-none"
                />
                <div
                  class="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-orange-500 rounded-lg flex-shrink-0"
                >
                  <span class="text-white font-medium text-sm sm:text-base"
                    >ckBTC</span
                  >
                </div>
              </div>
            </div>

            <!-- Swap Arrow -->
            <div class="flex justify-center">
              <div
                class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  ></path>
                </svg>
              </div>
            </div>

            <!-- Receive Input -->
            <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div class="flex justify-between items-center mb-2">
                <label for="mint-ousg-output" class="text-sm text-gray-600"
                  >Receive</label
                >
                <span class="text-xs text-gray-500">
                  Balance: {(Number(ousgBalance.balance) / 1_000_000).toFixed(
                    6
                  )}
                </span>
              </div>
              <div class="flex items-center gap-2 sm:gap-3">
                <input
                  id="mint-ousg-output"
                  type="text"
                  value={expectedOUSG() > 0n
                    ? (Number(expectedOUSG()) / 1_000_000).toFixed(6)
                    : "0"}
                  readonly
                  placeholder="0"
                  class="flex-1 bg-transparent text-xl sm:text-2xl font-semibold text-gray-900 outline-none"
                />
                <div
                  class="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-orange-500 rounded-lg flex-shrink-0"
                >
                  <span class="text-white font-medium text-sm sm:text-base"
                    >$BTB</span
                  >
                </div>
              </div>
            </div>

            <!-- Exchange Rate -->
            <div class="text-center text-sm text-gray-600">1$BTB = $ 1.09</div>

            <!-- Instant Limits Info -->
            <div class="text-center text-xs text-gray-500">Instant Limits</div>

            <!-- Connect Wallet / Mint Button -->
            {#if !$authStore.isAuthenticated}
              <button
                onclick={handleConnectWallet}
                class="w-full py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors text-lg"
              >
                Connect Wallet
              </button>
              <p class="text-xs text-center text-gray-500 mt-2">
                It looks like you haven't applied for OUSG yet. Start your
                application to access OUSG
              </p>
            {:else if !userSate.profile}
              <button
                disabled
                class="w-full py-4 bg-gray-300 text-gray-600 font-semibold rounded-xl cursor-not-allowed text-lg"
              >
                Registration Required
              </button>
              <p class="text-xs text-center text-red-500 mt-2">
                Please complete registration to mint OUSG tokens
              </p>
            {:else}
              <button
                onclick={handleMint}
                disabled={isMinting ||
                  !ckbtcAmount ||
                  parseFloat(ckbtcAmount) <= 0}
                class="w-full py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {#if isMinting}
                  <span
                    class="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
                  ></span>
                  Minting...
                {:else}
                  Mint OUSG
                {/if}
              </button>
            {/if}
          </div>
        {:else}
          <!-- Redeem Interface -->
          <div class="space-y-4">
            <!-- Pay Input (OUSG) -->
            <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div class="flex justify-between items-center mb-2">
                <label for="redeem-ousg-input" class="text-sm text-gray-600"
                  >Pay</label
                >
                <button
                  onclick={setMaxOUSG}
                  class="text-xs text-gray-500 hover:text-gray-700"
                >
                  Balance: {(Number(ousgBalance.balance) / 1_000_000).toFixed(
                    6
                  )} <span class="font-medium">Max</span>
                </button>
              </div>
              <div class="flex items-center gap-2 sm:gap-3">
                <input
                  id="redeem-ousg-input"
                  type="number"
                  step="0.000001"
                  bind:value={ousgAmount}
                  placeholder="0"
                  class="flex-1 bg-transparent text-xl sm:text-2xl font-semibold text-gray-900 outline-none"
                />
                <div
                  class="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-orange-500 rounded-lg flex-shrink-0"
                >
                  <span class="text-white font-medium text-sm sm:text-base"
                    >$BTB</span
                  >
                </div>
              </div>
            </div>

            <!-- Swap Arrow -->
            <div class="flex justify-center">
              <div
                class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  ></path>
                </svg>
              </div>
            </div>

            <!-- Receive Input (ckBTC) -->
            <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div class="flex justify-between items-center mb-2">
                <label for="redeem-ckbtc-output" class="text-sm text-gray-600"
                  >Receive</label
                >
                <span class="text-xs text-gray-500">
                  Balance: {ckbtcBalance.number.toFixed(8)}
                </span>
              </div>
              <div class="flex items-center gap-2 sm:gap-3">
                <input
                  id="redeem-ckbtc-output"
                  type="text"
                  value={expectedCkBTC() > 0n
                    ? (Number(expectedCkBTC()) / 100_000_000).toFixed(8)
                    : "0"}
                  readonly
                  placeholder="0"
                  class="flex-1 bg-transparent text-xl sm:text-2xl font-semibold text-gray-900 outline-none"
                />
                <div
                  class="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-orange-500 rounded-lg flex-shrink-0"
                >
                  <span class="text-white font-medium text-sm sm:text-base"
                    >ckBTC</span
                  >
                </div>
              </div>
            </div>

            <!-- Exchange Rate -->
            <div class="text-center text-sm text-gray-600">1$BTB = $ 1.09</div>

            <!-- Instant Limits Info -->
            <div class="text-center text-xs text-gray-500">Instant Limits</div>

            <!-- Approval Status -->
            {#if approvalPending}
              <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p class="text-sm text-green-800 text-center">
                  ✅ OUSG tokens approved for redemption
                </p>
              </div>
            {/if}

            <!-- Redeem Buttons -->
            {#if !$authStore.isAuthenticated}
              <button
                onclick={handleConnectWallet}
                class="w-full py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors text-lg"
              >
                Connect Wallet
              </button>
            {:else if !userSate.profile}
              <button
                disabled
                class="w-full py-4 bg-gray-300 text-gray-600 font-semibold rounded-xl cursor-not-allowed text-lg"
              >
                Registration Required
              </button>
            {:else}
              <div class="flex gap-2">
                <button
                  onclick={handleApprove}
                  disabled={isApproving ||
                    approvalPending ||
                    !ousgAmount ||
                    parseFloat(ousgAmount) <= 0}
                  class="flex-1 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {#if isApproving}
                    <span
                      class="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
                    ></span>
                    Approving...
                  {:else if approvalPending}
                    Approved ✓
                  {:else}
                    1. Approve
                  {/if}
                </button>
                <button
                  onclick={handleRedeem}
                  disabled={!approvalPending ||
                    isRedeeming ||
                    !ousgAmount ||
                    parseFloat(ousgAmount) <= 0}
                  class="flex-1 py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {#if isRedeeming}
                    <span
                      class="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
                    ></span>
                    Redeeming...
                  {:else}
                    2. Redeem
                  {/if}
                </button>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>

<Footer />
