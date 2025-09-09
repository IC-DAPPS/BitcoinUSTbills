use candid::CandidType;
use serde::Deserialize;

// ============= REQUEST STRUCTURES (KEEP - Used in lib.rs) =============

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct UserRegistrationRequest {
    pub email: String,
    pub phone_number: Option<String>,
    pub country: String,
}