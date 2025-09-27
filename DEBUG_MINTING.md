# 🐛 Debug: InvalidAccount Error Fix

## ❌ **Error Analysis:**

**Error:** `"Failed to send ckBTC to Backend: InvalidAccount"`

**Cause:** The `InvalidAccount` error occurs when:
1. **Backend Canister ID is undefined/null**
2. **Invalid Principal format**
3. **Canister ID doesn't exist or is not accessible**

---

## ✅ **Fixes Applied:**

### **1. Fixed Constants (`constants.ts`):**
```typescript
// Before: Could be undefined
export const BACKEND_CANISTER_ID = import.meta.env.VITE_CANISTER_ID_BACKEND;

// After: Has fallback
export const BACKEND_CANISTER_ID = import.meta.env.VITE_CANISTER_ID_BACKEND || "mbw5i-laaaa-aaaag-qniwq-cai";
```

### **2. Added Principal Conversion (`minting.service.ts`):**
```typescript
// Before: String passed directly
owner: BACKEND_CANISTER_ID

// After: Properly converted to Principal
owner: Principal.fromText(BACKEND_CANISTER_ID)
```

### **3. Added Validation:**
```typescript
// Validate canister IDs before use
if (!CKBTC_LEDGER_CANISTER_ID) {
    throw new Error('ckBTC Ledger Canister ID not configured');
}
if (!BACKEND_CANISTER_ID) {
    throw new Error('Backend Canister ID not configured');
}
```

### **4. Added Debug Logging:**
```typescript
console.log('Transfer details:', {
    canisterId: CKBTC_LEDGER_CANISTER_ID,
    backendId: BACKEND_CANISTER_ID,
    amount: amount.toString()
});
```

---

## 🔍 **Debug Steps:**

### **Step 1: Check Console Logs**
Open browser console and look for:
```
Transfer details: {
  canisterId: "mxzaz-hqaaa-aaaar-qaada-cai",
  backendId: "mbw5i-laaaa-aaaag-qniwq-cai",
  amount: "100000000"
}
```

### **Step 2: Verify Canister IDs**
- **ckBTC Ledger:** `mxzaz-hqaaa-aaaar-qaada-cai`
- **Backend:** `mbw5i-laaaa-aaaag-qniwq-cai`

### **Step 3: Check Network Tab**
Look for failed requests to the ckBTC ledger canister.

---

## 🚀 **Testing:**

1. **Open browser console**
2. **Try minting again**
3. **Check for debug logs**
4. **Verify canister IDs are correct**

---

## 🎯 **Expected Result:**

After fixes, you should see:
- ✅ Debug logs in console
- ✅ Successful ckBTC transfer
- ✅ Automatic OUSG minting
- ✅ No more "InvalidAccount" error

---

## 🔧 **If Still Getting Error:**

1. **Check if canisters are deployed:**
   ```bash
   dfx canister status backend
   dfx canister status ckbtc_ledger
   ```

2. **Verify canister IDs in `canister_ids.json`**

3. **Check if ckBTC ledger is properly configured**

---

**The fixes should resolve the InvalidAccount error!** 🎉
