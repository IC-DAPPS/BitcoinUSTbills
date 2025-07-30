use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

// ============= TRADING & HOLDINGS STRUCTURES =============

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct TokenHolding {
    pub id: String,
    pub user_principal: Principal,
    pub ustbill_id: String,
    pub token_id: u64,       // ICRC1 token ID representing this bill
    pub purchase_price: u64, // Total purchase price in cents
    pub purchase_date: u64,
    pub yield_option: YieldOption,
    pub status: HoldingStatus,
    pub current_value: u64,   // Current market value
    pub projected_yield: u64, // Projected yield at maturity
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize, PartialEq)]
pub enum YieldOption {
    Maturity, // Hold till maturity (full yield)
    Flexible, // Can sell anytime (market rate)
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize, PartialEq)]
pub enum HoldingStatus {
    Active,
    Sold,
    Matured,
    Cancelled,
}

// ============= YIELD & TRADING STRUCTURES =============

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct YieldDistribution {
    pub holding_id: String,
    pub user_principal: Principal,
    pub yield_amount: u64,
    pub distribution_date: u64,
    pub ustbill_id: String,
}

#[derive(Clone, Debug, CandidType, Serialize)]
pub struct YieldProjection {
    pub holding_id: String,
    pub current_value: u64,
    pub projected_yield: u64,
    pub yield_percentage: f64,
    pub days_to_maturity: u64,
    pub annual_yield_rate: f64,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct TradingMetrics {
    pub total_volume: u64,
    pub total_transactions: u64,
    pub average_price: u64,
    pub highest_price: u64,
    pub lowest_price: u64,
    pub last_updated: u64,
}

// ============= VERIFIED BROKER PURCHASE =============

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct VerifiedBrokerPurchase {
    pub amount: u64,
    pub price: u64,
    pub timestamp: u64,
    pub broker_txn_id: String,
    pub ustbill_type: String,
}

// ============= TRADING IMPLEMENTATIONS =============

impl TokenHolding {
    pub fn calculate_current_yield(&self, annual_rate: f64, days_held: u64) -> u64 {
        let daily_rate = annual_rate / 365.0;
        (self.purchase_price as f64 * daily_rate * days_held as f64) as u64
    }

    pub fn is_active(&self) -> bool {
        self.status == HoldingStatus::Active
    }
}