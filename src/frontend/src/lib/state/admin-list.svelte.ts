import { getAuthorizedPrincipals } from "$lib/api";


export const adminList: string[] = $state([]);


export const fetchAdminList = async () => {
    try {
        const response = await getAuthorizedPrincipals();
        adminList.push(...response.map(principal => principal.toString()));

        console.log('adminList', response);
    } catch (error) {
        console.error(error);
    }
}