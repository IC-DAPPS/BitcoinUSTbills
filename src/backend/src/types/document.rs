use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

use crate::User;

// ============= FREE KYC MVP TYPES =============

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct FreeKYCSession {
    pub user_principal: Principal,
    pub document_front_page: String,
    pub document_back_page: String,
    pub selfie_with_document: String,
    pub needs_manual_review: bool,
    pub status: FreeKYCStatus,
    pub created_at: u64,
    pub reviewed_at: Option<u64>,
    pub reviewer_notes: Option<String>,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize, PartialEq)]
pub enum FreeKYCStatus {
    Processing,
    PendingReview,
    AutoApproved,
    ManualApproved,
    Rejected,
    Expired,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct UserAndFreeKYCSession {
    pub user: User,
    pub kyc_session: FreeKYCSession,
}

