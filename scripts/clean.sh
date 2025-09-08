#!/bin/bash
set -e

echo "🧹 Cleaning gitignored files and directories..."

git clean -fdX

echo "🧹 Cleaning DFX state..."
dfx killall || true
rm -rf .dfx

echo "🧹 Cleaning build artifacts..."
rm -rf dist/
rm -rf build/
rm -rf target/

echo "✅ Clean complete!"

