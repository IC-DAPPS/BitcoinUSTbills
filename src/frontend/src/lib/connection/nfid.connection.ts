import { goto } from '$app/navigation';
import { getActors } from '$lib/actors/actors.ic';
import type { AuthStoreData } from '$lib/stores/auth.store';
import { connectAnonymously } from './anonymous.connection';

export const nfidLogin = async (set: (this: void, value: AuthStoreData) => void) => {
    try {
        // For now, redirect to NFID login page
        window.open('https://nfid.one', '_blank');
        await connectAnonymously(set);
    } catch (error) {
        console.error('NFID login error:', error);
        await connectAnonymously(set);
    }
};

export const nfidLogout = () => {
    // NFID logout logic would go here
    console.log('NFID logout');
};
