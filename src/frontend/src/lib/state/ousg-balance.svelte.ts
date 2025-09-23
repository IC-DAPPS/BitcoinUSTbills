import { getOUSGBalance } from '$lib/services/minting.service';
import { authStore } from '$lib/stores/auth.store';

export const ousgBalance = $state({
    balance: 0n,
    loading: false,
    error: null as string | null
});

export const fetchOUSGBalance = async () => {
    if (!authStore.isAuthenticated) {
        ousgBalance.balance = 0n;
        ousgBalance.error = null;
        return;
    }

    ousgBalance.loading = true;
    ousgBalance.error = null;

    try {
        const balance = await getOUSGBalance();
        if (balance !== null) {
            ousgBalance.balance = balance;
        } else {
            ousgBalance.error = 'Failed to fetch OUSG balance';
        }
    } catch (error) {
        console.error('Error fetching OUSG balance:', error);
        ousgBalance.error = 'Failed to fetch OUSG balance';
    } finally {
        ousgBalance.loading = false;
    }
};

// Auto-fetch balance when authentication state changes
$effect(() => {
    if (authStore.isAuthenticated) {
        fetchOUSGBalance();
    } else {
        ousgBalance.balance = 0n;
        ousgBalance.error = null;
    }
});
