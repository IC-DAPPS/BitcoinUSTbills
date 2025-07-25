<script lang="ts">
  export let variant: "primary" | "secondary" | "success" | "outline" =
    "primary";
  export let size: "sm" | "md" | "lg" = "md";
  export let disabled = false;
  export let loading = false;
  export let fullWidth = false;
  export let type: "button" | "submit" | "reset" = "button";
  export let href: string | undefined = undefined;
  export let target: string | undefined = undefined;

  // Allow additional CSS classes
  let className = "";
  export { className as class };

  $: classes = [
    "btn",
    `btn-${variant}`,
    size === "lg" ? "btn-lg" : size === "sm" ? "btn-sm" : "",
    fullWidth ? "w-full" : "",
    loading ? "cursor-wait" : "",
    "focus-visible",
    className,
  ]
    .filter(Boolean)
    .join(" ");
</script>

{#if href}
  <a
    {href}
    {target}
    class={classes}
    class:opacity-50={disabled}
    class:pointer-events-none={disabled || loading}
    role="button"
    tabindex={disabled ? -1 : 0}
  >
    {#if loading}
      <svg
        class="animate-spin -ml-1 mr-2 h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    {/if}
    <slot />
  </a>
{:else}
  <button
    {type}
    {disabled}
    class={classes}
    class:cursor-wait={loading}
    on:click
  >
    {#if loading}
      <svg
        class="animate-spin -ml-1 mr-2 h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    {/if}
    <slot />
  </button>
{/if}

<style>
  /* Additional button-specific styles */
  .btn-outline {
    background-color: transparent;
    color: var(--primary-blue);
    border: 1px solid var(--primary-blue);
  }

  .btn-outline:hover:not(:disabled) {
    background-color: var(--primary-blue);
    color: var(--text-white);
  }
</style>
