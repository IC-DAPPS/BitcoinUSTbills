import { get } from 'svelte/store';
import { toast } from 'svelte-sonner';
import type { DepositRequest, DepositResponse } from '../../../../declarations/backend/backend.did';
import { authStore } from '$lib/stores/auth.store';

export interface MintingResult {
    success: boolean;
    depositId?: bigint;
    ousgMinted?: bigint;
    errorMessage?: string;
}

export const mintOUSG = async (ckbtcAmount: bigint, blockIndex: bigint): Promise<MintingResult> => {
    const { backend } = get(authStore);
    if (!backend) {
        toast.error('Not authenticated');
        return { success: false, errorMessage: 'Not authenticated' };
    }

    try {
        const toastId = toast.loading('Minting OUSG tokens...', {
            duration: 30000
        });

        const depositRequest: DepositRequest = {
            ckbtc_amount: ckbtcAmount,
            block_index: blockIndex
        };

        const response: DepositResponse = await backend.notify_deposit(depositRequest);

        if (response.success) {
            toast.success('OUSG tokens minted successfully!', {
                id: toastId,
                duration: 5000
            });

            return {
                success: true,
                depositId: response.deposit_id[0],
                ousgMinted: response.ousg_minted[0]
            };
        } else {
            toast.error(response.error_message[0] || 'Failed to mint OUSG tokens', {
                id: toastId,
                duration: 5000
            });

            return {
                success: false,
                errorMessage: response.error_message[0] || 'Failed to mint OUSG tokens'
            };
        }
    } catch (error) {
        console.error('Error minting OUSG:', error);
        toast.error('Failed to mint OUSG tokens');
        return { success: false, errorMessage: 'Failed to mint OUSG tokens' };
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
        }
        return null;
    } catch (error) {
        console.error('Error getting OUSG balance:', error);
        return null;
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
        }
        return null;
    } catch (error) {
        console.error('Error getting BTC price:', error);
        return null;
    }
};

export const calculateOUSGForUSD = async (usdAmount: number): Promise<bigint | null> => {
    const { backend } = get(authStore);
    if (!backend) {
        return null;
    }

    try {
        return await backend.calculate_ousg_for_usd(usdAmount);
    } catch (error) {
        console.error('Error calculating OUSG for USD:', error);
        return null;
    }
};

export const calculateCKBTCUSDValue = async (ckbtcAmount: bigint, btcPrice: number): Promise<number | null> => {
    const { backend } = get(authStore);
    if (!backend) {
        return null;
    }

    try {
        return await backend.calculate_ckbtc_usd_value(ckbtcAmount, btcPrice);
    } catch (error) {
        console.error('Error calculating ckBTC USD value:', error);
        return null;
    }
};
