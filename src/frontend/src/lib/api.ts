import { actor } from "./agent";
import { get } from "svelte/store";
import type {
  Principal
} from '@dfinity/principal';
import type {
  // Core types from declaration
  _SERVICE,
  USTBill,
  USTBillCreateRequest,
  User,
  UserRegistrationRequest,
  TokenHolding,
  TreasuryRate,
  YieldProjection,
  TradingMetrics,
  PlatformConfig,
  VerifiedBrokerPurchase,
  PaginatedResponse,
  KYCStatus,

  // Result types
  Result,
  Result_1,
  Result_2,
  Result_3,
  Result_4,
  Result_5,
  Result_6,
  Result_7,
  Result_8,

  // Error types
  BitcoinUSTBillsError
} from "../../../declarations/backend/backend.did";
import type { GetUserProfileResponse } from "./types/result";

// ============= UTILITY FUNCTIONS =============

/**
 * Gets the backend actor instance
 */
function getActor(): _SERVICE {
  const backendActor = get(actor);
  if (!backendActor) {
    throw new Error("Actor not initialized. Please ensure you're logged in.");
  }
  return backendActor;
}

/**
 * Handles API call results and extracts data or throws error
 */
function handleResult<T>(result: { 'Ok'?: T; 'Err'?: BitcoinUSTBillsError }): T {
  if ('Ok' in result && result.Ok !== undefined) {
    return result.Ok;
  }
  if ('Err' in result && result.Err) {
    throw new Error(`API Error: ${JSON.stringify(result.Err)}`);
  }
  throw new Error("Unexpected API response format");
}

// ============= UST BILL MANAGEMENT =============

/**
 * Creates a new UST Bill (Admin only)
 */
export async function createUSTBill(ustbillData: USTBillCreateRequest): Promise<USTBill> {
  const result = await getActor().create_ustbill(ustbillData);
  return handleResult(result);
}

/**
 * Retrieves a specific UST Bill by ID
 */
export async function getUSTBill(ustbillId: string): Promise<USTBill> {
  const result = await getActor().get_ustbill(ustbillId);
  return handleResult(result);
}

/**
 * Gets all active UST Bills
 */
export async function getActiveUSTBills(): Promise<USTBill[]> {
  return await getActor().get_active_ustbills();
}

/**
 * Gets paginated list of UST Bills
 */
export async function getUSTBillsPaginated(page: bigint, perPage: bigint): Promise<PaginatedResponse> {
  const result = await getActor().get_ustbills_paginated(page, perPage);
  return handleResult(result);
}

/**
 * Gets available token count for a UST Bill
 */
export async function getUSTBillAvailability(ustbillId: string): Promise<bigint> {
  const result = await getActor().get_ustbill_availability(ustbillId);
  return handleResult(result);
}

// ============= USER MANAGEMENT =============

/**
 * Registers a new user
 */
export async function registerUser(userData: UserRegistrationRequest): Promise<User> {
  const result = await getActor().register_user(userData);
  return handleResult(result);
}

/**
 * Gets user profile by principal
 */
export async function getUserProfile(): Promise<GetUserProfileResponse
> {
return getActor().get_user_profile();

}

/**
 * Updates KYC status for a user (Admin only)
 */
export async function updateKYCStatus(principal: Principal, status: KYCStatus): Promise<void> {
  const result = await getActor().update_kyc_status(principal, status);
  handleResult(result);
}

// ============= WALLET OPERATIONS =============

/**
 * Deposits funds to user wallet
 */
export async function depositFunds(amount: bigint): Promise<bigint> {
  const result = await getActor().deposit_funds(amount);
  return handleResult(result);
}

/**
 * Withdraws funds from user wallet
 */
export async function withdrawFunds(amount: bigint): Promise<bigint> {
  const result = await getActor().withdraw_funds(amount);
  return handleResult(result);
}

// ============= TRADING OPERATIONS =============

/**
 * Purchases entire UST Bill (single ownership model)
 */
export async function buyUSTBill(ustbillId: string): Promise<TokenHolding> {
  const result = await getActor().buy_ustbill(ustbillId);
  return handleResult(result);
}

/**
 * Gets user's token holdings
 */
export async function getUserHoldings(principal: Principal): Promise<TokenHolding[]> {
  return await getActor().get_user_holdings(principal);
}

/**
 * Calculates purchase cost for tokens
 */
export async function calculatePurchaseCost(ustbillId: string, tokenAmount: bigint): Promise<bigint> {
  const result = await getActor().calculate_purchase_cost(ustbillId, tokenAmount);
  return handleResult(result);
}

/**
 * Calculates current value of a holding
 */
export async function calculateCurrentValue(holdingId: string): Promise<bigint> {
  const result = await getActor().calculate_current_value(holdingId);
  return handleResult(result);
}

/**
 * Calculates maturity yield for a holding
 */
export async function calculateMaturityYield(holdingId: string): Promise<bigint> {
  const result = await getActor().calculate_maturity_yield(holdingId);
  return handleResult(result);
}

/**
 * Gets yield projection for a holding
 */
export async function getYieldProjection(holdingId: string): Promise<YieldProjection> {
  const result = await getActor().get_yield_projection(holdingId);
  return handleResult(result);
}

