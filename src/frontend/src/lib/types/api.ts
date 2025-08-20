import type { MetadataValue, Subaccount } from '@dfinity/ledger-icrc/dist/candid/icrc_ledger';

export type CanisterApiFunctionParams<T = unknown> = T & {
	canisterId: string;
};
export enum IcrcMetadataResponseEntries {
	SYMBOL = 'icrc1:symbol',
	NAME = 'icrc1:name',
	DECIMALS = 'icrc1:decimals',
	FEE = 'icrc1:fee',
	LOGO = 'icrc1:logo'
}

export type IcrcTokenMetadataResponse = [string | IcrcMetadataResponseEntries, MetadataValue][];
