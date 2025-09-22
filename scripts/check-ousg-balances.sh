#!/bin/bash

# Script to check OUSG and ckBTC balances
# Similar to check-balances.sh but for BitcoinUSTBills

export DEFAULT_ACCOUNT=$(dfx identity get-principal --identity default)
export BACKEND_CANISTER_ID=$(dfx canister id backend)

echo "=== BitcoinUSTBills Balance Check ==="
echo "Default Account: $DEFAULT_ACCOUNT"
echo "Backend Canister: $BACKEND_CANISTER_ID"
echo

# Check ckBTC balance
echo "=== ckBTC BALANCE ==="
echo "ckBTC Balance of default identity:"
dfx canister call ckbtc_ledger icrc1_balance_of "(record {owner= principal \"$DEFAULT_ACCOUNT\"})" --identity default

echo

# Check OUSG balance
echo "=== OUSG BALANCE ==="
echo "OUSG Balance of default identity:"
dfx canister call ousg_ledger icrc1_balance_of "(record {owner= principal \"$DEFAULT_ACCOUNT\"})" --identity default

echo

# Check backend canister balances
echo "=== BACKEND CANISTER BALANCES ==="
echo "ckBTC Balance of backend canister:"
dfx canister call ckbtc_ledger icrc1_balance_of "(record {owner= principal \"$BACKEND_CANISTER_ID\"})" --identity default

echo "OUSG Balance of backend canister:"
dfx canister call ousg_ledger icrc1_balance_of "(record {owner= principal \"$BACKEND_CANISTER_ID\"})" --identity default

echo

# Get current BTC price
echo "=== CURRENT BTC PRICE ==="
dfx canister call backend get_current_btc_price --identity default

echo

# Get user deposit history
echo "=== USER DEPOSIT HISTORY ==="
dfx canister call backend get_user_deposits --identity default

echo

# Get deposit statistics
echo "=== DEPOSIT STATISTICS ==="
dfx canister call backend get_deposit_stats --identity default

echo

# Calculate USD value of ckBTC holdings
echo "=== USD VALUE CALCULATION ==="
echo "To calculate USD value of your ckBTC holdings:"
echo "1. Get your ckBTC balance from above"
echo "2. Get current BTC price from above"
echo "3. Multiply: (ckBTC_balance / 100000000) * btc_price_usd"
echo "4. If USD value >= $5000, you can mint OUSG tokens"
echo

echo "=== CHECK COMPLETED ==="
