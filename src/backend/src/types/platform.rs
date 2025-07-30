use candid::CandidType;
use serde::{Deserialize, Serialize};

// ============= PLATFORM CONFIGURATION =============

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct PlatformConfig {
    pub platform_fee_percentage: f64,       // 0.5% = 0.005
    pub minimum_investment: u64,            // $1 = 100 cents
    pub maximum_investment: u64,            // $10,000 = 1,000,000 cents
    pub yield_distribution_frequency: u64,  // Days
    pub kyc_expiry_days: u64,               // 365 days
    pub treasury_api_refresh_interval: u64, // Seconds
}

impl Default for PlatformConfig {
    fn default() -> Self {
        Self {
            platform_fee_percentage: 0.005,      // 0.5%
            minimum_investment: 100,             // $1
            maximum_investment: 1_000_000,       // $10,000
            yield_distribution_frequency: 1,     // Daily
            kyc_expiry_days: 365,                // 1 year
            treasury_api_refresh_interval: 3600, // 1 hour
        }
    }
}