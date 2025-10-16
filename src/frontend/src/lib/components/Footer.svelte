<footer
  class="bg-gray-900 text-gray-300 border-t border-gray-800 footer-smooth"
>
  <div class="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
    <!-- Main Footer Links -->
    <div
      class="footer-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8"
    >
      <!-- Product Links -->
      <div>
        <h3
          class="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 pb-2 border-b border-gray-700"
        >
          Product
        </h3>
        <ul class="space-y-2">
          <li>
            <a
              href="/dashboard"
              class="text-gray-400 hover:text-orange-500 transition-colors text-sm sm:text-base"
            >
              Dashboard
            </a>
          </li>
          <li>
            <a
              href="/ousg"
              class="text-gray-400 hover:text-orange-500 transition-colors text-sm sm:text-base"
            >
              BBILL Tokens
            </a>
          </li>
          <li>
            <a
              href="/wallet"
              class="text-gray-400 hover:text-orange-500 transition-colors text-sm sm:text-base"
            >
              Wallet
            </a>
          </li>
          <li>
            <a
              href="/kyc"
              class="text-gray-400 hover:text-orange-500 transition-colors text-sm sm:text-base"
            >
              KYC Verification
            </a>
          </li>
        </ul>
      </div>

      <!-- Resources -->
      <div>
        <h3
          class="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 pb-2 border-b border-gray-700"
        >
          Resources
        </h3>
        <ul class="space-y-2">
          <li>
            <a
              href="/docs"
              class="text-gray-400 hover:text-orange-500 transition-colors text-sm sm:text-base"
            >
              Documentation
            </a>
          </li>
          <li>
            <a
              href="/security"
              class="text-gray-400 hover:text-orange-500 transition-colors text-sm sm:text-base"
            >
              Security
            </a>
          </li>
          <li>
            <a
              href="/compliance"
              class="text-gray-400 hover:text-orange-500 transition-colors text-sm sm:text-base"
            >
              Compliance
            </a>
          </li>
          <li>
            <a
              href="/help"
              class="text-gray-400 hover:text-orange-500 transition-colors text-sm sm:text-base"
            >
              Help Center
            </a>
          </li>
        </ul>
      </div>

      <!-- Legal & Support -->
      <div>
        <h3
          class="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 pb-2 border-b border-gray-700"
        >
          Legal & Support
        </h3>
        <ul class="space-y-2">
          <li>
            <a
              href="/privacy"
              class="text-gray-400 hover:text-orange-500 transition-colors text-sm sm:text-base"
            >
              Privacy Policy
            </a>
          </li>
          <li>
            <a
              href="/terms"
              class="text-gray-400 hover:text-orange-500 transition-colors text-sm sm:text-base"
            >
              Terms of Service
            </a>
          </li>
          <li>
            <a
              href="/disclaimer"
              class="text-gray-400 hover:text-orange-500 transition-colors text-sm sm:text-base"
            >
              Disclaimer
            </a>
          </li>
          <li>
            <a
              href="/risk-disclosure"
              class="text-gray-400 hover:text-orange-500 transition-colors text-sm sm:text-base"
            >
              Risk Disclosure
            </a>
          </li>
          <li>
            <a
              href="/contact"
              class="text-gray-400 hover:text-orange-500 transition-colors text-sm sm:text-base"
            >
              Contact Us
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Footer Bottom Section -->
    <div class="border-t border-gray-800 pt-6">
      <div
        class="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-6 text-center text-xs sm:text-sm"
      >
        <span class="text-gray-400">
          © 2024 BitcoinTBill. All rights reserved.
        </span>
        <span class="text-gray-400 hidden sm:inline">
          Securities offered through licensed broker-dealers.
        </span>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span class="text-gray-400">SEC Compliant</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span class="text-gray-400">Blockchain Verified</span>
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
