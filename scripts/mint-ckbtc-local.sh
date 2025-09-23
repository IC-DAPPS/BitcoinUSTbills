#!/bin/bash

# Script to mint ckBTC locally for testing
# Similar to minting ckUSDC in DoxaV3

Amount=$1

if [ -z "$Amount" ]; then
    echo "Usage: $0 <amount_in_ckbtc>"
    echo "Example: $0 0.1 (for 0.1 ckBTC)"
    exit 1
fi

export DEFAULT_ACCOUNT=$(dfx identity get-principal --identity default)
TOKENS=$((Amount * 10 ** 8))

echo "Minting $Amount ckBTC to default identity locally"
echo "Default Account: $DEFAULT_ACCOUNT"

# Mint ckBTC to default identity
dfx canister call ckbtc_ledger icrc1_transfer "(record{ to=record {owner = principal \"$DEFAULT_ACCOUNT\"} ; amount=$TOKENS;})" --identity minter

echo "Minted $Amount ckBTC to default identity."
echo

# Check balance
echo "ckBTC Balance of default identity:"
dfx canister call ckbtc_ledger icrc1_balance_of "(record {owner= principal \"$DEFAULT_ACCOUNT\"})" --identity default
