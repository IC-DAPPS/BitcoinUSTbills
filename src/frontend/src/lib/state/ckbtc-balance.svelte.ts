import { balance } from "$lib/api/icrc.ledger.api";
import { authStore } from "$lib/auth";
import { CKBTC_LEDGER_CANISTER_ID, DECIMALS } from "$lib/constants";
import type { Balance } from "$lib/types/state";
import { nonNullish } from "@dfinity/utils";
import { toast } from "svelte-sonner";
import { get } from "svelte/store";


export const ckbtcBalance: Balance = $state({
    number: 0,
    format: '0.00'
});


export const fetchCkbtcBalance = async () => {

    const { identity } = get(authStore);

    try {
        if (nonNullish(identity)) {
            const response = await balance({
                canisterId: CKBTC_LEDGER_CANISTER_ID,
                owner: identity.getPrincipal(),
            });
            const number = fromBigIntDecimals(response);
            const format = formatRawNumber(number);

            ckbtcBalance.number = number;
            ckbtcBalance.format = format;
        }


    } catch (error) {
        console.error(error);

        toast.error('Something went wrong while fetching balance.');
    }
};

export function fromBigIntDecimals(value: bigint): number {


    return Number(value) / 10 ** DECIMALS;
}

export function formatRawNumber(number: number): string {
    // Add thousand separators to integer part by splitting the number on the decimal point.
    let [intPart, decimalPart] = number.toString().split('.');
    intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "'");

    return decimalPart ? `${intPart}.${decimalPart}` : intPart;
}
