<script lang="ts">
  import { onMount } from "svelte";
  import { authStore } from "$lib/stores/auth.store";
  import { userSate } from "$lib/state/user.svelte";
  import {
    ckbtcBalance,
    fetchCkbtcBalance,
  } from "$lib/state/ckbtc-balance.svelte";
  import {
    ousgBalance,
    fetchOUSGBalance,
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
  let approvedAmount = $state(0n); // Store the approved amount in BigInt
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
      toast.error("Please log in to mint BBILL tokens");
      return;
    }

    // TODO: Uncomment for KYC enforcement in production
    // if (!userSate.profile || userSate.profile.kyc_status !== "Verified") {
    //   toast.error("KYC verification is required to mint BBILL tokens");
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
      toast.error("❌ Insufficient ckBTC balance", {
        description: `You only have ${ckbtcBalance.number.toFixed(8)} ckBTC available.`,
      });
      return;
    }

    isMinting = true;

    // Show processing toast
    const processingToast = toast.loading("🔄 Processing minting...", {
      description: "Transferring ckBTC and minting BBILL tokens (2-3 seconds)",
    });

    try {
      const result = await mintOUSGAutomatic(ckbtcAmountBigInt);

      // Dismiss processing toast
      toast.dismiss(processingToast);

      if (result.success) {
        // Calculate minted BBILL
        const usdValue = (Number(ckbtcAmountBigInt) / 100_000_000) * btcPrice;
        const bbillMinted = usdValue / 5000;
        const formattedBBILL = bbillMinted.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        });
        const formattedCkBTC = amount.toLocaleString("en-US", {
          minimumFractionDigits: 4,
          maximumFractionDigits: 8,
        });

        toast.success(`🎉 Minting successful!`, {
          duration: 10000,
          description: `Sent: ${formattedCkBTC} ckBTC\nMinted: ${formattedBBILL} BBILL tokens\n\nYour balances will update in a moment.`,
        });

        // Wait 2 seconds for minting to be processed
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Refresh balances
        await Promise.all([fetchOUSGBalance(), fetchCkbtcBalance()]);

        // Reset form
        ckbtcAmount = "";

        toast.success("✅ Balances updated!", {
          duration: 3000,
        });
      } else {
        toast.error(`❌ Minting failed`, {
          description:
            result.err || "Unknown error. Please try again or contact support.",
        });
      }
    } catch (error) {
      console.error("Minting error:", error);
      toast.dismiss(processingToast);
      toast.error("❌ Failed to mint BBILL tokens", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again or contact support.",
      });
    } finally {
      isMinting = false;
    }
  };

  const handleApprove = async () => {
    if (!$authStore.isAuthenticated) {
      toast.error("Please log in to approve BBILL tokens");
      return;
    }

    // TODO: Uncomment for KYC enforcement in production
    // if (!userSate.profile || userSate.profile.kyc_status !== "Verified") {
    //   toast.error("KYC verification is required");
    //   return;
    // }

    const amount = parseFloat(ousgAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid BBILL amount");
      return;
    }

    if (amount < 1) {
      toast.error("Minimum redemption amount is 1 BBILL token");
      return;
    }

    const ousgAmountBigInt = BigInt(Math.floor(amount * 1_000_000));

    if (ousgBalance.balance < ousgAmountBigInt) {
      toast.error("Insufficient BBILL balance");
      return;
    }

    isApproving = true;

    // Show processing toast
    const processingToast = toast.loading("🔄 Processing approval...", {
      description:
        "Please wait while we approve your BBILL tokens (2-3 seconds)",
    });

    try {
      const result = await approveOUSGForRedemption(ousgAmountBigInt);

      // Dismiss processing toast
      toast.dismiss(processingToast);

      if (result.success) {
        approvalPending = true;
        approvedAmount = ousgAmountBigInt; // Store the approved amount

        // Format the amount nicely
        const formattedAmount = amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        });
        const formattedUnits = ousgAmountBigInt.toLocaleString("en-US");

        toast.success(`✅ BBILL tokens approved successfully!`, {
          duration: 10000,
          description: `Approved Amount: ${formattedAmount} BBILL tokens (${formattedUnits} units)\n\nYou can now click the "2. Redeem" button to get your ckBTC back.`,
        });

        // Wait 3 seconds for approval to be processed
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else {
        toast.error(`❌ Approval failed`, {
          description: result.err || "Unknown error. Please try again.",
        });
      }
    } catch (error) {
      console.error("Approval error:", error);
      toast.dismiss(processingToast);
      toast.error("❌ Failed to approve BBILL tokens", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again or contact support.",
      });
    } finally {
      isApproving = false;
    }
  };

  const handleRedeem = async () => {
    if (!approvalPending) {
      toast.error("⚠️ Please approve BBILL tokens first", {
        description: "Click the '1. Approve' button before redeeming.",
      });
      return;
    }

    if (!$authStore.isAuthenticated) {
      toast.error("Please log in to redeem BBILL tokens");
      return;
    }

    // TODO: Uncomment for KYC enforcement in production
    // if (!userSate.profile || userSate.profile.kyc_status !== "Verified") {
    //   toast.error("KYC verification is required to redeem BBILL tokens");
    //   return;
    // }

    // Use the approved amount instead of user input
    if (approvedAmount <= 0n) {
      toast.error("❌ No approved amount found", {
        description: "Please approve tokens first before redeeming.",
      });
      return;
    }

    if (ousgBalance.balance < approvedAmount) {
      toast.error("❌ Insufficient BBILL balance", {
        description: `You only have ${(Number(ousgBalance.balance) / 1_000_000).toFixed(2)} BBILL tokens available.`,
      });
      return;
    }

    isRedeeming = true;

    // Show processing toast
    const processingToast = toast.loading("🔄 Processing redemption...", {
      description: "Burning BBILL tokens and transferring ckBTC (2-3 seconds)",
    });

    try {
      const result = await redeemOUSG(approvedAmount);

      // Dismiss processing toast
      toast.dismiss(processingToast);

      if (result.success) {
        // Calculate expected ckBTC received using the approved amount
        const usdValue = (Number(approvedAmount) / 1_000_000) * 5000;
        const ckbtcReceived = (usdValue / btcPrice) * 100_000_000;
        const formattedCkBTC = (ckbtcReceived / 100_000_000).toLocaleString(
          "en-US",
          {
            minimumFractionDigits: 4,
            maximumFractionDigits: 8,
          }
        );
        const formattedSatoshis =
          Math.floor(ckbtcReceived).toLocaleString("en-US");
        const formattedBBILL = (
          Number(approvedAmount) / 1_000_000
        ).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        });

        toast.success(`🎉 Redemption successful!`, {
          duration: 12000,
          description: `Redeemed: ${formattedBBILL} BBILL tokens\nReceived: ${formattedCkBTC} ckBTC (${formattedSatoshis} satoshis)\n\nYour balances will update in a moment.`,
        });

        // Wait 2 seconds for redemption to be processed
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Refresh balances
        await Promise.all([fetchOUSGBalance(), fetchCkbtcBalance()]);

        // Reset form
        ousgAmount = "";
        approvalPending = false;
        approvedAmount = 0n; // Reset approved amount

        toast.success("✅ Balances updated!", {
          duration: 3000,
        });
      } else {
        toast.error(`❌ Redemption failed`, {
          description:
            result.err || "Unknown error. Please try again or contact support.",
        });
      }
    } catch (error) {
      console.error("Redeeming error:", error);
      toast.dismiss(processingToast);
      toast.error("❌ Failed to redeem BBILL tokens", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again or contact support.",
      });
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
  <title>BitcoinTBill - Fractionalized US Treasury Bills for Africa</title>
  <meta
    name="description"
    content="Bitcoin Tbill offers fractionalized US Treasury bills to individuals and SMEs in Africa using ckBTC."
  />
