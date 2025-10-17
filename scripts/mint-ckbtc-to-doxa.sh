#!/bin/bash

# Script to mint ckBTC to doxa identity for testing
# Usage: ./mint-ckbtc-to-doxa.sh <amount_in_ckbtc>

Amount=$1

if [ -z "$Amount" ]; then
    echo "Usage: $0 <amount_in_ckbtc>"
    echo "Example: $0 1.0 (for 1 ckBTC)"
    exit 1
fi

# Get doxa principal
DOXA_PRINCIPAL=$(dfx identity get-principal --identity doxa)
TOKENS=$(echo "$Amount * 100000000" | bc | cut -d. -f1)

echo "=================================================="
echo "🪙 Minting ckBTC to Doxa Identity"
echo "=================================================="
echo "Doxa Principal: $DOXA_PRINCIPAL"
echo "Amount: $Amount ckBTC ($TOKENS satoshis)"
echo ""

# Check current balance
echo "Current ckBTC Balance:"
dfx canister call ckbtc_ledger icrc1_balance_of "(record {
    owner = principal \"$DOXA_PRINCIPAL\";
    subaccount = null
})"
echo ""

# Mint ckBTC to doxa identity
echo "Minting ckBTC..."
dfx canister call ckbtc_ledger icrc1_transfer "(record {
    to = record {
        owner = principal \"$DOXA_PRINCIPAL\";
        subaccount = null;
    };
    amount = $TOKENS:nat;
    fee = null;
    memo = null;
    from_subaccount = null;
    created_at_time = null;
})" --identity minter

echo ""
echo "✅ Minted $Amount ckBTC to doxa identity"
echo ""

# Check new balance
echo "New ckBTC Balance:"
dfx canister call ckbtc_ledger icrc1_balance_of "(record {
    owner = principal \"$DOXA_PRINCIPAL\";
    subaccount = null
})"
echo ""
echo "=================================================="
echo "✅ Minting Complete!"
echo "=================================================="

