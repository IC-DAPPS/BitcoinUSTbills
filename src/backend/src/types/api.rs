use candid::CandidType;
use serde::{Deserialize, Serialize};

// ============= REQUEST/RESPONSE STRUCTURES =============

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct USTBillCreateRequest {
    pub cusip: String,
    pub face_value: u64,
    pub purchase_price: u64,
    pub maturity_date: u64,
    pub annual_yield: f64,
    pub issuer: String,
    pub bill_type: String,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct UserRegistrationRequest {
    pub email: String,
    pub phone_number: Option<String>,
    pub country: String,
}

#[derive(Clone, Debug, CandidType, Serialize)]
pub struct PaginatedResponse<T> {
    pub data: Vec<T>,
    pub total: usize,
    pub page: usize,
    pub per_page: usize,
    pub has_next: bool,
}