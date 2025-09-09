use candid::CandidType;
use serde::{Deserialize, Serialize};

// ============= TRADING METRICS (KEEP - Used in lib.rs) =============

// For platform-wide analytics (admin-facing)
#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct TradingMetrics {
    pub total_volume: u64,
    pub total_transactions: u64,
    pub average_price: u64,
    pub highest_price: u64,
    pub lowest_price: u64,
    pub last_updated: u64,
}

// ============= VERIFIED BROKER PURCHASE (KEEP - Used in storage) =============

// For platform inventory management (admin-facing)
#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct VerifiedBrokerPurchase {
    pub amount: u64,
    pub price: u64,
    pub timestamp: u64,
    pub broker_txn_id: String,
    pub ustbill_type: String,
}