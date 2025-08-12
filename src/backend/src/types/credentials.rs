use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

// ============= VERIFIABLE CREDENTIALS STRUCTURES =============

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct CredentialSpec {
    pub credential_type: String,
    pub arguments: Option<Vec<(String, ArgumentValue)>>,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub enum ArgumentValue {
    Int(i32),
    String(String),
}

// ICRC-21 Types for consent message
#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Icrc21ConsentInfo {
    pub consent_message: String,
    pub language: String,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Icrc21ConsentPreferences {
    pub language: String,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Icrc21VcConsentMessageRequest {
    pub preferences: Icrc21ConsentPreferences,
    pub credential_spec: CredentialSpec,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct Icrc21Error {
    pub description: String,
    pub error_code: Option<u32>,
}

// Credential preparation and issuance types
#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct PrepareCredentialRequest {
    pub signed_id_alias: SignedIdAlias,
    pub credential_spec: CredentialSpec,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct SignedIdAlias {
    pub credential_jws: String,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct PreparedCredentialData {
    pub prepared_context: Option<Vec<u8>>,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct GetCredentialRequest {
    pub signed_id_alias: SignedIdAlias,
    pub credential_spec: CredentialSpec,
    pub prepared_context: Option<Vec<u8>>,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct IssuedCredentialData {
    pub vc_jws: String,
}

// Derivation Origin types
#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct DerivationOriginRequest {
    pub frontend_hostname: String,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct DerivationOriginData {
    pub origin: String,
}

// ============= BITCOINUSTBILLS SPECIFIC CREDENTIAL TYPES =============

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct UserCredentials {
    pub principal: Principal,
    pub verified_adult: Option<VerifiedAdultCredential>,
    pub verified_resident: Option<VerifiedResidentCredential>,
    pub kyc_credential: Option<KYCCredential>,
    pub accredited_investor: Option<AccreditedInvestorCredential>,
    pub last_updated: u64,
    pub credential_count: u32,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct VerifiedAdultCredential {
    pub min_age: u8,
    pub verified_date: u64,
    pub expiry_date: u64,
    pub issuer: String,
    pub credential_jws: String,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct VerifiedResidentCredential {
    pub country_code: String,
    pub country_name: String,
    pub verified_date: u64,
    pub expiry_date: u64,
    pub issuer: String,
    pub credential_jws: String,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct KYCCredential {
    pub tier: u8, // 1=Basic, 2=Enhanced, 3=Premium
    pub verified_date: u64,
    pub expiry_date: u64,
    pub issuer: String,
    pub credential_jws: String,
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct AccreditedInvestorCredential {
    pub net_worth_verified: bool,
    pub annual_income_verified: bool,
    pub verified_date: u64,
    pub expiry_date: u64,
    pub issuer: String,
    pub credential_jws: String,
}

// Trading compliance types
#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct TradingEligibility {
    pub can_trade: bool,
    pub max_investment_amount: u64,
    pub restricted_countries: Vec<String>,
    pub requires_accreditation: bool,
    pub compliance_notes: Vec<String>,
}

// ============= VC IMPLEMENTATIONS =============

impl UserCredentials {
    pub fn new(principal: Principal) -> Self {
        Self {
            principal,
            verified_adult: None,
            verified_resident: None,
            kyc_credential: None,
            accredited_investor: None,
            last_updated: ic_cdk::api::time(),
            credential_count: 0,
        }
    }

    pub fn add_adult_credential(&mut self, credential: VerifiedAdultCredential) {
        self.verified_adult = Some(credential);
        self.credential_count += 1;
        self.last_updated = ic_cdk::api::time();
    }

    pub fn add_resident_credential(&mut self, credential: VerifiedResidentCredential) {
        self.verified_resident = Some(credential);
        self.credential_count += 1;
        self.last_updated = ic_cdk::api::time();
    }

    pub fn add_kyc_credential(&mut self, credential: KYCCredential) {
        self.kyc_credential = Some(credential);
        self.credential_count += 1;
        self.last_updated = ic_cdk::api::time();
    }

    pub fn is_fully_verified(&self) -> bool {
        self.verified_adult.is_some()
            && self.verified_resident.is_some()
            && self.kyc_credential.is_some()
    }

    pub fn get_trading_eligibility(&self) -> TradingEligibility {
        let can_trade = self.is_fully_verified();
        let max_amount = if let Some(kyc) = &self.kyc_credential {
            match kyc.tier {
                1 => 100000,   // $1,000
                2 => 1000000,  // $10,000
                3 => 10000000, // $100,000
                _ => 100000,
            }
        } else {
            0
        };

        let restricted_countries = vec!["IR".to_string(), "KP".to_string(), "SY".to_string()];
        let requires_accreditation = max_amount > 1000000; // > $10,000

        TradingEligibility {
            can_trade,
            max_investment_amount: max_amount,
            restricted_countries,
            requires_accreditation,
            compliance_notes: vec![
                "US Treasury Bills trading requires valid KYC verification".to_string()
            ],
        }
    }
}