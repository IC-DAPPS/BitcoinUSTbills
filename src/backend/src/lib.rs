#![allow(dead_code)]
#![warn(unused_variables)]

// Module declarations
mod errors;
mod guard;
mod handlers;
mod storage;
mod store;
// mod token; // Temporarily disabled for demo
mod types;
mod utils;

// Re-export types for easier access
pub use errors::*;
pub use guard::*;
pub use storage::*;
pub use store::*;
pub use types::*;

use crate::storage::VerifiedPurchasesLedgerStorage;
use crate::utils::get_current_timestamp;
use candid::Principal;
use ic_cdk::api::management_canister::http_request::{HttpResponse, TransformArgs};
use ic_cdk::{query, update};
use std::collections::HashMap;

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                  VERIFIED BROKER PURCHASE FUNCTIONS                        ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

#[update]
pub fn admin_add_broker_purchase_record(
    amount: u64,
    price: u64,
    broker_txn_id: String,
    ustbill_type: String,
) -> Result<()> {
    guard::assert_admin()?;

    let purchase = VerifiedBrokerPurchase {
        amount,
        price,
        timestamp: get_current_timestamp(),
        broker_txn_id,
        ustbill_type,
    };

    VerifiedPurchasesLedgerStorage::insert(purchase)
}

#[query]
pub fn get_all_verified_broker_purchases() -> Vec<VerifiedBrokerPurchase> {
    VerifiedPurchasesLedgerStorage::get_all()
}

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                  USTBILLS CANISTER FUNCTIONS                        ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

/// Creates a new US Treasury Bill offering
#[update]
pub fn create_ustbill(ustbill_data: USTBillCreateRequest) -> Result<USTBill> {
    // Validate admin access
    guard::assert_admin()?;

    // Validate input data
    validate_ustbill_data(&ustbill_data)?;

    let current_time = get_current_timestamp();

    let ustbill = USTBill {
        id: generate_id(),
        cusip: ustbill_data.cusip,
        face_value: ustbill_data.face_value,
        purchase_price: ustbill_data.purchase_price,
        maturity_date: ustbill_data.maturity_date,
        annual_yield: ustbill_data.annual_yield,
        owner: None, // Available for purchase
        status: USTBillStatus::Active,
        created_at: current_time,
        updated_at: current_time,
        issuer: ustbill_data.issuer,
        bill_type: ustbill_data.bill_type,
    };

    // Store in database
    USTBillStorage::insert(ustbill.clone())?;

    Ok(ustbill)
}

/// Retrieves a US Treasury Bill by ID
#[query]
pub fn get_ustbill(ustbill_id: String) -> Result<USTBill> {
    USTBillStorage::get(&ustbill_id)
}

/// Retrieves all active US Treasury Bills
#[query]
pub fn get_active_ustbills() -> Vec<USTBill> {
    USTBillStorage::get_active()
}

/// Checks if a US Treasury Bill is available for purchase (single ownership model)
#[query]
pub fn get_ustbill_availability(ustbill_id: String) -> Result<u64> {
    let ustbill = USTBillStorage::get(&ustbill_id)?;
    Ok(if ustbill.owner.is_none() { 1 } else { 0 })
}

/// Retrieves paginated list of US Treasury Bills
#[query]
pub fn get_ustbills_paginated(page: usize, per_page: usize) -> Result<PaginatedResponse<USTBill>> {
    let ustbills = USTBillStorage::get_all();
    let total = ustbills.len();

    let start = page * per_page;
    let end = std::cmp::min(start + per_page, total);

    let data = if start < total {
        ustbills[start..end].to_vec()
    } else {
        vec![]
    };

    Ok(PaginatedResponse {
        data,
        total,
        page,
        per_page,
        has_next: end < total,
    })
}

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                  USER CANISTER FUNCTIONS                        ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

/// Registers a new user
#[update]
pub fn register_user(user_data: UserRegistrationRequest) -> Result<User> {
    let principal = ic_cdk::api::msg_caller();

    // Check if user already exists
    if UserStorage::get(&principal).is_ok() {
        return Err(BitcoinUSTBillsError::UserAlreadyExists);
    }

    // Validate user data
    validate_user_data(&user_data)?;

    let current_time = get_current_timestamp();

    let user = User {
        principal,
        email: user_data.email,
        kyc_status: KYCStatus::Pending,
        wallet_balance: 0,
        total_invested: 0,
        total_yield_earned: 0,
        created_at: current_time,
        updated_at: current_time,
        is_active: true,
        phone_number: user_data.phone_number,
        country: user_data.country,

        // VC-related fields
        vc_credentials_ref: None,
        last_vc_verification: None,
        verified_adult: false,
        verified_resident: false,
        kyc_tier: 0,
        accredited_investor: false,
        max_investment_limit: 0,
    };

    UserStorage::insert(user.clone())?;

    Ok(user)
}

