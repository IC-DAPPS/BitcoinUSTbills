<script lang="ts">
  import Button from "./ui/Button.svelte";
  import StatusBadge from "./ui/StatusBadge.svelte";
  import {
    centsToDoller,
    formatYieldPercentage,
    getStatusText,
  } from "$lib/api";
  import type { USTBill } from "$lib/types";

  export let ustbill: USTBill;
  export let onInvest: ((ustbillId: string) => void) | undefined = undefined;
  export let loading = false;

  $: isAvailable =
    getStatusText(ustbill.status) === "Active" && ustbill.owner.length === 0;
  $: statusText =
    ustbill.owner.length > 0 ? "SoldOut" : getStatusText(ustbill.status);

  function handleInvest() {
    if (onInvest && isAvailable) {
      onInvest(ustbill.id);
    }
  }
</script>

<div
  class="card p-6 hover:shadow-lg transition-all duration-200 animate-fade-in"
>
  <div class="flex justify-between items-start mb-4">
    <div>
      <h3 class="text-lg font-semibold text-primary mb-1">{ustbill.cusip}</h3>
      <p class="text-sm text-secondary">
        Maturity: {new Date(
          Number(ustbill.maturity_date) * 1000
        ).toLocaleDateString()}
      </p>
    </div>
    <StatusBadge status={statusText} />
  </div>

  <div class="space-y-3 mb-6">
    <div class="flex justify-between items-center">
      <span class="text-sm text-secondary">Yield:</span>
      <span class="text-lg font-semibold text-success">
        {formatYieldPercentage(ustbill.annual_yield)}
      </span>
    </div>

    <div class="flex justify-between items-center">
      <span class="text-sm text-secondary">Min. Investment:</span>
      <span class="text-sm font-medium text-primary">
        ${centsToDoller(ustbill.purchase_price)}
      </span>
    </div>

    <div class="flex justify-between items-center">
      <span class="text-sm text-secondary">Total Value:</span>
      <span class="text-sm font-medium text-primary">
        ${centsToDoller(ustbill.face_value)}
      </span>
    </div>

    <div class="flex justify-between items-center">
      <span class="text-sm text-secondary">Availability:</span>
      <span class="text-sm font-medium text-primary">
        {isAvailable ? "Available" : "Sold Out"}
      </span>
    </div>

    <div class="flex justify-between items-center">
      <span class="text-sm text-secondary">Bill Type:</span>
      <span class="text-sm font-medium text-primary">
        {ustbill.bill_type}
      </span>
    </div>
  </div>

  <Button
    variant="primary"
    fullWidth
    {loading}
    disabled={!isAvailable || loading}
    on:click={handleInvest}
  >
    {#if statusText === "SoldOut"}
      Sold Out
    {:else if !isAvailable}
      Not Available
    {:else}
      Invest Now
    {/if}
  </Button>
</div>

<style>
  .card:hover {
    transform: translateY(-2px);
  }
</style>
