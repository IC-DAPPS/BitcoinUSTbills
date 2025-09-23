import { AnonymousIdentity } from '@dfinity/agent';
import { getActors } from '$lib/actors/actors.ic';
import type { AuthStoreData } from '$lib/stores/auth.store';

export const anonIdentity = new AnonymousIdentity();

export const connectAnonymously = async (set: (this: void, value: AuthStoreData) => void) => {
    try {
        const anonymousActor = await getActors(anonIdentity);

        set({
            isAuthenticated: false,
            identity: anonIdentity,
            identityProvider: 'anonymous',
            principal: anonIdentity.getPrincipal(),
            ...anonymousActor
        });
    } catch (error) {
        console.error('Error connecting anonymously:', error);
        // Set a minimal state if actor creation fails
        set({
            isAuthenticated: false,
            identity: anonIdentity,
            identityProvider: 'anonymous',
            principal: anonIdentity.getPrincipal(),
            backend: null as any,
            ousgLedger: null as any,
            ckbtcLedger: null as any
        });
    }
};