/// Updates KYC status for a user
#[update]
pub fn update_kyc_status(principal: Principal, status: KYCStatus) -> Result<()> {
    // Validate admin access
    guard::assert_admin()?;

    let mut user = UserStorage::get(&principal)?;
    user.kyc_status = status;
    user.updated_at = get_current_timestamp();

    UserStorage::update(user)?;

    Ok(())
}

/// Retrieves user profile
#[query]
pub fn get_user_profile(principal: Principal) -> Result<User> {
    UserStorage::get(&principal)
}

/// Deposits funds to user wallet
#[update]
pub fn deposit_funds(amount: u64) -> Result<u64> {
    let principal = ic_cdk::api::msg_caller();
    let mut user = UserStorage::get(&principal)?;

    // Validate amount
    if amount == 0 {
        return Err(BitcoinUSTBillsError::InvalidAmount);
    }

    // Update user balance
    user.wallet_balance += amount;
    user.updated_at = get_current_timestamp();

    UserStorage::update(user.clone())?;

    // Record transaction
    let transaction = Transaction {
        id: generate_id(),
        user_principal: principal,
        transaction_type: TransactionType::Deposit,
        amount,
        ustbill_id: None,
        holding_id: None,
        timestamp: get_current_timestamp(),
        status: TransactionStatus::Completed,
        fees: 0,
        description: "Wallet deposit".to_string(),
    };

    TransactionStorage::insert(transaction)?;

    Ok(user.wallet_balance)
}

/// Withdraws funds from user wallet
#[update]
pub fn withdraw_funds(amount: u64) -> Result<u64> {
    let principal = ic_cdk::api::msg_caller();
    let mut user = UserStorage::get(&principal)?;

    // Validate amount
    if amount == 0 {
        return Err(BitcoinUSTBillsError::InvalidAmount);
    }

    if user.wallet_balance < amount {
        return Err(BitcoinUSTBillsError::InsufficientFunds);
    }

    // Update user balance
    user.wallet_balance -= amount;
    user.updated_at = get_current_timestamp();

    UserStorage::update(user.clone())?;

    // Record transaction
    let transaction = Transaction {
        id: generate_id(),
        user_principal: principal,
        transaction_type: TransactionType::Withdrawal,
        amount,
        ustbill_id: None,
        holding_id: None,
        timestamp: get_current_timestamp(),
        status: TransactionStatus::Completed,
        fees: 0,
        description: "Wallet withdrawal".to_string(),
    };

    TransactionStorage::insert(transaction)?;

    Ok(user.wallet_balance)
}

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                  TRADING CANISTER FUNCTIONS                        ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

/// Buys entire US Treasury Bill (single ownership model)
#[update]
pub fn buy_ustbill(ustbill_id: String) -> Result<TokenHolding> {
    let principal = ic_cdk::api::msg_caller();
    let mut user = UserStorage::get(&principal)?;

    // Validate user eligibility
    if !user.is_eligible_for_trading() {
        return Err(BitcoinUSTBillsError::TradingNotAllowed);
    }

    // Get UST Bill
    let mut ustbill = USTBillStorage::get(&ustbill_id)?;

    // Validate UST Bill availability (single ownership model)
    if !ustbill.is_available_for_purchase() {
        return Err(BitcoinUSTBillsError::USTBillSoldOut);
    }

    // Purchase cost is the full bill price
    let cost = ustbill.purchase_price;
    let config = PlatformConfigStorage::get();

    // Validate investment limits
    if cost < config.minimum_investment {
        return Err(BitcoinUSTBillsError::MinimumInvestmentNotMet);
    }

    if cost > config.maximum_investment {
        return Err(BitcoinUSTBillsError::MaximumInvestmentExceeded);
    }

    // Check user balance
    if user.wallet_balance < cost {
        return Err(BitcoinUSTBillsError::InsufficientFunds);
    }

    // Calculate fees
    let fees = (cost as f64 * config.platform_fee_percentage) as u64;
    let total_cost = cost + fees;

    // Update user balance
    user.wallet_balance -= total_cost;
    user.total_invested += cost;
    user.updated_at = get_current_timestamp();

    // Update UST Bill (single ownership model)
    ustbill.owner = Some(principal);
    ustbill.status = USTBillStatus::SoldOut;
    ustbill.updated_at = get_current_timestamp();

    // Create holding
    let holding_id = generate_id();
    let token_id = 1; // Single token representing ownership of the entire bill
    let holding = TokenHolding {
        id: holding_id.clone(),
        user_principal: principal,
        ustbill_id: ustbill_id.clone(),
        token_id,
        purchase_price: cost,
        purchase_date: get_current_timestamp(),
        yield_option: YieldOption::Maturity,
        status: HoldingStatus::Active,
        current_value: cost,
        projected_yield: calculate_projected_yield(&ustbill, cost),
    };

    // Record transaction
    let transaction = Transaction {
        id: generate_id(),
        user_principal: principal,
        transaction_type: TransactionType::Purchase,
        amount: cost,
        ustbill_id: Some(ustbill_id.clone()),
        holding_id: Some(holding_id.clone()),
        timestamp: get_current_timestamp(),
        status: TransactionStatus::Completed,
        fees,
        description: format!("Purchase of UST Bill {}", ustbill_id),
    };

    // Record fees transaction
    let fee_transaction = Transaction {
        id: generate_id(),
        user_principal: principal,
        transaction_type: TransactionType::Fee,
        amount: fees,
        ustbill_id: Some(ustbill_id.clone()),
        holding_id: Some(holding_id.clone()),
        timestamp: get_current_timestamp(),
        status: TransactionStatus::Completed,
        fees: 0,
        description: "Platform fee".to_string(),
    };

    // TODO: ICRC1 token minting (temporarily disabled for demo)
    // let token_block_index = token::mint_bill_token(principal, ustbill_id.clone()).await?;
    // ic_cdk::api::print!(&format!("Token minted at block index: {}", token_block_index));

    // Save all updates
    UserStorage::update(user)?;
    USTBillStorage::update(ustbill)?;
    HoldingStorage::insert(holding.clone())?;
    TransactionStorage::insert(transaction)?;
    TransactionStorage::insert(fee_transaction)?;

    // Update trading metrics
    TradingMetricsStorage::update_volume(cost)?;
    TradingMetricsStorage::update_price(cost)?;

    Ok(holding)
}

