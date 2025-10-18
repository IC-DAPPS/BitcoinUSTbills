# Complete Testing Guide for BitcoinUSTbills

## Overview
This guide explains how to test the complete mint and redeem flow using automated scripts.

## 🚀 Quick Start

### 1. Start DFX (if not already running)
```bash
dfx start --background --clean
```

### 2. Deploy All Canisters
```bash
dfx deploy
```

### 3. Setup doxa Identity
```bash
# Create doxa identity if it doesn't exist
dfx identity new doxa

# Or use existing one
dfx identity use doxa
```

### 4. Mint ckBTC to doxa (if needed)
```bash
bash scripts/mint-ckbtc-to-doxa.sh 1.0
```
This mints 1 ckBTC (100,000,000 satoshis) to the doxa identity.

### 5. Run Complete Flow Test
```bash
bash scripts/test-mint-redeem-flow.sh
```

## 📋 What the Test Does

### Complete Flow Breakdown:

1. **Registration Check** ✅
   - Checks if doxa user is registered
   - Auto-registers if not registered
   - Verifies registration status

2. **Initial Balance Check** 💰
   - Shows ckBTC balance
   - Shows OUSG balance (should be 0 initially)

3. **Minting OUSG** 🏭
   - Transfers 0.1 ckBTC (10,000,000 satoshis) to backend
   - Backend validates the transfer
   - Backend calculates USD value based on BTC price
   - Backend mints OUSG tokens (each OUSG = $5,000 USD)
   - User receives OUSG tokens

4. **Balance Check After Minting** 💰
   - Verifies ckBTC was deducted
   - Verifies OUSG was minted

5. **Approval for Redemption** ✅
   - User approves backend to spend their OUSG tokens
   - Uses ICRC-2 approval mechanism
   - Approves entire OUSG balance

6. **Approval Status Check** 🔍
   - Verifies approval was successful
   - Shows current allowance

7. **Redemption** 🔄
   - Redeems 80% of approved OUSG (to account for fees)
   - Backend uses `transfer_from` to pull OUSG from user
   - Backend burns the OUSG tokens
   - Backend sends ckBTC back to user

8. **Final Balance Check** 💰
   - Shows final ckBTC balance (should be higher)
   - Shows final OUSG balance (should be lower)

## 🔧 Available Scripts

### 1. Complete Flow Test
```bash
bash scripts/test-mint-redeem-flow.sh
```
Tests the entire mint and redeem flow automatically.

### 2. Mint ckBTC to doxa
```bash
bash scripts/mint-ckbtc-to-doxa.sh <amount>
```
Example:
```bash
bash scripts/mint-ckbtc-to-doxa.sh 0.5  # Mints 0.5 ckBTC
```

### 3. Test Individual Functions
```bash
bash scripts/test-functions.sh <function_name>
```

Available functions:
- `registration` - Test user registration
- `balances` - Check all balances
- `approval` - Check approval status
- `btc_price` - Get current BTC price
- `deposits` - Check deposit information
- `register` - Register a new user
- `all` - Run all tests

Examples:
```bash
bash scripts/test-functions.sh balances
bash scripts/test-functions.sh registration
bash scripts/test-functions.sh all
```

## 📊 Understanding the Output

### Successful Flow Output:
```
==================================================
🚀 Testing Complete Mint & Redeem Flow with Doxa
==================================================

✅ Using identity: 2bfxp-uzezm-gf5ny-ztks2-ybgzc-4dfjc-7gdhs...

==================================================
STEP 1: User Registration Check
==================================================
✅ User already registered

==================================================
STEP 2: Initial Balance Check
==================================================
ckBTC Balance: (100_000_000 : nat)  # 1.0 ckBTC
OUSG Balance: (0 : nat)

==================================================
STEP 3: Minting OUSG Tokens
==================================================
✅ OUSG minted successfully!

==================================================
STEP 4: Balance Check After Minting
==================================================
ckBTC Balance: (89_999_990 : nat)   # 0.9 ckBTC (0.1 spent + fees)
OUSG Balance: (1_990_000 : nat)     # ~2 OUSG tokens

==================================================
STEP 5: Approving OUSG for Redemption
==================================================
✅ OUSG approved successfully!

==================================================
STEP 6: Checking Approval Status
==================================================
Current allowance: (1_990_000 : nat)

==================================================
STEP 7: Redeeming OUSG Tokens
==================================================
✅ OUSG redeemed successfully!
ckBTC received: 7_960_000 satoshis  # ~0.08 ckBTC back

==================================================
STEP 8: Final Balance Check
==================================================
ckBTC Balance: (97_959_990 : nat)   # Got ckBTC back
OUSG Balance: (398_000 : nat)       # 20% OUSG left
```

## 🧮 Token Math Explained

### Minting Calculation:
```
1. User sends: 0.1 ckBTC (10,000,000 satoshis)
2. BTC Price: $100,000 (hardcoded for testing)
3. USD Value: 0.1 × $100,000 = $10,000
4. OUSG to Mint: $10,000 / $5,000 = 2 OUSG tokens
5. OUSG Units: 2 × 1,000,000 = 2,000,000 units (6 decimals)
6. After Fees: ~1,990,000 units
```

