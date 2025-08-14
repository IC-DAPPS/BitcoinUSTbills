export const idlFactory = ({ IDL }) => {
  const BitcoinUSTBillsError = IDL.Variant({
    'UserAlreadyExists' : IDL.Null,
    'VCPreparationFailed' : IDL.Text,
    'VCInvalidIdAlias' : IDL.Text,
    'TradingNotAllowed' : IDL.Null,
    'VCUnsupportedCredentialSpec' : IDL.Text,
    'AccessDenied' : IDL.Null,
    'InvalidAmount' : IDL.Null,
    'TransactionCancelled' : IDL.Null,
    'MinimumInvestmentNotMet' : IDL.Null,
    'VCUnsupportedOrigin' : IDL.Text,
    'HoldingNotFound' : IDL.Null,
    'DatabaseError' : IDL.Text,
    'YieldCalculationError' : IDL.Null,
    'FailedToAddToList' : IDL.Null,
    'VCConsentMessageUnavailable' : IDL.Text,
    'VCVerificationFailed' : IDL.Text,
    'TreasuryDataFetchError' : IDL.Null,
    'TransactionFailed' : IDL.Null,
    'MaximumInvestmentExceeded' : IDL.Null,
    'VCIssuanceFailed' : IDL.Text,
    'VCCredentialNotFound' : IDL.Text,
    'VCUnknownSubject' : IDL.Text,
    'VCCredentialExpired' : IDL.Text,
    'USTBillSoldOut' : IDL.Null,
    'SystemError' : IDL.Text,
    'InvalidPrincipal' : IDL.Null,
    'HTTPRequestError' : IDL.Text,
    'HoldingAlreadySold' : IDL.Null,
    'USTBillMatured' : IDL.Null,
    'ValidationError' : IDL.Text,
    'ExternalAPIError' : IDL.Text,
    'VCInvalidCredentialType' : IDL.Text,
    'InvalidTokenAmount' : IDL.Null,
    'USTBillCancelled' : IDL.Null,
    'InsufficientTokens' : IDL.Null,
    'InvalidDate' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'KYCExpired' : IDL.Null,
    'KYCNotVerified' : IDL.Null,
    'PlatformConfigurationError' : IDL.Null,
    'InvalidCUSIP' : IDL.Null,
    'VCSignatureNotFound' : IDL.Text,
    'DidntFindUserData' : IDL.Null,
    'InvalidHoldingData' : IDL.Null,
    'USTBillAlreadyExists' : IDL.Null,
    'InvalidTransactionType' : IDL.Null,
    'InvalidUserData' : IDL.Null,
    'VCGenericError' : IDL.Text,
    'YieldDistributionError' : IDL.Null,
    'TransactionNotFound' : IDL.Null,
    'NotImplemented' : IDL.Null,
    'USTBillNotFound' : IDL.Null,
    'StorageError' : IDL.Text,
    'VCUnauthorizedSubject' : IDL.Text,
    'InvalidYieldRate' : IDL.Null,
    'VCInternalError' : IDL.Text,
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
  const Result = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : BitcoinUSTBillsError });
  const FreeKYCStatus = IDL.Variant({
    'PendingReview' : IDL.Null,
    'ManualApproved' : IDL.Null,
    'Rejected' : IDL.Null,
    'AutoApproved' : IDL.Null,
    'Processing' : IDL.Null,
    'Expired' : IDL.Null,
  });
  const OCRResult = IDL.Record({
    'extracted_country' : IDL.Text,
    'extracted_name' : IDL.Text,
    'extracted_dob' : IDL.Text,
    'raw_text' : IDL.Text,
    'extracted_document_number' : IDL.Text,
    'confidence_score' : IDL.Float32,
  });
  const FreeKYCSession = IDL.Record({
    'status' : FreeKYCStatus,
    'user_principal' : IDL.Principal,
    'document_type' : IDL.Text,
    'selfie_bytes' : IDL.Vec(IDL.Nat8),
    'reviewed_at' : IDL.Opt(IDL.Nat64),
    'created_at' : IDL.Nat64,
    'ofac_clear' : IDL.Bool,
    'needs_manual_review' : IDL.Bool,
    'upload_id' : IDL.Text,
    'document_bytes' : IDL.Vec(IDL.Nat8),
    'calculated_age' : IDL.Nat8,
    'ocr_result' : OCRResult,
    'reviewer_notes' : IDL.Opt(IDL.Text),
  });
  const Result_1 = IDL.Variant({
    'Ok' : IDL.Vec(FreeKYCSession),
    'Err' : BitcoinUSTBillsError,
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
  const Result_2 = IDL.Variant({
    'Ok' : TokenHolding,
    'Err' : BitcoinUSTBillsError,
  });
  const Result_3 = IDL.Variant({
    'Ok' : IDL.Nat64,
    'Err' : BitcoinUSTBillsError,
  });
  const USTBillCreateRequest = IDL.Record({
    'purchase_price' : IDL.Nat64,
    'face_value' : IDL.Nat64,
    'cusip' : IDL.Text,
    'annual_yield' : IDL.Float64,
    'maturity_date' : IDL.Nat64,
    'issuer' : IDL.Text,
    'bill_type' : IDL.Text,
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
  const Result_4 = IDL.Variant({
    'Ok' : USTBill,
    'Err' : BitcoinUSTBillsError,
  });
  const DerivationOriginRequest = IDL.Record({
    'frontend_hostname' : IDL.Text,
  });
  const DerivationOriginData = IDL.Record({ 'origin' : IDL.Text });
  const Result_5 = IDL.Variant({
    'Ok' : DerivationOriginData,
    'Err' : BitcoinUSTBillsError,
  });
  const TreasuryRate = IDL.Record({
    'record_date' : IDL.Text,
    'rate' : IDL.Float64,
    'cusip' : IDL.Text,
    'security_desc' : IDL.Text,
    'security_type' : IDL.Text,
    'rate_date' : IDL.Text,
  });
  const Result_6 = IDL.Variant({
    'Ok' : IDL.Vec(TreasuryRate),
    'Err' : BitcoinUSTBillsError,
  });
  const VerifiedBrokerPurchase = IDL.Record({
    'ustbill_type' : IDL.Text,
    'broker_txn_id' : IDL.Text,
    'timestamp' : IDL.Nat64,
    'price' : IDL.Nat64,
    'amount' : IDL.Nat64,
  });
  const SignedIdAlias = IDL.Record({ 'credential_jws' : IDL.Text });
  const ArgumentValue = IDL.Variant({ 'Int' : IDL.Int32, 'String' : IDL.Text });
  const CredentialSpec = IDL.Record({
    'arguments' : IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, ArgumentValue))),
    'credential_type' : IDL.Text,
  });
  const GetCredentialRequest = IDL.Record({
    'signed_id_alias' : SignedIdAlias,
    'prepared_context' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'credential_spec' : CredentialSpec,
  });
  const IssuedCredentialData = IDL.Record({ 'vc_jws' : IDL.Text });
  const Result_7 = IDL.Variant({
    'Ok' : IssuedCredentialData,
    'Err' : BitcoinUSTBillsError,
  });
  const Result_8 = IDL.Variant({
    'Ok' : FreeKYCSession,
    'Err' : BitcoinUSTBillsError,
  });
  const PlatformConfig = IDL.Record({
    'minimum_investment' : IDL.Nat64,
    'kyc_expiry_days' : IDL.Nat64,
    'platform_fee_percentage' : IDL.Float64,
    'yield_distribution_frequency' : IDL.Nat64,
    'maximum_investment' : IDL.Nat64,
    'treasury_api_refresh_interval' : IDL.Nat64,
  });
  const Result_9 = IDL.Variant({
    'Ok' : IDL.Text,
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
  const VerifiedAdultCredential = IDL.Record({
    'verified_date' : IDL.Nat64,
    'min_age' : IDL.Nat8,
    'credential_jws' : IDL.Text,
    'issuer' : IDL.Text,
    'expiry_date' : IDL.Nat64,
  });
  const VerifiedResidentCredential = IDL.Record({
    'verified_date' : IDL.Nat64,
    'credential_jws' : IDL.Text,
    'issuer' : IDL.Text,
    'expiry_date' : IDL.Nat64,
    'country_code' : IDL.Text,
    'country_name' : IDL.Text,
  });
  const KYCCredential = IDL.Record({
    'verified_date' : IDL.Nat64,
    'tier' : IDL.Nat8,
    'credential_jws' : IDL.Text,
    'issuer' : IDL.Text,
    'expiry_date' : IDL.Nat64,
  });
  const AccreditedInvestorCredential = IDL.Record({
    'verified_date' : IDL.Nat64,
    'credential_jws' : IDL.Text,
    'issuer' : IDL.Text,
    'expiry_date' : IDL.Nat64,
    'annual_income_verified' : IDL.Bool,
    'net_worth_verified' : IDL.Bool,
  });
  const UserCredentials = IDL.Record({
    'principal' : IDL.Principal,
    'last_updated' : IDL.Nat64,
    'verified_adult' : IDL.Opt(VerifiedAdultCredential),
    'verified_resident' : IDL.Opt(VerifiedResidentCredential),
    'kyc_credential' : IDL.Opt(KYCCredential),
    'accredited_investor' : IDL.Opt(AccreditedInvestorCredential),
    'credential_count' : IDL.Nat32,
  });
  const Result_10 = IDL.Variant({
    'Ok' : UserCredentials,
    'Err' : BitcoinUSTBillsError,
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
  const Result_11 = IDL.Variant({ 'Ok' : User, 'Err' : BitcoinUSTBillsError });
  const PaginatedResponse = IDL.Record({
    'per_page' : IDL.Nat64,
    'total' : IDL.Nat64,
    'data' : IDL.Vec(USTBill),
    'page' : IDL.Nat64,
    'has_next' : IDL.Bool,
  });
  const Result_12 = IDL.Variant({
    'Ok' : PaginatedResponse,
    'Err' : BitcoinUSTBillsError,
  });
  const YieldProjection = IDL.Record({
    'days_to_maturity' : IDL.Nat64,
    'holding_id' : IDL.Text,
    'annual_yield_rate' : IDL.Float64,
    'current_value' : IDL.Nat64,
    'projected_yield' : IDL.Nat64,
    'yield_percentage' : IDL.Float64,
  });
  const Result_13 = IDL.Variant({
    'Ok' : YieldProjection,
    'Err' : BitcoinUSTBillsError,
  });
  const PrepareCredentialRequest = IDL.Record({
    'signed_id_alias' : SignedIdAlias,
    'credential_spec' : CredentialSpec,
  });
  const PreparedCredentialData = IDL.Record({
    'prepared_context' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const Result_14 = IDL.Variant({
    'Ok' : PreparedCredentialData,
    'Err' : BitcoinUSTBillsError,
  });
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
  const Icrc21ConsentPreferences = IDL.Record({ 'language' : IDL.Text });
  const Icrc21VcConsentMessageRequest = IDL.Record({
    'preferences' : Icrc21ConsentPreferences,
    'credential_spec' : CredentialSpec,
  });
  const Icrc21ConsentInfo = IDL.Record({
    'consent_message' : IDL.Text,
    'language' : IDL.Text,
  });
  const Result_15 = IDL.Variant({
    'Ok' : Icrc21ConsentInfo,
    'Err' : BitcoinUSTBillsError,
  });
  const TradingEligibility = IDL.Record({
    'can_trade' : IDL.Bool,
    'compliance_notes' : IDL.Vec(IDL.Text),
    'max_investment_amount' : IDL.Nat64,
    'requires_accreditation' : IDL.Bool,
    'restricted_countries' : IDL.Vec(IDL.Text),
  });
  const Result_16 = IDL.Variant({
    'Ok' : TradingEligibility,
    'Err' : BitcoinUSTBillsError,
  });
  return IDL.Service({
    'add_to_list' : IDL.Func([IDL.Principal], [Result], []),
    'admin_add_broker_purchase_record' : IDL.Func(
        [IDL.Nat64, IDL.Nat64, IDL.Text, IDL.Text],
        [Result],
        [],
      ),
    'admin_get_pending_reviews' : IDL.Func([], [Result_1], ['query']),
    'admin_review_free_kyc' : IDL.Func(
        [IDL.Text, IDL.Bool, IDL.Text],
        [Result],
        [],
      ),
    'buy_ustbill' : IDL.Func([IDL.Text], [Result_2], []),
    'calculate_current_value' : IDL.Func([IDL.Text], [Result_3], ['query']),
    'calculate_maturity_yield' : IDL.Func([IDL.Text], [Result_3], []),
    'calculate_purchase_cost' : IDL.Func(
        [IDL.Text, IDL.Nat64],
        [Result_3],
        ['query'],
      ),
    'create_ustbill' : IDL.Func([USTBillCreateRequest], [Result_4], []),
    'deposit_funds' : IDL.Func([IDL.Nat64], [Result_3], []),
    'derivation_origin' : IDL.Func(
        [DerivationOriginRequest],
        [Result_5],
        ['query'],
      ),
    'fetch_treasury_rates' : IDL.Func([], [Result_6], []),
    'get_active_ustbills' : IDL.Func([], [IDL.Vec(USTBill)], ['query']),
    'get_all_verified_broker_purchases' : IDL.Func(
        [],
        [IDL.Vec(VerifiedBrokerPurchase)],
        ['query'],
      ),
    'get_credential' : IDL.Func([GetCredentialRequest], [Result_7], ['query']),
    'get_free_kyc_status' : IDL.Func([IDL.Text], [Result_8], ['query']),
    'get_platform_config' : IDL.Func([], [PlatformConfig], ['query']),
    'get_principal_data' : IDL.Func([], [Result_9], ['query']),
    'get_storage_stats' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat64))],
        ['query'],
      ),
    'get_trading_metrics' : IDL.Func([], [TradingMetrics], ['query']),
    'get_user_credential_status' : IDL.Func(
        [IDL.Opt(IDL.Principal)],
        [Result_10],
        ['query'],
      ),
    'get_user_holdings' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(TokenHolding)],
        ['query'],
      ),
    'get_user_profile' : IDL.Func([IDL.Principal], [Result_11], ['query']),
    'get_ustbill' : IDL.Func([IDL.Text], [Result_4], ['query']),
    'get_ustbill_availability' : IDL.Func([IDL.Text], [Result_3], ['query']),
    'get_ustbills_paginated' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [Result_12],
        ['query'],
      ),
    'get_yield_projection' : IDL.Func([IDL.Text], [Result_13], ['query']),
    'prepare_credential' : IDL.Func(
        [PrepareCredentialRequest],
        [Result_14],
        [],
      ),
    'register_user' : IDL.Func([UserRegistrationRequest], [Result_11], []),
    'set_principal_data' : IDL.Func([IDL.Text], [Result], []),
    'test_func' : IDL.Func([], [Result_9], []),
    'transform_treasury_response' : IDL.Func(
        [TransformArgs],
        [HttpResponse],
        ['query'],
      ),
    'update_kyc_status' : IDL.Func([IDL.Principal, KYCStatus], [Result], []),
    'update_platform_config' : IDL.Func([PlatformConfig], [Result], []),
    'update_ustbill_market_data' : IDL.Func([], [Result], []),
    'upload_document_free_kyc' : IDL.Func(
        [IDL.Vec(IDL.Nat8), IDL.Text, IDL.Vec(IDL.Nat8)],
        [Result_9],
        [],
      ),
    'vc_consent_message' : IDL.Func(
        [Icrc21VcConsentMessageRequest],
        [Result_15],
        ['query'],
      ),
    'verify_user_credentials' : IDL.Func(
        [IDL.Opt(IDL.Principal)],
        [Result_16],
        [],
      ),
    'withdraw_funds' : IDL.Func([IDL.Nat64], [Result_3], []),
  });
};
export const init = ({ IDL }) => { return []; };