// ============= TREASURY DATA =============

/**
 * Fetches current Treasury rates from external API
 */
export async function fetchTreasuryRates(): Promise<TreasuryRate[]> {
  const result = await getActor().fetch_treasury_rates();
  return handleResult(result);
}

/**
 * Updates UST Bill market data
 */
export async function updateUSTBillMarketData(): Promise<void> {
  const result = await getActor().update_ustbill_market_data();
  handleResult(result);
}

// ============= PLATFORM MANAGEMENT =============

/**
 * Gets platform configuration
 */
export async function getPlatformConfig(): Promise<PlatformConfig> {
  return await getActor().get_platform_config();
}

/**
 * Updates platform configuration (Admin only)
 */
export async function updatePlatformConfig(config: PlatformConfig): Promise<void> {
  const result = await getActor().update_platform_config(config);
  handleResult(result);
}

/**
 * Gets trading metrics
 */
export async function getTradingMetrics(): Promise<TradingMetrics> {
  return await getActor().get_trading_metrics();
}

/**
 * Gets storage statistics
 */
export async function getStorageStats(): Promise<[string, bigint][]> {
  return await getActor().get_storage_stats();
}

// ============= VERIFIED BROKER PURCHASES =============

/**
 * Adds a verified broker purchase record (Admin only)
 */
export async function adminAddBrokerPurchaseRecord(
  amount: bigint,
  price: bigint,
  brokerTxnId: string,
  ustbillType: string
): Promise<void> {
  const result = await getActor().admin_add_broker_purchase_record(
    amount,
    price,
    brokerTxnId,
    ustbillType
  );
  handleResult(result);
}

/**
 * Gets all verified broker purchases
 */
export async function getAllVerifiedBrokerPurchases(): Promise<VerifiedBrokerPurchase[]> {
  return await getActor().get_all_verified_broker_purchases();
}

// ============= HELPER FUNCTIONS =============

/**
 * Converts cents to dollars for display
 */
export function centsToDoller(cents: bigint): number {
  return Number(cents) / 100;
}

/**
 * Converts dollars to cents for API calls
 */
export function dollarsToCents(dollars: number): bigint {
  return BigInt(Math.round(dollars * 100));
}

/**
 * Formats timestamp to readable date
 */
export function formatTimestamp(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleDateString();
}

/**
 * Formats timestamp to full date and time
 */
export function formatFullTimestamp(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleString();
}

/**
 * Calculates days until maturity
 */
export function daysUntilMaturity(maturityDate: bigint): number {
  const currentTime = Math.floor(Date.now() / 1000);
  const maturityTime = Number(maturityDate);
  return Math.max(0, Math.ceil((maturityTime - currentTime) / 86400));
}

/**
/**
 * Formats yield percentage for display
 */
export function formatYieldPercentage(yieldValue: number): string {
  return `${(yieldValue * 100).toFixed(2)}%`;
}

export function getStatusText(status: any): string {
  if (typeof status === 'object' && status !== null) {
    const keys = Object.keys(status);
    return keys[0] || 'Unknown';
  }
  return String(status);
}

/**
 * Checks if user has KYC verified status
 */
export function isKYCVerified(kycStatus: KYCStatus): boolean {
  return 'Verified' in kycStatus;
}

/**
 * Gets KYC status text
 */
export function getKYCStatusText(kycStatus: KYCStatus): string {
  return getStatusText(kycStatus);
}

/**
 * Validates amount input
 */
export function validateAmount(amount: string | number): { valid: boolean; error?: string } {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num) || num <= 0) {
    return { valid: false, error: 'Amount must be a positive number' };
  }

  if (num < 1) {
    return { valid: false, error: 'Minimum investment is $1' };
  }

  if (num > 10000) {
    return { valid: false, error: 'Maximum investment is $10,000' };
  }

  return { valid: true };
}

/**
 * Validates email format
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email.trim()) {
    return { valid: false, error: 'Email is required' };
  }

  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

// ============= ERROR HANDLING =============

/**
 * Gets user-friendly error message
 */
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    // Handle BitcoinUSTBillsError variants
    const errorKeys = Object.keys(error);
    if (errorKeys.length > 0) {
      const errorType = errorKeys[0];

      switch (errorType) {
        case 'UserNotFound':
          return 'User not found. Please register first.';
        case 'InsufficientFunds':
          return 'Insufficient funds in wallet.';
        case 'KYCNotVerified':
          return 'KYC verification required for trading.';
        case 'USTBillSoldOut':
          return 'This UST Bill is sold out.';
        case 'TradingNotAllowed':
          return 'Trading not allowed. Please complete KYC verification.';
        case 'MinimumInvestmentNotMet':
          return 'Minimum investment amount not met.';
        case 'MaximumInvestmentExceeded':
          return 'Maximum investment amount exceeded.';
        case 'Unauthorized':
          return 'Unauthorized access. Admin privileges required.';
        case 'AnonymousCaller':
          return 'Please log in to continue.';
        default:
          return `Error: ${errorType}`;
      }
    }
  }

  return 'An unexpected error occurred. Please try again.';
}
