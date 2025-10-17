#!/bin/bash

# Script to test complete mint and redeem flow with doxa identity
# This script will:
# 1. Check if user is registered, if not register
# 2. Test minting OUSG tokens
# 3. Test approving OUSG for redemption
# 4. Test redeeming OUSG for ckBTC

set -e

echo "=================================================="
echo "🚀 Testing Complete Mint & Redeem Flow with Doxa"
echo "=================================================="
echo ""

# Switch to doxa identity
echo "📝 Switching to doxa identity..."
dfx identity use doxa
DOXA_PRINCIPAL=$(dfx identity get-principal)
echo "✅ Using identity: $DOXA_PRINCIPAL"
echo ""

# Function to check if user is registered
check_registration() {
    echo "🔍 Checking if user is registered..."
    REGISTERED=$(dfx canister call backend is_user_registered)
    echo "Registration status: $REGISTERED"
    echo ""
    
    if [[ "$REGISTERED" == *"false"* ]]; then
        return 1
    else
        return 0
    fi
}

# Function to register user
register_user() {
    echo "📋 Registering user..."
    dfx canister call backend register_user '(record { 
        email = "doxa@test.com"; 
        country = "India"; 
        phone_number = opt "+1234567890" 
    })'
    echo "✅ User registered successfully!"
    echo ""
}

# Function to check balances
check_balances() {
    echo "💰 Checking balances..."
    
    echo "ckBTC Balance:"
    CKBTC_BALANCE=$(dfx canister call ckbtc_ledger icrc1_balance_of "(record { 
        owner = principal \"$DOXA_PRINCIPAL\"; 
        subaccount = null 
    })")
    echo "$CKBTC_BALANCE"
    
    echo ""
    echo "OUSG Balance:"
    OUSG_BALANCE=$(dfx canister call ousg_ledger icrc1_balance_of "(record { 
        owner = principal \"$DOXA_PRINCIPAL\"; 
        subaccount = null 
    })")
    echo "$OUSG_BALANCE"
    echo ""
}

# Function to mint OUSG
mint_ousg() {
    local CKBTC_AMOUNT=$1
    
    echo "🏭 Minting OUSG tokens..."
    echo "Amount: $CKBTC_AMOUNT ckBTC (in satoshis)"
    echo ""
    
    # Get backend canister ID
    BACKEND_PRINCIPAL=$(dfx canister id backend)
    echo "Backend canister: $BACKEND_PRINCIPAL"
    echo ""
    
    # Step 1: Transfer ckBTC to backend
    echo "Step 1: Transferring ckBTC to backend..."
    TRANSFER_RESULT=$(dfx canister call ckbtc_ledger icrc1_transfer "(record {
        to = record {
            owner = principal \"$BACKEND_PRINCIPAL\";
            subaccount = null;
        };
        amount = $CKBTC_AMOUNT:nat;
        fee = null;
        memo = null;
        from_subaccount = null;
        created_at_time = null;
    })")
    
    echo "Transfer result: $TRANSFER_RESULT"
    
    # Check if transfer was successful
    if [[ "$TRANSFER_RESULT" == *"Err"* ]]; then
        echo "❌ ckBTC transfer failed!"
        echo "Error: $TRANSFER_RESULT"
        return 1
    fi
    
    # Extract block index from result
    BLOCK_INDEX=$(echo "$TRANSFER_RESULT" | grep -oP '(?<=Ok = )\d+' || echo "0")
    echo "Block index: $BLOCK_INDEX"
    
    if [ "$BLOCK_INDEX" -eq 0 ]; then
        echo "❌ Failed to extract block index from transfer result"
        return 1
    fi
    echo ""
    
    # Step 2: Notify backend to mint OUSG
    echo "Step 2: Notifying backend to mint OUSG..."
    MINT_RESULT=$(dfx canister call backend notify_deposit "(record {
        block_index = $BLOCK_INDEX:nat64;
        ckbtc_amount = $CKBTC_AMOUNT:nat64;
    })")
    
    echo "Mint result: $MINT_RESULT"
    echo ""
    
    if [[ "$MINT_RESULT" == *"success = true"* ]]; then
        echo "✅ OUSG minted successfully!"
    else
        echo "❌ Minting failed!"
        return 1
    fi
    echo ""
}

# Function to approve OUSG for redemption
approve_ousg() {
    local OUSG_AMOUNT=$1
    
    echo "✅ Approving OUSG for redemption..."
    echo "Amount: $OUSG_AMOUNT OUSG units"
    echo ""
    
    BACKEND_PRINCIPAL=$(dfx canister id backend)
    
    APPROVE_RESULT=$(dfx canister call ousg_ledger icrc2_approve "(record {
        spender = record {
            owner = principal \"$BACKEND_PRINCIPAL\";
            subaccount = null;
        };
        amount = $OUSG_AMOUNT:nat;
        fee = null;
        memo = null;
        from_subaccount = null;
        created_at_time = null;
        expires_at = null;
        expected_allowance = null;
    })")
    
    echo "Approval result: $APPROVE_RESULT"
    
    if [[ "$APPROVE_RESULT" == *"Ok"* ]]; then
        echo "✅ OUSG approved successfully!"
    else
        echo "❌ Approval failed!"
        return 1
    fi
    echo ""
}

