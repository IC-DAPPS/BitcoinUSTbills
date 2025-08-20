import type { ActorSubclass } from '@dfinity/agent';


import type { _SERVICE as ICRC_LEDGER_SERVICE } from '@dfinity/ledger-icrc/dist/candid/icrc_ledger';

export { idlFactory as icrcLedgerIdlFactory } from '@dfinity/ledger-icrc/dist/candid/icrc_ledger.idl';

export type IcrcLedgerActor = ActorSubclass<ICRC_LEDGER_SERVICE>;


