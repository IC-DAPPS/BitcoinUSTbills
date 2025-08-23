
import { writable, get } from 'svelte/store';
import { AuthClient } from '@dfinity/auth-client';
import type { Identity } from '@dfinity/agent';
import { fetchUserProfile } from './state/user.svelte';
import { isUserRegistered } from './api';
import { goto } from '$app/navigation';
import { IDENTITY_PROVIDER } from './const';
import { getAgent } from './actors/agents.ic';
import { createActor, actor } from './agent';
import { adminList } from './state/admin-list.svelte';

export interface AuthState {
  isLoggedIn: boolean;
  identity: Identity | null;
  authClient: AuthClient | null;
}

const defaultState: AuthState = {
  isLoggedIn: false,
  identity: null,
  authClient: null,
};

export const authStore = writable<AuthState>(defaultState);

export async function initAuth() {
  const authClient = await AuthClient.create();
  const isLoggedIn = await authClient.isAuthenticated();
  const identity = isLoggedIn ? authClient.getIdentity() : null;

  authStore.set({ isLoggedIn, identity, authClient });
}

export async function login() {
  const authClient = get(authStore).authClient;
  if (!authClient) return;

  await authClient.login({
    identityProvider: IDENTITY_PROVIDER,
    onSuccess: async () => {
      const identity = authClient.getIdentity();
      authStore.update(store => ({ ...store, isLoggedIn: true, identity }));

      // Initialize actor before making API calls
      const agent = await getAgent({ identity });
      const newActor = await createActor(agent);
      actor.set(newActor);

      // Now we can safely make API calls
      try {
        if (adminList.includes(identity.getPrincipal().toString())) {
          goto('/admin/kyc');
        } else if (await isUserRegistered()) {
          goto('/dashboard');
        } else {
          goto('/register');
        }
      } catch (error) {
        console.error('Error checking user registration:', error);
        // If there's an error, assume user needs to register
        goto('/register');
      }
    },
  });
}

export async function logout() {
  const authClient = get(authStore).authClient;
  if (!authClient) return;

  await authClient.logout();
  authStore.update(store => ({ ...store, isLoggedIn: false, identity: null }));
}
