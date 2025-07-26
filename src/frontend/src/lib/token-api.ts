import { Principal } from '@dfinity/principal';
import { createActor } from '../../../declarations/ustb_token_ledger';

// ============= ICRC1 TOKEN API =============

/**
 * ICRC1 Account type
 */
export interface ICRC1Account {
    owner: Principal;
    subaccount?: Uint8Array;
}

/**
 * ICRC1 Transfer Arguments
 */
export interface ICRC1TransferArgs {
    from_subaccount?: Uint8Array;
    to: ICRC1Account;
    amount: bigint;
    fee?: bigint;
    memo?: Uint8Array;
    created_at_time?: bigint;
}

/**
 * ICRC1 Transfer Result
 */
export type ICRC1TransferResult =
    | { Ok: bigint }  // Block index
    | { Err: ICRC1TransferError };

export interface ICRC1TransferError {
    BadFee?: { expected_fee: bigint };
    BadBurn?: { min_burn_amount: bigint };
    InsufficientFunds?: { balance: bigint };
    TooOld?: null;
    CreatedInFuture?: { ledger_time: bigint };
    TemporarilyUnavailable?: null;
    Duplicate?: { duplicate_of: bigint };
    GenericError?: { error_code: bigint; message: string };
}

/**
 * Get token ledger actor instance
 */
function getTokenActor() {
    // Use the declarations generated for ustb_token_ledger
    return createActor(process.env.CANISTER_ID_USTB_TOKEN_LEDGER || 'rdmx6-jaaaa-aaaah-qcaiq-cai');
}

/**
 * Get ICRC1 token balance for an account
 */
export async function getTokenBalance(account: ICRC1Account): Promise<bigint> {
    const actor = getTokenActor();
    return await actor.icrc1_balance_of(account);
}

/**
 * Transfer ICRC1 tokens
 */
export async function transferTokens(args: ICRC1TransferArgs): Promise<ICRC1TransferResult> {
    const actor = getTokenActor();
    return await actor.icrc1_transfer(args);
}

/**
 * Get token metadata
 */
export async function getTokenMetadata() {
    const actor = getTokenActor();
    const [name, symbol, decimals, fee] = await Promise.all([
        actor.icrc1_name(),
        actor.icrc1_symbol(),
        actor.icrc1_decimals(),
        actor.icrc1_fee()
    ]);

    return { name, symbol, decimals, fee };
}

/**
 * Create ICRC1 account from principal
 */
export function createAccount(principal: Principal): ICRC1Account {
    return {
        owner: principal,
        subaccount: undefined
    };
}

/**
 * Convert principal string to ICRC1 account
 */
export function principalToAccount(principalStr: string): ICRC1Account {
    return createAccount(Principal.fromText(principalStr));
}

/**
 * Helper function to handle token transfer errors
 */
export function getTokenErrorMessage(error: ICRC1TransferError): string {
    if (error.BadFee) {
        return `Invalid fee. Expected: ${error.BadFee.expected_fee}`;
    }
    if (error.InsufficientFunds) {
        return `Insufficient funds. Balance: ${error.InsufficientFunds.balance}`;
    }
    if (error.TemporarilyUnavailable) {
        return 'Token ledger temporarily unavailable. Please try again.';
    }
    if (error.TooOld) {
        return 'Transaction too old. Please try again.';
    }
    if (error.CreatedInFuture) {
        return 'Transaction created in future. Please check your system time.';
    }
    if (error.Duplicate) {
        return 'Duplicate transaction detected.';
    }
    if (error.GenericError) {
        return `Token error: ${error.GenericError.message}`;
    }
    return 'Unknown token error occurred.';
}

/**
 * Format token amount for display (considering decimals)
 */
export function formatTokenAmount(amount: bigint, decimals: number = 8): string {
    const divisor = BigInt(10 ** decimals);
    const wholePart = amount / divisor;
    const fractionalPart = amount % divisor;

    if (fractionalPart === BigInt(0)) {
        return wholePart.toString();
    }

    const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    const trimmedFractional = fractionalStr.replace(/0+$/, '');

    return `${wholePart}.${trimmedFractional}`;
}

/**
 * Parse token amount from string (considering decimals)
 */
export function parseTokenAmount(amountStr: string, decimals: number = 8): bigint {
    const parts = amountStr.split('.');
    const wholePart = BigInt(parts[0] || '0');

    if (parts.length === 1) {
        return wholePart * BigInt(10 ** decimals);
    }

    const fractionalPart = parts[1].padEnd(decimals, '0').slice(0, decimals);
    const fractionalBigInt = BigInt(fractionalPart);

    return wholePart * BigInt(10 ** decimals) + fractionalBigInt;
} 