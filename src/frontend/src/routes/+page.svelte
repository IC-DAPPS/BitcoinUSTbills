<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import { authStore, login } from "$lib/auth";
  import { goto } from "$app/navigation";

  function handleStartInvesting() {
    if ($authStore.isLoggedIn) {
      goto("/dashboard");
    } else {
      login();
    }
  }

  function handleLearnMore() {
    goto("/how-it-works");
  }
</script>

<svelte:head>
  <title>BitcoinUSTbills - Democratize Treasury Investments</title>
  <meta
    name="description"
    content="Access fractional ownership of US Treasury Bills through blockchain tokenization. Earn steady yields with unprecedented liquidity and transparency."
  />
</svelte:head>

<!-- Hero Section -->
<section
  class="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20 lg:py-32"
>
  <div class="container mx-auto px-6">
    <!-- SEC Compliant Banner -->
    <div class="flex justify-center mb-12">
      <div
        class="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border border-light"
      >
        <div class="w-2 h-2 bg-blue rounded-full mr-3"></div>
        <span class="text-sm text-secondary font-medium"
          >SEC Compliant & Secure</span
        >
        <svg
          class="w-4 h-4 ml-2 text-blue"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          ></path>
        </svg>
      </div>
    </div>

    <!-- Main Heading -->
    <div class="text-center max-w-6xl mx-auto mb-12">
      <h1
        class="text-5xl lg:text-6xl font-bold text-primary mb-6 leading-tight"
      >
        Democratize <span class="text-blue">Treasury</span><br />
        <span class="text-blue">Investments</span>
      </h1>
      <p
        class="text-xl lg:text-2xl text-secondary mb-8 max-w-4xl mx-auto leading-relaxed"
      >
        Access fractional ownership of US Treasury Bills through blockchain
        tokenization.<br />
        Earn steady yields with unprecedented liquidity and transparency.
      </p>

      <!-- CTA Buttons -->
      <div
        class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
      >
        <Button
          variant="primary"
          size="lg"
          on:click={handleStartInvesting}
          class="shadow-lg"
        >
          Start Investing →
        </Button>
        <Button variant="secondary" size="lg" on:click={handleLearnMore}>
          Learn How It Works
        </Button>
      </div>
    </div>

    <!-- Feature Icons -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
      <div class="text-center">
        <div
          class="w-16 h-16 bg-blue rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
        >
          <svg
            class="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            ></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-primary mb-2">Steady Yields</h3>
      </div>

      <div class="text-center">
        <div
          class="w-16 h-16 bg-blue rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
        >
          <svg
            class="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-primary mb-2">Global Access</h3>
      </div>

      <div class="text-center">
        <div
          class="w-16 h-16 bg-blue rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
        >
          <svg
            class="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-primary mb-2">
          US Treasury Bills
        </h3>
      </div>

      <div class="text-center">
        <div
          class="w-16 h-16 bg-blue rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
        >
          <svg
            class="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            ></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-primary mb-2">Blockchain</h3>
      </div>
    </div>
  </div>
</section>

<!-- Value Proposition Section -->
<section class="py-20 bg-white">
  <div class="container-wide mx-auto px-6">
    <div class="text-center mb-16">
      <p class="text-blue font-medium mb-4">Built for Modern Investors</p>
      <h2
        class="text-4xl lg:text-5xl font-bold text-primary mb-6 leading-tight"
      >
        Everything you need to<br />
        invest in tokenized
        <span class="text-blue"
          >Treasury<br />
          Bills with confidence</span
        >
      </h2>
      <p class="text-xl text-secondary max-w-4xl mx-auto leading-relaxed">
        Democratizing access to US Treasury investments through innovative
        blockchain<br />
        technology. Join thousands of investors who are already building wealth with<br
        />
        BitcoinUSTbills.
      </p>
    </div>

    <!-- Feature Cards - Consistent Card Blocks -->
    <div class="grid grid-cols-3 gap-6">
      <!-- Instant Onboarding -->
      <div class="card p-6 text-center">
        <div
          class="w-12 h-12 bg-blue rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg
            class="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-primary mb-4">Instant Onboarding</h3>
        <p class="text-secondary mb-4 text-sm">
          Quick registration with streamlined KYC verification. Get started in
          minutes with our secure, user-friendly onboarding process designed for
          modern investors.
        </p>
        <a
          href="/how-it-works"
          class="text-blue font-semibold hover:text-primary"
        >
          Learn more →
        </a>
      </div>

      <!-- Fractional Ownership -->
      <div class="card p-6 text-center">
        <div
          class="w-12 h-12 bg-blue rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg
            class="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z"
            ></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-primary mb-4">
          Fractional Ownership
        </h3>
        <p class="text-secondary mb-4 text-sm">
          Invest with as little as $10 in US Treasury Bills. Break down
          traditional barriers and make institutional-grade investments
          accessible to everyone.
        </p>
        <a
          href="/how-it-works"
          class="text-blue font-semibold hover:text-primary"
        >
          Learn more →
        </a>
      </div>

      <!-- Real-Time Liquidity -->
      <div class="card p-6 text-center">
        <div
          class="w-12 h-12 bg-blue rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg
            class="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-primary mb-4">Real-Time Liquidity</h3>
        <p class="text-secondary mb-4 text-sm">
          Buy and sell tokens instantly with no waiting periods. Access your
          investments 24/7 with unprecedented liquidity in the Treasury market.
        </p>
        <a
          href="/how-it-works"
          class="text-blue font-semibold hover:text-primary"
        >
          Learn more →
        </a>
      </div>
    </div>
  </div>
</section>

<!-- Stats Section - Horizontal Blocks -->
<section class="py-16 bg-section">
  <div class="container mx-auto px-6">
    <div class="grid grid-cols-4 gap-6">
      <div class="card p-6 text-center">
        <div class="text-3xl font-bold text-primary mb-2">$10M+</div>
        <div class="text-sm text-secondary">Total Value Locked</div>
      </div>
      <div class="card p-6 text-center">
        <div class="text-3xl font-bold text-primary mb-2">5.2%</div>
        <div class="text-sm text-secondary">Average Yield</div>
      </div>
      <div class="card p-6 text-center">
        <div class="text-3xl font-bold text-primary mb-2">1,000+</div>
        <div class="text-sm text-secondary">Active Investors</div>
      </div>
      <div class="card p-6 text-center">
        <div class="text-3xl font-bold text-primary mb-2">24/7</div>
        <div class="text-sm text-secondary">Market Access</div>
      </div>
    </div>
  </div>
</section>

<!-- Call to Action -->
<section class="py-20 bg-gray-900 text-white">
  <div class="container mx-auto px-6 text-center">
    <h2 class="text-4xl font-bold mb-6">Ready to Start Investing?</h2>
    <p class="text-xl mb-8 text-gray-300">
      Join thousands of investors already earning steady yields with Treasury
      Bills
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <Button
        variant="primary"
        size="lg"
        on:click={handleStartInvesting}
        class="bg-primary-blue text-white hover:bg-blue-700"
      >
        Get Started Today
      </Button>
      <Button
        variant="outline"
        size="lg"
        on:click={handleLearnMore}
        class="border-gray-400 text-gray-300 hover:bg-gray-800 hover:text-white"
      >
        Learn More
      </Button>
    </div>
  </div>
</section>