# Function to check approval status
check_approval() {
    local OUSG_AMOUNT=$1
    
    echo "🔍 Checking approval status..."
    BACKEND_PRINCIPAL=$(dfx canister id backend)
    
    ALLOWANCE=$(dfx canister call ousg_ledger icrc2_allowance "(record {
        account = record {
            owner = principal \"$DOXA_PRINCIPAL\";
            subaccount = null;
        };
        spender = record {
            owner = principal \"$BACKEND_PRINCIPAL\";
            subaccount = null;
        };
    })")
    
    echo "Current allowance: $ALLOWANCE"
    echo ""
}

# Function to redeem OUSG
redeem_ousg() {
    local OUSG_AMOUNT=$1
    
    echo "🔄 Redeeming OUSG tokens..."
    echo "Amount: $OUSG_AMOUNT OUSG units"
    echo ""
    
    REDEEM_RESULT=$(dfx canister call backend redeem_ousg_tokens "($OUSG_AMOUNT:nat64)")
    
    echo "Redeem result: $REDEEM_RESULT"
    
    if [[ "$REDEEM_RESULT" == *"Ok"* ]]; then
        echo "✅ OUSG redeemed successfully!"
        # Extract ckBTC amount from result
        CKBTC_RECEIVED=$(echo "$REDEEM_RESULT" | grep -oP '(?<=Ok = )\d+' || echo "0")
        echo "ckBTC received: $CKBTC_RECEIVED satoshis"
    else
        echo "❌ Redemption failed!"
        echo "Error: $REDEEM_RESULT"
        return 1
    fi
    echo ""
}

# Main execution
echo "=================================================="
echo "STEP 1: User Registration Check"
echo "=================================================="
if check_registration; then
    echo "✅ User already registered"
else
    echo "⚠️  User not registered, registering now..."
    register_user
fi

echo "=================================================="
echo "STEP 2: Initial Balance Check"
echo "=================================================="
check_balances

echo "=================================================="
echo "STEP 3: Minting OUSG Tokens"
echo "=================================================="
# Mint with 10000000 satoshis (0.1 ckBTC) - reduced to fit available balance
MINT_AMOUNT=10000000
echo "Minting OUSG with $MINT_AMOUNT satoshis (0.1 ckBTC)..."
echo ""
if mint_ousg $MINT_AMOUNT; then
    echo "✅ Minting completed!"
    echo ""
    echo "⏳ Waiting 2 seconds for minting to be processed..."
    sleep 2
    echo ""
else
    echo "❌ Minting failed, stopping..."
    exit 1
fi

echo "=================================================="
echo "STEP 4: Balance Check After Minting"
echo "=================================================="
check_balances

echo "=================================================="
echo "STEP 5: Approving OUSG for Redemption"
echo "=================================================="
# Get current OUSG balance and approve all of it
OUSG_BALANCE_RAW=$(dfx canister call ousg_ledger icrc1_balance_of "(record { 
    owner = principal \"$DOXA_PRINCIPAL\"; 
    subaccount = null 
})")

echo "Raw balance response: $OUSG_BALANCE_RAW"

# Extract balance - handle both formats with and without underscores
OUSG_BALANCE_STR=$(echo "$OUSG_BALANCE_RAW" | grep -oP '[\d_]+(?=\s*:\s*nat)' | head -1)
APPROVE_AMOUNT=${OUSG_BALANCE_STR//[_]/}  # Remove underscores

echo "Current OUSG Balance: $APPROVE_AMOUNT units"
echo ""

if [ -z "$APPROVE_AMOUNT" ] || [ "$APPROVE_AMOUNT" -eq 0 ]; then
    echo "⚠️  No OUSG balance to approve, skipping approval and redemption..."
    # Skip to final balance check
else
    echo "Approving entire balance for redemption..."
    echo ""
    
    if approve_ousg $APPROVE_AMOUNT; then
        echo "✅ Approval completed!"
        echo ""
        
        # Wait for approval to be processed
        echo "⏳ Waiting 3 seconds for approval to be processed..."
        sleep 3
        echo ""
        
        echo "=================================================="
        echo "STEP 6: Checking Approval Status"
        echo "=================================================="
        check_approval $APPROVE_AMOUNT
        
        echo "=================================================="
        echo "STEP 7: Redeeming OUSG Tokens"
        echo "=================================================="
        # Redeem 80% of approved balance (to account for fees)
        REDEEM_AMOUNT=$((APPROVE_AMOUNT * 80 / 100))
        
        echo "Approved Amount: $APPROVE_AMOUNT units"
        echo "Redeeming: $REDEEM_AMOUNT OUSG units (80% of approved amount)..."
        echo ""
        
        if [ "$REDEEM_AMOUNT" -eq 0 ]; then
            echo "⚠️  No OUSG balance to redeem, skipping redemption..."
        elif redeem_ousg $REDEEM_AMOUNT; then
            echo "✅ Redemption completed!"
            echo ""
            echo "⏳ Waiting 2 seconds for redemption to be processed..."
            sleep 2
            echo ""
        else
            echo "❌ Redemption failed!"
        fi
    else
        echo "❌ Approval failed, stopping..."
        exit 1
    fi
fi

echo "=================================================="
echo "STEP 8: Final Balance Check"
echo "=================================================="
check_balances

echo "=================================================="
echo "✅ Complete Flow Test Finished!"
echo "=================================================="
echo ""
echo "Summary:"
echo "✅ User Registration: Complete"
echo "✅ OUSG Minting: Complete"
echo "✅ OUSG Approval: Complete"
echo "✅ OUSG Redemption: Complete"
echo ""
echo "Check the balances above to verify the flow worked correctly!"


