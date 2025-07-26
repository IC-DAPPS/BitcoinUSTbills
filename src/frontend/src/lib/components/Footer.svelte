<footer class="bg-blue-600 text-white border-t-2 border-blue-400 mt-16">
  <div class="container-wide mx-auto px-6 py-12">
    <!-- Footer Brand Section -->
    <div class="text-center mb-10 pb-8 border-b border-blue-500/30">
      <div class="flex items-center justify-center space-x-3 mb-4">
        <div
          class="w-10 h-10 bg-white rounded-lg flex items-center justify-center"
        >
          <span class="text-blue-600 font-bold text-lg">B</span>
        </div>
        <div>
          <h2 class="text-xl font-bold text-white">BitcoinUSTbills</h2>
          <p class="text-blue-100 text-sm">
            Democratizing Treasury Investments
          </p>
        </div>
      </div>
      <p class="text-blue-100 max-w-2xl mx-auto">
        Your trusted platform for tokenized US Treasury Bills. Secure,
        transparent, and accessible treasury investments powered by blockchain
        technology.
      </p>
    </div>

    <!-- Main Footer Links -->
    <div class="footer-grid grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
      <!-- Product Links -->
      <div>
        <h3
          class="text-lg font-bold text-white mb-4 pb-2 border-b border-blue-500/50"
        >
          Product
        </h3>
        <ul class="space-y-2">
          <li>
            <a
              href="/marketplace"
              class="text-blue-100 hover:text-white transition-colors"
              >Marketplace</a
            >
          </li>
          <li>
            <a
              href="/dashboard"
              class="text-blue-100 hover:text-white transition-colors"
              >Dashboard</a
            >
          </li>
          <li>
            <a
              href="/portfolio"
              class="text-blue-100 hover:text-white transition-colors"
              >Portfolio</a
            >
          </li>
          <li>
            <a
              href="/wallet"
              class="text-blue-100 hover:text-white transition-colors">Wallet</a
            >
          </li>
          <li>
            <a
              href="/how-it-works"
              class="text-blue-100 hover:text-white transition-colors"
              >How It Works</a
            >
          </li>
        </ul>
      </div>

      <!-- Resources -->
      <div>
        <h3
          class="text-lg font-bold text-white mb-4 pb-2 border-b border-blue-500/50"
        >
          Resources
        </h3>
        <ul class="space-y-2">
          <li>
            <a href="#" class="text-blue-100 hover:text-white transition-colors"
              >Documentation</a
            >
          </li>
          <li>
            <a href="#" class="text-blue-100 hover:text-white transition-colors"
              >API Reference</a
            >
          </li>
          <li>
            <a href="#" class="text-blue-100 hover:text-white transition-colors"
              >Security</a
            >
          </li>
          <li>
            <a href="#" class="text-blue-100 hover:text-white transition-colors"
              >Compliance</a
            >
          </li>
          <li>
            <a href="#" class="text-blue-100 hover:text-white transition-colors"
              >Help Center</a
            >
          </li>
        </ul>
      </div>

      <!-- Legal & Support -->
      <div>
        <h3
          class="text-lg font-bold text-white mb-4 pb-2 border-b border-blue-500/50"
        >
          Legal & Support
        </h3>
        <ul class="space-y-2">
          <li>
            <a href="#" class="text-blue-100 hover:text-white transition-colors"
              >Privacy Policy</a
            >
          </li>
          <li>
            <a href="#" class="text-blue-100 hover:text-white transition-colors"
              >Terms of Service</a
            >
          </li>
          <li>
            <a href="#" class="text-blue-100 hover:text-white transition-colors"
              >Disclaimer</a
            >
          </li>
          <li>
            <a href="#" class="text-blue-100 hover:text-white transition-colors"
              >Risk Disclosure</a
            >
          </li>
          <li>
            <a href="#" class="text-blue-100 hover:text-white transition-colors"
              >Contact Us</a
            >
          </li>
        </ul>
      </div>
    </div>

    <!-- Footer Bottom Section -->
    <div class="border-t border-blue-500/30 pt-6">
      <div
        class="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0"
      >
        <!-- Copyright -->
        <div class="text-center lg:text-left">
          <p class="text-blue-100 text-sm mb-1">
            © 2024 BitcoinUSTbills. All rights reserved.
          </p>
          <p class="text-blue-200 text-xs">
            Securities offered through licensed broker-dealers.
          </p>
        </div>

        <!-- Compliance Badges -->
        <div class="flex items-center space-x-6">
          <div class="flex items-center">
            <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span class="text-blue-100 text-sm">SEC Compliant</span>
          </div>
          <div class="flex items-center">
            <div class="w-2 h-2 bg-white rounded-full mr-2"></div>
            <span class="text-blue-100 text-sm">Blockchain Verified</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</footer>

<style>
  /* FORCE HORIZONTAL LAYOUT ON DESKTOP */
  @media (min-width: 1024px) {
    .footer-grid {
      display: grid !important;
      grid-template-columns: repeat(3, 1fr) !important;
      gap: 3rem !important;
    }
  }

  /* Tablet layout */
  @media (min-width: 768px) and (max-width: 1023px) {
    .footer-grid {
      display: grid !important;
      grid-template-columns: repeat(3, 1fr) !important;
      gap: 2rem !important;
    }
  }

  /* Mobile layout */
  @media (max-width: 767px) {
    .footer-grid {
      display: grid !important;
      grid-template-columns: 1fr !important;
      gap: 2rem !important;
    }
  }
</style>
