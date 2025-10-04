import {
    BACKEND_CANISTER_ID,
    OUSG_LEDGER_CANISTER_ID,
    CKBTC_LEDGER_CANISTER_ID
} from '$lib/const';
import { idlFactory as backendIdlFactory } from '../../../../declarations/backend';
import { idlFactory as ousgLedgerIdlFactory } from '../../../../declarations/ustb_token_ledger';
import { idlFactory as ckbtcLedgerIdlFactory } from '../../../../declarations/ustb_token_ledger';
import type { Actors, BackendActor, OusgLedgerActor, CkbtcLedgerActor } from './actors.ic';

// @ts-ignore: next-line
const plug = window?.ic?.plug;

export const getActorsFromPlug = async (): Promise<Actors> => ({
    backend: await plug.createActor({
        canisterId: BACKEND_CANISTER_ID,
        interfaceFactory: backendIdlFactory
    }),
    ousgLedger: await plug.createActor({
        canisterId: OUSG_LEDGER_CANISTER_ID,
        interfaceFactory: ousgLedgerIdlFactory
    }),
    ckbtcLedger: await plug.createActor({
        canisterId: CKBTC_LEDGER_CANISTER_ID,
        interfaceFactory: ckbtcLedgerIdlFactory
    })
});

export const getBackendActorFromPlug = async (): Promise<BackendActor> => {
    return await plug.createActor({
        canisterId: BACKEND_CANISTER_ID,
        interfaceFactory: backendIdlFactory
    });
};

export const getOusgLedgerActorFromPlug = async (): Promise<OusgLedgerActor> => {
    return await plug.createActor({
        canisterId: OUSG_LEDGER_CANISTER_ID,
        interfaceFactory: ousgLedgerIdlFactory
    });
};

export const getCkbtcLedgerActorFromPlug = async (): Promise<CkbtcLedgerActor> => {
    return await plug.createActor({
        canisterId: CKBTC_LEDGER_CANISTER_ID,
        interfaceFactory: ckbtcLedgerIdlFactory
    });
};