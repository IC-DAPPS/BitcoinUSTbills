import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

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
export type HoldingStatus = { 'Active' : null } |
  { 'Matured' : null };
export interface HttpHeader { 'value' : string, 'name' : string }
export interface HttpResponse {
  'status' : bigint,
  'body' : Uint8Array | number[],
  'headers' : Array<HttpHeader>,
}
export type KYCStatus = { 'Rejected' : null } |
  { 'Verified' : null } |
  { 'Expired' : null } |
  { 'Pending' : null };
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
export type Result = { 'Ok' : null } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_1 = { 'Ok' : Array<FreeKYCSession> } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_10 = { 'Ok' : string } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_2 = { 'Ok' : TokenHolding } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_3 = { 'Ok' : bigint } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_4 = { 'Ok' : USTBill } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_5 = { 'Ok' : Array<TreasuryRate> } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_6 = { 'Ok' : FreeKYCSession } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_7 = { 'Ok' : User } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_8 = { 'Ok' : PaginatedResponse } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_9 = { 'Ok' : YieldProjection } |
  { 'Err' : BitcoinUSTBillsError };
export interface TokenHolding {
  'id' : string,
  'status' : HoldingStatus,
  'user_principal' : Principal,
  'purchase_price' : bigint,
  'token_id' : bigint,
  'purchase_date' : bigint,
  'current_value' : bigint,
  'projected_yield' : bigint,
  'ustbill_id' : string,
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
export interface UserRegistrationRequest {
  'country' : string,
  'email' : string,
  'phone_number' : [] | [string],
}
export interface VerifiedBrokerPurchase {
  'ustbill_type' : string,
  'broker_txn_id' : string,
  'timestamp' : bigint,
  'price' : bigint,
  'amount' : bigint,
}
export interface YieldProjection {
  'days_to_maturity' : bigint,
  'holding_id' : string,
  'annual_yield_rate' : number,
  'current_value' : bigint,
  'projected_yield' : bigint,
  'yield_percentage' : number,
}
export interface _SERVICE {
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
  'fetch_treasury_rates' : ActorMethod<[], Result_5>,
  'get_active_ustbills' : ActorMethod<[], Array<USTBill>>,
  'get_all_verified_broker_purchases' : ActorMethod<
    [],
    Array<VerifiedBrokerPurchase>
  >,
  'get_free_kyc_status' : ActorMethod<[string], Result_6>,
  'get_platform_config' : ActorMethod<[], PlatformConfig>,
  'get_storage_stats' : ActorMethod<[], Array<[string, bigint]>>,
  'get_trading_metrics' : ActorMethod<[], TradingMetrics>,
  'get_user_holdings' : ActorMethod<[Principal], Array<TokenHolding>>,
  'get_user_profile' : ActorMethod<[], Result_7>,
  'get_ustbill' : ActorMethod<[string], Result_4>,
  'get_ustbill_availability' : ActorMethod<[string], Result_3>,
  'get_ustbills_paginated' : ActorMethod<[bigint, bigint], Result_8>,
  'get_yield_projection' : ActorMethod<[string], Result_9>,
  'is_user_registered' : ActorMethod<[], boolean>,
  'register_user' : ActorMethod<[UserRegistrationRequest], Result_7>,
  'transform_treasury_response' : ActorMethod<[TransformArgs], HttpResponse>,
  'update_kyc_status' : ActorMethod<[Principal, KYCStatus], Result>,
  'update_platform_config' : ActorMethod<[PlatformConfig], Result>,
  'update_ustbill_market_data' : ActorMethod<[], Result>,
  'upload_document_free_kyc' : ActorMethod<
    [Uint8Array | number[], string, Uint8Array | number[]],
    Result_10
  >,
  'withdraw_funds' : ActorMethod<[bigint], Result_3>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
