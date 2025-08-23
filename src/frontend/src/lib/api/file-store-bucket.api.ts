import { getFileStoreBucketActor } from "$lib/actors/file-store-bucket.actor";
import { authStore } from "$lib/auth";
import type { FileStoreBucketActor } from "$lib/types/actors";
import { assertNonNullish } from "@dfinity/utils";
import { get } from "svelte/store";
import type { BatchArg, BatchId, File as BucketFile, FileInfo as BucketFileInfo } from "../../../../declarations/file_store_bucket/file_store_bucket.did";
import type { GetChunkResponse, GetFileResponse } from "$lib/types/api";

const fileStoreBucketCanisterCache = new Map<string, FileStoreBucketActor>();

export const createBatch = async (batchArg: BatchArg): Promise<BatchId> => {
    const { create_batch } = await fileStoreBucketCanister();
    return create_batch(batchArg);
}

export const uploadChunk = async (chunk: Uint8Array, batchId: bigint): Promise<void> => {
    const { upload_chunk } = await fileStoreBucketCanister();
    return upload_chunk({ chunk, batchId });
}

export const getFile = async (fileName: string): Promise<GetFileResponse> => {
    const { get } = await fileStoreBucketCanister();
    return get({ file_name: fileName });
}

export const getChunk = async (fileName: string, index: bigint): Promise<GetChunkResponse> => {
    const { get_chunk } = await fileStoreBucketCanister();
    return get_chunk({ file_name: fileName, index });
}


export const getStoredFiles = async (): Promise<Array<[string, BucketFile]>> => {
    const { get_stored_files } = await fileStoreBucketCanister();
    return get_stored_files();
}

export const isUserRegistered = async (): Promise<boolean> => {
    const { is_user_registered } = await fileStoreBucketCanister();
    return is_user_registered();
}

export const list = async (): Promise<Array<BucketFileInfo>> => {
    const { list } = await fileStoreBucketCanister();
    return list();
}

const fileStoreBucketCanister = async (): Promise<FileStoreBucketActor> => {

    let { identity } = get(authStore);

    assertNonNullish(identity, 'identity is Nullish value. please login');

    const cacheKey = identity?.getPrincipal().toString();


    if (fileStoreBucketCanisterCache.has(cacheKey)) {
        return fileStoreBucketCanisterCache.get(cacheKey)!;
    }

    const fileStoreBucketInstance = await getFileStoreBucketActor();

    fileStoreBucketCanisterCache.set(cacheKey, fileStoreBucketInstance);
    return fileStoreBucketInstance;
}