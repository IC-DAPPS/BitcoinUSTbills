import { backendActorPromise } from "./agent";

export async function get(): Promise<string> {
  const backendActor = await backendActorPromise;
  const result = await backendActor.get_principal_data();

  if ("Err" in result) {
    console.error("Network error: failed to call IC from `get`");
    throw new Error("failed to call IC from `get`");
  }

  return result.Ok;
}

export async function set(value: string) {
  const backendActor = await backendActorPromise;
  await backendActor.set_principal_data(value);
}
