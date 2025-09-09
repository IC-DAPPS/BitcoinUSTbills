// ============= TYPES MODULE =============
// Refactored types module with clear organization

pub mod api;
pub mod core;
pub mod document;
pub mod external;
pub mod kyc;
pub mod platform;
pub mod trading;

// Re-export only used types
pub use api::*;
pub use core::*;
pub use document::*;
pub use kyc::*;
pub use trading::*;