/// Calculates purchase cost for UST Bill (single ownership model)
#[query]
pub fn calculate_purchase_cost(ustbill_id: String, _token_amount: u64) -> Result<u64> {
    let ustbill = USTBillStorage::get(&ustbill_id)?;
    calculate_purchase_cost_internal(&ustbill, 1)
}

/// Calculates current value of a holding
#[query]
pub fn calculate_current_value(holding_id: String) -> Result<u64> {
    let holding = HoldingStorage::get(&holding_id)?;
    let ustbill = USTBillStorage::get(&holding.ustbill_id)?;

    // Calculate based on current market conditions and time to maturity
    let _days_to_maturity = ustbill.days_to_maturity();
    let purchase_date = holding.purchase_date;
    let current_time = get_current_timestamp();
    let days_held = (current_time - purchase_date) / 86400; // Convert to days

    // Calculate accrued yield
    let accrued_yield = holding.calculate_current_yield(ustbill.annual_yield, days_held);

    Ok(holding.current_value + accrued_yield)
}

/// Retrieves user holdings
#[query]
pub fn get_user_holdings(principal: Principal) -> Vec<TokenHolding> {
    HoldingStorage::get_by_user(&principal)
}

// TODO: ICRC1 functions (temporarily disabled for demo)
// /// Gets user's ICRC1 token balance
// #[update]
// pub async fn get_user_token_balance(principal: Principal) -> Result<u64> {
//     token::get_token_balance(principal).await
// }

// /// Gets token metadata (name, symbol, decimals)
// #[update]
// pub async fn get_token_info() -> Result<(String, String, u8)> {
//     token::get_token_metadata().await
// }

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                  YIELD CANISTER FUNCTIONS                        ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

/// Calculates maturity yield for a holding
#[update]
pub fn calculate_maturity_yield(holding_id: String) -> Result<u64> {
    let holding = HoldingStorage::get(&holding_id)?;
    let ustbill = USTBillStorage::get(&holding.ustbill_id)?;

    // Check if UST Bill has matured
    let current_time = get_current_timestamp();
    if ustbill.maturity_date <= current_time {
        // Calculate full yield (single ownership model)
        let purchase_value = holding.purchase_price;
        let face_value = ustbill.face_value; // User owns the entire bill
        let yield_amount = face_value - purchase_value;

        Ok(yield_amount)
    } else {
        Err(BitcoinUSTBillsError::MaturityDatePassed)
    }
}

/// Gets yield projection for a holding
#[query]
pub fn get_yield_projection(holding_id: String) -> Result<YieldProjection> {
    let holding = HoldingStorage::get(&holding_id)?;
    let ustbill = USTBillStorage::get(&holding.ustbill_id)?;

    let current_value = holding.current_value;
    let days_to_maturity = ustbill.days_to_maturity();
    let annual_yield_rate = ustbill.annual_yield;

    // Calculate projected yield
    let projected_yield =
        (current_value as f64 * annual_yield_rate * days_to_maturity as f64 / 365.0) as u64;
    let yield_percentage = if current_value > 0 {
        (projected_yield as f64 / current_value as f64) * 100.0
    } else {
        0.0
    };

    Ok(YieldProjection {
        holding_id,
        current_value,
        projected_yield,
        yield_percentage,
        days_to_maturity,
        annual_yield_rate,
    })
}

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                  EXTERNAL API INTEGRATION                        ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

