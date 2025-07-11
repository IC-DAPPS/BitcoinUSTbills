<script>
  import Toasts from "$lib/components/ui/Toasts.svelte";
</script>

<Toasts />

<main>
  <slot />
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, sans-serif;
    background: #f8fafc;
    color: #1a202c;
  }

  :global(*) {
    box-sizing: border-box;
  }

  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    padding: 2rem;
  }
</style>
