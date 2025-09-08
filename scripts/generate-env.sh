#!/bin/bash
set -e

# Generates root .env.development and per-app .env.development files.

ROOT_ENV_FILE=".env.development"

echo "Generating $ROOT_ENV_FILE at repository root..."
cat > "$ROOT_ENV_FILE" << 'EOF'
VITE_IDENTITY_PROVIDER=http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8080

VITE_HOSTNAME=localhost:8080
VITE_DFX_PROTOCOL=http
VITE_DFX_HOSTNAME=localhost
VITE_DFX_PORT=8080

VITE_BACKEND_CANISTER_ID=rrkah-fqaaa-aaaah-qcujq-cai
VITE_FILE_STORE_BUCKET_CANISTER_ID=ryjl3-tyaaa-aaaah-qcujq-cai
VITE_II_CANISTER_ID=rdmx6-jaaaa-aaaaa-aaadq-cai
VITE_CKBTC_LEDGER_CANISTER_ID=rrkah-fqaaa-aaaah-qcujq-cai
EOF
echo "✓ Wrote $ROOT_ENV_FILE"

echo "✓ Environment files generated"