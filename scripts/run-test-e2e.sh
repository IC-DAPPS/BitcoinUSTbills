#!/bin/bash

set -euo pipefail

echo "🚀 Running Bitcoin UST Bills End-to-End Tests"

# Check if DFX is running
if ! dfx ping > /dev/null 2>&1; then
    echo "❌ Error: DFX is not running. Please start DFX with 'dfx start' first."
    exit 1
fi

# Check if Internet Identity is running
if ! curl -s http://localhost:4943 > /dev/null 2>&1; then
    echo "❌ Error: Internet Identity is not running. Please start it with 'dfx start --clean' first."
    exit 1
fi

# Check if app is running
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "❌ Error: BitcoinUSTbills app is not running. Please start it with 'npm run dev' first."
    exit 1
fi

# Install Playwright browsers if not already installed
echo "📦 Installing Playwright browsers..."
npx playwright install chromium

# Run tests in order of dependencies
echo "🔐 Running authentication tests..."
npx playwright test --project=authentication

echo "📝 Running registration tests..."
npx playwright test --project=registration

echo "🆔 Running KYC verification tests..."
npx playwright test --project=kyc-verification

echo "💰 Running wallet operations tests..."
npx playwright test --project=wallet-operations

echo "🎯 Running complete user journey test..."
npx playwright test --project=complete-journey

echo "✅ All E2E tests completed successfully!"
echo "📊 Test results available in: test-results/"
echo "🌐 HTML report available in: playwright-report/"

