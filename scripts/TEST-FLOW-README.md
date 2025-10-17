# Complete Mint & Redeem Flow Test Script

## Overview
`test-mint-redeem-flow.sh` - A comprehensive script to test the complete OUSG token lifecycle using the doxa identity.

## What This Script Does

### Step-by-Step Flow:

1. **Identity Setup**
   - Switches to `doxa` identity
   - Gets principal ID

2. **Registration Check**
   - Checks if user is registered
   - If not registered, automatically registers the user
   - Registration includes: email, country, phone number

3. **Initial Balance Check**
   - Displays ckBTC balance
   - Displays OUSG balance

4. **Minting OUSG**
   - Transfers 0.5 ckBTC (50000000 satoshis) to backend
   - Notifies backend to mint OUSG tokens
   - Verifies minting success

5. **Balance Check After Minting**
   - Shows updated balances

6. **Approval for Redemption**
   - Approves backend to spend 10 OUSG tokens (10000000 units)
   - Uses ICRC-2 approval mechanism

7. **Approval Status Check**
   - Verifies the approval was successful
   - Shows current allowance

8. **Redeeming OUSG**
   - Redeems 9 OUSG tokens (9000000 units)
   - Burns OUSG tokens
   - Receives ckBTC back

9. **Final Balance Check**
   - Shows final balances
   - Verifies the complete flow

## Usage

### Make Script Executable
```bash
chmod +x scripts/test-mint-redeem-flow.sh
```

### Run the Script
```bash
./scripts/test-mint-redeem-flow.sh
```

Or from project root:
```bash
bash scripts/test-mint-redeem-flow.sh
```

## Prerequisites

1. **DFX Running**
   ```bash
   dfx start --background
   ```

2. **Canisters Deployed**
   ```bash
   dfx deploy
   ```

3. **Doxa Identity Exists**
   ```bash
   dfx identity list
   # Should show 'doxa' in the list
   ```

4. **ckBTC Balance**
   - Doxa identity should have some ckBTC
   - Script uses 0.5 ckBTC for minting
   - Use `./scripts/mint-ckbtc-local.sh` to mint ckBTC if needed

## Script Configuration

You can modify these values in the script:

```bash
# Minting amount (in satoshis, 8 decimals)
MINT_AMOUNT=50000000  # 0.5 ckBTC

# Approval amount (in OUSG units, 6 decimals)
APPROVE_AMOUNT=10000000  # 10 OUSG tokens

# Redeem amount (in OUSG units, 6 decimals)
REDEEM_AMOUNT=9000000  # 9 OUSG tokens
```

## Expected Output

```
==================================================
🚀 Testing Complete Mint & Redeem Flow with Doxa
==================================================

✅ Using identity: 2bfxp-uzezm-gf5ny-ztks2-ybgzc-4dfjc-7gdhs-he2ek-vdjfk-w4yph-fqe

==================================================
STEP 1: User Registration Check
==================================================
✅ User already registered

==================================================
STEP 2: Initial Balance Check
==================================================
💰 Checking balances...
ckBTC Balance: (99999990 : nat)
OUSG Balance: (0 : nat)

==================================================
STEP 3: Minting OUSG Tokens
==================================================
✅ OUSG minted successfully!

==================================================
STEP 4: Balance Check After Minting
==================================================
ckBTC Balance: (49999990 : nat)
OUSG Balance: (50000000 : nat)

==================================================
STEP 5: Approving OUSG for Redemption
==================================================
✅ OUSG approved successfully!

==================================================
STEP 6: Checking Approval Status
==================================================
Current allowance: (10000000 : nat)

==================================================
STEP 7: Redeeming OUSG Tokens
==================================================
✅ OUSG redeemed successfully!
ckBTC received: 45000000 satoshis

==================================================
STEP 8: Final Balance Check
==================================================
ckBTC Balance: (94999990 : nat)
OUSG Balance: (41000000 : nat)

==================================================
✅ Complete Flow Test Finished!
==================================================
```

## Troubleshooting

### Error: "User not found"
- Script will automatically register the user
- If still fails, check if backend canister is running

### Error: "Insufficient balance"
- Mint more ckBTC using `./scripts/mint-ckbtc-local.sh`
- Or adjust `MINT_AMOUNT` in the script

### Error: "Approval failed"
- Check OUSG balance is sufficient
- Verify OUSG ledger canister is running

### Error: "Redemption failed"
- Ensure approval was successful
- Check backend has ckBTC reserves
- Verify backend canister is running

## What This Script Tests

✅ **User Registration Flow**
- Registration check
- Automatic registration if needed

✅ **Minting Flow**
- ckBTC transfer to backend
- OUSG token minting
- Balance updates

✅ **Approval Flow**
- ICRC-2 approval mechanism
- Allowance verification

✅ **Redemption Flow**
- OUSG token burning using transfer_from
- ckBTC transfer back to user
- Balance reconciliation

## Notes

- All amounts use proper decimal places:
  - ckBTC: 8 decimals (satoshis)
  - OUSG: 6 decimals
  
- Each OUSG token = $5000 USD

- BTC price is fetched from XRC or defaults to $100,000

- Script includes comprehensive error checking and logging

## Related Scripts

- `mint-ckbtc-local.sh` - Mint ckBTC to identities
- `check-ousg-balances.sh` - Check token balances
- `transfer-ckbtc-local.sh` - Transfer ckBTC between identities


