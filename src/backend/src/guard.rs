use crate::errors::{BitcoinUSTBillsError, Result};
use candid::Principal;
use std::{cell::RefCell, collections::BTreeSet};

const INITIAL_AUTHORIZED_PRINCIPAL: &str =
    "6lzil-lzkgm-twmv5-rz5xg-a5nnm-togvj-mlu6s-p4xyl-5j3zi-6a6jy-yqe";

thread_local! {
    pub static GUARD: RefCell<BTreeSet<Principal>> = RefCell::new({
        let mut set = BTreeSet::new();
        let initial_principal = Principal::from_text(INITIAL_AUTHORIZED_PRINCIPAL)
        .expect("Invalid initial principal");

        let frontend_principal = Principal::from_text("tdlcm-qf6xy-gwvm5-uil6h-ygjte-6e3nq-ni63i-cqbeh-ho4p2-7ga6x-6ae")
        .expect("Invalid initial principal");

        set.insert(initial_principal);
        set.insert(frontend_principal);
        set
    });

}


/// Gets the list of authorized principals
pub fn get_list() -> Vec<Principal> {
    GUARD.with(|guard| {
        let guard_ref = guard.borrow();
        guard_ref.iter().cloned().collect()
    })
}

/// Assert that the caller is an admin, returning BitcoinUSTBillsError
pub fn assert_admin() -> Result<()> {
    let caller = ic_cdk::api::msg_caller();
    let anonymous = Principal::anonymous();

    if caller == anonymous {
        return Err(BitcoinUSTBillsError::AnonymousCaller);
    }

    GUARD.with(|guard| {
        let guard_ref = guard.borrow();
        if !guard_ref.contains(&caller) {
            Err(BitcoinUSTBillsError::Unauthorized)
        } else {
            Ok(())
        }
    })
}

/// Checks if a principal is in the authorized list
pub fn is_authorized(principal: &Principal) -> bool {
    GUARD.with(|guard| {
        let guard_ref = guard.borrow();
        guard_ref.contains(principal)
    })
}

/// Gets all authorized principals
pub fn get_authorized_principals() -> Vec<Principal> {
    get_list()
}
