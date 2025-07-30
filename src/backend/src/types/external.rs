use candid::CandidType;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ============= EXTERNAL API STRUCTURES =============

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct TreasuryRate {
    pub record_date: String,
    pub security_type: String,
    pub security_desc: String,
    pub rate_date: String,
    pub rate: f64,
    pub cusip: String,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct TreasuryApiResponse {
    pub data: Vec<TreasuryRate>,
    pub meta: TreasuryApiMeta,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct TreasuryApiMeta {
    pub count: u64,
    pub labels: HashMap<String, String>,
}