#!/bin/bash

# Script to test OUSG minting with ckBTC deposits
# Similar to local-mint.sh but for BitcoinUSTBills

export DEFAULT_ACCOUNT=$(dfx identity get-principal --identity default)
export BACKEND_CANISTER_ID=$(dfx canister id backend)

echo "=== BitcoinUSTBills OUSG Minting Test ==="
echo "Default Account: $DEFAULT_ACCOUNT"
echo "Backend Canister: $BACKEND_CANISTER_ID"
echo

# Check initial balances
echo "=== INITIAL BALANCES ==="
echo "ckBTC Balance of default identity:"
dfx canister call ckbtc_ledger icrc1_balance_of "(record {owner= principal \"$DEFAULT_ACCOUNT\"})" --identity default

echo "OUSG Balance of default identity:"
dfx canister call ousg_ledger icrc1_balance_of "(record {owner= principal \"$DEFAULT_ACCOUNT\"})" --identity default

echo

# Test 1: Small deposit (0.001 ckBTC = ~$50-100 depending on BTC price)
echo "=== TEST 1: Small Deposit (0.001 ckBTC) ==="
AMOUNT_1=100000  # 0.001 ckBTC in units (8 decimals)

# First mint ckBTC to default identity
echo "Minting $AMOUNT_1 ckBTC to default identity"
dfx canister call ckbtc_ledger icrc1_transfer "(record{ to=record {owner = principal \"$DEFAULT_ACCOUNT\"} ; amount=$AMOUNT_1;})" --identity minter

# Then transfer to backend
output1=$(dfx canister call ckbtc_ledger icrc1_transfer "(record{ to=record {owner = principal \"$BACKEND_CANISTER_ID\"} ; amount=$AMOUNT_1;})" --identity default)
number1=$(echo "$output1" | awk -F'Ok = ' '{print $2}' | awk -F' :' '{print $1}')

if [ ! -z "$number1" ]; then
    echo "Transfer successful. Block index: $number1"
    echo "Notifying backend to process deposit..."
    dfx canister call backend notify_deposit "(record{ ckbtc_amount=$AMOUNT_1; block_index=$number1})" --identity default
else
    echo "Transfer failed: $output1"
fi

echo

# Test 2: Medium deposit (0.1 ckBTC = ~$5000-10000 depending on BTC price)
echo "=== TEST 2: Medium Deposit (0.1 ckBTC) ==="
AMOUNT_2=10000000  # 0.1 ckBTC in units (8 decimals)

# First mint ckBTC to default identity
echo "Minting $AMOUNT_2 ckBTC to default identity"
dfx canister call ckbtc_ledger icrc1_transfer "(record{ to=record {owner = principal \"$DEFAULT_ACCOUNT\"} ; amount=$AMOUNT_2;})" --identity minter

# Then transfer to backend
output2=$(dfx canister call ckbtc_ledger icrc1_transfer "(record{ to=record {owner = principal \"$BACKEND_CANISTER_ID\"} ; amount=$AMOUNT_2;})" --identity default)
number2=$(echo "$output2" | awk -F'Ok = ' '{print $2}' | awk -F' :' '{print $1}')

if [ ! -z "$number2" ]; then
    echo "Transfer successful. Block index: $number2"
    echo "Notifying backend to process deposit..."
    dfx canister call backend notify_deposit "(record{ ckbtc_amount=$AMOUNT_2; block_index=$number2})" --identity default
else
    echo "Transfer failed: $output2"
fi

echo

# Test 3: Large deposit (0.5 ckBTC = ~$25000-50000 depending on BTC price)
echo "=== TEST 3: Large Deposit (0.5 ckBTC) ==="
AMOUNT_3=50000000  # 0.5 ckBTC in units (8 decimals)

# First mint ckBTC to default identity
echo "Minting $AMOUNT_3 ckBTC to default identity"
dfx canister call ckbtc_ledger icrc1_transfer "(record{ to=record {owner = principal \"$DEFAULT_ACCOUNT\"} ; amount=$AMOUNT_3;})" --identity minter

# Then transfer to backend
output3=$(dfx canister call ckbtc_ledger icrc1_transfer "(record{ to=record {owner = principal \"$BACKEND_CANISTER_ID\"} ; amount=$AMOUNT_3;})" --identity default)
number3=$(echo "$output3" | awk -F'Ok = ' '{print $2}' | awk -F' :' '{print $1}')

if [ ! -z "$number3" ]; then
    echo "Transfer successful. Block index: $number3"
    echo "Notifying backend to process deposit..."
    dfx canister call backend notify_deposit "(record{ ckbtc_amount=$AMOUNT_3; block_index=$number3})" --identity default
else
    echo "Transfer failed: $output3"
fi

echo

# Check final balances
echo "=== FINAL BALANCES ==="
echo "ckBTC Balance of default identity:"
dfx canister call ckbtc_ledger icrc1_balance_of "(record {owner= principal \"$DEFAULT_ACCOUNT\"})" --identity default

echo "OUSG Balance of default identity:"
dfx canister call ousg_ledger icrc1_balance_of "(record {owner= principal \"$DEFAULT_ACCOUNT\"})" --identity default

echo

# Get deposit history
echo "=== DEPOSIT HISTORY ==="
dfx canister call backend get_user_deposits --identity default

echo

# Get BTC price
echo "=== CURRENT BTC PRICE ==="
dfx canister call backend get_current_btc_price --identity default

echo

# Get deposit statistics
echo "=== DEPOSIT STATISTICS ==="
dfx canister call backend get_deposit_stats --identity default

echo
echo "=== TEST COMPLETED ==="
