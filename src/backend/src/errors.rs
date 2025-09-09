use candid::CandidType;
use serde::{Deserialize, Serialize};

#[derive(Debug, CandidType, Clone, Serialize, Deserialize)]
pub enum BitcoinUSTBillsError {
    // User-related errors
    UserNotFound,
    UserAlreadyExists,
    KYCNotVerified,
    KYCExpired,
    InvalidUserData,

    // Storage & Database errors (KEEP - Used in storage)
    StorageError(String),

    // Authentication & Authorization errors
    Unauthorized,
    AnonymousCaller,
    InvalidPrincipal,
    AccessDenied,

    // Validation errors (KEEP - Used in registration)
    ValidationError(String),

    // File store bucket errors
    FileStoreBucketError(String),
}

impl std::fmt::Display for BitcoinUSTBillsError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            // User-related errors
            BitcoinUSTBillsError::UserNotFound => write!(f, "User not found"),
            BitcoinUSTBillsError::UserAlreadyExists => write!(f, "User already exists"),
            BitcoinUSTBillsError::KYCNotVerified => write!(f, "KYC verification required"),
            BitcoinUSTBillsError::KYCExpired => write!(f, "KYC verification has expired"),
            BitcoinUSTBillsError::InvalidUserData => write!(f, "Invalid user data provided"),

            // Storage & Database errors
            BitcoinUSTBillsError::StorageError(msg) => write!(f, "Storage error: {}", msg),

            // Authentication & Authorization errors
            BitcoinUSTBillsError::Unauthorized => write!(f, "Unauthorized access"),
            BitcoinUSTBillsError::AnonymousCaller => write!(f, "Anonymous caller not allowed"),
            BitcoinUSTBillsError::InvalidPrincipal => write!(f, "Invalid principal"),
            BitcoinUSTBillsError::AccessDenied => write!(f, "Access denied"),

            // Validation errors
            BitcoinUSTBillsError::ValidationError(msg) => write!(f, "Validation error: {}", msg),

            // File store bucket errors
            BitcoinUSTBillsError::FileStoreBucketError(msg) => {
                write!(f, "File store bucket error: {}", msg)
            }
        }
    }
}

impl std::error::Error for BitcoinUSTBillsError {}

// Result type alias for convenience
pub type Result<T> = std::result::Result<T, BitcoinUSTBillsError>;

// Legacy error types removed - not used in current implementation

// Helper functions for error creation
impl BitcoinUSTBillsError {
    pub fn validation_error(msg: impl Into<String>) -> Self {
        BitcoinUSTBillsError::ValidationError(msg.into())
    }
}
