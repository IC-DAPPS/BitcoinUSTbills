use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

// ============= CORE DATA STRUCTURES =============

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct USTBill {
    pub id: String,
    pub cusip: String,
    pub face_value: u64,          // In cents ($1000 = 100000)
    pub purchase_price: u64,      // In cents ($950 = 95000)
    pub maturity_date: u64,       // Unix timestamp
    pub annual_yield: f64,        // 5.26% = 0.0526
    pub owner: Option<Principal>, // None = Available, Some(principal) = Sold to that user
    pub status: USTBillStatus,
    pub created_at: u64,
    pub updated_at: u64,
    pub issuer: String,    // Treasury issuer info
    pub bill_type: String, // 4-week, 13-week, 26-week, 52-week
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize, PartialEq)]
pub enum USTBillStatus {
    Active,
    SoldOut,
    Matured,
    Cancelled,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct User {
    pub principal: Principal,
    pub email: String,
    pub kyc_status: super::kyc::KYCStatus,
    pub wallet_balance: u64,     // In cents
    pub total_invested: u64,     // Total amount invested
    pub total_yield_earned: u64, // Total yield earned
    pub created_at: u64,
    pub updated_at: u64,
    pub is_active: bool,
    pub phone_number: Option<String>,
    pub country: String,

    // ============= VC ENHANCEMENTS =============
    pub vc_credentials_ref: Option<String>, // Reference to stored credentials
    pub last_vc_verification: Option<u64>,  // Last verification timestamp
    pub verified_adult: bool,               // Quick access boolean
    pub verified_resident: bool,            // Quick access boolean
    pub kyc_tier: u8,                       // 0=None, 1=Basic, 2=Enhanced, 3=Premium
    pub accredited_investor: bool,          // Accredited investor status
    pub max_investment_limit: u64,          // Based on verification level
}

// ============= TRANSACTION STRUCTURES =============

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Transaction {
    pub id: String,
    pub user_principal: Principal,
    pub transaction_type: TransactionType,
    pub amount: u64,
    pub ustbill_id: Option<String>,
    pub holding_id: Option<String>,
    pub timestamp: u64,
    pub status: TransactionStatus,
    pub fees: u64,
    pub description: String,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize, PartialEq)]
pub enum TransactionType {
    Deposit,
    Withdrawal,
    Purchase,
    Sale,
    YieldDistribution,
    Fee,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize, PartialEq)]
pub enum TransactionStatus {
    Pending,
    Completed,
    Failed,
    Cancelled,
}

// ============= CORE IMPLEMENTATIONS =============

impl USTBill {
    pub fn is_available_for_purchase(&self) -> bool {
        self.status == USTBillStatus::Active && self.owner.is_none()
    }

    pub fn is_owned_by(&self, principal: &Principal) -> bool {
        self.owner.map_or(false, |owner| owner == *principal)
    }

    pub fn days_to_maturity(&self) -> u64 {
        let current_time = ic_cdk::api::time() / 1_000_000_000; // Convert to seconds
        if self.maturity_date > current_time {
            (self.maturity_date - current_time) / 86400 // Convert to days
        } else {
            0
        }
    }
}

impl User {
    pub fn is_eligible_for_trading(&self) -> bool {
        self.kyc_status == super::kyc::KYCStatus::Verified && self.is_active
    }

    pub fn total_portfolio_value(&self) -> u64 {
        // This will be calculated dynamically by aggregating holdings
        self.total_invested
    }

    // ============= VC HELPER METHODS =============

    pub fn is_vc_verified(&self) -> bool {
        self.verified_adult && self.kyc_tier > 0
    }

    pub fn can_trade_with_vc(&self) -> bool {
        self.is_active && self.is_vc_verified() && self.verified_resident
    }

    pub fn get_max_investment_based_on_verification(&self) -> u64 {
        match self.kyc_tier {
            0 => 0,        // No KYC
            1 => 100000,   // $1,000 for Basic
            2 => 1000000,  // $10,000 for Enhanced
            3 => 10000000, // $100,000 for Premium
            _ => {
                if self.accredited_investor {
                    u64::MAX
                } else {
                    1000000
                }
            }
        }
    }

    pub fn needs_vc_renewal(&self) -> bool {
        if let Some(last_verification) = self.last_vc_verification {
            let current_time = ic_cdk::api::time();
            let one_year = 365 * 24 * 60 * 60 * 1_000_000_000; // 1 year in nanoseconds
            current_time > last_verification + one_year
        } else {
            true // Never verified
        }
    }
}
