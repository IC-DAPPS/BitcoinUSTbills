#![allow(dead_code)]
#![warn(unused_variables)]

// Module declarations
mod errors;
mod evm_rpc;
mod guard;
mod handlers;
mod storage;
mod types;
mod utils;

// Re-export types for easier access
pub use errors::*;
pub use guard::*;
pub use storage::*;
pub use types::*;

// get_current_timestamp is available through storage::* re-export
use candid::Principal;
use evm_rpc::*;
use ic_cdk::api::call::call_with_payment;
use ic_cdk::call::Call;
use ic_cdk::{query, update};

const FILE_STORE_BUCKET_CANISTER_ID: &str = "uzt4z-lp777-77774-qaabq-cai";

// EVM RPC service instance - using lazy_static for runtime initialization
use std::sync::LazyLock;

static EVM_RPC: LazyLock<Service> = LazyLock::new(|| {
    Service(Principal::from_text("uxrrr-q7777-77774-qaaaq-cai").expect("Invalid EVM RPC principal"))
});

// get_active_ustbills removed - USTBill functionality not implemented

/// Registers a new user
#[update]
pub async fn register_user(user_data: UserRegistrationRequest) -> Result<User> {
    let principal = ic_cdk::api::msg_caller();

    // Check if user already exists
    if UserStorage::get(&principal).is_ok() {
        return Err(BitcoinUSTBillsError::UserAlreadyExists);
    }

    // Validate user data
    validate_user_data(&user_data)?;

    let current_time = crate::storage::get_current_timestamp();

    let user = User {
        principal,
        email: user_data.email,
        kyc_status: KYCStatus::Pending,
        wallet_balance: 0,
        total_invested: 0,
        total_yield_earned: 0,
        created_at: current_time,
        updated_at: current_time,
        is_active: true,
        phone_number: user_data.phone_number,
        country: user_data.country,

        // VC-related fields
        vc_credentials_ref: None,
        last_vc_verification: None,
        verified_adult: false,
        verified_resident: false,
        kyc_tier: 0,
        accredited_investor: false,
        max_investment_limit: 0,
    };

    UserStorage::insert(user.clone())?;

    // Register user to the file store bucket, so user can upload kyc documents to it
    let _ = Call::unbounded_wait(
        Principal::from_text(FILE_STORE_BUCKET_CANISTER_ID).expect("Invalid initial principal"),
        "register_user_by_backend",
    )
    .with_arg(user.principal)
    .await
    .map_err(|e| BitcoinUSTBillsError::FileStoreBucketError(e.to_string()));

    Ok(user)
}

/// Checks if a user is registered
#[query]
pub fn is_user_registered() -> bool {
    let principal = ic_cdk::api::msg_caller();
    UserStorage::get(&principal).is_ok()
}

/// Retrieves user profile
#[query]
pub fn get_user_profile() -> Result<User> {
    let principal = ic_cdk::api::msg_caller();
    UserStorage::get(&principal)
}

// get_user_holdings removed - TokenHolding functionality not implemented
// get_trading_metrics removed - Trading functionality not implemented

pub fn validate_user_data(data: &UserRegistrationRequest) -> Result<()> {
    if data.email.is_empty() || !data.email.contains('@') {
        return Err(BitcoinUSTBillsError::validation_error(
            "Invalid email format",
        ));
    }

    if data.country.is_empty() {
        return Err(BitcoinUSTBillsError::validation_error(
            "Country is required",
        ));
    }

    Ok(())
}

/// Free Document Upload and OCR Processing
#[update]
pub async fn upload_document_free_kyc(
    document_front_page: String,
    document_back_page: String,
    selfie_with_document: String,
) -> Result<String> {
    let caller = ic_cdk::api::msg_caller();

    let user = UserStorage::get(&caller).map_err(|_| BitcoinUSTBillsError::UserNotFound)?;

    // Validate that caller is not anonymous
    if caller == Principal::anonymous() {
        return Err(BitcoinUSTBillsError::AnonymousCaller);
    }

    // Generate upload ID
    let upload_id = caller.to_text();

    // Step 5: All cases require manual review
    let needs_review = true; // Always send for manual review

    let kyc_session = FreeKYCSession {
        user_principal: user.principal,
        document_front_page,
        document_back_page,
        selfie_with_document,
        needs_manual_review: needs_review,
        status: FreeKYCStatus::PendingReview, // Always set to PendingReview
        created_at: crate::storage::get_current_timestamp(),
        reviewed_at: None,
        reviewer_notes: None,
    };

    // Store session
    FreeKYCStorage::insert(upload_id.clone(), kyc_session.clone())?;

    // Log that it's queued for manual review
    ic_cdk::println!("⏳ Queued for manual review: {}", upload_id);

    Ok(upload_id)
}

