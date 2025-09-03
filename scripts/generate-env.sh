#!/bin/bash
set -e

# This script first leverages `dfx deploy` to auto-generate a .env file
# with the latest canister IDs, and then appends additional frontend-specific
# environment variables to it.

echo "Ensuring dfx can generate canister IDs..."
# A simple deploy should be enough to generate the .env file
# based on the "output_env_file" setting in dfx.json
dfx deploy

echo "Appending additional frontend variables to the .env file..."

# Append extra variables needed by the Vite frontend
# Using a temporary file to avoid issues with `cat << EOF >>` syntax
cat << EOF >> .env

# Local DFX network host for Vite
VITE_DFX_HOST=http://localhost:8080
EOF

echo "✓ .env file is ready for the frontend."
echo "Script finished successfully!"
