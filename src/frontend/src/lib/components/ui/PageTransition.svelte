<script>
  import { onMount } from "svelte";

  export let loading = false;
  export let minLoadingTime = 100; // Minimum loading time to prevent flashes
  export let fadeInDelay = 50; // Delay before fade in starts

  let isVisible = false;
  let contentElement;

  onMount(() => {
    // Ensure minimum loading time to prevent flashing
    const startTime = Date.now();

    const showContent = () => {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsed);

      setTimeout(() => {
        setTimeout(() => {
          isVisible = true;
        }, fadeInDelay);
      }, remainingTime);
    };

    if (!loading) {
      showContent();
    } else {
      // Watch for loading to become false
      const checkLoading = () => {
        if (!loading) {
          showContent();
        } else {
          requestAnimationFrame(checkLoading);
        }
      };
      checkLoading();
    }
  });

  $: if (!loading && contentElement) {
    // Trigger fade in when loading becomes false
    setTimeout(() => {
      isVisible = true;
    }, fadeInDelay);
  }
</script>

<div
  class="page-content {isVisible ? 'visible' : 'hidden'}"
  bind:this={contentElement}
>
  <slot {isVisible} />
</div>

<style>
  .page-content {
    opacity: 0;
    transform: translateY(10px);
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
  }

  .page-content.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .page-content.hidden {
    opacity: 0;
    transform: translateY(10px);
  }
</style>
