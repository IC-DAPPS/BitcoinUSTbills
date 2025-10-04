import { HttpAgent, type Identity, type Principal } from '@dfinity/agent';
import { HOST, FETCH_ROOT_KEY } from '$lib/const';

let agents: Map<string, HttpAgent> | null = null;

export const getAgent = async ({ identity }: { identity: Identity }): Promise<HttpAgent> => {
	const principal = identity.getPrincipal();

	if (agents === null) {
		agents = new Map();
	}

	const principalString = principal.toString();

	if (agents.has(principalString)) {
		return agents.get(principalString)!;
	}

	const agent = await createAgent({ identity });

	agents.set(principalString, agent);

	return agent;
};

export const createAgent = ({
	identity,
	verifyQuerySignatures = true
}: {
	identity: Identity;
	verifyQuerySignatures?: boolean;
}): Promise<HttpAgent> =>
	new Promise((resolve) => {
		const agent = new HttpAgent({
			identity,
			host: HOST,
			verifyQuerySignatures
		});

		if (FETCH_ROOT_KEY) {
			agent.fetchRootKey().then(() => resolve(agent));
		} else {
			resolve(agent);
		}
	});

export const clearAgents = () => (agents = null);

export const getAgentFromCache = (principal: Principal): HttpAgent | undefined => {
	return agents?.get(principal.toString());
};