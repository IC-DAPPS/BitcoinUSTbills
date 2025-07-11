use serde::{Deserialize, Serialize};
#[derive(candid::CandidType, Clone, Serialize, Deserialize)]
pub enum GetUserDataError {
    AnonymousCaller,
    DidntFindUserData,
    FailedToAddToList,
}
