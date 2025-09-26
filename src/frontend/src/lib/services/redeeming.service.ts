import { authStore } from '$lib/stores/auth.store';
import { get } from 'svelte/store';
import { toast } from 'svelte-sonner';
import type { ResultSuccess } from '$lib/types/utils';
import { fetchCkbtcBalance } from '$lib/state/ckbtc-balance.svelte';
import { fetchOUSGBalance } from '$lib/state/ousg-balance.svelte';

let toastId: string | number;

export const approveOUSGForRedemption = async (ousgAmount: bigint): Promise<ResultSuccess> => {
    const { backend } = get(authStore);

    if (!backend) {
        return { success: false, err: 'Backend actor not available' };
    }

    try {
        toastId = toast.loading('Approving OUSG tokens for redemption...', {
            id: toastId,
            duration: 8000
        });

        // First approve the tokens for redemption
        const approvalResponse = await backend.approve_ousg_for_redemption(ousgAmount);

        if ('Ok' in approvalResponse) {
            toast.success('OUSG tokens approved for redemption!', {
                id: toastId,
                duration: 2000
            });
            return { success: true };
        } else {
            const errorMessage = `Approval failed: ${approvalResponse.Err || 'Unknown error'}`;
            toast.error(errorMessage, {
                id: toastId,
                duration: 4000
            });
            return { success: false, err: errorMessage };
        }
    } catch (error) {
        console.error('Error approving OUSG:', error);
        const errorMessage = 'Failed to approve OUSG tokens';

        toast.error(errorMessage, {
            id: toastId,
            duration: 4000
        });

        return { success: false, err: errorMessage };
    }
};

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
            const ckbtcAmount = response.Ok;
            toast.success(`OUSG tokens redeemed successfully! Received ${Number(ckbtcAmount) / 100_000_000} ckBTC`, {
                id: toastId,
                duration: 4000
            });

            // Update balances
            await fetchCkbtcBalance();
            await fetchOUSGBalance();

            return { success: true };
        } else {
            const errorMessage = `Redeeming failed: ${response.Err || 'Unknown error'}`;
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