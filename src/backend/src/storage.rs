use candid::Principal;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{Cell, DefaultMemoryImpl, StableBTreeMap, Storable};
use std::borrow::Cow;
use std::cell::RefCell;

use crate::errors::{BitcoinUSTBillsError, Result};
use crate::types::*;

// Memory management
type Memory = VirtualMemory<DefaultMemoryImpl>;

// Memory IDs for different data types
const USERS_MEMORY_ID: MemoryId = MemoryId::new(1);
const TRADING_METRICS_MEMORY_ID: MemoryId = MemoryId::new(6);
const ID_COUNTER_MEMORY_ID: MemoryId = MemoryId::new(7);
const VERIFIED_PURCHASES_LEDGER_MEMORY_ID: MemoryId = MemoryId::new(8);
const FREE_KYC_SESSIONS_MEMORY_ID: MemoryId = MemoryId::new(11);

// Thread-local storage for memory manager and stable data structures
thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );

    static ID_COUNTER: RefCell<Cell<u64, Memory>> = RefCell::new(
        Cell::init(MEMORY_MANAGER.with(|m| m.borrow().get(ID_COUNTER_MEMORY_ID)), 0)
    );

    static USERS: RefCell<StableBTreeMap<Principal, User, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(USERS_MEMORY_ID))
        )
    );

    static TRADING_METRICS: RefCell<Cell<TradingMetrics, Memory>> = RefCell::new(
        Cell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(TRADING_METRICS_MEMORY_ID)),
            TradingMetrics {
                total_volume: 0,
                total_transactions: 0,
                average_price: 0,
                highest_price: 0,
                lowest_price: 0,
                last_updated: 0,
            }
        )
    );

    static VERIFIED_PURCHASES_LEDGER: RefCell<StableBTreeMap<u64, VerifiedBrokerPurchase, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(VERIFIED_PURCHASES_LEDGER_MEMORY_ID))
        )
    );


    // ============= FREE KYC STORAGE STRUCTURES =============

    static FREE_KYC_SESSIONS: RefCell<StableBTreeMap<String, FreeKYCSession, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(FREE_KYC_SESSIONS_MEMORY_ID))
        )
    );


}

// USTBill Storable implementation removed - not used in current implementation

impl Storable for User {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    fn into_bytes(self) -> Vec<u8> {
        candid::encode_one(self).unwrap()
    }

    const BOUND: ic_stable_structures::storable::Bound =
        ic_stable_structures::storable::Bound::Unbounded;
}

// TokenHolding, Transaction, PlatformConfig, TreasuryRate Storable implementations removed - not used

impl Storable for TradingMetrics {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    fn into_bytes(self) -> Vec<u8> {
        candid::encode_one(self).unwrap()
    }

    const BOUND: ic_stable_structures::storable::Bound =
        ic_stable_structures::storable::Bound::Unbounded;
}

impl Storable for VerifiedBrokerPurchase {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    fn into_bytes(self) -> Vec<u8> {
        candid::encode_one(self).unwrap()
    }

    const BOUND: ic_stable_structures::storable::Bound =
        ic_stable_structures::storable::Bound::Unbounded;
}

// ============= FREE KYC STORABLE IMPLEMENTATIONS =============

impl Storable for FreeKYCSession {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    fn into_bytes(self) -> Vec<u8> {
        candid::encode_one(self).unwrap()
    }

    const BOUND: ic_stable_structures::storable::Bound =
        ic_stable_structures::storable::Bound::Unbounded;
}

// USTBillStorage removed - not used in current implementation

// Storage interface for Users
pub struct UserStorage;

impl UserStorage {
    pub fn insert(user: User) -> Result<()> {
        USERS.with(|users| {
            if users.borrow().contains_key(&user.principal) {
                Err(BitcoinUSTBillsError::UserAlreadyExists)
            } else {
                users.borrow_mut().insert(user.principal, user);
                Ok(())
            }
        })
    }

    pub fn get(principal: &Principal) -> Result<User> {
        USERS.with(|users| {
            users
                .borrow()
                .get(principal)
                .ok_or(BitcoinUSTBillsError::UserNotFound)
        })
    }

    pub fn update(user: User) -> Result<()> {
        USERS.with(|users| {
            let mut users = users.borrow_mut();
            if users.contains_key(&user.principal) {
                users.insert(user.principal, user);
                Ok(())
            } else {
                Err(BitcoinUSTBillsError::UserNotFound)
            }
        })
    }

    pub fn remove(principal: &Principal) -> Result<User> {
        USERS.with(|users| {
            users
                .borrow_mut()
                .remove(principal)
                .ok_or(BitcoinUSTBillsError::UserNotFound)
        })
    }

    pub fn get_all() -> Vec<User> {
        USERS.with(|users| {
            users
                .borrow()
                .iter()
                .map(|entry| entry.value().clone())
                .collect()
        })
    }

    pub fn count() -> u64 {
        USERS.with(|users| users.borrow().len())
    }
}

// HoldingStorage, TransactionStorage, PlatformConfigStorage, TreasuryRateStorage removed - not used

// Storage interface for Trading Metrics
pub struct TradingMetricsStorage;

impl TradingMetricsStorage {
    pub fn get() -> TradingMetrics {
        TRADING_METRICS.with(|metrics| metrics.borrow().get().clone())
    }

