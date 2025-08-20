import { getAgent, } from '$lib/actors/agents.ic';

import { assertNonNullish } from '@dfinity/utils';
import { authStore } from '$lib/auth';
import { get } from 'svelte/store';
import { Actor } from '@dfinity/agent';
import { icrcLedgerIdlFactory, type IcrcLedgerActor } from '$lib/types/actors';


export const getIcrcLedgerActor = async (canisterId: string): Promise<IcrcLedgerActor> => {
	const { identity } = get(authStore);

	assertNonNullish(identity, 'identity is Nullish value. please login');
	const agent = await getAgent({ identity });

	return Actor.createActor(icrcLedgerIdlFactory, { agent, canisterId });

};



