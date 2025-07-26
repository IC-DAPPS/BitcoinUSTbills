use crate::errors::BitcoinUSTBillsError;
use crate::Result;
use candid::{CandidType, Principal};
use ic_cdk::call;
use serde::Deserialize;

// ICRC1 Token Canister ID (deployed canister)
pub const USTB_TOKEN_CANISTER_ID: &str = "uzt4z-lp777-77774-qaabq-cai";

// ============= ICRC1 TYPES =============

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Account {
    pub owner: Principal,
    pub subaccount: Option<Vec<u8>>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct TransferArg {
    pub from_subaccount: Option<Vec<u8>>,
    pub to: Account,
    pub amount: u64,
    pub fee: Option<u64>,
    pub memo: Option<Vec<u8>>,
    pub created_at_time: Option<u64>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum TransferError {
    BadFee { expected_fee: u64 },
    BadBurn { min_burn_amount: u64 },
    InsufficientFunds { balance: u64 },
    TooOld,
    CreatedInFuture { ledger_time: u64 },
    TemporarilyUnavailable,
    Duplicate { duplicate_of: u64 },
    GenericError { error_code: u64, message: String },
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum TransferResult {
    Ok(u64), // Block index
    Err(TransferError),
}

// ============= HELPER FUNCTIONS =============

/// Creates an ICRC1 account from a principal
pub fn create_account(principal: Principal) -> Account {
    Account {
        owner: principal,
        subaccount: None,
    }
}

/// Gets the token canister principal
pub fn get_token_canister_principal() -> Result<Principal> {
    Principal::from_text(USTB_TOKEN_CANISTER_ID).map_err(|_| BitcoinUSTBillsError::InvalidPrincipal)
}

// ============= TOKEN OPERATIONS =============

/// Transfers USTB tokens from one account to another
pub async fn transfer_tokens(
    to_principal: Principal,
    amount: u64,
    memo: Option<Vec<u8>>,
) -> Result<u64> {
    let token_canister = get_token_canister_principal()?;

    let transfer_arg = TransferArg {
        from_subaccount: None, // Using default subaccount
        to: create_account(to_principal),
        amount,
        fee: None, // Let the ledger calculate the fee
        memo,
        created_at_time: Some(ic_cdk::api::time()),
    };

    let result = call(token_canister, "icrc1_transfer", (transfer_arg,)).await;

    match result {
        Ok((TransferResult::Ok(block_index),)) => Ok(block_index),
        Ok((TransferResult::Err(_error),)) => Err(BitcoinUSTBillsError::TransactionFailed),
        Err(_e) => Err(BitcoinUSTBillsError::TransactionFailed),
    }
}

/// Gets ICRC1 token balance for an account
pub async fn get_token_balance(principal: Principal) -> Result<u64> {
    let token_canister = get_token_canister_principal()?;
    let account = create_account(principal);

    let result: Result<(u64,), _> = call(token_canister, "icrc1_balance_of", (account,)).await;

    match result {
        Ok((balance,)) => Ok(balance),
        Err(e) => {
            ic_cdk::api::print(&format!("Failed to get token balance: {:?}", e));
            Err(BitcoinUSTBillsError::TransactionFailed)
        }
    }
}

/// Mints tokens to a user when they purchase a UST Bill
/// In single ownership model, we mint 1 token per bill representing ownership
pub async fn mint_bill_token(to_principal: Principal, ustbill_id: String) -> Result<u64> {
    // For now, we transfer from the minting account
    // In production, you might want to implement proper minting
    let amount = 100_000_000; // 1 USTB token (with 8 decimals)

    let memo = format!("UST Bill Purchase: {}", ustbill_id);
    let memo_bytes = memo.as_bytes().to_vec();

    transfer_tokens(to_principal, amount, Some(memo_bytes)).await
}

/// Gets token metadata
pub async fn get_token_metadata() -> Result<(String, String, u8)> {
    let token_canister = get_token_canister_principal()?;

    let name_result: Result<(String,), _> = call(token_canister, "icrc1_name", ()).await;
    let symbol_result: Result<(String,), _> = call(token_canister, "icrc1_symbol", ()).await;
    let decimals_result: Result<(u8,), _> = call(token_canister, "icrc1_decimals", ()).await;

    match (name_result, symbol_result, decimals_result) {
        (Ok((name,)), Ok((symbol,)), Ok((decimals,))) => Ok((name, symbol, decimals)),
        _ => Err(BitcoinUSTBillsError::TransactionFailed),
    }
}

// ============= CONVERSION HELPERS =============

/// Converts human-readable token amount to raw amount (with decimals)
pub fn tokens_to_raw(tokens: f64, decimals: u8) -> u64 {
    (tokens * 10_f64.powi(decimals as i32)) as u64
}

/// Converts raw token amount to human-readable amount
pub fn raw_to_tokens(raw_amount: u64, decimals: u8) -> f64 {
    raw_amount as f64 / 10_f64.powi(decimals as i32)
}
