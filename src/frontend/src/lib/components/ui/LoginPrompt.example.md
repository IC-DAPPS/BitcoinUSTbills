# LoginPrompt Component Usage

A simple, reusable component that displays a login prompt for non-authenticated users.

## Basic Usage

```svelte
<script>
  import LoginPrompt from '$lib/components/ui/LoginPrompt.svelte';
  import { authStore } from '$lib/auth';
</script>

<!-- Simple usage with conditional rendering -->
{#if !$authStore.isLoggedIn}
  <LoginPrompt />
{/if}
```

## Complete Example with Loading State

```svelte
<script>
  import LoginPrompt from '$lib/components/ui/LoginPrompt.svelte';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import { authStore } from '$lib/auth';
  
  let loading = true;
  
  // Simulate loading
  setTimeout(() => loading = false, 1000);
</script>

{#if loading}
  <LoadingSpinner />
{:else if !$authStore.isLoggedIn}
  <LoginPrompt />
{:else}
  <!-- Your authenticated content here -->
  <div class="card p-6">
    <h2>Welcome! You are logged in.</h2>
    <p>This content is only visible to authenticated users.</p>
  </div>
{/if}
```

## Features

- **Simple and clean design** that matches the app's UI
- **Automatic login trigger** - clicking the button calls the login function
- **Reusable** - can be used on any page that requires authentication
- **Consistent styling** - uses the app's design system
- **Responsive** - looks good on mobile and desktop

## Where to Use

This component is perfect for:
- Dashboard pages
- Wallet pages  
- Portfolio pages
- Any protected content areas
- Settings pages
- Admin sections

The component automatically handles the login flow when the button is clicked.
