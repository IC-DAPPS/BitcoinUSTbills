<script lang="ts">
  import { onMount } from "svelte";

  let {
    loading = false,
    minLoadingTime = 100, // Minimum loading time to prevent flashes
    fadeInDelay = 50, // Delay before fade in starts
    children,
  } = $props<{
    loading?: boolean;
    minLoadingTime?: number;
    fadeInDelay?: number;
    children?: any;
  }>();

  let isVisible = $state(false);
  let contentElement: HTMLElement | undefined = undefined;

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

  $effect(() => {
    if (!loading && contentElement) {
      // Trigger fade in when loading becomes false
      setTimeout(() => {
        isVisible = true;
      }, fadeInDelay);
    }
  });
</script>

<div
  class="page-content {isVisible ? 'visible' : 'hidden'}"
  bind:this={contentElement}
>
  {@render children?.({ isVisible })}
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
