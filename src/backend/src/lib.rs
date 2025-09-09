#![allow(dead_code)]
#![warn(unused_variables)]

// Module declarations
mod errors;
mod guard;
mod handlers;
mod storage;
mod types;
mod utils;

// Re-export types for easier access
pub use errors::*;
pub use guard::*;
pub use storage::*;
pub use types::*;

// get_current_timestamp is available through storage::* re-export
use candid::Principal;
use ic_cdk::call::Call;
use ic_cdk::{query, update};

const FILE_STORE_BUCKET_CANISTER_ID: &str = "uzt4z-lp777-77774-qaabq-cai";

// get_active_ustbills removed - USTBill functionality not implemented

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

    let current_time = crate::storage::get_current_timestamp();

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

// get_user_holdings removed - TokenHolding functionality not implemented
// get_trading_metrics removed - Trading functionality not implemented

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
        created_at: crate::storage::get_current_timestamp(),
        reviewed_at: None,
        reviewer_notes: None,
    };

    // Store session
    FreeKYCStorage::insert(upload_id.clone(), kyc_session.clone())?;

    // Log that it's queued for manual review
    ic_cdk::println!("⏳ Queued for manual review: {}", upload_id);

    Ok(upload_id)
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
    kyc_session.reviewed_at = Some(crate::storage::get_current_timestamp());
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

#[test]
pub fn generate_candid() {
    candid::export_service!();
    std::fs::write("../distributed/backend/backend.did", __export_service())
        .expect("Failed to write backend.did");
}
