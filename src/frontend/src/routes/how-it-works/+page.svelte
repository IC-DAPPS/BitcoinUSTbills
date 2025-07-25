<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import { goto } from "$app/navigation";

  function handleGetStarted() {
    goto("/");
  }
</script>

<svelte:head>
  <title>How It Works - BitcoinUSTbills</title>
  <meta
    name="description"
    content="Learn how to invest in tokenized US Treasury Bills through blockchain technology. Simple, secure, and accessible for everyone."
  />
</svelte:head>

<!-- Hero Section -->
<section
  class="py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-blue-50"
>
  <div class="container mx-auto px-6">
    <div class="text-center max-w-4xl mx-auto mb-16">
      <h1 class="text-5xl lg:text-6xl font-bold text-primary mb-6">
        How <span class="text-blue">BitcoinUSTbills</span><br />
        Works
      </h1>
      <p class="text-xl text-secondary leading-relaxed">
        Discover how we're democratizing access to US Treasury Bills through
        innovative blockchain tokenization. It's simpler than you think.
      </p>
    </div>
  </div>
</section>

<!-- Process Steps -->
<section class="py-20 bg-white">
  <div class="container mx-auto px-6">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-bold text-primary mb-6">
        Start Investing in <span class="text-blue">4 Simple Steps</span>
      </h2>
      <p class="text-xl text-secondary max-w-3xl mx-auto">
        From registration to earning yields, here's everything you need to know
        about investing in tokenized Treasury Bills.
      </p>
    </div>

    <!-- Steps Grid -->
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
      <!-- Step 1 -->
      <div class="text-center">
        <div
          class="w-16 h-16 bg-blue rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold"
        >
          1
        </div>
        <h3 class="text-xl font-semibold text-primary mb-4">
          Sign Up & Verify
        </h3>
        <p class="text-secondary leading-relaxed">
          Create your account with our secure onboarding process. Complete KYC
          verification to ensure compliance and security.
        </p>
      </div>

      <!-- Step 2 -->
      <div class="text-center">
        <div
          class="w-16 h-16 bg-blue rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold"
        >
          2
        </div>
        <h3 class="text-xl font-semibold text-primary mb-4">Deposit Funds</h3>
        <p class="text-secondary leading-relaxed">
          Add funds to your wallet using secure payment methods. Start with as
          little as $10 to begin investing.
        </p>
      </div>

      <!-- Step 3 -->
      <div class="text-center">
        <div
          class="w-16 h-16 bg-blue rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold"
        >
          3
        </div>
        <h3 class="text-xl font-semibold text-primary mb-4">
          Choose Treasury Bills
        </h3>
        <p class="text-secondary leading-relaxed">
          Browse available tokenized Treasury Bills with different yields and
          maturity dates. Pick what fits your strategy.
        </p>
      </div>

      <!-- Step 4 -->
      <div class="text-center">
        <div
          class="w-16 h-16 bg-blue rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold"
        >
          4
        </div>
        <h3 class="text-xl font-semibold text-primary mb-4">Earn & Trade</h3>
        <p class="text-secondary leading-relaxed">
          Receive regular yield payments and trade your tokens anytime with 24/7
          liquidity.
        </p>
      </div>
    </div>
  </div>
</section>