/// Fetches current Treasury rates from external API
#[update]
pub async fn fetch_treasury_rates() -> Result<Vec<TreasuryRate>> {
    // For now, return a mock response until we can properly configure HTTP requests
    // This is a placeholder implementation
    let mock_rates = vec![TreasuryRate {
        record_date: "2024-01-01".to_string(),
        security_type: "T-Bill".to_string(),
        security_desc: "13-Week Treasury Bill".to_string(),
        rate_date: "2024-01-01".to_string(),
        rate: 5.26,
        cusip: "912796RF6".to_string(),
    }];

    // Store rates in database
    TreasuryRateStorage::clear()?;
    for rate in &mock_rates {
        TreasuryRateStorage::insert(rate.clone())?;
    }

    Ok(mock_rates)

    // TODO: Implement actual HTTP request once we have proper configuration
    // let url = "https://api.fiscaldata.treasury.gov/services/api/v1/accounting/od/rates_of_exchange";
    //
    // let request = HttpRequestType {
    //     url: url.to_string(),
    //     method: HttpMethod::GET,
    //     headers: vec![],
    //     body: None,
    //     transform: Some(TransformContext::from_name("transform_treasury_response".to_string(), vec![])),
    // };
    //
    // match http_request(request, 10_000_000_000).await {
    //     Ok((response,)) => {
    //         let rates = parse_treasury_response(response)?;
    //
    //         // Store rates in database
    //         TreasuryRateStorage::clear()?;
    //         for rate in &rates {
    //             TreasuryRateStorage::insert(rate.clone())?;
    //         }
    //
    //         Ok(rates)
    //     }
    //     Err(e) => Err(BitcoinUSTBillsError::http_request_error(format!("HTTP request failed: {:?}", e))),
    // }
}

/// Updates UST Bill market data
#[update]
pub async fn update_ustbill_market_data() -> Result<()> {
    let _rates = fetch_treasury_rates().await?;
    // Update logic would go here to sync with external data
    Ok(())
}

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                  PLATFORM MANAGEMENT                        ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

/// Gets platform configuration
#[query]
pub fn get_platform_config() -> PlatformConfig {
    PlatformConfigStorage::get()
}

/// Updates platform configuration (admin only)
#[update]
pub fn update_platform_config(config: PlatformConfig) -> Result<()> {
    guard::assert_admin()?;
    PlatformConfigStorage::update(config)
}

/// Gets trading metrics
#[query]
pub fn get_trading_metrics() -> TradingMetrics {
    TradingMetricsStorage::get()
}

/// Gets storage statistics
#[query]
pub fn get_storage_stats() -> HashMap<String, u64> {
    storage::get_storage_stats()
}

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                  HELPER FUNCTIONS                        ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

pub fn validate_ustbill_data(data: &USTBillCreateRequest) -> Result<()> {
    if data.cusip.is_empty() {
        return Err(BitcoinUSTBillsError::InvalidCUSIP);
    }

    if data.annual_yield < 0.0 || data.annual_yield > 1.0 {
        return Err(BitcoinUSTBillsError::InvalidYieldRate);
    }

    let current_time = get_current_timestamp();
    if data.maturity_date <= current_time {
        return Err(BitcoinUSTBillsError::InvalidDate);
    }

    Ok(())
}

pub fn validate_user_data(data: &UserRegistrationRequest) -> Result<()> {
    if data.email.is_empty() || !data.email.contains('@') {
        return Err(BitcoinUSTBillsError::validation_error(
            "Invalid email format",
        ));
    }

    if data.country.is_empty() {
        return Err(BitcoinUSTBillsError::validation_error(
            "Country is required",
        ));
    }

    Ok(())
}

pub fn calculate_purchase_cost_internal(ustbill: &USTBill, _token_amount: u64) -> Result<u64> {
    // In single ownership model, cost is always the full bill price
    Ok(ustbill.purchase_price)
}

pub fn calculate_projected_yield(ustbill: &USTBill, investment: u64) -> u64 {
    let days_to_maturity = ustbill.days_to_maturity();
    (investment as f64 * ustbill.annual_yield * days_to_maturity as f64 / 365.0) as u64
}

fn parse_treasury_response(response: HttpResponse) -> Result<Vec<TreasuryRate>> {
    let body = String::from_utf8(response.body)
        .map_err(|_| BitcoinUSTBillsError::external_api_error("Invalid response body"))?;

    let api_response: TreasuryApiResponse = serde_json::from_str(&body).map_err(|_| {
        BitcoinUSTBillsError::external_api_error("Failed to parse Treasury API response")
    })?;

    Ok(api_response.data)
}

#[query]
fn transform_treasury_response(response: TransformArgs) -> HttpResponse {
    let mut res = response.response;
    res.headers.clear();
    res
}

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                  LEGACY FUNCTIONS (for backward compatibility)                        ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

#[ic_cdk::query]
fn get_principal_data() -> Result<String> {
    let principal = ic_cdk::api::msg_caller();
    match UserStorage::get(&principal) {
        Ok(user) => Ok(user.email),
        Err(_) => Err(BitcoinUSTBillsError::DidntFindUserData),
    }
}

#[ic_cdk::update]
fn set_principal_data(s: String) -> Result<()> {
    let principal = ic_cdk::api::msg_caller();
    match UserStorage::get(&principal) {
        Ok(mut user) => {
            user.email = s;
            UserStorage::update(user)?;
            Ok(())
        }
        Err(_) => Err(BitcoinUSTBillsError::DidntFindUserData),
    }
}

