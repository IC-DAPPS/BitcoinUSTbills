<script>
  import { onMount } from "svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";

  let loading = true;
  let error = null;
  let showBuyModal = false;
  let selectedBill = null;

  // Simple mock bills for demo
  let bills = [
    {
      id: "1",
      cusip: "912797JK5",
      faceValue: 1000,
      purchasePrice: 950,
      maturityDays: 30,
      annualYield: 5.26,
      issuer: "US Treasury",
      billType: "4-week",
      isAvailable: true,
    },
    {
      id: "2",
      cusip: "912797JL3",
      faceValue: 1000,
      purchasePrice: 940,
      maturityDays: 90,
      annualYield: 6.15,
      issuer: "US Treasury",
      billType: "13-week",
      isAvailable: true,
    },
    {
      id: "3",
      cusip: "912797JM1",
      faceValue: 1000,
      purchasePrice: 920,
      maturityDays: 180,
      annualYield: 7.25,
      issuer: "US Treasury",
      billType: "26-week",
      isAvailable: true,
    },
  ];

  let filteredBills = bills.filter((b) => b.isAvailable);

  onMount(async () => {
    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 400));
    loading = false;
  });

  function openBuyModal(bill) {
    selectedBill = bill;
    showBuyModal = true;
  }

  function closeBuyModal() {
    showBuyModal = false;
    selectedBill = null;
  }

  function confirmPurchase() {
    if (selectedBill) {
      alert(
        `Purchase confirmed for ${selectedBill.cusip} at $${selectedBill.purchasePrice}`
      );
      closeBuyModal();
    }
  }
</script>

<svelte:head>
  <title>Marketplace - BitcoinUSTbills</title>
</svelte:head>

<div class="container-wide mx-auto px-6 py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-primary mb-2">UST Bills Marketplace</h1>
    <p class="text-secondary">
      Browse and purchase available US Treasury Bills
    </p>
  </div>

  {#if error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-800">{error}</p>
      <button
        class="text-red-600 underline mt-2"
        on:click={() => (error = null)}
      >
        Dismiss
      </button>
    </div>
  {/if}

  {#if loading}
    <LoadingSpinner />
  {:else}
    <div class="mb-4">
      <p class="text-secondary">{filteredBills.length} bills available</p>
    </div>

    {#if filteredBills.length === 0}
      <div class="text-center py-12">
        <h3 class="text-xl font-semibold text-secondary mb-2">
          No Bills Available
        </h3>
        <p class="text-gray-500">All bills have been purchased</p>
      </div>
    {:else}
      <div
        class="marketplace-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {#each filteredBills as bill (bill.id)}
          <div class="card p-6 hover:shadow-lg transition-shadow">
            <div class="flex justify-between items-start mb-4">
              <span
                class="inline-block px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800"
              >
                Available
              </span>
            </div>

            <h3 class="text-lg font-semibold text-primary mb-4">
              {bill.cusip}
            </h3>

            <div class="space-y-3 mb-6">
              <div class="flex justify-between">
                <span class="text-secondary">{bill.billType} Treasury Bill</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-secondary">Face Value:</span>
                <span class="font-semibold"
                  >${bill.faceValue.toLocaleString()}</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-secondary">Purchase Price:</span>
                <span class="font-semibold"
                  >${bill.purchasePrice.toLocaleString()}</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-secondary">Annual Yield:</span>
                <span class="font-semibold text-success"
                  >{bill.annualYield}%</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-secondary">Maturity:</span>
                <span class="font-semibold">{bill.maturityDays} days</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary">Issuer:</span>
                <span class="font-semibold">{bill.issuer}</span>
              </div>
            </div>

            <Button
              variant="primary"
              class="w-full"
              on:click={() => openBuyModal(bill)}
            >
              Buy Now - ${bill.purchasePrice.toLocaleString()}
            </Button>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<!-- Buy Modal -->
{#if showBuyModal && selectedBill}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    role="dialog"
    aria-modal="true"
    aria-labelledby="buy-modal-title"
    tabindex="-1"
    on:click={(e) => e.target === e.currentTarget && closeBuyModal()}
    on:keydown={(e) => e.key === "Escape" && closeBuyModal()}
  >
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" role="document">
      <h3 id="buy-modal-title" class="text-xl font-semibold text-primary mb-4">
        Confirm Purchase
      </h3>

      <div class="space-y-3 mb-6">
        <div class="flex justify-between">
          <span class="text-secondary">Treasury Bill:</span>
          <span class="font-semibold">{selectedBill.cusip}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-secondary">Type:</span>
          <span class="font-semibold">{selectedBill.billType}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-secondary">Face Value:</span>
          <span class="font-semibold"
            >${selectedBill.faceValue.toLocaleString()}</span
          >
        </div>
        <div class="flex justify-between">
          <span class="text-secondary">Annual Yield:</span>
          <span class="font-semibold text-success"
            >{selectedBill.annualYield}%</span
          >
        </div>
        <div class="border-t pt-3">
          <div class="flex justify-between text-lg font-semibold">
            <span>Total Cost:</span>
            <span class="text-primary"
              >${selectedBill.purchasePrice.toLocaleString()}</span
            >
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <Button variant="secondary" class="flex-1" on:click={closeBuyModal}>
          Cancel
        </Button>
        <Button variant="primary" class="flex-1" on:click={confirmPurchase}>
          Confirm Purchase
        </Button>
      </div>
    </div>
  </div>
{/if}
