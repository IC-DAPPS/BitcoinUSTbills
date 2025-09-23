import { Actor, type Identity } from '@dfinity/agent';
import { idlFactory as backendIdlFactory } from '../../../../declarations/backend';
import { idlFactory as ousgLedgerIdlFactory } from '../../../../declarations/ustb_token_ledger';
import { idlFactory as ckbtcLedgerIdlFactory } from '../../../../declarations/ustb_token_ledger';
import { BACKEND_CANISTER_ID, OUSG_LEDGER_CANISTER_ID, CKBTC_LEDGER_CANISTER_ID } from '$lib/const';
import { getAgent } from './agents.ic';

export interface BackendActor {
    // Add backend methods here based on your backend.did
    notify_deposit: (args: { block_index: bigint; amount: bigint }) => Promise<any>;
    redeem_ousg_tokens: (ousg_amount: bigint) => Promise<any>;
    get_ousg_balance: () => Promise<bigint>;
    get_user_deposits: () => Promise<any[]>;
    get_current_btc_price: () => Promise<number>;
    calculate_ckbtc_usd_value: (ckbtc_amount: bigint) => Promise<number>;
    calculate_ousg_for_usd: (usd_amount: number) => Promise<bigint>;
    get_deposit_stats: () => Promise<any>;
}

export interface OusgLedgerActor {
    icrc1_balance_of: (args: { owner: any; subaccount?: any }) => Promise<bigint>;
    icrc1_transfer: (args: any) => Promise<any>;
    icrc1_metadata: () => Promise<any[]>;
    icrc1_total_supply: () => Promise<bigint>;
}

export interface CkbtcLedgerActor {
    icrc1_balance_of: (args: { owner: any; subaccount?: any }) => Promise<bigint>;
    icrc1_transfer: (args: any) => Promise<any>;
    icrc1_metadata: () => Promise<any[]>;
    icrc1_total_supply: () => Promise<bigint>;
}

export interface Actors {
    backend: BackendActor;
    ousgLedger: OusgLedgerActor;
    ckbtcLedger: CkbtcLedgerActor;
}

export const getBackendActor = async (identity: Identity): Promise<BackendActor> => {
    const agent = await getAgent({ identity });

    return Actor.createActor(backendIdlFactory, {
        agent,
        canisterId: BACKEND_CANISTER_ID
    });
};

export const getOusgLedgerActor = async (identity: Identity): Promise<OusgLedgerActor> => {
    const agent = await getAgent({ identity });

    return Actor.createActor(ousgLedgerIdlFactory, {
        agent,
        canisterId: OUSG_LEDGER_CANISTER_ID
    });
};

export const getCkbtcLedgerActor = async (identity: Identity): Promise<CkbtcLedgerActor> => {
    const agent = await getAgent({ identity });

    return Actor.createActor(ckbtcLedgerIdlFactory, {
        agent,
        canisterId: CKBTC_LEDGER_CANISTER_ID
    });
};

export const getActors = async (identity: Identity): Promise<Actors> => ({
    backend: await getBackendActor(identity),
    ousgLedger: await getOusgLedgerActor(identity),
    ckbtcLedger: await getCkbtcLedgerActor(identity)
});
