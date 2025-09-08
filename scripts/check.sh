#!/bin/bash
set -e

echo "🔍 Running prerelease validation checks..."

echo "📦 Installing dependencies..."
npm ci

# echo "🏗️  Building all workspace packages..."
# npm run build

# echo "🔍 Running lint, format, and typecheck..."
# npm run check

# echo "🔗 Checking dependency consistency and usage..."
# npm run deps:check || echo "No deps:check script found, skipping..."

echo "Rust lint and format..."
if [ -f "Cargo.toml" ]; then
    cargo fmt
    # Fix clippy warnings automatically
    cargo clippy --fix --lib -p backend --allow-dirty --allow-staged
    echo "Clippy fixes applied..."
else
    echo "No Rust project found, skipping Rust checks..."
fi

echo "Validation checks complete!"