### Redemption Calculation:
```
1. User redeems: 1,592,000 OUSG units (80% of 1,990,000)
2. OUSG Tokens: 1,592,000 / 1,000,000 = 1.592 OUSG
3. USD Value: 1.592 × $5,000 = $7,960
4. BTC Amount: $7,960 / $100,000 = 0.0796 BTC
5. Satoshis: 0.0796 × 100,000,000 = 7,960,000 satoshis
```

## 🐛 Common Issues & Solutions

### Issue 1: "Insufficient ckBTC balance"
**Solution:** Mint more ckBTC
```bash
bash scripts/mint-ckbtc-to-doxa.sh 1.0
```

### Issue 2: "User not registered"
**Solution:** Script auto-registers. If fails, manually register:
```bash
dfx canister call backend register_user '(record { 
    email = "doxa@test.com"; 
    country = "India"; 
    phone_number = opt "+1234567890" 
})'
```

### Issue 3: "Deposit already processed"
**Cause:** Same block index used twice
**Solution:** The script handles this automatically by checking for errors

### Issue 4: "Insufficient OUSG balance for redemption"
**Cause:** Trying to redeem more than you have
**Solution:** Script now auto-calculates and redeems only 80% of available balance

### Issue 5: "Approval failed"
**Solution:** Check OUSG balance and try again with correct amount

### Issue 6: "Candid type mismatch"
**Solution:** Fixed in script - uses `nat64` for block_index and amounts

## 🔍 Debugging Tips

### 1. Check Balances
```bash
bash scripts/test-functions.sh balances
```

### 2. Check Registration
```bash
bash scripts/test-functions.sh registration
```

### 3. Check Approval Status
```bash
bash scripts/test-functions.sh approval
```

### 4. Check Backend Logs
```bash
dfx canister logs backend
```

### 5. Check Deposit Stats
```bash
dfx canister call backend get_deposit_stats
```

## 📝 Manual Testing Commands

### Check if User is Registered
```bash
dfx canister call backend is_user_registered
```

### Get User Profile
```bash
dfx canister call backend get_user_profile
```

### Check ckBTC Balance
```bash
PRINCIPAL=$(dfx identity get-principal)
dfx canister call ckbtc_ledger icrc1_balance_of "(record { 
    owner = principal \"$PRINCIPAL\"; 
    subaccount = null 
})"
```

### Check OUSG Balance
```bash
PRINCIPAL=$(dfx identity get-principal)
dfx canister call ousg_ledger icrc1_balance_of "(record { 
    owner = principal \"$PRINCIPAL\"; 
    subaccount = null 
})"
```

### Check Approval Allowance
```bash
PRINCIPAL=$(dfx identity get-principal)
BACKEND=$(dfx canister id backend)
dfx canister call ousg_ledger icrc2_allowance "(record {
    account = record {
        owner = principal \"$PRINCIPAL\";
        subaccount = null;
    };
    spender = record {
        owner = principal \"$BACKEND\";
        subaccount = null;
    };
})"
```

## 🎯 Expected Results

### After Minting:
- ✅ ckBTC balance decreased by minted amount + fees
- ✅ OUSG balance increased (approximately USD value / $5,000)
- ✅ Deposit record created in backend
- ✅ User profile updated with new balance

### After Approval:
- ✅ Approval success message
- ✅ Allowance shows approved amount
- ✅ OUSG tokens still in user's wallet

### After Redemption:
- ✅ OUSG balance decreased by redeemed amount
- ✅ ckBTC balance increased (approximately OUSG value converted back)
- ✅ OUSG tokens burned
- ✅ ckBTC transferred to user

## 🔐 Security Notes

- All operations require authentication (caller principal)
- Approvals expire (can be set with `expires_at`)
- Double-spending prevention via processed block tracking
- Minimum deposit enforced ($5,000 USD)
- KYC status checked for deposits

## 📚 Related Documentation

- [ICRC-1 Standard](https://github.com/dfinity/ICRC-1)
- [ICRC-2 Standard](https://github.com/dfinity/ICRC-1/blob/main/standards/ICRC-2/README.md)
- [Internet Computer Documentation](https://internetcomputer.org/docs)

## 🆘 Getting Help

If tests fail:
1. Check DFX is running: `dfx ping`
2. Check canisters deployed: `dfx canister status backend`
3. Check logs: `dfx canister logs backend`
4. Review error messages in terminal output
5. Verify ckBTC balance is sufficient
6. Ensure user is registered

## 🎉 Success Criteria

The test is successful when:
- ✅ User registration works
- ✅ OUSG tokens are minted after ckBTC deposit
- ✅ Approval mechanism works correctly
- ✅ OUSG tokens can be redeemed for ckBTC
- ✅ Balances update correctly throughout flow
- ✅ No errors in backend logs