</svelte:head>

<!-- Main Hero Section -->
<section class="bg-gray-50 py-20 lg:py-24">
  <div class="container mx-auto px-6 max-w-6xl">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
      <!-- Left Section - Information -->
      <div class="space-y-4 lg:space-y-5">
        <!-- Badge -->
        <div
          class="inline-flex items-center gap-2 px-3 py-1.5 lg:px-3 lg:py-1.5 bg-white rounded-full border border-gray-200 shadow-sm"
        >
          <div
            class="w-5 h-5 lg:w-6 lg:h-6 bg-orange-500 rounded flex items-center justify-center flex-shrink-0"
          >
            <span class="text-white text-xs font-bold">₿</span>
          </div>
          <span class="text-xs lg:text-xs text-gray-700 font-medium">
            BBILL: BTC based Short-Term US Treasuries Fund *
          </span>
        </div>

        <!-- Main Heading -->
        <div>
          <h1
            class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2 lg:mb-3"
          >
            BUY TREASURY BILLS<br />
            FOR<br />
            AS LOW AS 100$.
          </h1>
          <p
            class="text-sm sm:text-sm lg:text-base text-gray-600 leading-relaxed"
          >
            Bitcoin Tbill offers fractionalized US Treasury bills to individuals
            and SMEs in Africa using ckBTC.
          </p>

          <!-- Backing Note -->
          <div class="bg-gray-100 border border-gray-300 rounded-lg p-3 mt-4">
            <div class="flex items-center gap-2">
              <div
                class="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"
              ></div>
              <p class="text-xs sm:text-sm text-gray-700 font-medium">
                <span class="font-bold">BBILL</span> is backed by
                <span class="font-bold">OUSG</span> (Ondo Short-Term U.S. Government
                Treasuries)
              </p>
            </div>
          </div>
        </div>

        <!-- Metrics -->
        <div class="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
          <div>
            <p class="text-xs text-gray-600 mb-1">Price</p>
            <p class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              $ 112.0303
            </p>
            <p class="text-xs text-gray-500 hidden sm:block">$ 0.0000 today</p>
          </div>
          <div>
            <p class="text-xs text-gray-600 mb-1">APY1</p>
            <p class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              4.11 %
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-600 mb-1">TVL</p>
            <p class="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              $ 701.07M
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row flex-wrap gap-2 lg:gap-3">
          <button
            class="px-4 py-2 lg:px-5 lg:py-2.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors text-sm"
          >
            Buy BBILL
          </button>
          <button
            class="px-4 py-2 lg:px-5 lg:py-2.5 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors text-sm"
          >
            Redeem BBILL
          </button>
        </div>
      </div>

      <!-- Right Section - Widget Card -->
      <div
        class="bg-white rounded-2xl shadow-xl border-2 border-black p-4 sm:p-5 lg:p-6"
      >
        <!-- Mint/Redeem Toggle -->
        <div
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-4"
        >
          <div class="flex gap-2">
            <button
              class={`px-3 sm:px-4 py-1.5 rounded-full font-medium transition-colors text-xs sm:text-sm ${
                activeTab === "mint"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onclick={() => (activeTab = "mint")}
            >
              Mint
            </button>
            <button
              class={`px-3 sm:px-4 py-1.5 rounded-full font-medium transition-colors text-xs sm:text-sm ${
                activeTab === "redeem"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onclick={() => (activeTab = "redeem")}
            >
              Redeem
            </button>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-gray-600">
            <span class="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
            <span>BTC Network</span>
          </div>
        </div>

        {#if activeTab === "mint"}
          <!-- Mint Interface -->
          <div class="space-y-3">
            <!-- Pay Input -->
            <div class="bg-gray-50 rounded-xl p-3 border-2 border-black">
              <div class="flex justify-between items-center mb-1.5">
                <label for="mint-ckbtc-input" class="text-xs text-gray-600"
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
              <div class="flex items-center gap-2">
                <input
                  id="mint-ckbtc-input"
                  type="number"
                  step="0.00000001"
                  bind:value={ckbtcAmount}
                  placeholder="0"
                  class="flex-1 bg-transparent text-lg sm:text-xl font-semibold text-gray-900 outline-none"
                />
                <div
                  class="flex items-center gap-1 px-2 py-1 bg-orange-500 rounded-lg flex-shrink-0"
                >
                  <span class="text-white font-medium text-xs sm:text-sm"
                    >ckBTC</span
                  >
                </div>
              </div>
            </div>

            <!-- Swap Arrow -->
            <div class="flex justify-center">
              <div
                class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-4 h-4 text-gray-600"
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
            <div class="bg-gray-50 rounded-xl p-3 border-2 border-black">
              <div class="flex justify-between items-center mb-1.5">
                <label for="mint-ousg-output" class="text-xs text-gray-600"
                  >Receive</label
                >
                <span class="text-xs text-gray-500">
                  Balance: {(Number(ousgBalance.balance) / 1_000_000).toFixed(
                    6
                  )}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <input
                  id="mint-ousg-output"
                  type="text"
                  value={expectedOUSG() > 0n
                    ? (Number(expectedOUSG()) / 1_000_000).toFixed(6)
                    : "0"}
                  readonly
                  placeholder="0"
                  class="flex-1 bg-transparent text-lg sm:text-xl font-semibold text-gray-900 outline-none"
                />
                <div
                  class="flex items-center gap-1 px-2 py-1 bg-orange-500 rounded-lg flex-shrink-0"
                >
                  <span class="text-white font-medium text-xs sm:text-sm"
                    >BBILL</span
                  >
                </div>
              </div>
            </div>

            <!-- Exchange Rate -->
            <div class="text-center text-sm text-gray-600">1BBILL = $ 1.09</div>

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
                It looks like you haven't applied for BBILL yet. Start your
                application to access BBILL
              </p>
            {:else if !userSate.profile}
              <button
                disabled
                class="w-full py-4 bg-gray-300 text-gray-600 font-semibold rounded-xl cursor-not-allowed text-lg"
              >
                Registration Required
              </button>
              <p class="text-xs text-center text-red-500 mt-2">
                Please complete registration to mint BBILL tokens
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
                  Mint BBILL
                {/if}
              </button>

              <!-- KYC Prompt for registered users -->
              {#if userSate.profile && userSate.profile.kyc_status === "Pending"}
                <p class="text-xs text-center text-gray-600 mt-2">
                  To fill in KYC <a
                    href="/kyc"
                    class="text-orange-500 hover:text-orange-600 underline"
                    >click here</a
                  >
                </p>
              {/if}
            {/if}
          </div>
        {:else}
          <!-- Redeem Interface -->
          <div class="space-y-3">
            <!-- Pay Input (OUSG) -->
            <div class="bg-gray-50 rounded-xl p-3 border-2 border-black">
              <div class="flex justify-between items-center mb-1.5">
                <label for="redeem-ousg-input" class="text-xs text-gray-600"
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
              <div class="flex items-center gap-2">
                <input
                  id="redeem-ousg-input"
                  type="number"
                  step="0.000001"
                  bind:value={ousgAmount}
                  placeholder="0"
                  class="flex-1 bg-transparent text-lg sm:text-xl font-semibold text-gray-900 outline-none"
                />
                <div
                  class="flex items-center gap-1 px-2 py-1 bg-orange-500 rounded-lg flex-shrink-0"
                >
                  <span class="text-white font-medium text-xs sm:text-sm"
                    >BBILL</span
                  >
                </div>
              </div>
            </div>

            <!-- Swap Arrow -->
            <div class="flex justify-center">
              <div
                class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-4 h-4 text-gray-600"
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
            <div class="bg-gray-50 rounded-xl p-3 border-2 border-black">
              <div class="flex justify-between items-center mb-1.5">
                <label for="redeem-ckbtc-output" class="text-xs text-gray-600"
                  >Receive</label
                >
                <span class="text-xs text-gray-500">
                  Balance: {ckbtcBalance.number.toFixed(8)}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <input
                  id="redeem-ckbtc-output"
                  type="text"
                  value={expectedCkBTC() > 0n
                    ? (Number(expectedCkBTC()) / 100_000_000).toFixed(8)
                    : "0"}
                  readonly
                  placeholder="0"
                  class="flex-1 bg-transparent text-lg sm:text-xl font-semibold text-gray-900 outline-none"
                />
                <div
                  class="flex items-center gap-1 px-2 py-1 bg-orange-500 rounded-lg flex-shrink-0"
                >
                  <span class="text-white font-medium text-xs sm:text-sm"
                    >ckBTC</span
                  >
                </div>
              </div>
            </div>

            <!-- Exchange Rate -->
            <div class="text-center text-sm text-gray-600">1BBILL = $ 1.09</div>

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