    pub fn update(metrics: TradingMetrics) -> Result<()> {
        TRADING_METRICS.with(|trading_metrics| {
            trading_metrics.borrow_mut().set(metrics);
            Ok(())
        })
    }

    pub fn update_volume(volume: u64) -> Result<()> {
        let mut metrics = Self::get();
        metrics.total_volume += volume;
        metrics.total_transactions += 1;
        metrics.last_updated = ic_cdk::api::time() / 1_000_000_000;
        Self::update(metrics)
    }

    pub fn update_price(price: u64) -> Result<()> {
        let mut metrics = Self::get();
        if metrics.highest_price == 0 || price > metrics.highest_price {
            metrics.highest_price = price;
        }
        if metrics.lowest_price == 0 || price < metrics.lowest_price {
            metrics.lowest_price = price;
        }
        // Calculate new average price
        let total_volume = metrics.total_volume;
        if total_volume > 0 {
            metrics.average_price =
                (metrics.average_price * total_volume + price) / (total_volume + 1);
        } else {
            metrics.average_price = price;
        }
        metrics.last_updated = ic_cdk::api::time() / 1_000_000_000;
        Self::update(metrics)
    }
}

// Storage interface for Verified Purchases Ledger
pub struct VerifiedPurchasesLedgerStorage;

impl VerifiedPurchasesLedgerStorage {
    pub fn insert(purchase: VerifiedBrokerPurchase) -> Result<()> {
        VERIFIED_PURCHASES_LEDGER.with(|ledger| {
            let id = ledger.borrow().len();
            ledger.borrow_mut().insert(id, purchase);
            Ok(())
        })
    }

    pub fn get_all() -> Vec<VerifiedBrokerPurchase> {
        VERIFIED_PURCHASES_LEDGER.with(|ledger| {
            ledger
                .borrow()
                .iter()
                .map(|entry| entry.value().clone())
                .collect()
        })
    }

    pub fn count() -> u64 {
        VERIFIED_PURCHASES_LEDGER.with(|ledger| ledger.borrow().len())
    }
}

// ============= FREE KYC STORAGE INTERFACES =============

// Storage interface for Free KYC Sessions
pub struct FreeKYCStorage;

impl FreeKYCStorage {
    pub fn insert(upload_id: String, session: FreeKYCSession) -> Result<()> {
        FREE_KYC_SESSIONS.with(|sessions| {
            sessions.borrow_mut().insert(upload_id, session);
            Ok(())
        })
    }

    pub fn get(upload_id: &String) -> Result<FreeKYCSession> {
        FREE_KYC_SESSIONS.with(|sessions| {
            sessions
                .borrow()
                .get(upload_id)
                .ok_or(BitcoinUSTBillsError::StorageError(
                    "KYC session not found".to_string(),
                ))
        })
    }

    pub fn update(upload_id: String, session: FreeKYCSession) -> Result<()> {
        FREE_KYC_SESSIONS.with(|sessions| {
            sessions.borrow_mut().insert(upload_id, session);
            Ok(())
        })
    }

    pub fn remove(upload_id: &String) -> Option<FreeKYCSession> {
        FREE_KYC_SESSIONS.with(|sessions| sessions.borrow_mut().remove(upload_id))
    }

    pub fn get_all() -> Vec<(String, FreeKYCSession)> {
        FREE_KYC_SESSIONS.with(|sessions| {
            sessions
                .borrow()
                .iter()
                .map(|entry| (entry.key().clone(), entry.value().clone()))
                .collect()
        })
    }

    pub fn get_by_user(user_principal: &Principal) -> Vec<(String, FreeKYCSession)> {
        FREE_KYC_SESSIONS.with(|sessions| {
            sessions
                .borrow()
                .iter()
                .filter(|entry| entry.value().user_principal == *user_principal)
                .map(|entry| (entry.key().clone(), entry.value().clone()))
                .collect()
        })
    }

    pub fn get_pending_reviews() -> Vec<(String, FreeKYCSession)> {
        FREE_KYC_SESSIONS.with(|sessions| {
            sessions
                .borrow()
                .iter()
                .filter(|entry| entry.value().status == FreeKYCStatus::PendingReview)
                .map(|entry| (entry.key().clone(), entry.value().clone()))
                .collect()
        })
    }

    pub fn count() -> u64 {
        FREE_KYC_SESSIONS.with(|sessions| sessions.borrow().len())
    }
}

// Utility functions for storage operations
pub fn generate_id() -> String {
    ID_COUNTER.with(|counter| {
        let current_value = *counter.borrow().get();
        counter.borrow_mut().set(current_value + 1);
        current_value.to_string()
    })
}

pub fn get_current_timestamp() -> u64 {
    ic_cdk::api::time() / 1_000_000_000 // Convert from nanoseconds to seconds
}

// Storage statistics
pub fn get_storage_stats() -> std::collections::HashMap<String, u64> {
    let mut stats = std::collections::HashMap::new();
    stats.insert("users".to_string(), UserStorage::count());
    stats.insert(
        "verified_purchases".to_string(),
        VerifiedPurchasesLedgerStorage::count(),
    );
    stats.insert("free_kyc_sessions".to_string(), FreeKYCStorage::count());

    stats
}
