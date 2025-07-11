#![allow(dead_code)]
#![warn(unused_variables)]

mod errors;
mod guard;
mod handlers;
mod store;

use crate::guard::*;
use candid::Principal;
use errors::GetUserDataError;
use ic_cdk::update;
use store::Store;

#[ic_cdk::query]
fn get_principal_data() -> Result<String, GetUserDataError> {
    let opt_principal_data = Store::get();
    match opt_principal_data {
        Some(data) => Ok(data),
        None => Err(GetUserDataError::DidntFindUserData),
    }
}

#[ic_cdk::update]
fn set_principal_data(s: String) -> Result<(), GetUserDataError> {
    let get_principal_data = Store::get();
    match get_principal_data {
        Some(_data) => {
            Store::insert(s);
            Ok(())
        }
        None => {
            Store::insert(s);
            Ok(())
        }
    }
}

// test_func uses guard
#[update(guard = "is_dev")]
pub fn test_func() -> String {
    "test_func with guard".to_string()
}

// only dev principal can add to list
#[update(guard = "is_dev")]
pub fn add_to_list(p: Principal) -> () {
    guard::add_to_list(p);
}

#[test]
pub fn generate_candid() {
    candid::export_service!();
    // Write the Candid interface description to a file
    std::fs::write("../distributed/backend/backend.did", __export_service())
        .expect("Failed to write backend.did");
}
