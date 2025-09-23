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
export type Result_2 = { 'Ok' : PublicKeyReply } |
  { 'Err' : string };
export type Result_3 = { 'Ok' : FreeKYCSession } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_4 = { 'Ok' : User } |
  { 'Err' : BitcoinUSTBillsError };
export type Result_5 = { 'Ok' : string } |
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
  'admin_get_pending_reviews' : ActorMethod<[], Result>,
  'admin_review_free_kyc' : ActorMethod<
    [string, boolean, [] | [string]],
    Result_1
  >,
  'get_authorized_principals' : ActorMethod<[], Array<Principal>>,
  'get_eth_address' : ActorMethod<[], Result_2>,
  'get_free_kyc_status' : ActorMethod<[string], Result_3>,
  'get_latest_block_number' : ActorMethod<[], string>,
  'get_user_profile' : ActorMethod<[], Result_4>,
  'is_user_registered' : ActorMethod<[], boolean>,
  'register_user' : ActorMethod<[UserRegistrationRequest], Result_4>,
  'test_erc20_transfer' : ActorMethod<[], TransferResponse>,
  'transfer_erc20_tokens' : ActorMethod<[TransferRequest], TransferResponse>,
  'upload_document_free_kyc' : ActorMethod<[string, string, string], Result_5>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
