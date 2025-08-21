
import { transfer } from '$lib/api/icrc.ledger.api';
import { fetchCkbtcBalance } from '$lib/state/ckbtc-balance.svelte';
import type { ResultSuccess } from '$lib/types/utils';
import type { IcrcAccount } from '@dfinity/ledger-icrc';
import type { TransferResult as IcrcTransferResult } from '@dfinity/ledger-icrc/dist/candid/icrc_ledger';
import { toBigIntDecimals } from '$lib/utils/decimals.utils';
import { toast } from 'svelte-sonner';

let toastId: string | number | undefined;

export const handleTransferResponse = async (
	response: IcrcTransferResult,
	amount: number,


): Promise<ResultSuccess> => {
	if ('Ok' in response) {
		toastId = toast.success(`${amount} ckBTC sent successfully.`, {
			id: toastId
		});

		await fetchCkbtcBalance();
		return { success: true };
	} else {
		console.error(`Failed to send ${amount} ckBTC.`, response);
		toastId = toast.error(`Failed to send ${amount} ckBTC.`, {
			id: toastId
		});
		return { success: false, err: response };
	}
};

export const transferToken = async (
	amount: number,
	to: IcrcAccount,
	ledgerId: string
): Promise<ResultSuccess> => {
	try {

		toastId = toast.loading(`Sending ${amount} ckBTC...`, {
			id: toastId
		});


		const response = await transfer({
			canisterId: ledgerId,
			to: {
				owner: to.owner,
				subaccount: to.subaccount ? [to.subaccount] : []
			},
			amount: toBigIntDecimals(amount)
		});

		return await handleTransferResponse(response, amount);

	} catch (error) {
		console.error(error);
		toastId = toast.error('Something went wrong while transferring token.', {
			id: toastId
		});
		return { success: false, err: error };
	}
};
