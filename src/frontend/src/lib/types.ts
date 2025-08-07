import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

// Copied from @src/declarations/backend/backend.did.d.ts

export interface AccreditedInvestorCredential {
  'verified_date' : bigint,
  'credential_jws' : string,
  'issuer' : string,
  'expiry_date' : bigint,
  'annual_income_verified' : boolean,
  'net_worth_verified' : boolean,
}
export type ArgumentValue = { 'Int' : number } |
  { 'String' : string };
export type BitcoinUSTBillsError = { 'UserAlreadyExists' : null } |
  { 'VCPreparationFailed' : string } |
  { 'VCInvalidIdAlias' : string } |
  { 'TradingNotAllowed' : null } |
  { 'VCUnsupportedCredentialSpec' : string } |
  { 'AccessDenied' : null } |
  { 'InvalidAmount' : null } |
  { 'TransactionCancelled' : null } |
  { 'MinimumInvestmentNotMet' : null } |
  { 'VCUnsupportedOrigin' : string } |
  { 'HoldingNotFound' : null } |
  { 'DatabaseError' : string } |
  { 'YieldCalculationError' : null } |
  { 'FailedToAddToList' : null } |
  { 'VCConsentMessageUnavailable' : string } |
  { 'VCVerificationFailed' : string } |
  { 'TreasuryDataFetchError' : null } |
  { 'TransactionFailed' : null } |
  { 'MaximumInvestmentExceeded' : null } |
  { 'VCIssuanceFailed' : string } |
  { 'VCCredentialNotFound' : string } |
  { 'VCUnknownSubject' : string } |
  { 'VCCredentialExpired' : string } |
  { 'USTBillSoldOut' : null } |
  { 'SystemError' : string } |
  { 'InvalidPrincipal' : null } |
  { 'HTTPRequestError' : string } |
  { 'HoldingAlreadySold' : null } |
  { 'USTBillMatured' : null } |
  { 'ValidationError' : string } |
  { 'ExternalAPIError' : string } |
  { 'VCInvalidCredentialType' : string } |
  { 'InvalidTokenAmount' : null } |
  { 'USTBillCancelled' : null } |
  { 'InsufficientTokens' : null } |
  { 'InvalidDate' : null } |
  { 'Unauthorized' : null } |
  { 'KYCExpired' : null } |
  { 'KYCNotVerified' : null } |
  { 'PlatformConfigurationError' : null } |
  { 'InvalidCUSIP' : null } |
  { 'VCSignatureNotFound' : string } |
  { 'DidntFindUserData' : null } |
  { 'InvalidHoldingData' : null } |
  { 'USTBillAlreadyExists' : null } |
  { 'InvalidTransactionType' : null } |
  { 'InvalidUserData' : null } |
  { 'VCGenericError' : string } |
  { 'YieldDistributionError' : null } |
  { 'TransactionNotFound' : null } |
  { 'NotImplemented' : null } |
  { 'USTBillNotFound' : null } |
  { 'StorageError' : string } |
  { 'VCUnauthorizedSubject' : string } |
  { 'InvalidYieldRate' : null } |
  { 'VCInternalError' : string } |
  { 'InternalError' : string } |
  { 'InvalidUSTBillData' : null } |
  { 'PlatformFeesCalculationError' : null } |
  { 'SerializationError' : string } |
  { 'UserNotFound' : null } |
  { 'AnonymousCaller' : null } |
  { 'MaturityDatePassed' : null } |
  { 'InsufficientFunds' : null } |
  { 'HoldingMatured' : null };
export interface CredentialSpec {
  'arguments' : [] | [Array<[string, ArgumentValue]>],
  'credential_type' : string,
}
export interface DerivationOriginData { 'origin' : string }
export interface DerivationOriginRequest { 'frontend_hostname' : string }
export interface FreeKYCSession {
  'status' : FreeKYCStatus,
  'user_principal' : Principal,
  'document_type' : string,
  'selfie_bytes' : Uint8Array | number[],
  'reviewed_at' : [] | [bigint],
  'created_at' : bigint,
  'ofac_clear' : boolean,
  'needs_manual_review' : boolean,
  'upload_id' : string,
  'document_bytes' : Uint8Array | number[],
  'calculated_age' : number,
  'ocr_result' : OCRResult,
  'reviewer_notes' : [] | [string],
}
export type FreeKYCStatus = { 'PendingReview' : null } |
  { 'ManualApproved' : null } |
  { 'Rejected' : null } |
  { 'AutoApproved' : null } |
  { 'Processing' : null } |
  { 'Expired' : null };
