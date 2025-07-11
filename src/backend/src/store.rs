use candid::Principal;
use std::{cell::RefCell, collections::HashMap};

pub struct Store;
// Thread-local storage for the main data structure
thread_local! {
   pub static DATA: RefCell<HashMap<Principal, String>> = RefCell::new(HashMap::new());
}

impl Store {
    // Retrieves a value from the store for the current caller
    pub fn get() -> Option<String> {
        DATA.with(|data| data.borrow().get(&ic_cdk::caller()).cloned())
    }

    // Inserts a value into the store for the current caller
    pub fn insert(s: String) {
        DATA.with(|data| {
            let mut data = data.borrow_mut();
            data.insert(ic_cdk::caller(), s);
        })
    }
}
