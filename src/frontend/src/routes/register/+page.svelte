<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { authStore } from "$lib/auth";
  import { registerUser, isUserRegistered, validateEmail } from "$lib/api";
  import { userSate, fetchUserProfile } from "$lib/state/user.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import { toast } from "svelte-sonner";
  import type { UserRegistrationRequest } from "../../../../declarations/backend/backend.did";

  // Form state
  let formData: UserRegistrationRequest = {
    email: "",
    country: "",
    phone_number: [],
  };

  let phoneNumber = ""; // Separate variable for phone input
  let loading = false;
  let checking = true;

  // Validation state
  let errors: Record<string, string> = {};

  // Check authentication and registration status
  onMount(async () => {
    const { isAuthenticated } = $authStore;

    if (!isAuthenticated) {
      goto("/");
      return;
    }

    try {
      const registered = await isUserRegistered();
      if (registered) {
        goto("/dashboard");
        return;
      }
    } catch (error) {
      console.error("Error checking registration status:", error);
    }

    checking = false;
  });

  // Form validation
  function validateForm(): boolean {
    errors = {};

    // Email validation
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      errors.email = emailValidation.error || "Invalid email";
    }

    // Country validation
    if (!formData.country.trim()) {
      errors.country = "Country is required";
    }

    // Phone number validation (optional but if provided, should be valid)
    if (phoneNumber.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ""))) {
        errors.phone_number = "Invalid phone number format";
      }
    }

    return Object.keys(errors).length === 0;
  }

  // Handle form submission
  async function handleSubmit() {
    if (!validateForm()) {
      return;
    }

    loading = true;

    try {
      // Set phone number properly (empty array if not provided)
      formData.phone_number = phoneNumber.trim() ? [phoneNumber.trim()] : [];

      // Register user
      const user = await registerUser(formData);

      // Update user state
      await fetchUserProfile();

      toast.success("Registration successful! Welcome to BitcoinUSTbills.");

      // Redirect to dashboard
      goto("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      loading = false;
    }
  }

  // Country options (simplified list)
  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Germany",
    "France",
    "Japan",
    "Australia",
    "Netherlands",
    "Switzerland",
    "Singapore",
    "Other",
  ];
</script>

<svelte:head>
  <title>Register - BitcoinUSTbills</title>
  <meta
    name="description"
    content="Complete your registration to start investing in US Treasury Bills"
  />
</svelte:head>

{#if checking}
  <div class="min-h-screen flex items-center justify-center bg-slate-50">
    <div class="flex flex-col items-center space-y-4">
      <LoadingSpinner />
      <p class="text-slate-600">Checking registration status...</p>
    </div>
  </div>
{:else}
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12"
  >
    <div class="container mx-auto px-6 max-w-2xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <div
          class="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4"
        >
          <span class="text-white font-bold text-2xl">B</span>
        </div>
        <h1 class="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
          Complete Your Registration
        </h1>
        <p class="text-lg text-slate-600 leading-relaxed">
          Welcome to BitcoinUSTbills! Please provide your information to start
          investing in US Treasury Bills.
        </p>
      </div>

      <!-- Registration Form -->
      <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <form
          onsubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          class="space-y-6"
        >
          <!-- Email Field -->
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-slate-800 mb-2"
            >
              Email Address <span class="text-red-500">*</span>
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              bind:value={formData.email}
              placeholder="Enter your email address"
              disabled={loading}
              required
            />
            {#if errors.email}
              <p class="mt-1 text-sm text-red-600">{errors.email}</p>
            {/if}
          </div>

          <!-- Country Field -->
          <div>
            <label
              for="country"
              class="block text-sm font-medium text-slate-800 mb-2"
            >
              Country <span class="text-red-500">*</span>
            </label>
            <select
              id="country"
              bind:value={formData.country}
              disabled={loading}
              required
              class="w-full px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              <option value="">Select your country</option>
              {#each countries as country}
                <option value={country}>{country}</option>
              {/each}
            </select>
            {#if errors.country}
              <p class="mt-1 text-sm text-red-600">{errors.country}</p>
            {/if}
          </div>

          <!-- Phone Number Field (Optional) -->
          <div>
            <label
              for="phone"
              class="block text-sm font-medium text-primary mb-2"
            >
              Phone Number (Optional)
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              bind:value={phoneNumber}
              placeholder="Enter your phone number"
              disabled={loading}
            />
            {#if errors.phone_number}
              <p class="mt-1 text-sm text-red-600">{errors.phone_number}</p>
            {/if}
            <p class="mt-1 text-xs text-muted">
              Including your phone number helps us provide better support and
              account security.
            </p>
          </div>

          <!-- Terms and Information -->
          <div class="bg-background-section p-4 rounded-lg border border-light">
            <h3 class="font-medium text-primary mb-2">What happens next?</h3>
            <ul class="text-sm text-secondary space-y-1">
              <li>• Complete KYC verification to start trading</li>
              <li>• Browse available US Treasury Bills</li>
              <li>• Fund your wallet with ckBTC</li>
              <li>• Start earning yield on your investments</li>
            </ul>
          </div>

          <!-- Submit Button -->
          <div class="pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth={true}
              {loading}
              disabled={loading}
            >
              {#if loading}
                Creating Account...
              {:else}
                Complete Registration
              {/if}
            </Button>
          </div>
        </form>

        <!-- Footer Note -->
        <div class="mt-6 pt-6 border-t border-light text-center">
          <p class="text-sm text-muted">
            By registering, you agree to our terms of service and privacy
            policy.
            <br />
            Your information is securely stored and protected.
          </p>
        </div>
      </div>

      <!-- Help Section -->
      <div class="mt-8 text-center">
        <p class="text-secondary text-sm">
          Need help? Contact our support team for assistance.
        </p>
      </div>
    </div>
  </div>
{/if}
