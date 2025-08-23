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
    'TradingNotAllowed' : IDL.Null,
    'AccessDenied' : IDL.Null,
    'InvalidAmount' : IDL.Null,
    'TransactionCancelled' : IDL.Null,
    'MinimumInvestmentNotMet' : IDL.Null,
    'HoldingNotFound' : IDL.Null,
    'DatabaseError' : IDL.Text,
    'YieldCalculationError' : IDL.Null,
    'FailedToAddToList' : IDL.Null,
    'TreasuryDataFetchError' : IDL.Null,
    'TransactionFailed' : IDL.Null,
    'MaximumInvestmentExceeded' : IDL.Null,
    'USTBillSoldOut' : IDL.Null,
    'SystemError' : IDL.Text,
    'InvalidPrincipal' : IDL.Null,
    'FileStoreBucketError' : IDL.Text,
    'HTTPRequestError' : IDL.Text,
    'HoldingAlreadySold' : IDL.Null,
    'USTBillMatured' : IDL.Null,
    'ValidationError' : IDL.Text,
    'ExternalAPIError' : IDL.Text,
    'InvalidTokenAmount' : IDL.Null,
    'USTBillCancelled' : IDL.Null,
    'InsufficientTokens' : IDL.Null,
    'InvalidDate' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'KYCExpired' : IDL.Null,
    'KYCNotVerified' : IDL.Null,
    'PlatformConfigurationError' : IDL.Null,
    'InvalidCUSIP' : IDL.Null,
    'DidntFindUserData' : IDL.Null,
    'InvalidHoldingData' : IDL.Null,
    'USTBillAlreadyExists' : IDL.Null,
    'InvalidTransactionType' : IDL.Null,
    'InvalidUserData' : IDL.Null,
    'YieldDistributionError' : IDL.Null,
    'TransactionNotFound' : IDL.Null,
    'NotImplemented' : IDL.Null,
    'USTBillNotFound' : IDL.Null,
    'StorageError' : IDL.Text,
    'InvalidYieldRate' : IDL.Null,
    'InternalError' : IDL.Text,
    'InvalidUSTBillData' : IDL.Null,
    'PlatformFeesCalculationError' : IDL.Null,
    'SerializationError' : IDL.Text,
    'UserNotFound' : IDL.Null,
    'AnonymousCaller' : IDL.Null,
    'MaturityDatePassed' : IDL.Null,
    'InsufficientFunds' : IDL.Null,
    'HoldingMatured' : IDL.Null,
  });
  const Result = IDL.Variant({
    'Ok' : IDL.Vec(UserAndFreeKYCSession),
    'Err' : BitcoinUSTBillsError,
  });
  const Result_1 = IDL.Variant({
    'Ok' : IDL.Null,
    'Err' : BitcoinUSTBillsError,
  });
  const USTBillStatus = IDL.Variant({
    'Active' : IDL.Null,
    'SoldOut' : IDL.Null,
    'Matured' : IDL.Null,
    'Cancelled' : IDL.Null,
  });
  const USTBill = IDL.Record({
    'id' : IDL.Text,
    'status' : USTBillStatus,
    'updated_at' : IDL.Nat64,
    'purchase_price' : IDL.Nat64,
    'owner' : IDL.Opt(IDL.Principal),
    'face_value' : IDL.Nat64,
    'cusip' : IDL.Text,
    'created_at' : IDL.Nat64,
    'annual_yield' : IDL.Float64,
    'maturity_date' : IDL.Nat64,
    'issuer' : IDL.Text,
    'bill_type' : IDL.Text,
  });
  const Result_2 = IDL.Variant({
    'Ok' : FreeKYCSession,
    'Err' : BitcoinUSTBillsError,
  });
  const TradingMetrics = IDL.Record({
    'average_price' : IDL.Nat64,
    'last_updated' : IDL.Nat64,
    'lowest_price' : IDL.Nat64,
    'total_transactions' : IDL.Nat64,
    'total_volume' : IDL.Nat64,
    'highest_price' : IDL.Nat64,
  });
  const HoldingStatus = IDL.Variant({
    'Active' : IDL.Null,
    'Matured' : IDL.Null,
  });
  const TokenHolding = IDL.Record({
    'id' : IDL.Text,
    'status' : HoldingStatus,
    'user_principal' : IDL.Principal,
    'purchase_price' : IDL.Nat64,
    'token_id' : IDL.Nat64,
    'purchase_date' : IDL.Nat64,
    'current_value' : IDL.Nat64,
    'projected_yield' : IDL.Nat64,
    'ustbill_id' : IDL.Text,
  });
  const Result_3 = IDL.Variant({ 'Ok' : User, 'Err' : BitcoinUSTBillsError });
  const UserRegistrationRequest = IDL.Record({
    'country' : IDL.Text,
    'email' : IDL.Text,
    'phone_number' : IDL.Opt(IDL.Text),
  });
  const HttpHeader = IDL.Record({ 'value' : IDL.Text, 'name' : IDL.Text });
  const HttpResponse = IDL.Record({
    'status' : IDL.Nat,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HttpHeader),
  });
  const TransformArgs = IDL.Record({
    'context' : IDL.Vec(IDL.Nat8),
    'response' : HttpResponse,
  });
  const Result_4 = IDL.Variant({
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
    'get_active_ustbills' : IDL.Func([], [IDL.Vec(USTBill)], ['query']),
    'get_authorized_principals' : IDL.Func(
        [],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'get_free_kyc_status' : IDL.Func([IDL.Text], [Result_2], ['query']),
    'get_trading_metrics' : IDL.Func([], [TradingMetrics], ['query']),
    'get_user_holdings' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(TokenHolding)],
        ['query'],
      ),
    'get_user_profile' : IDL.Func([], [Result_3], ['query']),
    'is_user_registered' : IDL.Func([], [IDL.Bool], ['query']),
    'register_user' : IDL.Func([UserRegistrationRequest], [Result_3], []),
    'transform_treasury_response' : IDL.Func(
        [TransformArgs],
        [HttpResponse],
        ['query'],
      ),
    'upload_document_free_kyc' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [Result_4],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