export interface GetCredentialRequest {
  'signed_id_alias' : SignedIdAlias,
  'prepared_context' : [] | [Uint8Array | number[]],
  'credential_spec' : CredentialSpec,
}
export type HoldingStatus = { 'Sold' : null } |
  { 'Active' : null } |
  { 'Matured' : null } |
  { 'Cancelled' : null };
export interface HttpHeader { 'value' : string, 'name' : string }
export interface HttpResponse {
  'status' : bigint,
  'body' : Uint8Array | number[],
  'headers' : Array<HttpHeader>,
}
export interface Icrc21ConsentInfo {
  'consent_message' : string,
  'language' : string,
}
export interface Icrc21ConsentPreferences { 'language' : string }
export interface Icrc21VcConsentMessageRequest {
  'preferences' : Icrc21ConsentPreferences,
  'credential_spec' : CredentialSpec,
}
export interface IssuedCredentialData { 'vc_jws' : string }
export interface KYCCredential {
  'verification_level' : KYCVerificationLevel,
  'verified_date' : bigint,
  'tier' : number,
  'credential_jws' : string,
  'issuer' : string,
  'expiry_date' : bigint,
}
export type KYCStatus = { 'Rejected' : null } |
  { 'Verified' : null } |
  { 'Expired' : null } |
  { 'Pending' : null };
export type KYCVerificationLevel = { 'Enhanced' : null } |
  { 'Premium' : null } |
  { 'Basic' : null } |
  { 'Institutional' : null };
export interface OCRResult {
  'extracted_country' : string,
  'extracted_name' : string,
  'extracted_dob' : string,
  'raw_text' : string,
  'extracted_document_number' : string,
  'confidence_score' : number,
}
export interface PaginatedResponse {
  'per_page' : bigint,
  'total' : bigint,
  'data' : Array<USTBill>,
  'page' : bigint,
  'has_next' : boolean,
}
export interface PlatformConfig {
  'minimum_investment' : bigint,
  'kyc_expiry_days' : bigint,
  'platform_fee_percentage' : number,
  'yield_distribution_frequency' : bigint,
  'maximum_investment' : bigint,
  'treasury_api_refresh_interval' : bigint,
}
export interface PrepareCredentialRequest {
  'signed_id_alias' : SignedIdAlias,
  'credential_spec' : CredentialSpec,
}
export interface PreparedCredentialData {
  'prepared_context' : [] | [Uint8Array | number[]],
}
export type Result = { 'Ok' : null } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_1 = { 'Ok' : Array<FreeKYCSession> } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_10 = { 'Ok' : UserCredentials } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_11 = { 'Ok' : User } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_12 = { 'Ok' : PaginatedResponse } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_13 = { 'Ok' : YieldProjection } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_14 = { 'Ok' : PreparedCredentialData } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_15 = { 'Ok' : Icrc21ConsentInfo } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_16 = { 'Ok' : TradingEligibility } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_2 = { 'Ok' : TokenHolding } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_3 = { 'Ok' : bigint } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_4 = { 'Ok' : USTBill } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_5 = { 'Ok' : DerivationOriginData } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_6 = { 'Ok' : Array<TreasuryRate> } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_7 = { 'Ok' : IssuedCredentialData } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_8 = { 'Ok' : FreeKYCSession } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_9 = { 'Ok' : string } |
  { 'Err' : BitcoinUSTBillsError };