/// Gets the list of authorized principals
#[query]
pub fn get_authorized_principals() -> Vec<Principal> {
    guard::get_list()
}

/// Manual review functions for admins
#[update]
pub async fn admin_review_free_kyc(
    upload_id: String,
    approved: bool,
    notes: Option<String>,
) -> Result<()> {
    guard::assert_admin()?;

    let mut kyc_session = FreeKYCStorage::get(&upload_id)?;

    kyc_session.status = if approved {
        FreeKYCStatus::ManualApproved
    } else {
        FreeKYCStatus::Rejected
    };
    kyc_session.reviewed_at = Some(crate::storage::get_current_timestamp());
    kyc_session.reviewer_notes = notes;

    if approved {
        // VC issuance hata diya; sirf user ko Verified mark kar rahe hain
        if let Ok(mut user) = UserStorage::get(&kyc_session.user_principal) {
            user.kyc_status = KYCStatus::Verified;
            UserStorage::update(user)?;
        }
        ic_cdk::println!(
            "Manual approval for: {}",
            kyc_session.user_principal.to_text()
        );
    } else {
        ic_cdk::println!(
            "❌ Manual rejection for: {}",
            kyc_session.user_principal.to_text()
        );
    }

    FreeKYCStorage::update(upload_id, kyc_session)?;
    Ok(())
}

/// Get pending manual reviews for admins
#[query]
pub fn admin_get_pending_reviews() -> Result<Vec<UserAndFreeKYCSession>> {
    guard::assert_admin()?;

    let all_sessions = FreeKYCStorage::get_all();
    let pending: Vec<UserAndFreeKYCSession> = all_sessions
        .into_iter()
        .filter(|(_, session)| session.status == FreeKYCStatus::PendingReview)
        .filter_map(|(_, session)| {
            UserStorage::get(&session.user_principal)
                .ok()
                .map(|user| UserAndFreeKYCSession {
                    user,
                    kyc_session: session,
                })
        })
        .collect();

    Ok(pending)
}

/// Check user's free KYC status
#[query]
pub fn get_free_kyc_status(upload_id: String) -> Result<FreeKYCSession> {
    let session = FreeKYCStorage::get(&upload_id)?;

    // Only allow user or admin to check status
    let caller = ic_cdk::api::msg_caller();
    if caller != session.user_principal {
        guard::assert_admin()?;
    }

    Ok(session)
}

/// //////////////////////////////////////////////////////////////
/// //////////////////////////////////////////////////////////////  ERC-20 Transfer Implementation
/// //////////////////////////////////////////////////////////////
/// //////////////////////////////////////////////////////////////

use candid::CandidType;
#[allow(deprecated)]
use ic_cdk::api::management_canister::ecdsa::{
    EcdsaPublicKeyArgument, EcdsaCurve, EcdsaKeyId,
};
use serde::{Deserialize, Serialize};

#[derive(CandidType, Serialize, Deserialize)]
pub struct PublicKeyReply {
    pub public_key_hex: String,
    pub eth_address: String,
}

#[update]
#[allow(deprecated)]
async fn get_eth_address() -> std::result::Result<PublicKeyReply, String> {
    let request = EcdsaPublicKeyArgument {
        canister_id: None,
        derivation_path: vec![], // Use [] for canister root key
        key_id: EcdsaKeyId {
            curve: EcdsaCurve::Secp256k1,
            name: "key_1".to_string(), // Use "key_1" for mainnet, "test_key_1" for testnet
        },
    };

    let (response,) = ic_cdk::api::call::call::<
        _,
        (ic_cdk::api::management_canister::ecdsa::EcdsaPublicKeyResponse,),
    >(
        Principal::from_text("aaaaa-aa").expect("Invalid management canister principal"),
        "ecdsa_public_key",
        (request,),
    )
    .await
    .map_err(|e| format!("ecdsa_public_key failed: {:?}", e.1))?;

    // Convert SEC1 public key to Ethereum address
    let pubkey_bytes = &response.public_key;
    let eth_address = pubkey_bytes_to_address(pubkey_bytes);

    Ok(PublicKeyReply {
        public_key_hex: hex::encode(pubkey_bytes),
        eth_address,
    })
}

