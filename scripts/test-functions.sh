#!/bin/bash

# Quick function tester for backend functions
# Usage: ./test-functions.sh [function_name]

set -e

# Switch to doxa identity
dfx identity use doxa > /dev/null 2>&1
DOXA_PRINCIPAL=$(dfx identity get-principal)
BACKEND_PRINCIPAL=$(dfx canister id backend)

echo "Using identity: $DOXA_PRINCIPAL"
echo "Backend canister: $BACKEND_PRINCIPAL"
echo ""

# Function to test registration
test_registration() {
    echo "=== Testing Registration ==="
    echo "Checking if registered..."
    dfx canister call backend is_user_registered
    echo ""
    
    echo "Getting user profile..."
    dfx canister call backend get_user_profile
    echo ""
}

# Function to test balances
test_balances() {
    echo "=== Testing Balances ==="
    echo "ckBTC Balance:"
    dfx canister call ckbtc_ledger icrc1_balance_of "(record { 
        owner = principal \"$DOXA_PRINCIPAL\"; 
        subaccount = null 
    })"
    echo ""
    
    echo "OUSG Balance:"
    dfx canister call ousg_ledger icrc1_balance_of "(record { 
        owner = principal \"$DOXA_PRINCIPAL\"; 
        subaccount = null 
    })"
    echo ""
    
    echo "Total Users:"
    dfx canister call backend get_total_users
    echo ""
}

# Function to test approval status
test_approval() {
    echo "=== Testing Approval Status ==="
    echo "Checking allowance..."
    dfx canister call ousg_ledger icrc2_allowance "(record {
        account = record {
            owner = principal \"$DOXA_PRINCIPAL\";
            subaccount = null;
        };
        spender = record {
            owner = principal \"$BACKEND_PRINCIPAL\";
            subaccount = null;
        };
    })"
    echo ""
    
    echo "Checking backend approval status for 9000000 units..."
    dfx canister call backend check_approval_status "(
        principal \"$DOXA_PRINCIPAL\",
        9000000:nat64
    )"
    echo ""
}

# Function to test BTC price
test_btc_price() {
    echo "=== Testing BTC Price ==="
    dfx canister call backend get_current_btc_price
    echo ""
}

# Function to test deposits
test_deposits() {
    echo "=== Testing Deposits ==="
    echo "Getting deposit stats..."
    dfx canister call backend get_deposit_stats
    echo ""
    
    echo "Getting user deposits..."
    dfx canister call backend get_user_deposits
    echo ""
}

# Function to register user
test_register() {
    echo "=== Registering User ==="
    dfx canister call backend register_user '(record { 
        email = "doxa@test.com"; 
        country = "India"; 
        phone_number = opt "+1234567890" 
    })'
    echo ""
}

# Main menu
if [ $# -eq 0 ]; then
    echo "Available functions:"
    echo "  registration  - Test user registration and profile"
    echo "  balances      - Check ckBTC and OUSG balances"
    echo "  approval      - Check approval status"
    echo "  btc_price     - Get current BTC price"
    echo "  deposits      - Check deposit information"
    echo "  register      - Register user"
    echo "  all           - Run all tests"
    echo ""
    echo "Usage: ./test-functions.sh [function_name]"
    echo "Example: ./test-functions.sh balances"
    exit 0
fi

case "$1" in
    registration)
        test_registration
        ;;
    balances)
        test_balances
        ;;
    approval)
        test_approval
        ;;
    btc_price)
        test_btc_price
        ;;
    deposits)
        test_deposits
        ;;
    register)
        test_register
        ;;
    all)
        test_registration
        test_balances
        test_approval
        test_btc_price
        test_deposits
        ;;
    *)
        echo "Unknown function: $1"
        echo "Run without arguments to see available functions"
        exit 1
        ;;
esac


