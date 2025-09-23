import { goto } from '$app/navigation';
import { getActors } from '$lib/actors/actors.ic';
import type { AuthStoreData } from '$lib/stores/auth.store';
import { AuthClient } from '@dfinity/auth-client';
import { connectAnonymously } from './anonymous.connection';
import { IDENTITY_PROVIDER } from '$lib/const';

let authClient: AuthClient | null | undefined;

export const syncAuthClient = async (set: (this: void, value: AuthStoreData) => void) => {
    try {
        authClient = authClient ?? (await AuthClient.create());
        const isAuthenticated: boolean = await authClient.isAuthenticated();

        if (isAuthenticated) {
            const signIdentity = authClient.getIdentity();
            const authenticatedActor = await getActors(signIdentity);

            set({
                isAuthenticated,
                identity: signIdentity,
                identityProvider: 'ii',
                principal: signIdentity.getPrincipal(),
                ...authenticatedActor
            });
        }

        return { success: isAuthenticated };
    } catch (error) {
        console.error('Error syncing auth client:', error);
        return { success: false };
    }
};

export const authClientLogin = async (set: (this: void, value: AuthStoreData) => void) =>
    new Promise<void>(async (resolve, reject) => {
        try {
            authClient = authClient ?? (await AuthClient.create());

            await authClient.login({
                identityProvider: IDENTITY_PROVIDER,
                maxTimeToLive: BigInt(7) * BigInt(24) * BigInt(3_600_000_000_000), // 1 week
                onSuccess: async () => {
                    await syncAuthClient(set);
                    goto('/');
                    resolve();
                },
                onError: async (error) => {
                    console.error('Auth client login error:', error);
                    await connectAnonymously(set);
                    reject(error);
                }
            });
        } catch (error) {
            console.error('Error creating auth client:', error);
            await connectAnonymously(set);
            reject(error);
        }
    });

export const authClientLogout = async () => {
    try {
        if (authClient) {
            await authClient.logout();
            authClient = null;
        }
    } catch (error) {
        console.error('Error logging out:', error);
    }
};
