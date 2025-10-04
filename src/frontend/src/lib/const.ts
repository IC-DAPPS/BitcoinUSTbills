export const HOST = import.meta.env.VITE_DFX_NETWORK != "ic" ? "http://localhost:8080" : "https://ic0.app"

export const FETCH_ROOT_KEY = import.meta.env.VITE_DFX_NETWORK != "ic"

export const IDENTITY_PROVIDER =
    import.meta.env.VITE_DFX_NETWORK === "ic"
        ? "https://identity.ic0.app"
        : `http://${import.meta.env.VITE_CANISTER_ID_II}.localhost:8080`;

// Canister IDs
export const BACKEND_CANISTER_ID = import.meta.env.VITE_CANISTER_ID_BACKEND;
export const OUSG_LEDGER_CANISTER_ID = import.meta.env.VITE_CANISTER_ID_OUSG_LEDGER ?? 'ucwa4-rx777-77774-qaada-cai';
export const CKBTC_LEDGER_CANISTER_ID = import.meta.env.VITE_CANISTER_ID_CKBTC_LEDGER;

console.log('BACKEND_CANISTER_ID', BACKEND_CANISTER_ID);
console.log('OUSG_LEDGER_CANISTER_ID', OUSG_LEDGER_CANISTER_ID);
console.log('CKBTC_LEDGER_CANISTER_ID', CKBTC_LEDGER_CANISTER_ID);