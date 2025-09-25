import { authStore } from "$lib/stores/auth.store";
import { fileStoreBucketIdlFactory, type FileStoreBucketActor } from "$lib/types/actors";
import { assertNonNullish } from "@dfinity/utils";
import { get } from "svelte/store";
import { getAgent, getAgentFromCache } from "./agents.ic";
import { Actor } from "@dfinity/agent";
import { FILE_STORE_BUCKET_CANISTER_ID } from "$lib/constants";

export const getFileStoreBucketActor = async (): Promise<FileStoreBucketActor> => {
    const { identityProvider, principal } = get(authStore);

    const canisterId = FILE_STORE_BUCKET_CANISTER_ID;

    if (identityProvider === 'ii' || identityProvider === 'nfid') {
        const agent = getAgentFromCache(principal);
        assertNonNullish(agent, 'Agent is Nullish value');
        return Actor.createActor(fileStoreBucketIdlFactory, { agent, canisterId });
    } else if (identityProvider === 'plug') {
        // TODO: Add Plug support for file store bucket
        throw new Error('Plug wallet not supported for file store bucket');
    } else if (identityProvider === 'anonymous') {
        const agent = await getAgent({ identity: null });
        return Actor.createActor(fileStoreBucketIdlFactory, { agent, canisterId });
    }

    throw new Error('Invalid identity provider');
}