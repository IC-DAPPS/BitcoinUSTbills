#!/bin/bash

# Script to generate Rust bindings from DID files using didc
# Usage: ./scripts/generate-bindings.sh

set -e  # Exit on any error

echo "Generating Rust bindings from DID files..."

# Check if didc is installed
if ! command -v didc &> /dev/null; then
    echo "Error: didc is not installed or not in PATH"
    echo "Please install didc first:"
    echo "  cargo install didc"
    exit 1
fi

# Generate bindings for evm_rpc
echo "Generating bindings for evm_rpc..."
didc bind --target rs src/declarations/evm_rpc/evm_rpc.did > src/backend/src/evm_rpc.rs

# Generate bindings for exchange_rate_canister
echo "Generating bindings for exchange_rate_canister..."
didc bind --target rs src/declarations/exchange_rate_canister/exchange_rate_canister.did > src/backend/src/exchange_rate_canister.rs

# Generate bindings for OUSG ledger
echo "Generating bindings for OUSG ledger..."
didc bind --target rs "src/declarations/OUSG /ledger.did" > src/backend/src/ousg_ledger.rs

echo "✅ Successfully generated Rust bindings!"
echo "Generated files:"
echo "  - src/backend/src/evm_rpc.rs"
echo "  - src/backend/src/exchange_rate_canister.rs"
echo "  - src/backend/src/ousg_ledger.rs"