#[update]
pub fn test_func() -> Result<String> {
    guard::assert_admin()?;
    Ok("test_func with admin guard".to_string())
}

#[update]
pub fn add_to_list(p: Principal) -> Result<()> {
    guard::assert_admin()?;
    guard::add_to_list(p);
    Ok(())
}

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                  VERIFIABLE CREDENTIALS ISSUER FUNCTIONS                    ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

/// Returns a consent message for the user to approve VC issuance
#[query]
pub fn vc_consent_message(request: Icrc21VcConsentMessageRequest) -> Result<Icrc21ConsentInfo> {
    let credential_type = &request.credential_spec.credential_type;
    let language = &request.preferences.language;

    let consent_message = match credential_type.as_str() {
        "VerifiedAdult" => {
            format!(
                "BitcoinUSTbills is requesting to verify that you are 18+ years old. \
                This verification is required for trading US Treasury Bills. \
                Your age information will be securely stored and used only for compliance purposes."
            )
        }
        "VerifiedResident" => {
            let country = request
                .credential_spec
                .arguments
                .as_ref()
                .and_then(|args| args.iter().find(|(k, _)| k == "countryName"))
                .map(|(_, v)| match v {
                    ArgumentValue::String(s) => s.clone(),
                    _ => "Unknown".to_string(),
                })
                .unwrap_or_else(|| "Unknown".to_string());

            format!(
                "BitcoinUSTbills is requesting to verify your country of residence as {}. \
                This verification is required for regulatory compliance and may affect \
                your trading limits and available features.",
                country
            )
        }
        "KYCVerified" => {
            format!(
                "BitcoinUSTbills is requesting to verify your identity for KYC compliance. \
                This includes verification of your government-issued ID and address. \
                This is required for trading US Treasury Bills and ensures platform security."
            )
        }
        "AccreditedInvestor" => {
            format!(
                "BitcoinUSTbills is requesting to verify your accredited investor status. \
                This verification allows access to higher investment limits and exclusive features. \
                Your financial information will be kept strictly confidential."
            )
        }
        _ => {
            return Err(BitcoinUSTBillsError::VCUnsupportedCredentialSpec(
                credential_type.clone(),
            ));
        }
    };

    Ok(Icrc21ConsentInfo {
        consent_message,
        language: language.clone(),
    })
}

/// Returns the derivation origin for principal derivation
#[query]
pub fn derivation_origin(_request: DerivationOriginRequest) -> Result<DerivationOriginData> {
    // For now, return the default canister URL
    // In production, you might want to validate the frontend_hostname
    let canister_id = ic_cdk::id();
    let origin = format!("https://{}.icp0.io", canister_id);

    Ok(DerivationOriginData { origin })
}

/// Prepares a credential for issuance (Step 1 of 2-step process)
#[update]
pub fn prepare_credential(request: PrepareCredentialRequest) -> Result<PreparedCredentialData> {
    let caller = ic_cdk::caller();

    // Validate that caller is not anonymous
    if caller == Principal::anonymous() {
        return Err(BitcoinUSTBillsError::AnonymousCaller);
    }

    // Validate credential spec
    let credential_type = &request.credential_spec.credential_type;
    if !is_supported_credential_type(credential_type) {
        return Err(BitcoinUSTBillsError::VCUnsupportedCredentialSpec(
            credential_type.clone(),
        ));
    }

    // TODO: Validate signed_id_alias.credential_jws
    // For now, we'll skip JWT validation and assume it's valid

    // Check if user exists and is eligible for this credential
    let user = UserStorage::get(&caller)?;
    if !user.is_active {
        return Err(BitcoinUSTBillsError::VCUnauthorizedSubject(
            "User account is not active".to_string(),
        ));
    }

    // Generate a context ID for this preparation
    let context_id = format!("{}_{}", caller.to_text(), get_current_timestamp());

    // Create prepared context (contains information needed for get_credential)
    let prepared_context = PreparedCredentialData {
        prepared_context: Some(context_id.clone().into_bytes()),
    };

    // Store the prepared context temporarily
    VCPreparedContextsStorage::insert(context_id.clone(), prepared_context.clone())?;

    Ok(prepared_context)
}

/// Issues the actual credential (Step 2 of 2-step process)
#[query]
pub fn get_credential(request: GetCredentialRequest) -> Result<IssuedCredentialData> {
    let caller = ic_cdk::caller();

    // Validate that caller is not anonymous
    if caller == Principal::anonymous() {
        return Err(BitcoinUSTBillsError::AnonymousCaller);
    }

    // Validate prepared context if provided
    let context_id = if let Some(context_bytes) = &request.prepared_context {
        String::from_utf8(context_bytes.clone()).map_err(|_| {
            BitcoinUSTBillsError::VCInvalidIdAlias("Invalid context format".to_string())
        })?
    } else {
        return Err(BitcoinUSTBillsError::VCPreparationFailed(
            "Prepared context required".to_string(),
        ));
    };

    // Retrieve prepared context
    let _prepared_data = VCPreparedContextsStorage::get(&context_id).ok_or_else(|| {
        BitcoinUSTBillsError::VCPreparationFailed(
            "Prepared context not found or expired".to_string(),
        )
    })?;

    // Generate the actual credential JWT
    let vc_jws = generate_credential_jwt(&request, &caller)?;

    // Store the credential for the user
    store_user_credential(&request, &caller, &vc_jws)?;

    // Clean up prepared context
    VCPreparedContextsStorage::remove(&context_id);

    Ok(IssuedCredentialData { vc_jws })
}

