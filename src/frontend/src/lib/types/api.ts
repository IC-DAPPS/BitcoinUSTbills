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


export type GetFileResponse = {
	'modified': bigint,
	'content': Uint8Array | number[],
	'sha256': [] | [Uint8Array | number[]],
	'chunks_left': bigint,
	'content_type': string,
}

export type GetChunkResponse = {
	'content': Uint8Array | number[],
}

