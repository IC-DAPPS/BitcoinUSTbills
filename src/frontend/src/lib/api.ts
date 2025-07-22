import { backendActorPromise } from "./agent";
import type { VerifiedBrokerPurchase } from "$lib/types";

export async function getAllVerifiedBrokerPurchases(): Promise<VerifiedBrokerPurchase[]> {
  const backendActor = await backendActorPromise;
  return await backendActor.get_all_verified_broker_purchases();
}