/// Get user's credential status
#[query]
pub fn get_user_credential_status(principal: Option<Principal>) -> Result<UserCredentials> {
    let caller = principal.unwrap_or_else(|| ic_cdk::caller());

    // Only allow users to check their own credentials or admin
    if caller != ic_cdk::caller() {
        guard::assert_admin()?;
    }

    VCCredentialsStorage::get(&caller).ok_or_else(|| {
        BitcoinUSTBillsError::VCCredentialNotFound("No credentials found for user".to_string())
    })
}

/// Verify user credentials and return trading eligibility
#[update]
pub async fn verify_user_credentials(principal: Option<Principal>) -> Result<TradingEligibility> {
    let caller = principal.unwrap_or_else(|| ic_cdk::caller());

    // Only allow users to check their own credentials or admin
    if caller != ic_cdk::caller() {
        guard::assert_admin()?;
    }

    let credentials = VCCredentialsStorage::get(&caller).ok_or_else(|| {
        BitcoinUSTBillsError::VCCredentialNotFound("No credentials found for user".to_string())
    })?;

    Ok(credentials.get_trading_eligibility())
}

// ============= VC HELPER FUNCTIONS =============

/// Check if a credential type is supported
fn is_supported_credential_type(credential_type: &str) -> bool {
    matches!(
        credential_type,
        "VerifiedAdult" | "VerifiedResident" | "KYCVerified" | "AccreditedInvestor"
    )
}

// ============= FREE KYC MVP IMPLEMENTATION =============
// Start with free options, upgrade later to paid services

/// Free Document Upload and OCR Processing
#[update]
pub async fn upload_document_free_kyc(
    document_bytes: Vec<u8>,
    document_type: String, // "passport", "drivers_license", "national_id"
    selfie_bytes: Vec<u8>,
) -> Result<String> {
    let caller = ic_cdk::caller();

    // Validate that caller is not anonymous
    if caller == Principal::anonymous() {
        return Err(BitcoinUSTBillsError::AnonymousCaller);
    }

    // Basic file size validation (free)
    if document_bytes.len() > 5_000_000 {
        // 5MB limit
        return Err(BitcoinUSTBillsError::ValidationError(
            "Document file too large (max 5MB)".to_string(),
        ));
    }

    if selfie_bytes.len() > 2_000_000 {
        // 2MB limit
        return Err(BitcoinUSTBillsError::ValidationError(
            "Selfie file too large (max 2MB)".to_string(),
        ));
    }

    // Generate upload ID
    let upload_id = format!("FREE_KYC_{}_{}", caller.to_text(), get_current_timestamp());

    // Step 1: OFAC Sanctions Check (Free)
    ic_cdk::println!("🔍 Running free OFAC sanctions check...");
    // TODO: Implement OFAC check with extracted name

    // Step 2: Basic OCR Processing (Free with tesseract-rs)
    ic_cdk::println!("📄 Processing document with free OCR...");
    let ocr_result =
        process_document_ocr_free(document_bytes.clone(), document_type.clone()).await?;

    // Step 3: Basic Validation (Free)
    validate_ocr_result(&ocr_result)?;

    // Step 4: Calculate age (Free)
    let age = calculate_age_from_dob(&ocr_result.extracted_dob)?;

    // Step 5: Store for manual review if needed (Free)
    let needs_review = ocr_result.confidence_score < 0.8 || age < 18;

    let kyc_session = FreeKYCSession {
        upload_id: upload_id.clone(),
        user_principal: caller,
        document_type,
        document_bytes,
        selfie_bytes,
        ocr_result: ocr_result.clone(),
        calculated_age: age,
        ofac_clear: true, // TODO: Implement actual OFAC check
        needs_manual_review: needs_review,
        status: if needs_review {
            FreeKYCStatus::PendingReview
        } else {
            FreeKYCStatus::AutoApproved
        },
        created_at: get_current_timestamp(),
        reviewed_at: None,
        reviewer_notes: None,
    };

    // Store session
    FreeKYCStorage::insert(upload_id.clone(), kyc_session.clone())?;

    // Auto-approve if confidence is high and age check passes
    if !needs_review && age >= 18 {
        issue_free_kyc_credential(caller, &kyc_session).await?;
        ic_cdk::println!("✅ Auto-approved KYC for user: {}", caller.to_text());
    } else {
        ic_cdk::println!("⏳ Queued for manual review: {}", upload_id);
    }

    Ok(upload_id)
}

