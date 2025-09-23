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

// ============= ckBTC DEPOSIT TYPES =============

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Deposit {
    pub id: u64,
    pub user_principal: Principal,
    pub ckbtc_amount: u64,  // Deposit amount in ckBTC (8 decimals)
    pub usd_value: f64,     // USD value of the deposit
    pub btc_price_usd: f64, // BTC price at time of deposit
    pub deposit_time: u64,  // Timestamp when deposit was made
    pub block_index: u64,   // Block index of the deposit transaction
    pub status: DepositStatus,
    pub ousg_minted: u64, // Amount of OUSG tokens minted (6 decimals)
    pub created_at: u64,
    pub updated_at: u64,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize, PartialEq)]
pub enum DepositStatus {
    Pending,   // Deposit received, waiting for validation
    Validated, // Deposit validated, OUSG minted
    Failed,    // Deposit validation failed
    Processed, // Fully processed
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct DepositRequest {
    pub ckbtc_amount: u64, // Deposit amount in ckBTC (8 decimals)
    pub block_index: u64,  // Block index of the deposit transaction
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct DepositResponse {
    pub success: bool,
    pub deposit_id: Option<u64>,
    pub ousg_minted: Option<u64>,
    pub error_message: Option<String>,
}

// ============= XRC (EXCHANGE RATE CANISTER) TYPES =============
// These types are now imported from the generated exchange_rate_canister binding

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

    // ============= DEPOSIT HELPER METHODS =============

    pub fn can_make_deposit(&self, amount: u64) -> bool {
        // Check if we're in testing mode
        let is_testing_mode = Self::is_testing_mode();

        ic_cdk::println!("can_make_deposit: amount={}, is_testing_mode={}, is_active={}, max_investment_limit={}", 
                        amount, is_testing_mode, self.is_active, self.max_investment_limit);

        if is_testing_mode {
            // Testing mode: Allow deposits without KYC
            let result = self.is_active && amount <= 1_000_000_000;
            ic_cdk::println!("Testing mode result: {}", result);
            result
        } else {
            // Production mode: Strict KYC verification required
            let result = self.is_eligible_for_trading() && amount <= self.max_investment_limit;
            ic_cdk::println!("Production mode result: {}", result);
            result
        }
    }

    // Helper function to determine testing mode
    fn is_testing_mode() -> bool {
        // For now, always return true for testing
        // TODO: Implement proper environment detection
        ic_cdk::println!("Testing mode enabled (hardcoded)");
        true
    }

    pub fn update_after_deposit(&mut self, amount: u64) {
        self.total_invested += amount;
        self.wallet_balance += amount;
        self.updated_at = ic_cdk::api::time() / 1_000_000_000;
    }
}

// ============= DEPOSIT IMPLEMENTATIONS =============

impl Deposit {
    pub fn new(
        id: u64,
        user_principal: Principal,
        ckbtc_amount: u64,
        usd_value: f64,
        btc_price_usd: f64,
        block_index: u64,
    ) -> Self {
        let current_time = ic_cdk::api::time() / 1_000_000_000;
        Self {
            id,
            user_principal,
            ckbtc_amount,
            usd_value,
            btc_price_usd,
            deposit_time: current_time,
            block_index,
            status: DepositStatus::Pending,
            ousg_minted: 0,
            created_at: current_time,
            updated_at: current_time,
        }
    }

    pub fn mark_validated(&mut self, ousg_minted: u64) {
        self.status = DepositStatus::Validated;
        self.ousg_minted = ousg_minted;
        self.updated_at = ic_cdk::api::time() / 1_000_000_000;
    }

    pub fn mark_failed(&mut self) {
        self.status = DepositStatus::Failed;
        self.updated_at = ic_cdk::api::time() / 1_000_000_000;
    }

    pub fn mark_processed(&mut self) {
        self.status = DepositStatus::Processed;
        self.updated_at = ic_cdk::api::time() / 1_000_000_000;
    }

    // Calculate OUSG tokens to mint based on USD value (OUSG = UST-Bill = $5000)
    pub fn calculate_ousg_to_mint(&self) -> u64 {
        let ousg_tokens = self.usd_value / 5000.0; // Each OUSG = $5000
                                                   // Convert to OUSG units (6 decimals)
        (ousg_tokens * 1_000_000.0) as u64
    }
}

// ============= XRC HELPER FUNCTIONS =============
// These functions are now handled directly in lib.rs using generated bindings

// Convert USD amount to ckBTC amount based on BTC price
pub fn convert_usd_to_ckbtc(usd_amount: f64, btc_price_usd: f64) -> u64 {
    let btc_amount = usd_amount / btc_price_usd;
    // Convert to ckBTC units (8 decimals)
    (btc_amount * 100_000_000.0) as u64
}

// Convert ckBTC amount to USD based on BTC price
pub fn convert_ckbtc_to_usd(ckbtc_amount: u64, btc_price_usd: f64) -> f64 {
    let btc_amount = ckbtc_amount as f64 / 100_000_000.0;
    btc_amount * btc_price_usd
}
