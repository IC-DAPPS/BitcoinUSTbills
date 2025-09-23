import type { ActorSubclass } from '@dfinity/agent';
import type { _SERVICE as BACKEND_SERVICE } from '../../../../declarations/backend/backend.did';
import type { _SERVICE as OUSG_LEDGER_SERVICE } from '../../../../declarations/ustb_token_ledger/ustb_token_ledger.did';
import type { _SERVICE as CKBTC_LEDGER_SERVICE } from '../../../../declarations/ustb_token_ledger/ustb_token_ledger.did';

export { idlFactory as backendIdlFactory } from '../../../../declarations/backend';
export { idlFactory as ousgLedgerIdlFactory } from '../../../../declarations/ustb_token_ledger';
export { idlFactory as ckbtcLedgerIdlFactory } from '../../../../declarations/ustb_token_ledger';
export { idlFactory as icrcLedgerIdlFactory } from '../../../../declarations/ustb_token_ledger';

export type BackendActor = ActorSubclass<BACKEND_SERVICE>;
export type OusgLedgerActor = ActorSubclass<OUSG_LEDGER_SERVICE>;
export type CkbtcLedgerActor = ActorSubclass<CKBTC_LEDGER_SERVICE>;
