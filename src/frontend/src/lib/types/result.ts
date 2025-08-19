import type { BitcoinUSTBillsError } from "$lib/types";
import type { User } from "../../../../declarations/backend/backend.did";

export type GetUserProfileResponse =  { 'Ok' : User } |
{ 'Err' : BitcoinUSTBillsError };


// Type for the discriminated union from the backend
export type BackendKYCStatus = { 'Rejected' : null } |
  { 'Verified' : null } |
  { 'Expired' : null } |
  { 'Pending' : null };
