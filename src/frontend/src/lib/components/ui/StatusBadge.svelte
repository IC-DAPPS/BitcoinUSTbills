<script lang="ts">
  export let status:
    | "Available"
    | "SoldOut"
    | "Matured"
    | "Cancelled"
    | "Pending"
    | "Completed"
    | string;
  export let size: "sm" | "md" = "md";

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

  $: config = statusConfig[status] || { class: "badge-pending", text: status };

  $: classes = [
    "badge",
    config.class,
    size === "sm" ? "px-2 py-0.5 text-xs" : "",
  ]
    .filter(Boolean)
    .join(" ");
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
