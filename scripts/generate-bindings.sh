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

echo "✅ Successfully generated Rust bindings!"
echo "Generated file: src/backend/src/evm_rpc.rs"
