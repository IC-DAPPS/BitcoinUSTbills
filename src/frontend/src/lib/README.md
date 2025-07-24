# 🚀 Bitcoin UST Bills - Frontend API Documentation

## 📋 Overview

Ye comprehensive API layer hai jo Internet Computer backend ke saath fully compatible hai. Isme sare functions available hain jo backend mein implement kiye gaye hain.

## 🔧 Setup

```typescript
import { initAuth, login } from '$lib/auth';
import { getUserProfile, getActiveUSTBills } from '$lib/api';

// Initialize authentication
await initAuth();

// Login user
await login();
```

## 🏗️ API Functions

### 🔐 User Management

#### Register User
```typescript
import { registerUser } from '$lib/api';

const userData = {
  email: "user@example.com",
  phone_number: ["123-456-7890"], // Optional
  country: "US"
};

const user = await registerUser(userData);
```

#### Get User Profile
```typescript
import { getUserProfile } from '$lib/api';
import { Principal } from '@dfinity/principal';

const principal = Principal.fromText("rdmx6-jaaaa-aaaah-qcaiq-cai");
const user = await getUserProfile(principal);
```

#### Update KYC Status (Admin only)
```typescript
import { updateKYCStatus } from '$lib/api';

await updateKYCStatus(userPrincipal, { 'Verified': null });
```

### 💰 Wallet Operations

#### Deposit Funds
```typescript
import { depositFunds, dollarsToCents } from '$lib/api';

// Deposit $100
const amount = dollarsToCents(100);
const newBalance = await depositFunds(amount);
```

#### Withdraw Funds
```typescript
import { withdrawFunds, dollarsToCents } from '$lib/api';

// Withdraw $50
const amount = dollarsToCents(50);
const newBalance = await withdrawFunds(amount);
```

### 🏦 UST Bill Management

#### Get Active UST Bills
```typescript
import { getActiveUSTBills } from '$lib/api';

const ustbills = await getActiveUSTBills();
console.log(`Found ${ustbills.length} active UST Bills`);
```

#### Create UST Bill (Admin only)
```typescript
import { createUSTBill, dollarsToCents } from '$lib/api';

const ustbillData = {
  cusip: "912796RF6",
  face_value: dollarsToCents(1000),    // $1000
  purchase_price: dollarsToCents(950),  // $950
  maturity_date: BigInt(Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60)), // 90 days
  annual_yield: 5.26,                   // 5.26%
  total_tokens: BigInt(1000),
  issuer: "US Treasury",
  bill_type: "13-week"
};

const ustbill = await createUSTBill(ustbillData);
```

#### Get Paginated UST Bills
```typescript
import { getUSTBillsPaginated } from '$lib/api';

const response = await getUSTBillsPaginated(BigInt(0), BigInt(10));
console.log(`Page: ${response.page}, Total: ${response.total}`);
```

### 📈 Trading Operations

#### Buy UST Bill Tokens
```typescript
import { buyUSTBillTokens, calculatePurchaseCost } from '$lib/api';

// Calculate cost first
const cost = await calculatePurchaseCost(ustbillId, BigInt(10));
console.log(`Cost for 10 tokens: $${centsToDoller(cost)}`);

// Buy tokens
const holding = await buyUSTBillTokens(ustbillId, BigInt(10));
```

#### Get User Holdings
```typescript
import { getUserHoldings } from '$lib/api';

const holdings = await getUserHoldings(userPrincipal);
holdings.forEach(holding => {
  console.log(`Holding: ${holding.tokens_owned} tokens of ${holding.ustbill_id}`);
});
```

#### Calculate Yield Projection
```typescript
import { getYieldProjection } from '$lib/api';

const projection = await getYieldProjection(holdingId);
console.log(`Projected yield: $${centsToDoller(projection.projected_yield)}`);
```

### 📊 Treasury Data

#### Fetch Treasury Rates
```typescript
import { fetchTreasuryRates } from '$lib/api';

const rates = await fetchTreasuryRates();
rates.forEach(rate => {
  console.log(`${rate.security_desc}: ${rate.rate}%`);
});
```

### ⚙️ Platform Management

#### Get Platform Config
```typescript
import { getPlatformConfig } from '$lib/api';

const config = await getPlatformConfig();
console.log(`Min investment: $${centsToDoller(config.minimum_investment)}`);
```

#### Get Trading Metrics
```typescript
import { getTradingMetrics } from '$lib/api';

const metrics = await getTradingMetrics();
console.log(`Total volume: $${centsToDoller(metrics.total_volume)}`);
```

## 🛠️ Utility Functions

### Currency Conversion
```typescript
import { centsToDoller, dollarsToCents } from '$lib/api';

// Convert cents to dollars for display
const dollars = centsToDoller(BigInt(12500)); // 125.00

// Convert dollars to cents for API calls
const cents = dollarsToCents(125.50); // BigInt(12550)
```

