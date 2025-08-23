import type { ActorSubclass } from '@dfinity/agent';


import type { _SERVICE as ICRC_LEDGER_SERVICE } from '@dfinity/ledger-icrc/dist/candid/icrc_ledger';
import type { _SERVICE as FILE_STORE_BUCKET_SERVICE } from '../../../../declarations/file_store_bucket/file_store_bucket.did.d.ts';


export { idlFactory as icrcLedgerIdlFactory } from '@dfinity/ledger-icrc/dist/candid/icrc_ledger.idl';
export { idlFactory as fileStoreBucketIdlFactory } from '../../../../declarations/file_store_bucket';

export type IcrcLedgerActor = ActorSubclass<ICRC_LEDGER_SERVICE>;

export type FileStoreBucketActor = ActorSubclass<FILE_STORE_BUCKET_SERVICE>;

