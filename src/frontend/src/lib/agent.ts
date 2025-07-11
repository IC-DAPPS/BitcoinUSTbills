import { createAgent as dfinityCreateAgent } from "@dfinity/utils";
import { AnonymousIdentity, Actor } from "@dfinity/agent";
import type { ActorSubclass, HttpAgent, Identity, CallConfig, ActorConfig } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/backend";
import { HOST as host, FETCH_ROOT_KEY as fetchRootKey } from "./const";
import type { _SERVICE } from "../../../declarations/backend/backend.did";

// This function creates an HttpAgent. It can be exported if needed elsewhere directly.
async function setupAgentWithIdentity(identity?: Identity): Promise<HttpAgent> {
  const agentOptions: { host: string; identity: Identity; fetchRootKey?: boolean } = {
    host,
    identity: identity || new AnonymousIdentity(),
  };

  // For local development, always fetch root key
  if (import.meta.env.VITE_DFX_NETWORK !== "ic") {
    agentOptions.fetchRootKey = true;
  }

  return await dfinityCreateAgent(agentOptions);
}

// This is the function that was probably intended to be exported as createAgent
// It sets up an agent with a given identity (or anonymous if none provided)
export async function createAgent(identity?: Identity): Promise<HttpAgent> {
  return setupAgentWithIdentity(identity);
}

async function initializeActor(identity?: Identity): Promise<ActorSubclass<_SERVICE>> {
  const agent = await setupAgentWithIdentity(identity);

  const canisterId = import.meta.env.VITE_CANISTER_ID_BACKEND;
  if (!canisterId) {
    throw new Error("CANISTER_ID_BACKEND is not set in environment variables");
  }

  const actorOptions: ActorConfig = {
    canisterId,
    agent,
    callTransform: (methodName: string, args: unknown[], callConfig: CallConfig) => {
      console.log("callTransform -", { methodName, args, callConfig });
    },
  };
  return Actor.createActor<_SERVICE>(idlFactory, actorOptions);
}

export const backendActorPromise = initializeActor(); // For default anonymous actor

export async function getAuthenticatedActor(identity: Identity): Promise<ActorSubclass<_SERVICE>> {
  return initializeActor(identity);
}

// Function to get a new anonymous actor if needed after logout, to reset any prior auth state in actor instance
export async function getAnonymousActor(): Promise<ActorSubclass<_SERVICE>> {
  return initializeActor(); // No identity, so will use AnonymousIdentity
}