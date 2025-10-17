import { authStore } from '$lib/stores/auth.store';
import { get } from 'svelte/store';
import { toast } from 'svelte-sonner';
import type { ResultSuccess } from '$lib/types/utils';
import { fetchCkbtcBalance } from '$lib/state/ckbtc-balance.svelte';
import { fetchOUSGBalance } from '$lib/state/ousg-balance.svelte';
import { Principal } from '@dfinity/principal';
import { BACKEND_CANISTER_ID, OUSG_LEDGER_CANISTER_ID } from '$lib/constants';

let toastId: string | number;

export const approveOUSGForRedemption = async (ousgAmount: bigint): Promise<ResultSuccess> => {
    console.log('DEBUG: approveOUSGForRedemption called with amount:', ousgAmount.toString());
    const { ousgLedger, isAuthenticated } = get(authStore);

    if (!isAuthenticated || !ousgLedger) {
        return { success: false, err: 'Please connect your wallet first' };
    }

    try {
        toastId = toast.loading('Approving BBILL tokens for redemption...', {
            id: toastId,
            duration: 8000
        });

        // Approve backend canister to spend user's OUSG tokens
        const approvalResponse = await ousgLedger.icrc2_approve({
            from_subaccount: [],
            spender: {
                owner: Principal.fromText(BACKEND_CANISTER_ID),
                subaccount: []
            },
            amount: ousgAmount,
            expected_allowance: [],
            expires_at: [],
            fee: [],
            memo: [],
            created_at_time: []
        });

        console.log('DEBUG: Approval response:', approvalResponse);

        if ('Ok' in approvalResponse) {
            console.log('DEBUG: Approval successful');
            toast.success('BBILL tokens approved for redemption!', {
                id: toastId,
                duration: 2000
            });
            return { success: true };
        } else {
            const errorMessage = `Approval failed: ${JSON.stringify(approvalResponse.Err) || 'Unknown error'}`;
            console.error('DEBUG: Approval failed:', approvalResponse.Err);
            toast.error(errorMessage, {
                id: toastId,
                duration: 4000
            });
            return { success: false, err: errorMessage };
        }
    } catch (error) {
        console.error('Error approving BBILL:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to approve BBILL tokens';

        toast.error(errorMessage, {
            id: toastId,
            duration: 4000
        });

        return { success: false, err: errorMessage };
    }
};

export const redeemOUSG = async (ousgAmount: bigint): Promise<ResultSuccess> => {
    const { backend, isAuthenticated } = get(authStore);

    if (!isAuthenticated || !backend) {
        return { success: false, err: 'Please connect your wallet first' };
    }

    try {
        console.log('DEBUG: redeemOUSG called with amount:', ousgAmount.toString());

        toastId = toast.loading('Redeeming BBILL tokens...', {
            id: toastId,
            duration: 8000
        });

        // Call the backend redeem function
        const response = await backend.redeem_ousg_tokens(ousgAmount);

        console.log('DEBUG: Backend redemption response:', response);

        if ('Ok' in response) {
            const ckbtcAmount = response.Ok;
            console.log('DEBUG: Received ckBTC amount:', ckbtcAmount.toString());

            toast.success(`BBILL tokens redeemed successfully! Received ${Number(ckbtcAmount) / 100_000_000} ckBTC`, {
                id: toastId,
                duration: 4000
            });

            // Update balances
            await fetchCkbtcBalance();
            await fetchOUSGBalance();

            return { success: true };
        } else {
            const errorMessage = `Redeeming failed: ${JSON.stringify(response.Err) || 'Unknown error'}`;
            console.error('DEBUG: Redemption error:', response.Err);

            toast.error(errorMessage, {
                id: toastId,
                duration: 4000
            });

            return { success: false, err: errorMessage };
        }
    } catch (error) {
        console.error('Error redeeming BBILL:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to redeem BBILL tokens';

        toast.error(errorMessage, {
            id: toastId,
            duration: 4000
        });

        return { success: false, err: errorMessage };
    }
};