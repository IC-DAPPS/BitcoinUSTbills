import { authStore } from "$lib/stores/auth.store";
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
    const { ckbtcLedger, principal } = get(authStore);

    try {
        if (nonNullish(principal) && nonNullish(ckbtcLedger)) {
            const response = await ckbtcLedger.icrc1_balance_of({
                owner: principal,
                subaccount: []
            });
            const number = fromBigIntDecimals(response);
            const format = formatRawNumber(number);

            ckbtcBalance.number = number;
            ckbtcBalance.format = format;
        }
    } catch (error) {
        console.error('Error fetching ckBTC balance:', error);
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
