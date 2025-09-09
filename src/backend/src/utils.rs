use crate::errors::{BitcoinUSTBillsError, Result};
use ic_cdk::api::time;

// CUSIP validation removed - not used in current implementation

/// Validates email format
pub fn validate_email(email: &str) -> Result<()> {
    if email.is_empty() {
        return Err(BitcoinUSTBillsError::validation_error(
            "Email cannot be empty",
        ));
    }

    if !email.contains('@') {
        return Err(BitcoinUSTBillsError::validation_error(
            "Invalid email format",
        ));
    }

    let parts: Vec<&str> = email.split('@').collect();
    if parts.len() != 2 {
        return Err(BitcoinUSTBillsError::validation_error(
            "Invalid email format",
        ));
    }

    let (local, domain) = (parts[0], parts[1]);

    if local.is_empty() || domain.is_empty() {
        return Err(BitcoinUSTBillsError::validation_error(
            "Invalid email format",
        ));
    }

    if !domain.contains('.') {
        return Err(BitcoinUSTBillsError::validation_error(
            "Invalid email domain",
        ));
    }

    Ok(())
}

// Phone, yield, maturity, token, and investment validation removed - not used in current implementation

/// Gets current timestamp in seconds
pub fn get_current_timestamp() -> u64 {
    time() / 1_000_000_000
}

// All unused utility functions removed - not needed for current KYC/registration implementation

// Tests removed - only keeping essential functions for current implementation
