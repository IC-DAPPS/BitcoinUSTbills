export const idlFactory = ({ IDL }) => {
  const FreeKYCStatus = IDL.Variant({
    'PendingReview' : IDL.Null,
    'ManualApproved' : IDL.Null,
    'Rejected' : IDL.Null,
    'AutoApproved' : IDL.Null,
    'Processing' : IDL.Null,
    'Expired' : IDL.Null,
  });
  const FreeKYCSession = IDL.Record({
    'status' : FreeKYCStatus,
    'document_front_page' : IDL.Text,
    'user_principal' : IDL.Principal,
    'reviewed_at' : IDL.Opt(IDL.Nat64),
    'created_at' : IDL.Nat64,
    'selfie_with_document' : IDL.Text,
    'needs_manual_review' : IDL.Bool,
    'document_back_page' : IDL.Text,
    'reviewer_notes' : IDL.Opt(IDL.Text),
  });
  const KYCStatus = IDL.Variant({
    'Rejected' : IDL.Null,
    'Verified' : IDL.Null,
    'Expired' : IDL.Null,
    'Pending' : IDL.Null,
  });
  const User = IDL.Record({
    'updated_at' : IDL.Nat64,
    'principal' : IDL.Principal,
    'country' : IDL.Text,
    'kyc_tier' : IDL.Nat8,
    'last_vc_verification' : IDL.Opt(IDL.Nat64),
    'created_at' : IDL.Nat64,
    'verified_adult' : IDL.Bool,
    'email' : IDL.Text,
    'total_invested' : IDL.Nat64,
    'vc_credentials_ref' : IDL.Opt(IDL.Text),
    'max_investment_limit' : IDL.Nat64,
    'kyc_status' : KYCStatus,
    'verified_resident' : IDL.Bool,
    'is_active' : IDL.Bool,
    'phone_number' : IDL.Opt(IDL.Text),
    'accredited_investor' : IDL.Bool,
    'wallet_balance' : IDL.Nat64,
    'total_yield_earned' : IDL.Nat64,
  });
  const UserAndFreeKYCSession = IDL.Record({
    'kyc_session' : FreeKYCSession,
    'user' : User,
  });
  const BitcoinUSTBillsError = IDL.Variant({
    'UserAlreadyExists' : IDL.Null,
    'AccessDenied' : IDL.Null,
    'InvalidPrincipal' : IDL.Null,
    'FileStoreBucketError' : IDL.Text,
    'ValidationError' : IDL.Text,
    'Unauthorized' : IDL.Null,
    'KYCExpired' : IDL.Null,
    'KYCNotVerified' : IDL.Null,
    'InvalidUserData' : IDL.Null,
    'StorageError' : IDL.Text,
    'UserNotFound' : IDL.Null,
    'AnonymousCaller' : IDL.Null,
  });
  const Result = IDL.Variant({
    'Ok' : IDL.Vec(UserAndFreeKYCSession),
    'Err' : BitcoinUSTBillsError,
  });
  const Result_1 = IDL.Variant({
    'Ok' : IDL.Null,
    'Err' : BitcoinUSTBillsError,
  });
  const PublicKeyReply = IDL.Record({
    'eth_address' : IDL.Text,
    'public_key_hex' : IDL.Text,
  });
  const Result_2 = IDL.Variant({ 'Ok' : PublicKeyReply, 'Err' : IDL.Text });
  const Result_3 = IDL.Variant({
    'Ok' : FreeKYCSession,
    'Err' : BitcoinUSTBillsError,
  });
  const Result_4 = IDL.Variant({ 'Ok' : User, 'Err' : BitcoinUSTBillsError });
  const UserRegistrationRequest = IDL.Record({
    'country' : IDL.Text,
    'email' : IDL.Text,
    'phone_number' : IDL.Opt(IDL.Text),
  });
  const TransferResponse = IDL.Record({
    'transaction_hash' : IDL.Opt(IDL.Text),
    'error_message' : IDL.Opt(IDL.Text),
    'success' : IDL.Bool,
  });
  const TransferRequest = IDL.Record({
    'recipient' : IDL.Text,
    'contract_address' : IDL.Text,
    'amount' : IDL.Text,
  });
  const Result_5 = IDL.Variant({
    'Ok' : IDL.Text,
    'Err' : BitcoinUSTBillsError,
  });
  return IDL.Service({
    'admin_get_pending_reviews' : IDL.Func([], [Result], ['query']),
    'admin_review_free_kyc' : IDL.Func(
        [IDL.Text, IDL.Bool, IDL.Opt(IDL.Text)],
        [Result_1],
        [],
      ),
    'get_authorized_principals' : IDL.Func(
        [],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'get_eth_address' : IDL.Func([], [Result_2], []),
    'get_free_kyc_status' : IDL.Func([IDL.Text], [Result_3], ['query']),
    'get_latest_block_number' : IDL.Func([], [IDL.Text], []),
    'get_user_profile' : IDL.Func([], [Result_4], ['query']),
    'is_user_registered' : IDL.Func([], [IDL.Bool], ['query']),
    'register_user' : IDL.Func([UserRegistrationRequest], [Result_4], []),
    'test_erc20_transfer' : IDL.Func([], [TransferResponse], []),
    'transfer_erc20_tokens' : IDL.Func(
        [TransferRequest],
        [TransferResponse],
        [],
      ),
    'upload_document_free_kyc' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [Result_5],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
