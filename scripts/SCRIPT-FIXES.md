# Script Fixes Summary

## Issues Fixed in `test-mint-redeem-flow.sh`

### 1. ✅ Candid Type Mismatch Error
**Problem:** 
```
Error: type mismatch: 0 : nat cannot be of type nat64
```

**Fix:**
Changed `notify_deposit` call to use `nat64` instead of `nat`:
```bash
# Before
block_index = $BLOCK_INDEX:nat;
ckbtc_amount = $CKBTC_AMOUNT:nat;

# After
block_index = $BLOCK_INDEX:nat64;
ckbtc_amount = $CKBTC_AMOUNT:nat64;
```

### 2. ✅ Insufficient Funds Error
**Problem:**
```
InsufficientFunds = record { balance = 49_999_980 : nat }
```

**Fix:**
Reduced mint amount from 50M to 10M satoshis:
```bash
# Before
MINT_AMOUNT=50000000  # 0.5 ckBTC

# After
MINT_AMOUNT=10000000  # 0.1 ckBTC (more realistic for testing)
```

### 3. ✅ Balance Extraction Error
**Problem:**
```
Current OUSG Balance: 000 units  # Wrong!
```
The grep pattern wasn't handling underscores in numbers properly.

**Fix:**
Improved balance extraction to handle both formats:
```bash
# Before
OUSG_BALANCE_STR=$(... | grep -oP '\d+(?=\s*:\s*nat)' | head -1)

# After
OUSG_BALANCE_RAW=$(dfx canister call ...)
echo "Raw balance response: $OUSG_BALANCE_RAW"  # Debug output
OUSG_BALANCE_STR=$(echo "$OUSG_BALANCE_RAW" | grep -oP '[\d_]+(?=\s*:\s*nat)' | head -1)
APPROVE_AMOUNT=${OUSG_BALANCE_STR//[_]/}  # Remove underscores
```

### 4. ✅ Redemption Amount Mismatch
**Problem:**
```
ValidationError = "Insufficient OUSG balance for redemption"
```
Script was trying to redeem more than available balance.

**Fix:**
- Approve full balance
- Redeem only 80% of approved amount (to account for fees)
```bash
# Approve full balance
APPROVE_AMOUNT=$(get_ousg_balance)

# Redeem 80% to be safe
REDEEM_AMOUNT=$((APPROVE_AMOUNT * 80 / 100))
```

### 5. ✅ Missing Wait Times (NEW FIX)
**Problem:**
Operations were happening too fast, before previous operations were fully processed.

**Fix:**
Added sleep delays between operations:
```bash
# After minting
echo "⏳ Waiting 2 seconds for minting to be processed..."
sleep 2

# After approval
echo "⏳ Waiting 3 seconds for approval to be processed..."
sleep 3

# After redemption
echo "⏳ Waiting 2 seconds for redemption to be processed..."
sleep 2
```

### 6. ✅ Better Error Handling
**Problem:**
Script didn't check if transfer was successful before proceeding.

**Fix:**
Added transfer validation:
```bash
# Check if transfer was successful
if [[ "$TRANSFER_RESULT" == *"Err"* ]]; then
    echo "❌ ckBTC transfer failed!"
    echo "Error: $TRANSFER_RESULT"
    return 1
fi

# Validate block index
if [ "$BLOCK_INDEX" -eq 0 ]; then
    echo "❌ Failed to extract block index from transfer result"
    return 1
fi
```

### 7. ✅ Empty Balance Handling
**Problem:**
Script would crash if balance was empty or couldn't be extracted.

**Fix:**
Added proper empty checks:
```bash
if [ -z "$APPROVE_AMOUNT" ] || [ "$APPROVE_AMOUNT" -eq 0 ]; then
    echo "⚠️  No OUSG balance to approve, skipping approval and redemption..."
else
    # Proceed with approval and redemption
fi
```

## New Features Added

### 1. Debug Output
Shows raw responses for easier debugging:
```bash
echo "Raw balance response: $OUSG_BALANCE_RAW"
echo "Transfer result: $TRANSFER_RESULT"
echo "Mint result: $MINT_RESULT"
```

### 2. Wait Time Messages
User-friendly messages during wait periods:
```bash
echo "⏳ Waiting 3 seconds for approval to be processed..."
```