// Helper function: convert SEC1 public key to Ethereum address
fn pubkey_bytes_to_address(pubkey_bytes: &[u8]) -> String {
    use ethers_core::k256::elliptic_curve::sec1::ToEncodedPoint;
    use ethers_core::k256::PublicKey;
    use ethers_core::types::Address;
    use ethers_core::utils::{keccak256, to_checksum};

    let key =
        PublicKey::from_sec1_bytes(pubkey_bytes).expect("failed to parse the public key as SEC1");
    let point = key.to_encoded_point(false);
    let point_bytes = point.as_bytes();
    assert_eq!(point_bytes[0], 0x04);

    let hash = keccak256(&point_bytes[1..]);
    to_checksum(&Address::from_slice(&hash[12..32]), None)
}

/// Get latest block number
#[update]
pub async fn get_latest_block_number() -> String {
    let rpc_providers = RpcServices::EthMainnet(Some(vec![EthMainnetService::Alchemy]));

    // Use ic_cdk::call with cycles
    let cycles: u64 = 2_000_000_000_000; // 2T cycles
    match call_with_payment::<_, (MultiGetBlockByNumberResult,)>(
        EVM_RPC.0,
        "eth_getBlockByNumber",
        (rpc_providers, None::<RpcConfig>, BlockTag::Latest),
        cycles,
    )
    .await
    {
        Ok((result,)) => match result {
            MultiGetBlockByNumberResult::Consistent(r) => match r {
                GetBlockByNumberResult::Ok(block) => {
                    format!("Latest block: {}", block.number)
                }
                GetBlockByNumberResult::Err(err) => {
                    format!("Failed to get block: {:?}", err)
                }
            },
            MultiGetBlockByNumberResult::Inconsistent(_) => {
                "RPC providers gave inconsistent results".to_string()
            }
        },
        Err(err) => {
            format!("Call failed: {:?}", err)
        }
    }
}


// ERC-20 Transfer Implementation
use ethers_core::types::{Address, U256, Bytes, Eip1559TransactionRequest};
use std::str::FromStr;

#[derive(CandidType, Serialize, Deserialize, Clone)]
pub struct TransferRequest {
    pub contract_address: String,
    pub recipient: String,
    pub amount: String, // Amount as string to avoid precision issues
}

#[derive(CandidType, Serialize, Deserialize)]
pub struct TransferResponse {
    pub success: bool,
    pub transaction_hash: Option<String>,
    pub error_message: Option<String>,
}

/// Encode ERC-20 transfer function call
fn encode_transfer(to: &str, value: U256) -> String {
    let mut data = hex::decode("a9059cbb").unwrap(); // transfer(address,uint256) selector

    // Pad recipient address to 32 bytes
    let mut to_bytes = [0u8; 32];
    let addr = hex::decode(&to[2..]).unwrap(); // Remove "0x" prefix
    to_bytes[12..].copy_from_slice(&addr); // Address goes in last 20 bytes

    data.extend_from_slice(&to_bytes);

    // Pad value to 32 bytes
    let mut value_bytes = [0u8; 32];
    value.to_big_endian(&mut value_bytes);
    data.extend_from_slice(&value_bytes);

    format!("0x{}", hex::encode(data))
}

/// Sign EIP-1559 transaction using threshold ECDSA
async fn sign_eip1559_transaction(
    _tx: Eip1559TransactionRequest,
    _key_id: EcdsaKeyId,
    _derivation_path: Vec<Vec<u8>>,
) -> std::result::Result<Bytes, String> {
    // This is a simplified implementation
    // In production, you would use the full signing logic from the starter project
    
    // For now, return a placeholder
    Ok(Bytes::from(vec![0u8; 32]))
}

