use candid::Principal;
use std::{cell::RefCell, collections::BTreeSet};

const INITIAL_AUTHORIZED_PRINCIPAL: &str =
    "2bfxp-uzezm-gf5ny-ztks2-ybgzc-4dfjc-7gdhs-he2ek-vdjfk-w4yph-fqe";

thread_local! {
    pub static GUARD: RefCell<BTreeSet<Principal>> = RefCell::new({
        let mut set = BTreeSet::new();
        let initial_principal = Principal::from_text(INITIAL_AUTHORIZED_PRINCIPAL)
        .expect("Invalid initial principal");

        set.insert(initial_principal);
        set
    });
}

pub fn add_to_list(principal: Principal) -> () {
    GUARD.with(|guard| {
        let mut guard_ref = guard.borrow_mut();

        if guard_ref.contains(&principal) {
            return ();
        } else {
            guard_ref.insert(principal);
            return ();
        }
    })
}

pub fn delete_from_list(p: Principal) -> String {
    GUARD.with(|guard| {
        let mut guard_ref = guard.borrow_mut();

        if !guard_ref.contains(&p) {
            return "Principal {} is not in the guard list".to_string();
        } else {
            guard_ref.remove(&p);
            return "removed".to_string();
        }
    })
}

pub fn is_dev() -> Result<(), String> {
    let caller = ic_cdk::caller();
    let anonymous = Principal::anonymous();
    if caller == anonymous {
        return Err("AnonymousCaller".to_string());
    }
    
    GUARD.with(|guard| {
        let guard_ref = guard.borrow();
        if !guard_ref.contains(&caller) {
            return Err(format!("Caller {} is not authorized", caller));
        } else {
            return Ok(());
        }
    })
}
