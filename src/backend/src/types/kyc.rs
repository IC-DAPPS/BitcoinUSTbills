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
