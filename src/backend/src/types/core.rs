use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

// ============= CORE DATA STRUCTURES =============

// USTBill types removed - not used in current implementation

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

// Transaction types removed - not used in current implementation

// ============= CORE IMPLEMENTATIONS =============

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
