<footer
  class="bg-blue-600 text-white border-t-2 border-blue-400 mt-16 footer-smooth"
  style="background-color: #2563eb !important; color: white !important;"
>
  <div class="container-wide mx-auto px-6 py-12">
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
              class="text-white hover:text-blue-200 transition-colors"
              style="color: white !important;">Marketplace</a
            >
          </li>
          <li>
            <a
              href="/dashboard"
              class="text-white hover:text-blue-200 transition-colors"
              style="color: white !important;">Dashboard</a
            >
          </li>
          <li>
            <a
              href="/portfolio"
              class="text-white hover:text-blue-200 transition-colors"
              style="color: white !important;">Portfolio</a
            >
          </li>
          <li>
            <a
              href="/wallet"
              class="text-white hover:text-blue-200 transition-colors"
              style="color: white !important;">Wallet</a
            >
          </li>
          <li>
            <a
              href="/how-it-works"
              class="text-white hover:text-blue-200 transition-colors"
              style="color: white !important;">How It Works</a
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
            <a
              href="/docs"
              class="text-white hover:text-blue-200 transition-colors"
              style="color: white !important;">Documentation</a
            >
          </li>
          <li>
            <a
              href="/api-docs"
              class="text-white hover:text-blue-200 transition-colors"
              style="color: white !important;">API Reference</a
            >
          </li>
          <li>
            <a
              href="/security"
              class="text-white hover:text-blue-200 transition-colors"
              style="color: white !important;">Security</a
            >
          </li>
          <li>
            <a
              href="/compliance"
              class="text-white hover:text-blue-200 transition-colors"
              style="color: white !important;">Compliance</a
            >
          </li>
          <li>
            <a
              href="/help"
              class="text-white hover:text-blue-200 transition-colors"
              style="color: white !important;">Help Center</a
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
            <a
              href="/privacy"
              class="text-white hover:text-blue-200 transition-colors"
              style="color: white !important;">Privacy Policy</a
            >
          </li>
          <li>
            <a
              href="/terms"
              class="text-white hover:text-blue-200 transition-colors"
              style="color: white !important;">Terms of Service</a
            >
          </li>
          <li>
            <a
              href="/disclaimer"
              class="text-white hover:text-blue-200 transition-colors"
              style="color: white !important;">Disclaimer</a
            >
          </li>
          <li>
            <a
              href="/risk-disclosure"
              class="text-white hover:text-blue-200 transition-colors"
              style="color: white !important;">Risk Disclosure</a
            >
          </li>
          <li>
            <a
              href="/contact"
              class="text-white hover:text-blue-200 transition-colors"
              style="color: white !important;">Contact Us</a
            >
          </li>
        </ul>
      </div>
    </div>

    <!-- Footer Bottom Section -->
    <div class="border-t border-blue-500/30 pt-6">
      <div
        class="flex flex-wrap justify-center items-center space-x-6 text-center text-sm"
      >
        <span class="text-white" style="color: white !important;"
          >© 2024 BitcoinUSTbills. All rights reserved.</span
        >
        <span class="text-white" style="color: white !important;"
          >Securities offered through licensed broker-dealers.</span
        >
        <div class="flex items-center">
          <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
          <span class="text-white" style="color: white !important;"
            >SEC Compliant</span
          >
        </div>
        <div class="flex items-center">
          <div class="w-2 h-2 bg-white rounded-full mr-2"></div>
          <span class="text-white" style="color: white !important;"
            >Blockchain Verified</span
          >
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