export interface SignedIdAlias { 'credential_jws' : string }
export interface TokenHolding {
  'id' : string,
  'status' : HoldingStatus,
  'user_principal' : Principal,
  'purchase_price' : bigint,
  'token_id' : bigint,
  'purchase_date' : bigint,
  'yield_option' : YieldOption,
  'current_value' : bigint,
  'projected_yield' : bigint,
  'ustbill_id' : string,
}
export interface TradingEligibility {
  'can_trade' : boolean,
  'compliance_notes' : Array<string>,
  'max_investment_amount' : bigint,
  'requires_accreditation' : boolean,
  'restricted_countries' : Array<string>,
}
export interface TradingMetrics {
  'average_price' : bigint,
  'last_updated' : bigint,
  'lowest_price' : bigint,
  'total_transactions' : bigint,
  'total_volume' : bigint,
  'highest_price' : bigint,
}
export interface TransformArgs {
  'context' : Uint8Array | number[],
  'response' : HttpResponse,
}
export interface TreasuryRate {
  'record_date' : string,
  'rate' : number,
  'cusip' : string,
  'security_desc' : string,
  'security_type' : string,
  'rate_date' : string,
}
export interface USTBill {
  'id' : string,
  'status' : USTBillStatus,
  'updated_at' : bigint,
  'purchase_price' : bigint,
  'owner' : [] | [Principal],
  'face_value' : bigint,
  'cusip' : string,
  'created_at' : bigint,
  'annual_yield' : number,
  'maturity_date' : bigint,
  'issuer' : string,
  'bill_type' : string,
}
export interface USTBillCreateRequest {
  'purchase_price' : bigint,
  'face_value' : bigint,
  'cusip' : string,
  'annual_yield' : number,
  'maturity_date' : bigint,
  'issuer' : string,
  'bill_type' : string,
}
export type USTBillStatus = { 'Active' : null } |
  { 'SoldOut' : null } |
  { 'Matured' : null } |
  { 'Cancelled' : null };
export interface User {
  'updated_at' : bigint,
  'principal' : Principal,
  'country' : string,
  'kyc_tier' : number,
  'last_vc_verification' : [] | [bigint],
  'created_at' : bigint,
  'verified_adult' : boolean,
  'email' : string,
  'total_invested' : bigint,
  'vc_credentials_ref' : [] | [string],
  'max_investment_limit' : bigint,
  'kyc_status' : KYCStatus,
  'verified_resident' : boolean,
  'is_active' : boolean,
  'phone_number' : [] | [string],
  'accredited_investor' : boolean,
  'wallet_balance' : bigint,
  'total_yield_earned' : bigint,
}
export interface UserCredentials {
  'principal' : Principal,
  'last_updated' : bigint,
  'verified_adult' : [] | [VerifiedAdultCredential],
  'verified_resident' : [] | [VerifiedResidentCredential],
  'kyc_credential' : [] | [KYCCredential],
  'accredited_investor' : [] | [AccreditedInvestorCredential],
  'credential_count' : number,
}
export interface UserRegistrationRequest {
  'country' : string,
  'email' : string,
  'phone_number' : [] | [string],
}
export interface VerifiedAdultCredential {
  'verified_date' : bigint,
  'min_age' : number,
  'credential_jws' : string,
  'issuer' : string,
  'expiry_date' : bigint,
}
export interface VerifiedBrokerPurchase {
  'ustbill_type' : string,
  'broker_txn_id' : string,
  'timestamp' : bigint,
  'price' : bigint,
  'amount' : bigint,
}
export interface VerifiedResidentCredential {
  'verified_date' : bigint,
  'credential_jws' : string,
  'issuer' : string,
  'expiry_date' : bigint,
  'country_code' : string,
  'country_name' : string,
}
export type YieldOption = { 'Maturity' : null } |
  { 'Flexible' : null };
