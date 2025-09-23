export type IdentityProvider = 'ii' | 'nfid' | 'plug' | 'anonymous';

export interface AuthSignInParams {
    identityProvider?: IdentityProvider;
}
