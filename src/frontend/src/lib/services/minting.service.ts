import { authStore } from '$lib/stores/auth.store';
import { get } from 'svelte/store';
import { toast } from 'svelte-sonner';
import type { ResultSuccess } from '$lib/types/utils';
import { fetchCkbtcBalance } from '$lib/state/ckbtc-balance.svelte';
import { fetchOUSGBalance } from '$lib/state/ousg-balance.svelte';
import { transfer } from '$lib/api/icrc.ledger.api';
import { CKBTC_LEDGER_CANISTER_ID, BACKEND_CANISTER_ID } from '$lib/constants';
import type { BlockIndex } from '@dfinity/ledger-icrc/dist/candid/icrc_ledger';
import { Principal } from '@dfinity/principal';

let toastId: string | number;

// Automatic minting flow similar to DoxaV3
export const mintOUSGAutomatic = async (ckbtcAmount: bigint): Promise<ResultSuccess> => {
    // Step 1: Transfer ckBTC to backend canister
    const ckbtcBlockIndex = await transferCkbtcToBackend(ckbtcAmount);
    if (!ckbtcBlockIndex) {
        return { success: false, err: 'Failed to send ckBTC to Backend' };
    }

    // Step 2: Notify backend to process deposit and mint OUSG
    const notifyResult = await notifyBackendForMinting(ckbtcBlockIndex, ckbtcAmount);

    return notifyResult;
};

// Transfer ckBTC to backend canister (similar to DoxaV3 transferCkusdcToReserve)
const transferCkbtcToBackend = async (amount: bigint): Promise<BlockIndex | null> => {
    try {
        // Debug logging
        console.log('Transfer details:', {
            canisterId: CKBTC_LEDGER_CANISTER_ID,
            backendId: BACKEND_CANISTER_ID,
            amount: amount.toString()
        });

        // Validate canister IDs
        if (!CKBTC_LEDGER_CANISTER_ID) {
            throw new Error('ckBTC Ledger Canister ID not configured');
        }
        if (!BACKEND_CANISTER_ID) {
            throw new Error('Backend Canister ID not configured');
        }

        toastId = toast.loading('Sending ckBTC to Backend', {
            duration: 10000, // 10 seconds
            id: toastId
        });

        // Convert backend canister ID to Principal
        let backendPrincipal;
        try {
            backendPrincipal = Principal.fromText(BACKEND_CANISTER_ID);
        } catch (error) {
            throw new Error(`Invalid Backend Canister ID: ${BACKEND_CANISTER_ID}`);
        }

        const transferResult = await transfer({
            canisterId: CKBTC_LEDGER_CANISTER_ID,
            to: {
                owner: backendPrincipal,
                subaccount: []
            },
            amount
        });

        // Update ckBTC balance
        await fetchCkbtcBalance();

        if ('Ok' in transferResult) {
            toast.success('ckBTC sent to Backend', {
                id: toastId,
                duration: 5000
            });
            return transferResult.Ok;
        } else {
            console.error('Failed to send ckBTC to Backend', transferResult.Err);
            toast.error('Failed to send ckBTC to Backend', {
                id: toastId,
                duration: 8000
            });
            return null;
        }
    } catch (error) {
        console.error('Failed to send ckBTC to Backend', error);
        toast.error('Failed to send ckBTC to Backend ' + error, {
            id: toastId,
            duration: 8000
        });
        return null;
    }
};

// Notify backend to process deposit and mint OUSG (similar to DoxaV3 notifyStablecoinMinter)
const notifyBackendForMinting = async (blockIndex: BlockIndex, ckbtcAmount: bigint): Promise<ResultSuccess> => {
    try {
        const { backend } = get(authStore);

        if (!backend) {
            return { success: false, err: 'Backend actor not available' };
        }

        toastId = toast.loading('Notifying backend to mint OUSG', {
            duration: 10000, // 10 seconds
            id: toastId
        });

        const notifyResult = await backend.notify_deposit({
            block_index: blockIndex,
            ckbtc_amount: ckbtcAmount
        });

        if (notifyResult.success) {
            // Update balances
            await fetchCkbtcBalance();
            await fetchOUSGBalance();

            toast.success('OUSG tokens minted successfully!', {
                id: toastId,
                duration: 8000
            });
            return { success: true };
        } else {
            const errorMessage = notifyResult.error_message?.[0] || 'Minting failed';
            console.error('Failed to notify backend', errorMessage);
            toast.error('Failed to notify backend: ' + errorMessage, {
                id: toastId,
                duration: 8000
            });
            return { success: false, err: errorMessage };
        }
    } catch (error) {
        console.error('Failed to notify backend', error);
        toast.error('Failed to notify backend ' + error, {
            id: toastId,
            duration: 8000
        });
        return { success: false, err: error };
    }
};

// Legacy function - kept for backward compatibility
export const mintOUSG = async (ckbtcAmount: bigint, blockIndex: bigint): Promise<ResultSuccess> => {
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
            block_index: blockIndex,
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