<!-- Technology Section -->
<section class="py-20 bg-section">
  <div class="container mx-auto px-6">
    <div class="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
      <div>
        <h2 class="text-4xl font-bold text-primary mb-6">
          Powered by <span class="text-blue">Blockchain Technology</span>
        </h2>
        <p class="text-lg text-secondary mb-8 leading-relaxed">
          We use Internet Computer blockchain to tokenize US Treasury Bills,
          making them accessible to everyone through fractional ownership.
        </p>

        <div class="space-y-6">
          <div class="flex items-start space-x-4">
            <div
              class="w-8 h-8 bg-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1"
            >
              <svg
                class="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-primary mb-2">
                Transparent & Secure
              </h3>
              <p class="text-secondary">
                All transactions are recorded on the blockchain for complete
                transparency and security.
              </p>
            </div>
          </div>

          <div class="flex items-start space-x-4">
            <div
              class="w-8 h-8 bg-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1"
            >
              <svg
                class="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-primary mb-2">
                24/7 Liquidity
              </h3>
              <p class="text-secondary">
                Trade your tokens anytime with instant settlement and no waiting
                periods.
              </p>
            </div>
          </div>

          <div class="flex items-start space-x-4">
            <div
              class="w-8 h-8 bg-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1"
            >
              <svg
                class="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-primary mb-2">
                Fractional Ownership
              </h3>
              <p class="text-secondary">
                Own a piece of high-value Treasury Bills starting from just $10.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white p-8 rounded-2xl shadow-lg">
        <h3 class="text-2xl font-bold text-primary mb-6">Key Benefits</h3>
        <div class="space-y-4">
          <div class="flex justify-between py-3 border-b border-gray-100">
            <span class="text-secondary">Minimum Investment</span>
            <span class="font-semibold text-primary">$10</span>
          </div>
          <div class="flex justify-between py-3 border-b border-gray-100">
            <span class="text-secondary">Average Yield</span>
            <span class="font-semibold text-blue">5.2% APY</span>
          </div>
          <div class="flex justify-between py-3 border-b border-gray-100">
            <span class="text-secondary">Trading Hours</span>
            <span class="font-semibold text-primary">24/7</span>
          </div>
          <div class="flex justify-between py-3 border-b border-gray-100">
            <span class="text-secondary">Settlement Time</span>
            <span class="font-semibold text-primary">Instant</span>
          </div>
          <div class="flex justify-between py-3">
            <span class="text-secondary">Security</span>
            <span class="font-semibold text-blue">SEC Compliant</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FAQ Section -->
<section class="py-20 bg-white">
  <div class="container mx-auto px-6">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-bold text-primary mb-6">
        Frequently Asked <span class="text-blue">Questions</span>
      </h2>
      <p class="text-xl text-secondary max-w-3xl mx-auto">
        Get answers to the most common questions about investing in tokenized
        Treasury Bills.
      </p>
    </div>

    <div class="max-w-4xl mx-auto space-y-6">
      <details class="bg-gray-50 rounded-lg p-6">
        <summary class="text-lg font-semibold text-primary cursor-pointer">
          What are tokenized Treasury Bills?
        </summary>
        <div class="mt-4 text-secondary leading-relaxed">
          Tokenized Treasury Bills are digital representations of US Treasury
          Bills on the blockchain. Each token represents fractional ownership of
          the underlying Treasury Bills, allowing for smaller investment amounts
          and enhanced liquidity.
        </div>
      </details>

      <details class="bg-gray-50 rounded-lg p-6">
        <summary class="text-lg font-semibold text-primary cursor-pointer">
          How are my investments secured?
        </summary>
        <div class="mt-4 text-secondary leading-relaxed">
          Your investments are backed by actual US Treasury Bills held in
          custody. Our platform is SEC compliant and uses blockchain technology
          for transparent and secure transactions.
        </div>
      </details>

      <details class="bg-gray-50 rounded-lg p-6">
        <summary class="text-lg font-semibold text-primary cursor-pointer">
          When do I receive yield payments?
        </summary>
        <div class="mt-4 text-secondary leading-relaxed">
          Yield payments are distributed monthly based on the Treasury Bills'
          interest rates. Payments are automatically credited to your wallet and
          can be reinvested or withdrawn.
        </div>
      </details>

      <details class="bg-gray-50 rounded-lg p-6">
        <summary class="text-lg font-semibold text-primary cursor-pointer">
          Can I sell my tokens before maturity?
        </summary>
        <div class="mt-4 text-secondary leading-relaxed">
          Yes! Unlike traditional Treasury Bills, our tokenized version offers
          24/7 liquidity. You can buy and sell tokens anytime through our
          platform.
        </div>
      </details>
    </div>
  </div>
</section>

<!-- CTA Section -->
<section class="py-20 bg-blue text-white">
  <div class="container mx-auto px-6 text-center">
    <h2 class="text-4xl font-bold mb-6">
      Ready to Start Your Investment Journey?
    </h2>
    <p class="text-xl mb-8 opacity-90">
      Join thousands of investors already building wealth with Treasury Bills
    </p>
    <Button
      variant="secondary"
      size="lg"
      on:click={handleGetStarted}
      class="bg-white text-blue hover:bg-gray-100"
    >
      Get Started Today →
    </Button>
  </div>
</section>
