import { authStore } from '$lib/stores/auth.store';
import { get } from 'svelte/store';
import { toast } from 'svelte-sonner';
import type { ResultSuccess } from '$lib/types/utils';
import { fetchCkbtcBalance } from '$lib/state/ckbtc-balance.svelte';
import { fetchOUSGBalance } from '$lib/state/ousg-balance.svelte';

let toastId: string | number;

export const mintOUSG = async (ckbtcAmount: bigint): Promise<ResultSuccess> => {
    const { backend } = get(authStore);

    if (!backend) {
        return { success: false, err: 'Backend actor not available' };
    }

    try {
        toastId = toast.loading('Minting OUSG tokens...', {
            id: toastId,
            duration: 8000
        });

        // Call the backend minting function
        const response = await backend.notify_deposit({
            block_index: 0n, // This should be the actual block index from ckBTC transfer
            ckbtc_amount: ckbtcAmount
        });

        if (response.success) {
            toast.success('OUSG tokens minted successfully!', {
                id: toastId,
                duration: 4000
            });

            // Update balances
            await fetchCkbtcBalance();
            await fetchOUSGBalance();

            return { success: true };
        } else {
            const errorMessage = response.error_message?.[0] || 'Minting failed';
            toast.error(errorMessage, {
                id: toastId,
                duration: 4000
            });

            return { success: false, err: errorMessage };
        }
    } catch (error) {
        console.error('Error minting OUSG:', error);
        const errorMessage = 'Failed to mint OUSG tokens';

        toast.error(errorMessage, {
            id: toastId,
            duration: 4000
        });

        return { success: false, err: errorMessage };
    }
};

export const getCurrentBTCPrice = async (): Promise<number | null> => {
    const { backend } = get(authStore);

    if (!backend) {
        return null;
    }

    try {
        const response = await backend.get_current_btc_price();

        if ('Ok' in response) {
            return response.Ok;
        } else {
            console.error('Error fetching BTC price:', response.Err);
            return null;
        }
    } catch (error) {
        console.error('Error fetching BTC price:', error);
        return null;
    }
};

export const calculateOUSGForUSD = async (usdAmount: number): Promise<bigint | null> => {
    const { backend } = get(authStore);

    if (!backend) {
        return null;
    }

    try {
        const response = await backend.calculate_ousg_for_usd(usdAmount);
        return response;
    } catch (error) {
        console.error('Error calculating OUSG for USD:', error);
        return null;
    }
};

export const getOUSGBalance = async (): Promise<bigint | null> => {
    const { backend } = get(authStore);

    if (!backend) {
        return null;
    }

    try {
        const response = await backend.get_ousg_balance();

        if ('Ok' in response) {
            return response.Ok;
        } else {
            console.error('Error fetching OUSG balance:', response.Err);
            return null;
        }
    } catch (error) {
        console.error('Error fetching OUSG balance:', error);
        return null;
    }
};