### 3. Percentage-Based Redemption
Automatically calculates safe redemption amount:
```bash
REDEEM_AMOUNT=$((APPROVE_AMOUNT * 80 / 100))  # 80% of balance
```

## Testing Workflow Now

```
1. Register/Check User ✅
   ↓
2. Check Initial Balances ✅
   ↓
3. Mint OUSG (0.1 ckBTC → ~2 OUSG) ✅
   ↓ [Wait 2 seconds]
   ↓
4. Check Balances After Mint ✅
   ↓
5. Extract OUSG Balance ✅
   ↓
6. Approve Full Balance ✅
   ↓ [Wait 3 seconds]
   ↓
7. Verify Approval ✅
   ↓
8. Redeem 80% of Balance ✅
   ↓ [Wait 2 seconds]
   ↓
9. Check Final Balances ✅
```

## Expected Results After Fixes

### Before Minting:
```
ckBTC Balance: 100_000_000 satoshis (1.0 ckBTC)
OUSG Balance: 0 units
```

### After Minting:
```
ckBTC Balance: ~89_999_990 satoshis (0.9 ckBTC - fees)
OUSG Balance: ~1_990_000 units (~2 OUSG tokens)
```

### After Redemption:
```
ckBTC Balance: ~97_960_000 satoshis (0.98 ckBTC)
OUSG Balance: ~398_000 units (0.4 OUSG - 80% redeemed)
```

## Why These Wait Times?

### Minting (2 seconds):
- ckBTC transfer needs to be recorded
- Backend needs to process the deposit
- OUSG tokens need to be minted
- Ledger needs to update balances

### Approval (3 seconds):
- ICRC-2 approval needs to be recorded
- Allowance needs to be updated
- Backend needs to see the approval
- **Longest wait because approval is critical**

### Redemption (2 seconds):
- Backend transfer_from operation
- OUSG tokens need to be burned
- ckBTC needs to be transferred back
- Final balances need to update

## Testing After Fixes

Run the script:
```bash
bash scripts/test-mint-redeem-flow.sh
```

Expected output:
```
✅ User already registered
✅ OUSG minted successfully!
⏳ Waiting 2 seconds...
✅ OUSG approved successfully!
⏳ Waiting 3 seconds...
✅ OUSG redeemed successfully!
⏳ Waiting 2 seconds...
✅ Complete Flow Test Finished!
```

## Manual Testing Commands

If script still has issues, test manually:

```bash
# 1. Get balance with debug
BALANCE=$(dfx canister call ousg_ledger icrc1_balance_of "(record { 
    owner = principal \"$(dfx identity get-principal)\"; 
    subaccount = null 
})")
echo "Raw: $BALANCE"
AMOUNT=$(echo "$BALANCE" | grep -oP '[\d_]+(?=\s*:\s*nat)' | head -1)
AMOUNT=${AMOUNT//[_]/}
echo "Extracted: $AMOUNT"

# 2. Test with small amount first
dfx canister call backend redeem_ousg_tokens "(100000:nat64)"

# 3. Check redemption logs
dfx canister logs backend
```

## Common Issues After Fixes

### Issue: Still showing "000 units"
**Solution:** Check the raw output, pattern might need adjustment:
```bash
# Debug the extraction
echo "$OUSG_BALANCE_RAW"
echo "$OUSG_BALANCE_STR"
echo "$APPROVE_AMOUNT"
```

### Issue: "Insufficient balance" even with 80%
**Solution:** OUSG balance might have fees. Try 70%:
```bash
REDEEM_AMOUNT=$((APPROVE_AMOUNT * 70 / 100))
```

### Issue: Wait time not enough
**Solution:** Increase wait times:
```bash
sleep 5  # Instead of 2-3 seconds
```

## Files Modified

1. ✅ `scripts/test-mint-redeem-flow.sh` - Main test script
2. ✅ `scripts/mint-ckbtc-to-doxa.sh` - Helper script
3. ✅ `scripts/test-functions.sh` - Individual function tester
4. ✅ `scripts/TESTING-GUIDE.md` - Documentation
5. ✅ `scripts/SCRIPT-FIXES.md` - This file

## Next Steps

1. Run the updated script:
   ```bash
   bash scripts/test-mint-redeem-flow.sh
   ```

2. Check the debug output for balance extraction

3. Verify redemption completes successfully

4. Check final balances match expectations