/// Process document with free OCR (using tesseract concept)
async fn process_document_ocr_free(
    _document_bytes: Vec<u8>,
    document_type: String,
) -> Result<OCRResult> {
    // TODO: Implement actual OCR using tesseract-rs
    // For now, return demo OCR result

    // Simulate OCR processing delay
    ic_cdk::println!("🔄 Running OCR on {} document...", document_type);

    // Demo OCR result (replace with real OCR)
    let demo_result = OCRResult {
        extracted_name: "Demo User".to_string(),
        extracted_dob: "1990-01-01".to_string(),
        extracted_document_number: "DEMO123456".to_string(),
        extracted_country: "US".to_string(),
        confidence_score: 0.85, // 85% confidence
        raw_text:
            "DEMO OCR OUTPUT - PASSPORT\nName: Demo User\nDOB: 01/01/1990\nDocument No: DEMO123456"
                .to_string(),
    };

    Ok(demo_result)
}

/// Free OFAC sanctions screening
async fn check_ofac_sanctions_free(full_name: &str) -> Result<bool> {
    // TODO: Download and parse OFAC XML file
    // https://www.treasury.gov/ofac/downloads/sanctions/1.0/sdn_advanced.xml

    ic_cdk::println!("🔍 Checking OFAC sanctions for: {}", full_name);

    // Demo implementation - in production, parse actual OFAC XML
    let suspicious_names = vec!["OSAMA", "TERROR", "SANCTION", "BLOCK"];
    let name_upper = full_name.to_uppercase();

    for suspicious in suspicious_names {
        if name_upper.contains(suspicious) {
            return Ok(false); // Found in sanctions list
        }
    }

    Ok(true) // Clear of sanctions
}

/// Manual review functions for admins
#[update]
pub async fn admin_review_free_kyc(upload_id: String, approved: bool, notes: String) -> Result<()> {
    guard::assert_admin()?;

    let mut kyc_session = FreeKYCStorage::get(&upload_id)?;

    kyc_session.status = if approved {
        FreeKYCStatus::ManualApproved
    } else {
        FreeKYCStatus::Rejected
    };
    kyc_session.reviewed_at = Some(get_current_timestamp());
    kyc_session.reviewer_notes = Some(notes);

    if approved {
        // Issue VC after manual approval
        issue_free_kyc_credential(kyc_session.user_principal, &kyc_session).await?;
        ic_cdk::println!(
            "✅ Manual approval for: {}",
            kyc_session.user_principal.to_text()
        );
    } else {
        ic_cdk::println!(
            "❌ Manual rejection for: {}",
            kyc_session.user_principal.to_text()
        );
    }

    FreeKYCStorage::update(upload_id, kyc_session)?;
    Ok(())
}

/// Get pending manual reviews for admins
#[query]
pub fn admin_get_pending_reviews() -> Result<Vec<FreeKYCSession>> {
    guard::assert_admin()?;

    let all_sessions = FreeKYCStorage::get_all();
    let pending: Vec<FreeKYCSession> = all_sessions
        .into_iter()
        .filter(|(_, session)| session.status == FreeKYCStatus::PendingReview)
        .map(|(_, session)| session)
        .collect();

    Ok(pending)
}

/// Issue credential after free KYC verification
async fn issue_free_kyc_credential(
    user_principal: Principal,
    kyc_session: &FreeKYCSession,
) -> Result<()> {
    let current_time = get_current_timestamp();
    let expiry_time = current_time + (365 * 24 * 60 * 60); // 1 year

    // Get or create user credentials
    let mut user_credentials = VCCredentialsStorage::get(&user_principal)
        .unwrap_or_else(|| UserCredentials::new(user_principal));

    // Add adult credential if age verified
    if kyc_session.calculated_age >= 18 {
        user_credentials.add_adult_credential(VerifiedAdultCredential {
            min_age: 18,
            verified_date: current_time,
            expiry_date: expiry_time,
            issuer: "BitcoinUSTbills_Free_KYC".to_string(),
            credential_jws: format!(
                "free_kyc_adult_{}_{}",
                user_principal.to_text(),
                current_time
            ),
        });
    }

    // Add resident credential based on document
    user_credentials.add_resident_credential(VerifiedResidentCredential {
        country_code: kyc_session.ocr_result.extracted_country.clone(),
        country_name: get_country_name(&kyc_session.ocr_result.extracted_country),
        verified_date: current_time,
        expiry_date: expiry_time,
        issuer: "BitcoinUSTbills_Free_KYC".to_string(),
        credential_jws: format!(
            "free_kyc_resident_{}_{}",
            user_principal.to_text(),
            current_time
        ),
    });

    // Store credentials
    VCCredentialsStorage::update(user_principal, user_credentials)?;

    // Update user record
    if let Ok(mut user) = UserStorage::get(&user_principal) {
        user.last_vc_verification = Some(current_time);
        user.verified_adult = kyc_session.calculated_age >= 18;
        user.verified_resident = true;
        user.kyc_tier = 1; // Basic free KYC
        user.max_investment_limit = 100000; // $1,000 limit for free KYC
        UserStorage::update(user)?;
    }

    Ok(())
}

