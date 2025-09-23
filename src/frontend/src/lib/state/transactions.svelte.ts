import { actor } from '$lib/agent';
import { get } from 'svelte/store';
import { authStore } from '$lib/stores/auth.store';
import type { Deposit } from '../../../declarations/backend/backend.did';

export interface Transaction {
    id: string;
    type: 'mint' | 'redeem' | 'deposit' | 'withdraw';
    amount: bigint;
    status: 'pending' | 'completed' | 'failed';
    timestamp: number;
    description: string;
    ousgAmount?: bigint;
    ckbtcAmount?: bigint;
    usdValue?: number;
}

export const transactions = $state({
    list: [] as Transaction[],
    loading: false,
    error: null as string | null
});

export const fetchTransactions = async () => {
    if (!authStore.isAuthenticated) {
        transactions.list = [];
        transactions.error = null;
        return;
    }

    transactions.loading = true;
    transactions.error = null;

    try {
        const backendActor = get(actor);
        if (!backendActor) {
            throw new Error('Backend actor not available');
        }

        const deposits = await backendActor.get_user_deposits();
        if ('Ok' in deposits) {
            const depositTransactions: Transaction[] = deposits.Ok.map((deposit: Deposit) => ({
                id: `deposit-${deposit.id}`,
                type: 'mint' as const,
                amount: deposit.ousg_minted,
                status: deposit.status === 'Validated' ? 'completed' :
                    deposit.status === 'Failed' ? 'failed' : 'pending',
                timestamp: Number(deposit.created_at),
                description: `Minted ${formatOUSGAmount(deposit.ousg_minted)} OUSG tokens`,
                ousgAmount: deposit.ousg_minted,
                ckbtcAmount: deposit.ckbtc_amount,
                usdValue: deposit.usd_value
            }));

            transactions.list = depositTransactions.sort((a, b) => b.timestamp - a.timestamp);
        } else {
            transactions.error = 'Failed to fetch transactions';
        }
    } catch (error) {
        console.error('Error fetching transactions:', error);
        transactions.error = 'Failed to fetch transactions';
    } finally {
        transactions.loading = false;
    }
};

function formatOUSGAmount(amount: bigint): string {
    const formatted = Number(amount) / 1_000_000; // Convert from units to tokens
    return formatted.toFixed(6);
}

// Auto-fetch transactions when authentication state changes
$effect(() => {
    if (authStore.isAuthenticated) {
        fetchTransactions();
    } else {
        transactions.list = [];
        transactions.error = null;
    }
});
