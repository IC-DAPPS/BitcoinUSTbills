
import type { BitcoinUSTBillsError, User } from "../../../../declarations/backend/backend.did";

export type GetUserProfileResponse = { 'Ok': User } |
{ 'Err': BitcoinUSTBillsError };

export type RegisterUserResponse = { 'Ok': User } |
{ 'Err': BitcoinUSTBillsError };
// Type for the discriminated union from the backend
export type BackendKYCStatus = { 'Rejected': null } |
{ 'Verified': null } |
{ 'Expired': null } |
{ 'Pending': null };
