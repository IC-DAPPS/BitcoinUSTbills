#![allow(dead_code)]
#![warn(unused_variables)]

// Module declarations
mod errors;
mod guard;
mod handlers;
mod storage;
mod store;
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
use ic_cdk::call::Call;
use ic_cdk::{query, update};

const FILE_STORE_BUCKET_CANISTER_ID: &str = "uzt4z-lp777-77774-qaabq-cai";

/// Retrieves all active US Treasury Bills
#[query]
pub fn get_active_ustbills() -> Vec<USTBill> {
    USTBillStorage::get_active()
}

/// Registers a new user
#[update]
pub async fn register_user(user_data: UserRegistrationRequest) -> Result<User> {
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

    // Register user to the file store bucket, so user can upload kyc documents to it
    let _ = Call::unbounded_wait(
        Principal::from_text(FILE_STORE_BUCKET_CANISTER_ID).expect("Invalid initial principal"),
        "register_user_by_backend",
    )
    .with_arg(user.principal)
    .await
    .map_err(|e| BitcoinUSTBillsError::FileStoreBucketError(e.to_string()));

    Ok(user)
}

/// Checks if a user is registered
#[query]
pub fn is_user_registered() -> bool {
    let principal = ic_cdk::api::msg_caller();
    UserStorage::get(&principal).is_ok()
}

/// Retrieves user profile
#[query]
pub fn get_user_profile() -> Result<User> {
    let principal = ic_cdk::api::msg_caller();
    UserStorage::get(&principal)
}


/// Retrieves user holdings
#[query]
pub fn get_user_holdings(principal: Principal) -> Vec<TokenHolding> {
    HoldingStorage::get_by_user(&principal)
}


/// Gets trading metrics
#[query]
pub fn get_trading_metrics() -> TradingMetrics {
    TradingMetricsStorage::get()
}


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

// ============= FREE KYC MVP IMPLEMENTATION =============


/// Free Document Upload and OCR Processing
#[update]
pub async fn upload_document_free_kyc(
    document_front_page: String,
    document_back_page: String,
    selfie_with_document: String,
) -> Result<String> {
    let caller = ic_cdk::api::msg_caller();

    let user = UserStorage::get(&caller).map_err(|_| BitcoinUSTBillsError::UserNotFound)?;

    // Validate that caller is not anonymous
    if caller == Principal::anonymous() {
        return Err(BitcoinUSTBillsError::AnonymousCaller);
    }

    // Generate upload ID
    let upload_id = caller.to_text();

    // Step 5: All cases require manual review
    let needs_review = true; // Always send for manual review

    let kyc_session = FreeKYCSession {
        user_principal: user.principal,
        document_front_page,
        document_back_page,
        selfie_with_document,
        needs_manual_review: needs_review,
        status: FreeKYCStatus::PendingReview, // Always set to PendingReview
        created_at: get_current_timestamp(),
        reviewed_at: None,
        reviewer_notes: None,
    };

    // Store session
    FreeKYCStorage::insert(upload_id.clone(), kyc_session.clone())?;

    // Log that it's queued for manual review
    ic_cdk::println!("⏳ Queued for manual review: {}", upload_id);

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

/// Gets the list of authorized principals
#[query]
pub fn get_authorized_principals() -> Vec<Principal> {
    guard::get_list()
}

/// Manual review functions for admins
#[update]
pub async fn admin_review_free_kyc(
    upload_id: String,
    approved: bool,
    notes: Option<String>,
) -> Result<()> {
    guard::assert_admin()?;

    let mut kyc_session = FreeKYCStorage::get(&upload_id)?;

    kyc_session.status = if approved {
        FreeKYCStatus::ManualApproved
    } else {
        FreeKYCStatus::Rejected
    };
    kyc_session.reviewed_at = Some(get_current_timestamp());
    kyc_session.reviewer_notes = notes;

    if approved {
        // VC issuance hata diya; sirf user ko Verified mark kar rahe hain
        if let Ok(mut user) = UserStorage::get(&kyc_session.user_principal) {
            user.kyc_status = KYCStatus::Verified;
            UserStorage::update(user)?;
        }
        ic_cdk::println!(
            "Manual approval for: {}",
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
pub fn admin_get_pending_reviews() -> Result<Vec<UserAndFreeKYCSession>> {
    guard::assert_admin()?;

    let all_sessions = FreeKYCStorage::get_all();
    let pending: Vec<UserAndFreeKYCSession> = all_sessions
        .into_iter()
        .filter(|(_, session)| session.status == FreeKYCStatus::PendingReview)
        .filter_map(|(_, session)| {
            UserStorage::get(&session.user_principal)
                .ok()
                .map(|user| UserAndFreeKYCSession {
                    user,
                    kyc_session: session,
                })
        })
        .collect();

    Ok(pending)
}

/// Check user's free KYC status
#[query]
pub fn get_free_kyc_status(upload_id: String) -> Result<FreeKYCSession> {
    let session = FreeKYCStorage::get(&upload_id)?;

    // Only allow user or admin to check status
    let caller = ic_cdk::api::msg_caller();
    if caller != session.user_principal {
        guard::assert_admin()?;
    }

    Ok(session)
}

// ============= HELPER FUNCTIONS =============

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

#[test]
pub fn generate_candid() {
    candid::export_service!();
    std::fs::write("../distributed/backend/backend.did", __export_service())
        .expect("Failed to write backend.did");
}
