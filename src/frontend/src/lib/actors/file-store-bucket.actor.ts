import { authStore } from "$lib/auth";
import { fileStoreBucketIdlFactory, type FileStoreBucketActor } from "$lib/types/actors";
import { assertNonNullish } from "@dfinity/utils";
import { get } from "svelte/store";
import { getAgent } from "./agents.ic";
import { Actor } from "@dfinity/agent";
import { FILE_STORE_BUCKET_CANISTER_ID } from "$lib/constants";



export const getFileStoreBucketActor = async (): Promise<FileStoreBucketActor> => {
    const { identity } = get(authStore);

    assertNonNullish(identity, 'identity is Nullish value. please login');
    const agent = await getAgent({ identity });

    return Actor.createActor(fileStoreBucketIdlFactory, { agent, canisterId: FILE_STORE_BUCKET_CANISTER_ID });
}