// ============= TYPES MODULE =============
// Refactored types module with clear organization

pub mod api;
pub mod core;
pub mod document;
pub mod external;
pub mod kyc;
pub mod platform;
pub mod trading;

// Re-export all types for backwards compatibility
pub use api::*;
pub use core::*;
pub use document::*;
pub use external::*;
pub use kyc::*;
pub use platform::*;
pub use trading::*;
