import type { Principal } from "@dfinity/principal";

export interface UserSate {
  profile?: Profile,
}

export interface Profile {
  'updated_at': string,
  'principal': Principal,
  'country': string,
  'kyc_tier': number,
  'created_at': string,
  'email': string,
  'total_invested': number,
  'kyc_status': KYCStatus,
  'is_active': boolean,
  'phone_number'?: string,
}

export type KYCStatus = 'Rejected' | 'Verified' | 'Expired' | 'Pending';


export interface Balance {
  number: number;
  format: string;
}