export interface YieldProjection {
  'days_to_maturity' : bigint,
  'holding_id' : string,
  'annual_yield_rate' : number,
  'current_value' : bigint,
  'projected_yield' : bigint,
  'yield_percentage' : number,
}
export interface _SERVICE {
  'add_to_list' : ActorMethod<[Principal], Result>,
  'admin_add_broker_purchase_record' : ActorMethod<
    [bigint, bigint, string, string],
    Result
  >,
  'admin_get_pending_reviews' : ActorMethod<[], Result_1>,
  'admin_review_free_kyc' : ActorMethod<[string, boolean, string], Result>,
  'buy_ustbill' : ActorMethod<[string], Result_2>,
  'calculate_current_value' : ActorMethod<[string], Result_3>,
  'calculate_maturity_yield' : ActorMethod<[string], Result_3>,
  'calculate_purchase_cost' : ActorMethod<[string, bigint], Result_3>,
  'create_ustbill' : ActorMethod<[USTBillCreateRequest], Result_4>,
  'deposit_funds' : ActorMethod<[bigint], Result_3>,
  'derivation_origin' : ActorMethod<[DerivationOriginRequest], Result_5>,
  'fetch_treasury_rates' : ActorMethod<[], Result_6>,
  'get_active_ustbills' : ActorMethod<[], Array<USTBill>>,
  'get_all_verified_broker_purchases' : ActorMethod<
    [],
    Array<VerifiedBrokerPurchase>
  >,
  'get_credential' : ActorMethod<[GetCredentialRequest], Result_7>,
  'get_free_kyc_status' : ActorMethod<[string], Result_8>,
  'get_platform_config' : ActorMethod<[], PlatformConfig>,
  'get_principal_data' : ActorMethod<[], Result_9>,
  'get_storage_stats' : ActorMethod<[], Array<[string, bigint]>>,
  'get_trading_metrics' : ActorMethod<[], TradingMetrics>,
  'get_user_credential_status' : ActorMethod<[[] | [Principal]], Result_10>,
  'get_user_holdings' : ActorMethod<[Principal], Array<TokenHolding>>,
  'get_user_profile' : ActorMethod<[Principal], Result_11>,
  'get_ustbill' : ActorMethod<[string], Result_4>,
  'get_ustbill_availability' : ActorMethod<[string], Result_3>,
  'get_ustbills_paginated' : ActorMethod<[bigint, bigint], Result_12>,
  'get_yield_projection' : ActorMethod<[string], Result_13>,
  'prepare_credential' : ActorMethod<[PrepareCredentialRequest], Result_14>,
  'register_user' : ActorMethod<[UserRegistrationRequest], Result_11>,
  'set_principal_data' : ActorMethod<[string], Result>,
  'test_func' : ActorMethod<[], Result_9>,
  'transform_treasury_response' : ActorMethod<[TransformArgs], HttpResponse>,
  'update_kyc_status' : ActorMethod<[Principal, KYCStatus], Result>,
  'update_platform_config' : ActorMethod<[PlatformConfig], Result>,
  'update_ustbill_market_data' : ActorMethod<[], Result>,
  'upload_document_free_kyc' : ActorMethod<
    [Uint8Array | number[], string, Uint8Array | number[]],
    Result_9
  >,
  'vc_consent_message' : ActorMethod<
    [Icrc21VcConsentMessageRequest],
    Result_15
  >,
  'verify_user_credentials' : ActorMethod<[[] | [Principal]], Result_16>,
  'withdraw_funds' : ActorMethod<[bigint], Result_3>,
}

// Additional frontend-specific types
export interface AppConfig {
  environment: "local" | "ic";
  canisterId: string;
}

export interface ApiResponse<T> {
  Ok?: T;
  Err?: BitcoinUSTBillsError;
}

// UI State Management Types
export interface DashboardData {
  user: User | null;
  holdings: TokenHolding[];
  availableUSTBills: USTBill[];
  totalPortfolioValue: number;
  totalYieldEarned: number;
  tradingMetrics: TradingMetrics;
}

export interface TransactionFormData {
  amount: string;
  ustbillId?: string;
  tokenAmount?: string;
}

export interface UserRegistrationFormData {
  email: string;
  phoneNumber?: string;
  country: string;
}

export interface USTBillCreateFormData {
  cusip: string;
  faceValue: string;
  purchasePrice: string;
  maturityDate: string;
  annualYield: string;
  issuer: string;
  billType: string;
}

// Form validation types
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface FormErrors {
  [key: string]: string;
}

// Chart and Analytics Types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface YieldChartData {
  historical: ChartDataPoint[];
  projected: ChartDataPoint[];
}

export interface PortfolioBreakdown {
  ustbillId: string;
  ustbillType: string;
  allocation: number;
  currentValue: number;
  yieldEarned: number;
}

