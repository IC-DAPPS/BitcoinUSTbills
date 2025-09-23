import { writable, type Readable, get } from 'svelte/store';
import { type Principal } from '@dfinity/principal';
import type { BackendActor, OusgLedgerActor, CkbtcLedgerActor } from '$lib/types/actors';
import {
    authClientLogin,
    authClientLogout,
    syncAuthClient
} from '$lib/connection/authclient.connection';
import { connectPlug, disconnectPlug, syncPlugConnection } from '$lib/connection/plug.connection';
import { connectAnonymously } from '$lib/connection/anonymous.connection';
import { nfidLogin, nfidLogout } from '$lib/connection/nfid.connection';
import type { IdentityProvider } from '$lib/types/auth';
import type { OptionIdentity } from '$lib/types/identity';

export interface AuthStoreData {
    isAuthenticated: boolean;
    identity: OptionIdentity;
    backend: BackendActor;
    ousgLedger: OusgLedgerActor;
    ckbtcLedger: CkbtcLedgerActor;
    identityProvider: IdentityProvider;
    principal: Principal;
}

export interface AuthSignInParams {
    identityProvider?: IdentityProvider;
}

export interface AuthStore extends Readable<AuthStoreData> {
    sync: () => Promise<void>;
    signIn: (authSignInParams: AuthSignInParams) => Promise<void>;
    signOut: () => Promise<void>;
}

// Create a default anonymous state
const createDefaultState = (): AuthStoreData => ({
    isAuthenticated: false,
    identity: null,
    backend: null as any,
    ousgLedger: null as any,
    ckbtcLedger: null as any,
    identityProvider: 'anonymous',
    principal: null as any
});

const init = (): AuthStore => {
    const { subscribe, set } = writable<AuthStoreData>(createDefaultState());

    return {
        subscribe,
        sync: async () => {
            const authClientResult = await syncAuthClient(set);
            if (authClientResult.success) return;

            const plugResult = await syncPlugConnection(set);
            if (plugResult.success) return;

            await connectAnonymously(set);
        },
        signIn: async ({ identityProvider }) => {
            const provider = identityProvider ?? 'ii';

            if (provider === 'ii') {
                await authClientLogin(set);
            } else if (provider === 'nfid') {
                await nfidLogin(set);
            } else if (provider === 'plug') {
                await connectPlug(set);
            }
        },
        signOut: async () => {
            const { identityProvider } = get(authStore);

            if (identityProvider === 'ii') {
                await authClientLogout();
            } else if (identityProvider === 'plug') {
                await disconnectPlug();
            } else if (identityProvider === 'nfid') {
                nfidLogout();
            }

            await connectAnonymously(set);
        }
    };
};

export const authStore: AuthStore = init();