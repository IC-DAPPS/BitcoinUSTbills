#!/bin/bash
set -e

E2E_FLAG=""
CLEAN_FLAG=""
SKIP_DFX_BOOTSTRAP_FLAG=""
SKIP_CHECKS_FLAG=""

for arg in "$@"; do
    case $arg in
        --e2e)
            E2E_FLAG="true"
            ;;
        --clean)
            CLEAN_FLAG="true"
            ;;
        --skip-dfx-bootstrap)
            SKIP_DFX_BOOTSTRAP_FLAG="true"
            ;;
        --skip-checks)
            SKIP_CHECKS_FLAG="true"
            ;;
    esac
done

if [ "$CLEAN_FLAG" = "true" ]; then
    ./scripts/clean.sh
fi

# Generate the .env files upfront
./scripts/generate-env.sh

# Format, lint, typecheck, build
if [ "$SKIP_CHECKS_FLAG" != "true" ]; then
    ./scripts/check.sh
fi

if [ "$SKIP_DFX_BOOTSTRAP_FLAG" != "true" ]; then
    echo "Starting DFX bootstrap"

    ./scripts/setup-dfx-identity.sh

    rm -rf .dfx
    dfx killall || true
    dfx start --clean --background > dfx.log 2>&1

    ./scripts/deploy-local.sh
fi

# Run Playwright E2E tests if E2E flag is set
if [ "$E2E_FLAG" = "true" ]; then
    echo "Running Playwright E2E tests..."
    ./scripts/run-test-e2e.sh
fi

echo "Validation finished correctly!"