// Notification and Status Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  duration?: number;
}

export interface LoadingState {
  [key: string]: boolean;
}

// Filter and Search Types
export interface USTBillFilters {
  status?: USTBillStatus[];
  billType?: string[];
  minYield?: number;
  maxYield?: number;
  maturityRange?: {
    start: Date;
    end: Date;
  };
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  perPage: number;
}

// Investment Calculator Types
export interface InvestmentCalculation {
  purchaseCost: number;
  fees: number;
  totalCost: number;
  projectedYield: number;
  maturityValue: number;
  roi: number;
}

// Admin Panel Types
export interface AdminStats {
  totalUsers: number;
  totalUSTBills: number;
  totalTradingVolume: number;
  pendingKYC: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export interface KYCReviewData {
  user: User;
  documents: string[];
  notes: string;
  decision: KYCStatus;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type OptionalExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export type ApiCallStatus = 'idle' | 'loading' | 'success' | 'error';

// Theme and UI Types
export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
}

export interface LayoutConfig {
  sidebarCollapsed: boolean;
  pageTitle: string;
  breadcrumbs: { label: string; href?: string }[];
}

// Error Boundary Types
export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

export interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  resetError: () => void;
}

// Date and Time Utilities
export interface DateRange {
  start: Date;
  end: Date;
}

export interface TimeseriesData {
  timestamp: number;
  value: number;
  metadata?: Record<string, any>;
}

// Websocket/Real-time Updates (for future use)
export interface RealtimeUpdate {
  type: 'price_update' | 'new_transaction' | 'status_change';
  data: any;
  timestamp: number;
}

export interface SubscriptionOptions {
  ustbillIds?: string[];
  userPrincipal?: Principal;
  eventTypes?: string[];
}

// Feature Flags (for gradual rollouts)
export interface FeatureFlags {
  [key: string]: boolean;
}

// Analytics and Tracking
export interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: Date;
  userId?: string;
}

export interface UserActivity {
  action: string;
  resource: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Export convenience types for common patterns
export type USTBillWithAvailability = USTBill & {
  availableTokens: number;
  daysToMaturity: number;
};

export type UserWithPortfolio = User & {
  holdings: TokenHolding[];
  portfolioValue: number;
  portfolioBreakdown: PortfolioBreakdown[];
};

export type ExtendedTokenHolding = TokenHolding & {
  ustbill: USTBill;
  currentYield: number;
  daysHeld: number;
  roi: number;
};

// Constants for type guards
export const USTBillStatusValues = ['Active', 'SoldOut', 'Matured', 'Cancelled'] as const;
export const KYCStatusValues = ['Pending', 'Verified', 'Rejected', 'Expired'] as const;
export const HoldingStatusValues = ['Active', 'Sold', 'Matured', 'Cancelled'] as const;
export const YieldOptionValues = ['Maturity', 'Flexible'] as const;

// Type guards
export function isUSTBillStatus(value: any): value is USTBillStatus {
  return typeof value === 'object' && value !== null &&
    USTBillStatusValues.some(status => status in value);
}

export function isKYCStatus(value: any): value is KYCStatus {
  return typeof value === 'object' && value !== null &&
    KYCStatusValues.some(status => status in value);
}

export function isHoldingStatus(value: any): value is HoldingStatus {
  return typeof value === 'object' && value !== null &&
    HoldingStatusValues.some(status => status in value);
}

export function isYieldOption(value: any): value is YieldOption {
  return typeof value === 'object' && value !== null &&
    YieldOptionValues.some(option => option in value);
}

// Utility function to extract enum value
export function getEnumValue<T extends Record<string, null>>(enumObj: T): keyof T {
  return Object.keys(enumObj)[0] as keyof T;
}

// Error type helpers
export function isBitcoinUSTBillsError(value: any): value is BitcoinUSTBillsError {
  return typeof value === 'object' && value !== null &&
    Object.keys(value).length === 1;
}

export function isApiResponse<T>(value: any): value is ApiResponse<T> {
  return typeof value === 'object' && value !== null &&
    ('Ok' in value || 'Err' in value);
}