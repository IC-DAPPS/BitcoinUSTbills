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
  BitcoinUSTBillsError,
  FreeKYCSession,
  UserAndFreeKYCSession
} from "../../../declarations/backend/backend.did";
import type { GetUserProfileResponse, RegisterUserResponse } from "./types/result";

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
 * Gets all active UST Bills
 */
export async function getActiveUSTBills(): Promise<USTBill[]> {
  return await getActor().get_active_ustbills();
}



// ============= USER MANAGEMENT =============

/**
 * Registers a new user
 */
export async function registerUser(userData: UserRegistrationRequest): Promise<User> {
  const result = await getActor().register_user(userData);
  return handleResult(result);
}

export async function isUserRegistered(): Promise<boolean> {
  return getActor().is_user_registered();

}

/**
 * Gets user profile by principal
 */
export async function getUserProfile(): Promise<GetUserProfileResponse
> {
  return getActor().get_user_profile();

}



/**
 * Gets KYC status for user and admin by uploadId = user.principal.toText()
 */
export async function getKYCStatus(uploadId: string): Promise<FreeKYCSession> {
  const result = await getActor().get_free_kyc_status(uploadId);
  return handleResult(result);
}

export async function RequestKycReview(documentFrontPage: string, documentBackPage: string, selfieWithDocument: string): Promise<string> {
  const result = await getActor().upload_document_free_kyc(documentFrontPage, documentBackPage, selfieWithDocument);
  return handleResult(result);
}


// this function is used to get User details and KYC requests documents that are pending review to review by admin
export async function adminGetPendingReviews(): Promise<UserAndFreeKYCSession[]> {
  const result = await getActor().admin_get_pending_reviews();
  return handleResult(result);
}

// this function is used to review a free KYC request
export async function adminReviewFreeKyc(uploadId: string, approved: boolean, notes?: string): Promise<void> {
  console.log('adminReviewFreeKyc', uploadId, approved, notes);
  const result = await getActor().admin_review_free_kyc(uploadId, approved, notes ? [notes] : []);
  console.log('adminReviewFreeKyc result', result);
  handleResult(result);
}






// ============= TRADING OPERATIONS =============

/**
 * Gets user's token holdings
 */
export async function getUserHoldings(principal: Principal): Promise<TokenHolding[]> {
  return await getActor().get_user_holdings(principal);
}



// ============= PLATFORM MANAGEMENT =============

/**
 * Gets trading metrics
 */
export async function getTradingMetrics(): Promise<TradingMetrics> {
  return await getActor().get_trading_metrics();
}



// ============= HELPER FUNCTIONS =============

/**
 * Converts cents to dollars for display
 */
export function centsToDoller(cents: bigint): number {
  return Number(cents) / 100;
}

/**
 * Formats timestamp to readable date
 */
export function formatTimestamp(timestamp: bigint): string {
  return new Date(Number(timestamp) * 1000).toLocaleDateString();
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
 * Gets the list of authorized principals
 */
export function getAuthorizedPrincipals(): Promise<Principal[]> {
  return getActor().get_authorized_principals();
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
