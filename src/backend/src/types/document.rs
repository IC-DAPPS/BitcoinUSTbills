use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

use crate::User;

// ============= DOCUMENT VERIFICATION TYPES =============

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct AgeVerificationData {
    pub document_id: String,
    pub birth_date: String,
    pub calculated_age: u8,
    pub document_type: String,
    pub is_authentic: bool,
    pub face_match_confidence: f32,
    pub verification_timestamp: u64,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct DocumentData {
    pub document_number: String,
    pub document_type: String,
    pub issuing_authority: String,
    pub birth_date: String,
    pub full_name: String,
    pub photo_hash: String,
    pub expiry_date: String,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct DocumentUpload {
    pub upload_id: String,
    pub user_principal: Principal,
    pub document_bytes: Vec<u8>,
    pub selfie_bytes: Vec<u8>,
    pub document_type: String,
    pub upload_timestamp: u64,
    pub processing_status: DocumentProcessingStatus,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize, PartialEq)]
pub enum DocumentProcessingStatus {
    Uploaded,
    Processing,
    OCRCompleted,
    AuthenticityChecked,
    FaceMatched,
    Verified,
    Failed(String),
}

// ============= FREE KYC MVP TYPES =============

// #[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
// pub struct FreeKYCSession {
//     pub upload_id: String,
//     pub user_principal: Principal,
//     pub document_type: String,
//     pub document_bytes: Vec<u8>,
//     pub selfie_bytes: Vec<u8>,
//     pub ocr_result: OCRResult,
//     pub calculated_age: u8,
//     pub ofac_clear: bool,
//     pub needs_manual_review: bool,
//     pub status: FreeKYCStatus,
//     pub created_at: u64,
//     pub reviewed_at: Option<u64>,
//     pub reviewer_notes: Option<String>,
// }

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

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct OCRResult {
    pub extracted_name: String,
    pub extracted_dob: String,
    pub extracted_document_number: String,
    pub extracted_country: String,
    pub confidence_score: f32, // 0.0 to 1.0
    pub raw_text: String,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct SanctionsCheckResult {
    pub is_clear: bool,
    pub checked_lists: Vec<String>, // "OFAC", "UN", "EU"
    pub check_date: u64,
    pub details: Option<String>,
}

// ============= FREE API CONFIGURATION =============

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct FreeAPIConfig {
    pub ofac_xml_url: String,
    pub un_sanctions_url: String,
    pub eu_sanctions_url: String,
    pub update_frequency_hours: u64,
    pub last_update: u64,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct DocumentValidationRules {
    pub min_age_required: u8,
    pub max_age_allowed: u8,
    pub supported_document_types: Vec<String>,
    pub required_confidence_score: f32,
    pub manual_review_threshold: f32,
    pub auto_approval_countries: Vec<String>,
}

// ============= DOCUMENT PROCESSING TYPES =============

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct DocumentProcessingResult {
    pub upload_id: String,
    pub processing_steps: Vec<ProcessingStep>,
    pub final_result: ProcessingOutcome,
    pub total_processing_time_ms: u64,
    pub manual_review_required: bool,
    pub confidence_breakdown: ConfidenceBreakdown,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct ProcessingStep {
    pub step_name: String,
    pub status: StepStatus,
    pub duration_ms: u64,
    pub error_message: Option<String>,
    pub output_data: Option<String>,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize, PartialEq)]
pub enum StepStatus {
    Pending,
    Processing,
    Completed,
    Failed,
    Skipped,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize, PartialEq)]
pub enum ProcessingOutcome {
    AutoApproved,
    RequiresReview,
    AutoRejected,
    ProcessingFailed,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct ConfidenceBreakdown {
    pub ocr_confidence: f32,
    pub age_validation_confidence: f32,
    pub document_format_confidence: f32,
    pub sanctions_check_confidence: f32,
    pub overall_confidence: f32,
}
