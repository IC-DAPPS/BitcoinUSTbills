import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type GetUserDataError = { 'FailedToAddToList' : null } |
  { 'DidntFindUserData' : null } |
  { 'AnonymousCaller' : null };
export type Result = { 'Ok' : string } |
  { 'Err' : GetUserDataError };
export type Result_1 = { 'Ok' : null } |
  { 'Err' : GetUserDataError };
export interface _SERVICE {
  'add_to_list' : ActorMethod<[Principal], undefined>,
  'get_principal_data' : ActorMethod<[], Result>,
  'set_principal_data' : ActorMethod<[string], Result_1>,
  'test_func' : ActorMethod<[], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
