use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

// ============= KYC TYPES =============

#[derive(Clone, Debug, CandidType, Deserialize, Serialize, PartialEq)]
pub enum KYCStatus {
    Pending,
    Verified,
    Rejected,
    Expired,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize, PartialEq)]
pub enum KYCVerificationLevel {
    Basic,         // Basic identity verification
    Enhanced,      // Enhanced document verification
    Premium,       // Premium verification with biometrics
    Institutional, // Institutional KYC for businesses
}

// ============= KYC SESSION TYPES =============

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct KYCSession {
    pub session_id: String,
    pub user_principal: Principal,
    pub country_code: String,
    pub document_type: String,
    pub status: KYCSessionStatus,
    pub created_at: u64,
    pub government_response: Option<String>,
    pub verification_result: Option<GovernmentKYCData>,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize, PartialEq)]
pub enum KYCSessionStatus {
    Initiated,
    PendingGovernmentResponse,
    GovernmentVerified,
    CredentialIssued,
    Failed(String),
    Expired,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct GovernmentKYCData {
    pub user_principal: Principal,
    pub full_name: String,
    pub date_of_birth: String,
    pub country_code: String,
    pub document_number: String,
    pub verification_level: String,
}

// ============= THIRD PARTY KYC PROVIDERS =============

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct ThirdPartyKYCProvider {
    pub provider_name: String, // "Jumio", "Onfido", "Veriff"
    pub api_endpoint: String,
    pub supported_countries: Vec<String>,
    pub supported_documents: Vec<String>,
    pub verification_levels: Vec<String>,
    pub is_active: bool,
}

// ============= GOVERNMENT API INTEGRATION TYPES =============

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct AadhaarKYCResponse {
    pub aadhaar_number: String,
    pub name: String,
    pub dob: String,
    pub gender: String,
    pub address: String,
    pub photo: Vec<u8>,
    pub digital_signature: String,
    pub timestamp: String,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct USGovernmentKYCResponse {
    pub ssn_verified: bool,
    pub ofac_clear: bool,
    pub name: String,
    pub dob: String,
    pub address: String,
    pub verification_source: String, // "SSA", "DMV", "IRS"
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct UKGovernmentKYCResponse {
    pub passport_number: Option<String>,
    pub driving_license_number: Option<String>,
    pub nino: Option<String>, // National Insurance Number
    pub name: String,
    pub dob: String,
    pub address: String,
    pub verification_source: String, // "HMRC", "DVLA", "Companies House"
}
