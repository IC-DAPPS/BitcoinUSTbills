use crate::guard::GUARD;
use crate::storage::UserStorage;
use crate::types::User;
use candid::{CandidType, Principal};
use ic_cdk::{post_upgrade, pre_upgrade, storage};
use serde::{Deserialize, Serialize};
use std::collections::BTreeSet;

// StableStore struct is used for serializing and deserializing the data during upgrades
#[derive(Debug, Clone, Serialize, Deserialize, CandidType)]
pub struct StableStore {
    pub guard: Vec<Principal>,
    pub users: Option<Vec<(Principal, User)>>, // Make optional for backward compatibility
}

#[pre_upgrade]
pub fn pre_upgrade_handler() {
    // Collect guard data
    let guard_data = GUARD.with(|guard| guard.borrow().iter().cloned().collect::<Vec<Principal>>());

    // Collect users data
    let users_data = UserStorage::get_all()
        .into_iter()
        .map(|user| (user.principal, user))
        .collect::<Vec<(Principal, User)>>();

    let stable_store = StableStore {
        guard: guard_data,
        users: Some(users_data),
    };

    storage::stable_save((stable_store,)).unwrap();
}

// Post-upgrade hook: Restores the state from stable storage after an upgrade
#[post_upgrade]
pub fn post_upgrade_handler() {
    let (stable_store,): (StableStore,) = storage::stable_restore().unwrap();

    // Restore guard data
    GUARD.with(|guard| {
        *guard.borrow_mut() = BTreeSet::from_iter(stable_store.guard);
    });

    // Restore users data (if available)
    if let Some(users_data) = stable_store.users {
        for user_tuple in users_data {
            let _ = UserStorage::insert(user_tuple.1);
        }
    }
}
