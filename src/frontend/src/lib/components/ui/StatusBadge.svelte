<script lang="ts">
  let {
    status,
    size = "md",
  }: {
    status:
      | "Available"
      | "SoldOut"
      | "Matured"
      | "Cancelled"
      | "Pending"
      | "Completed"
      | string;
    size?: "sm" | "md";
  } = $props();

  const statusConfig: Record<string, { class: string; text: string }> = {
    Available: { class: "badge-available", text: "Available" },
    SoldOut: { class: "badge-sold-out", text: "Sold Out" },
    Matured: { class: "badge-completed", text: "Matured" },
    Cancelled: { class: "badge-sold-out", text: "Cancelled" },
    Pending: { class: "badge-pending", text: "Pending" },
    Completed: { class: "badge-completed", text: "Completed" },
    completed: { class: "badge-completed", text: "completed" },
    pending: { class: "badge-pending", text: "pending" },
  };

  const config = $derived(
    statusConfig[status] || { class: "badge-pending", text: status }
  );

  const classes = $derived(
    ["badge", config.class, size === "sm" ? "px-2 py-0.5 text-xs" : ""]
      .filter(Boolean)
      .join(" ")
  );
</script>

<span class={classes}>
  {config.text}
</span>

<style>
  /* Additional badge styles if needed */
  .badge {
    white-space: nowrap;
    font-weight: 500;
  }
</style>
