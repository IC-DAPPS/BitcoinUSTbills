import { authStore } from '$lib/stores/auth.store';
import { get } from 'svelte/store';
import { toast } from 'svelte-sonner';
import type { ResultSuccess } from '$lib/types/utils';
import { fetchCkbtcBalance } from '$lib/state/ckbtc-balance.svelte';
import { fetchOUSGBalance } from '$lib/state/ousg-balance.svelte';

let toastId: string | number;

export const redeemOUSG = async (ousgAmount: bigint): Promise<ResultSuccess> => {
    const { backend } = get(authStore);

    if (!backend) {
        return { success: false, err: 'Backend actor not available' };
    }

    try {
        toastId = toast.loading('Redeeming OUSG tokens...', {
            id: toastId,
            duration: 8000
        });

        // Call the backend redeem function
        const response = await backend.redeem_ousg_tokens(ousgAmount);

        if ('Ok' in response) {
            toast.success('OUSG tokens redeemed successfully!', {
                id: toastId,
                duration: 4000
            });

            // Update balances
            await fetchCkbtcBalance();
            await fetchOUSGBalance();

            return { success: true };
        } else {
            const errorMessage = 'Redeeming failed';
            toast.error(errorMessage, {
                id: toastId,
                duration: 4000
            });

            return { success: false, err: errorMessage };
        }
    } catch (error) {
        console.error('Error redeeming OUSG:', error);
        const errorMessage = 'Failed to redeem OUSG tokens';

        toast.error(errorMessage, {
            id: toastId,
            duration: 4000
        });

        return { success: false, err: errorMessage };
    }
};