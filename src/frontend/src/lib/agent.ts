import { Actor, HttpAgent, type Identity, type ActorSubclass } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/backend";
import { writable } from "svelte/store";
import { authStore } from "./auth";
import type { _SERVICE } from "../../../declarations/backend/backend.did";
import { getAgent } from "./actors/agents.ic";
import { onDestroy } from "svelte";

const canisterId = import.meta.env.VITE_CANISTER_ID_BACKEND;

async function createActor(agent: HttpAgent) {
  return Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId,
  });
}


export const actor = writable<ActorSubclass<_SERVICE> | null>(null);

export const newActorUnsubscriber = authStore.subscribe(async ({ identity }) => {
  if (identity) {
    const agent = await getAgent({ identity });
    const newActor = await createActor(agent);
    actor.set(newActor);
  } else {
    actor.set(null);
  }
});

