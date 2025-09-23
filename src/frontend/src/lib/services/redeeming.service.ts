import { get } from 'svelte/store';
import { toast } from 'svelte-sonner';
import { authStore } from '$lib/stores/auth.store';

export interface RedeemingResult {
    success: boolean;
    ckbtcAmount?: bigint;
    errorMessage?: string;
}

export const redeemOUSG = async (ousgAmount: bigint): Promise<RedeemingResult> => {
    const { backend } = get(authStore);
    if (!backend) {
        toast.error('Not authenticated');
        return { success: false, errorMessage: 'Not authenticated' };
    }

    try {
        const toastId = toast.loading('Redeeming OUSG tokens...', {
            duration: 30000
        });

        const response = await backend.redeem_ousg_tokens(ousgAmount);

        if ('Ok' in response) {
            toast.success('OUSG tokens redeemed successfully!', {
                id: toastId,
                duration: 5000
            });

            return {
                success: true,
                ckbtcAmount: response.Ok
            };
        } else {
            const errorMessage = getErrorMessage(response.Err);
            toast.error(errorMessage, {
                id: toastId,
                duration: 5000
            });

            return {
                success: false,
                errorMessage
            };
        }
    } catch (error) {
        console.error('Error redeeming OUSG:', error);
        toast.error('Failed to redeem OUSG tokens');
        return { success: false, errorMessage: 'Failed to redeem OUSG tokens' };
    }
};

function getErrorMessage(error: any): string {
    if (typeof error === 'string') {
        return error;
    }

    if (error && typeof error === 'object') {
        if ('UserNotFound' in error) {
            return 'User not found';
        }
        if ('KYCNotVerified' in error) {
            return 'KYC verification required';
        }
        if ('ValidationError' in error) {
            return error.ValidationError;
        }
        if ('StorageError' in error) {
            return error.StorageError;
        }
    }

    return 'Unknown error occurred';
}