### Date Formatting
```typescript
import { formatTimestamp, formatFullTimestamp, daysUntilMaturity } from '$lib/api';

const timestamp = BigInt(1640995200); // Unix timestamp
const formattedDate = formatTimestamp(timestamp); // "1/1/2022"
const fullDate = formatFullTimestamp(timestamp);  // "1/1/2022, 12:00:00 AM"

const maturityDate = BigInt(Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60));
const daysLeft = daysUntilMaturity(maturityDate); // Number of days
```

### Status Helpers
```typescript
import { getStatusText, isKYCVerified, getKYCStatusText } from '$lib/api';

// Get readable status text
const status = getStatusText({ 'Active': null }); // "Active"

// Check KYC status
const verified = isKYCVerified({ 'Verified': null }); // true
const kycText = getKYCStatusText({ 'Pending': null }); // "Pending"
```

### Validation
```typescript
import { validateAmount, validateEmail } from '$lib/api';

const amountCheck = validateAmount("100.50");
if (!amountCheck.valid) {
  console.error(amountCheck.error);
}

const emailCheck = validateEmail("user@example.com");
if (!emailCheck.valid) {
  console.error(emailCheck.error);
}
```

## 🚨 Error Handling

```typescript
import { getErrorMessage } from '$lib/api';

try {
  await buyUSTBillTokens(ustbillId, BigInt(100));
} catch (error) {
  const userFriendlyMessage = getErrorMessage(error);
  console.error(userFriendlyMessage);
  
  // Handle specific errors
  if (error.message.includes('InsufficientFunds')) {
    // Show add funds dialog
  } else if (error.message.includes('KYCNotVerified')) {
    // Redirect to KYC page
  }
}
```

## 📱 UI Integration Examples

### Svelte Component Usage
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { getActiveUSTBills, getUserProfile, centsToDoller } from '$lib/api';
  import { authStore } from '$lib/auth';
  import type { USTBill, User } from '$lib/types';

  let ustbills: USTBill[] = [];
  let user: User | null = null;
  let loading = false;

  onMount(async () => {
    if ($authStore.isLoggedIn && $authStore.identity) {
      loading = true;
      try {
        ustbills = await getActiveUSTBills();
        user = await getUserProfile($authStore.identity.getPrincipal());
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        loading = false;
      }
    }
  });

  async function buyTokens(ustbillId: string, amount: number) {
    try {
      const holding = await buyUSTBillTokens(ustbillId, BigInt(amount));
      // Update UI
    } catch (error) {
      alert(getErrorMessage(error));
    }
  }
</script>

{#if loading}
  <p>Loading...</p>
{:else if user}
  <h1>Welcome, {user.email}!</h1>
  <p>Wallet Balance: ${centsToDoller(user.wallet_balance)}</p>
  
  <div class="ustbills">
    {#each ustbills as ustbill}
      <div class="ustbill-card">
        <h3>{ustbill.bill_type} - {ustbill.cusip}</h3>
        <p>Yield: {(ustbill.annual_yield * 100).toFixed(2)}%</p>
        <p>Available: {ustbill.total_tokens - ustbill.tokens_sold} tokens</p>
        <button on:click={() => buyTokens(ustbill.id, 10)}>
          Buy 10 Tokens
        </button>
      </div>
    {/each}
  </div>
{:else}
  <p>Please log in to continue</p>
{/if}
```

## 📋 Type Safety

Sare functions fully typed hain with TypeScript, so tumhe IntelliSense support milega:

```typescript
// Auto-complete aur type checking
const user: User = await getUserProfile(principal);
//    ^-- TypeScript knows this is User type

// Error prevention
await buyUSTBillTokens("invalid-id", "not-a-number"); // ❌ TypeScript error
await buyUSTBillTokens("valid-id", BigInt(10));       // ✅ Correct
```

## 🔄 Data Flow

```mermaid
graph LR
    A[User Action] --> B[API Function]
    B --> C[getActor()]
    C --> D[Backend Canister]
    D --> E[Result Handling]
    E --> F[UI Update]
    E --> G[Error Display]
```

## 🎯 Best Practices

1. **Always handle errors** - Use try-catch blocks
2. **Validate inputs** - Use provided validation functions
3. **Use type guards** - Check types before using data
4. **Convert units** - Use `centsToDoller()` and `dollarsToCents()`
5. **Check auth state** - Ensure user is logged in before API calls

## 🔧 Development Tips

- Use browser dev tools to debug API calls
- Check network tab for canister call details  
- Log errors for debugging: `console.error(getErrorMessage(error))`
- Use TypeScript strict mode for better type safety

Ye API layer completely production-ready hai aur sare backend functions ko support karta hai! 🚀 