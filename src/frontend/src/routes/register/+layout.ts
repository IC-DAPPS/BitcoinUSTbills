import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
    // This layout load function can be used for route-specific logic
    // The actual protection logic is in the +page.svelte component
    // since we need to check authentication and registration status
    return {};
};
