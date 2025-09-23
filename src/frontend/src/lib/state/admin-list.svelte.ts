import { get } from 'svelte/store';
import { authStore } from '$lib/stores/auth.store';

export const adminList: string[] = $state([]);

export const fetchAdminList = async () => {
    try {
        const { backend } = get(authStore);

        if (!backend) {
            console.warn('Backend actor not available for fetching admin list');
            return;
        }

        const response = await backend.getAuthorizedPrincipals();
        adminList.push(...response.map(principal => principal.toString()));

        console.log('adminList', response);
    } catch (error) {
        console.error('Error fetching admin list:', error);
    }
};