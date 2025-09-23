import { Actor, HttpAgent, type Identity, type ActorSubclass } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/backend";
import { writable } from "svelte/store";
import type { _SERVICE } from "../../../declarations/backend/backend.did";
import { getAgent } from "./actors/agents.ic";
import { BACKEND_CANISTER_ID } from "./const";

export async function createActor(agent: HttpAgent) {
  return Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId: BACKEND_CANISTER_ID,
  });
}

export const actor = writable<ActorSubclass<_SERVICE> | null>(null);


