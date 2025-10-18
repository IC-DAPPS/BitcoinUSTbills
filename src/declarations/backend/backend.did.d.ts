import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type BitcoinUSTBillsError = { 'UserAlreadyExists' : null } |
  { 'AccessDenied' : null } |
  { 'InvalidPrincipal' : null } |
  { 'FileStoreBucketError' : string } |
  { 'ValidationError' : string } |
  { 'Unauthorized' : null } |
  { 'KYCExpired' : null } |
  { 'KYCNotVerified' : null } |
  { 'InvalidUserData' : null } |
  { 'StorageError' : string } |
  { 'UserNotFound' : null } |
  { 'AnonymousCaller' : null };
export interface Deposit {
  'id' : bigint,
  'status' : DepositStatus,
  'user_principal' : Principal,
  'updated_at' : bigint,
  'block_index' : bigint,
  'deposit_time' : bigint,
  'ousg_minted' : bigint,
  'created_at' : bigint,
  'btc_price_usd' : number,
  'usd_value' : number,
  'ckbtc_amount' : bigint,
}
export interface DepositRequest {
  'block_index' : bigint,
  'ckbtc_amount' : bigint,
}
export interface DepositResponse {
  'deposit_id' : [] | [bigint],
  'ousg_minted' : [] | [bigint],
  'error_message' : [] | [string],
  'success' : boolean,
}
export type DepositStatus = { 'Failed' : null } |
  { 'Processed' : null } |
  { 'Validated' : null } |
  { 'Pending' : null };
export interface FreeKYCSession {
  'status' : FreeKYCStatus,
  'document_front_page' : string,
  'user_principal' : Principal,
  'reviewed_at' : [] | [bigint],
  'created_at' : bigint,
  'selfie_with_document' : string,
  'needs_manual_review' : boolean,
  'document_back_page' : string,
  'reviewer_notes' : [] | [string],
}
export type FreeKYCStatus = { 'PendingReview' : null } |
  { 'ManualApproved' : null } |
  { 'Rejected' : null } |
  { 'AutoApproved' : null } |
  { 'Processing' : null } |
  { 'Expired' : null };
export type KYCStatus = { 'Rejected' : null } |
  { 'Verified' : null } |
  { 'Expired' : null } |
  { 'Pending' : null };
export interface PublicKeyReply {
  'eth_address' : string,
  'public_key_hex' : string,
}
export type Result = { 'Ok' : Array<UserAndFreeKYCSession> } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_1 = { 'Ok' : null } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_10 = { 'Ok' : string } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_2 = { 'Ok' : boolean } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_3 = { 'Ok' : number } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_4 = { 'Ok' : Deposit } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_5 = { 'Ok' : PublicKeyReply } |
  { 'Err' : string };
export type Result_6 = { 'Ok' : FreeKYCSession } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_7 = { 'Ok' : bigint } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_8 = { 'Ok' : Array<Deposit> } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_9 = { 'Ok' : User } |
  { 'Err' : BitcoinUSTBillsError };
export interface TransferRequest {
  'recipient' : string,
  'contract_address' : string,
  'amount' : string,
}
export interface TransferResponse {
  'transaction_hash' : [] | [string],
  'error_message' : [] | [string],
  'success' : boolean,
}
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
export interface UserAndFreeKYCSession {
  'kyc_session' : FreeKYCSession,
  'user' : User,
}
export interface UserRegistrationRequest {
  'country' : string,
  'email' : string,
  'phone_number' : [] | [string],
}
export interface _SERVICE {
  /**
   * Get pending manual reviews for admins
   */
  'admin_get_pending_reviews' : ActorMethod<[], Result>,
  /**
   * Manual review functions for admins
   */
  'admin_review_free_kyc' : ActorMethod<
    [string, boolean, [] | [string]],
    Result_1
  >,
  /**
   * Calculate USD value of ckBTC amount
   */
  'calculate_ckbtc_usd_value' : ActorMethod<[bigint, number], number>,
  /**
   * Calculate OUSG tokens for USD amount
   */
  'calculate_ousg_for_usd' : ActorMethod<[number], bigint>,
  /**
   * Check if user has approved backend for redemption
   */
  'check_approval_status' : ActorMethod<[Principal, bigint], Result_2>,
  /**
   * Debug function to get all users (for debugging only)
   */
  'get_all_users' : ActorMethod<[], Array<User>>,
  /**
   * Gets the list of authorized principals
   */
  'get_authorized_principals' : ActorMethod<[], Array<Principal>>,
  /**
   * Get current BTC price
   */
  'get_current_btc_price' : ActorMethod<[], Result_3>,
  /**
   * Get deposit by ID
   */
  'get_deposit' : ActorMethod<[bigint], Result_4>,
  /**
   * Get deposit statistics
   */
  'get_deposit_stats' : ActorMethod<[], Array<[string, bigint]>>,
  'get_eth_address' : ActorMethod<[], Result_5>,
  /**
   * Check user's free KYC status
   */
  'get_free_kyc_status' : ActorMethod<[string], Result_6>,
  /**
   * Get latest block number
   */
  'get_latest_block_number' : ActorMethod<[], string>,
  /**
   * Get user's OUSG balance
   */
  'get_ousg_balance' : ActorMethod<[], Result_7>,
  /**
   * Debug function to check total registered users
   */
  'get_total_users' : ActorMethod<[], bigint>,
  /**
   * Get user's deposit history
   */
  'get_user_deposits' : ActorMethod<[], Result_8>,
  /**
   * Retrieves user profile
   */
  'get_user_profile' : ActorMethod<[], Result_9>,
  /**
   * Checks if a user is registered
   */
  'is_user_registered' : ActorMethod<[], boolean>,
  /**
   * User deposits ckBTC and gets OUSG minted (similar to DoxaV3 notifyStake)
   */
  'notify_deposit' : ActorMethod<[DepositRequest], DepositResponse>,
  /**
   * Redeem OUSG tokens for ckBTC
   */
  'redeem_ousg_tokens' : ActorMethod<[bigint], Result_7>,
  /**
   * Registers a new user
   */
  'register_user' : ActorMethod<[UserRegistrationRequest], Result_9>,
  /**
   * Test ERC-20 transfer with hardcoded values
   */
  'test_erc20_transfer' : ActorMethod<[], TransferResponse>,
  /**
   * Transfer ERC-20 tokens
   */
  'transfer_erc20_tokens' : ActorMethod<[TransferRequest], TransferResponse>,
  /**
   * Free Document Upload and OCR Processing
   */
  'upload_document_free_kyc' : ActorMethod<[string, string, string], Result_10>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