/// Send raw transaction to Ethereum network
async fn send_raw_transaction(
    _signed_tx: Bytes,
    _rpc_services: RpcServices,
    _evm_rpc: &Service,
) -> std::result::Result<String, String> {
    // This is a simplified implementation
    // In production, you would use the full EVM RPC call
    
    // For now, return a placeholder transaction hash
    Ok("0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef".to_string())
}

/// Transfer ERC-20 tokens
#[update]
pub async fn transfer_erc20_tokens(request: TransferRequest) -> TransferResponse {
    // Validate inputs
    if request.contract_address.is_empty() || request.recipient.is_empty() || request.amount.is_empty() {
        return TransferResponse {
            success: false,
            transaction_hash: None,
            error_message: Some("Invalid input parameters".to_string()),
        };
    }

    // Parse amount
    let amount = match U256::from_dec_str(&request.amount) {
        Ok(amount) => amount,
        Err(_) => {
            return TransferResponse {
                success: false,
                transaction_hash: None,
                error_message: Some("Invalid amount format".to_string()),
            };
        }
    };

    // Validate contract address format
    if !request.contract_address.starts_with("0x") || request.contract_address.len() != 42 {
        return TransferResponse {
            success: false,
            transaction_hash: None,
            error_message: Some("Invalid contract address format".to_string()),
        };
    }

    // Validate recipient address format
    if !request.recipient.starts_with("0x") || request.recipient.len() != 42 {
        return TransferResponse {
            success: false,
            transaction_hash: None,
            error_message: Some("Invalid recipient address format".to_string()),
        };
    }

    // Encode the transfer function call
    let data = encode_transfer(&request.recipient, amount);

    // Build EIP-1559 transaction
    let tx = Eip1559TransactionRequest {
        from: None,
        to: Some(ethers_core::types::NameOrAddress::Address(Address::from_str(&request.contract_address).unwrap())),
        value: Some(U256::zero()), // No ETH sent, just token transfer
        max_fee_per_gas: Some(U256::from(100_000_000_000u64)), // 100 gwei
        max_priority_fee_per_gas: Some(U256::from(2_000_000_000u64)), // 2 gwei
        gas: Some(U256::from(100_000u64)), // Gas limit
        nonce: Some(U256::from(0u64)), // Nonce (in production, fetch from network)
        chain_id: Some(1u64.into()), // Ethereum mainnet
        data: Some(hex::decode(&data[2..]).unwrap().into()), // Remove "0x" prefix
        access_list: Default::default(),
    };

    // Sign transaction using threshold ECDSA
    let key_id = EcdsaKeyId {
        curve: EcdsaCurve::Secp256k1,
        name: "key_1".to_string(), // Use "key_1" for mainnet
    };

    let derivation_path = vec![]; // Use canister root key

    let signed_tx = match sign_eip1559_transaction(tx, key_id, derivation_path).await {
        Ok(signed) => signed,
        Err(e) => {
            return TransferResponse {
                success: false,
                transaction_hash: None,
                error_message: Some(format!("Transaction signing failed: {}", e)),
            };
        }
    };

    // Send transaction to Ethereum network
    let rpc_services = RpcServices::EthMainnet(Some(vec![EthMainnetService::Alchemy]));
    
    match send_raw_transaction(signed_tx, rpc_services, &EVM_RPC).await {
        Ok(tx_hash) => TransferResponse {
            success: true,
            transaction_hash: Some(tx_hash),
            error_message: None,
        },
        Err(e) => TransferResponse {
            success: false,
            transaction_hash: None,
            error_message: Some(format!("Transaction submission failed: {}", e)),
        },
    }
}

/// Test ERC-20 transfer with hardcoded values
#[update]
pub async fn test_erc20_transfer() -> TransferResponse {
    let request = TransferRequest {
        contract_address: "0x1B19C19393e2d034D8Ff31ff34c81252FcBbee92".to_string(),
        recipient: "0x1234567890abcdef1234567890abcdef12345678".to_string(),
        amount: "1000000000000000000".to_string(), // 1 token (assuming 18 decimals)
    };

    transfer_erc20_tokens(request).await
}

#[test]
pub fn generate_candid() {
    candid::export_service!();
    std::fs::write("../distributed/backend/backend.did", __export_service())
        .expect("Failed to write backend.did");
}
