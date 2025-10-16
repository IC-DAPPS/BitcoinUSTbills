#!/bin/bash

# Script to transfer ckBTC from the default identity to a specified recipient.

# Set the recipient's Principal ID
RECIPIENT_PRINCIPAL="ov7go-lg6jn-idsqg-zr53z-bhz6d-vaydr-5zsp4-7et5m-kw4z2-m22mk-aae"

# Check if amount is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <amount_in_ckbtc>"
    echo "Example: $0 0.5"
    exit 1
fi

AMOUNT_CKBTC=$1
# ckBTC has 8 decimal places
AMOUNT_SATOSHIS=$(echo "$AMOUNT_CKBTC * 100000000" | bc | cut -d. -f1)

# Get the Principal ID of the default identity (sender)
SENDER_PRINCIPAL=$(dfx identity get-principal)

echo "Attempting to transfer $AMOUNT_CKBTC ckBTC..."
echo "From: $SENDER_PRINCIPAL (default)"
echo "To:   $RECIPIENT_PRINCIPAL"
echo "Amount in Satoshis: $AMOUNT_SATOSHIS"
echo "-------------------------------------------------"

# Execute the icrc1_transfer call
dfx canister call ckbtc_ledger icrc1_transfer "(record {
  to = record {
    owner = principal \"$RECIPIENT_PRINCIPAL\";
    subaccount = null;
  };
  amount = $AMOUNT_SATOSHIS:nat;
  fee = null;
  memo = null;
  created_at_time = null;
  from_subaccount = null;
})"

echo "-------------------------------------------------"
echo "Transfer command executed."
echo "You can check the balances with the 'check-ousg-balances.sh' script (it also checks ckBTC)."