/// Check user's free KYC status
#[query]
pub fn get_free_kyc_status(upload_id: String) -> Result<FreeKYCSession> {
    let session = FreeKYCStorage::get(&upload_id)?;

    // Only allow user or admin to check status
    let caller = ic_cdk::caller();
    if caller != session.user_principal {
        guard::assert_admin()?;
    }

    Ok(session)
}

// ============= HELPER FUNCTIONS =============

/// Verify digital signature from government
async fn verify_government_signature(_data: &str, _signature: &str) -> Result<bool> {
    // TODO: Implement government public key verification
    // Each country has different signature schemes:
    // - India: RSA with SHA-256 (UIDAI certificates)
    // - US: Various federal PKI certificates
    // - UK: Government Digital Service certificates

    // For demo, always return true
    // In production, use proper cryptographic verification
    Ok(true)
}

/// Parse government API response
fn parse_government_response(_response: &str) -> Result<GovernmentKYCData> {
    // TODO: Parse XML/JSON responses from different government APIs
    // Each country has different response formats

    // For demo, return dummy data
    Ok(GovernmentKYCData {
        user_principal: ic_cdk::caller(),
        full_name: "Demo User".to_string(),
        date_of_birth: "1990-01-01".to_string(),
        country_code: "US".to_string(),
        document_number: "DEMO123456".to_string(),
        verification_level: "Full".to_string(),
    })
}

/// Generate JWT backed by government verification
fn generate_government_backed_jwt(kyc_data: &GovernmentKYCData) -> Result<String> {
    // TODO: Generate proper JWT with government-verified claims
    // Include government session ID and verification proofs

    let jwt = format!(
        "gov_verified_{}_{}_{}",
        kyc_data.country_code,
        kyc_data.document_number,
        get_current_timestamp()
    );

    Ok(jwt)
}

fn calculate_age_from_dob(_dob: &str) -> Result<u8> {
    // TODO: Proper date parsing and age calculation
    // For demo, assume everyone is 25
    Ok(25)
}

fn get_country_name(country_code: &str) -> String {
    match country_code {
        "IN" => "India".to_string(),
        "US" => "United States".to_string(),
        "UK" => "United Kingdom".to_string(),
        _ => "Unknown".to_string(),
    }
}

fn validate_ocr_result(ocr_result: &OCRResult) -> Result<()> {
    if ocr_result.confidence_score < 0.5 {
        return Err(BitcoinUSTBillsError::validation_error(
            "OCR confidence score too low",
        ));
    }
    if ocr_result.extracted_name.is_empty() {
        return Err(BitcoinUSTBillsError::validation_error(
            "Extracted name is empty",
        ));
    }
    if ocr_result.extracted_dob.is_empty() {
        return Err(BitcoinUSTBillsError::validation_error(
            "Extracted date of birth is empty",
        ));
    }
    Ok(())
}

fn generate_credential_jwt(request: &GetCredentialRequest, caller: &Principal) -> Result<String> {
    // In a real implementation, this would create a signed JWT.
    // For now, we'll create a placeholder string.
    let credential_type = &request.credential_spec.credential_type;
    let jwt = format!(
        "dummy_jwt_{}_{}_{}",
        credential_type,
        caller.to_text(),
        get_current_timestamp()
    );
    Ok(jwt)
}

fn store_user_credential(
    request: &GetCredentialRequest,
    caller: &Principal,
    vc_jws: &str,
) -> Result<()> {
    let mut user_credentials =
        VCCredentialsStorage::get(caller).unwrap_or_else(|| UserCredentials::new(*caller));

    let credential_type = &request.credential_spec.credential_type;
    let current_time = get_current_timestamp();
    let expiry_date = current_time + (365 * 24 * 60 * 60); // 1 year expiry

    match credential_type.as_str() {
        "VerifiedAdult" => {
            user_credentials.add_adult_credential(VerifiedAdultCredential {
                min_age: 18,
                verified_date: current_time,
                expiry_date,
                issuer: "BitcoinUSTbills".to_string(),
                credential_jws: vc_jws.to_string(),
            });
        }
        "VerifiedResident" => {
            // Extract country from arguments if available
            let country_code = "US".to_string(); // Placeholder
            user_credentials.add_resident_credential(VerifiedResidentCredential {
                country_code: country_code.clone(),
                country_name: get_country_name(&country_code),
                verified_date: current_time,
                expiry_date,
                issuer: "BitcoinUSTbills".to_string(),
                credential_jws: vc_jws.to_string(),
            });
        }
        // Add other credential types if needed
        _ => {
            return Err(BitcoinUSTBillsError::VCUnsupportedCredentialSpec(
                credential_type.clone(),
            ));
        }
    }

    VCCredentialsStorage::update(*caller, user_credentials)?;
    Ok(())
}

#[test]
pub fn generate_candid() {
    candid::export_service!();
    std::fs::write("../distributed/backend/backend.did", __export_service())
        .expect("Failed to write backend.did");
}

