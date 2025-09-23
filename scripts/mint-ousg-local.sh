#!/bin/bash

# Script to mint OUSG tokens using ckBTC deposits
# Similar to mint-dusd-local.sh but for BitcoinUSTBills

# IMPORTANT: Testing vs Production Mode
# ======================================
# Testing Mode (Local Development):
#   export DFX_NETWORK=local
#   dfx deploy backend
#   -> No KYC required, up to 1M tokens
#
# Production Mode (Mainnet):
#   unset DFX_NETWORK
#   dfx deploy backend --network ic
#   -> KYC required, user's max limit
#
# The backend detects mode using environment variable DFX_NETWORK
# If set to "local" = testing mode (skip KYC)
# If not set or other value = production mode (require KYC)

Amount=$1

if [ -z "$Amount" ]; then
    echo "Usage: $0 <amount_in_ckbtc>"
    echo "Example: $0 0.01 (for 0.01 ckBTC)"
    exit 1
fi

export DEFAULT_ACCOUNT=$(dfx identity get-principal --identity default)
export BACKEND_CANISTER_ID=$(dfx canister id backend)

# Convert amount to ckBTC units (8 decimals)
# Use awk for decimal arithmetic (more portable than bc)
TOKENS=$(echo "$Amount" | awk '{printf "%.0f", $1 * 100000000}')

# Check if user is registered, if not register first
echo "Checking if user is registered..."
is_registered=$(dfx canister call backend is_user_registered --identity default)

if [[ "$is_registered" == *"false"* ]]; then
    echo "User not registered. Registering user first..."
    
    # Register user with default data
    dfx canister call backend register_user "(record{
        email = \"test@example.com\";
        phone_number = opt \"+1234567890\";
        country = \"US\";
    })" --identity default
    
    echo "User registration completed."
else
    echo "User is already registered."
fi

# For testing purposes, we'll skip KYC verification
# In production, users would need to complete KYC first
echo "Note: For testing, skipping KYC verification."
echo "In production, users must complete KYC before making deposits."

echo "Minting $Amount ckBTC worth of OUSG tokens to default identity locally"
echo "Backend canister ID: $BACKEND_CANISTER_ID"

# First, mint ckBTC to default identity (if needed)
echo "Minting $Amount ckBTC to default identity"
dfx canister call ckbtc_ledger icrc1_transfer "(record{ to=record {owner = principal \"$DEFAULT_ACCOUNT\"} ; amount=$TOKENS;})" --identity minter

# Then transfer ckBTC to the backend canister
echo "Transferring $Amount ckBTC to Backend Canister Account"

# Store output to extract block index for notifying backend
output=$(dfx canister call ckbtc_ledger icrc1_transfer "(record{ to=record {owner = principal \"$BACKEND_CANISTER_ID\"} ; amount=$TOKENS;})" --identity default)

# Extract the number (block index) using awk for notifying backend
number=$(echo "$output" | awk -F'Ok = ' '{print $2}' | awk -F' :' '{print $1}')

if [ -z "$number" ]; then
    echo "Error: Failed to get block index from transfer"
    echo "Transfer output: $output"
    exit 1
fi

echo "Transfer successful. Block index: $number"

# Notify backend to process the deposit and mint OUSG
echo "Notifying Backend to process ckBTC deposit and mint OUSG"
dfx canister call backend notify_deposit "(record{ ckbtc_amount=$TOKENS; block_index=$number})" --identity default

echo "Processed $Amount ckBTC deposit and minted OUSG tokens for default identity."
echo

# Check balances
echo "=== BALANCE CHECK ==="
echo "ckBTC Balance of default identity:"
dfx canister call ckbtc_ledger icrc1_balance_of "(record {owner= principal \"$DEFAULT_ACCOUNT\"})" --identity default

echo "OUSG Balance of default identity:"
dfx canister call ousg_ledger icrc1_balance_of "(record {owner= principal \"$DEFAULT_ACCOUNT\"})" --identity default
