<div class="flex justify-center items-center py-8">
  <div
    class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"
  ></div>
</div>

<style>
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>
