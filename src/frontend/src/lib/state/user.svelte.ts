import { getUserProfile } from "$lib/api";
import { authStore } from "$lib/auth";
import type { KYCStatus, Profile, UserSate } from "$lib/types/state";
import { formatBigIntNanoSecTimestamp } from "$lib/utils/data-time.utils";
import { get } from "svelte/store";
import type { User } from "../../../../declarations/backend/backend.did";
import type { BackendKYCStatus } from "$lib/types/result";
import { goto } from "$app/navigation";

export const userSate: UserSate = $state({});


export const fetchUserProfile = async () => {
    try {
        const { isLoggedIn } = get(authStore);

        if (!isLoggedIn) return;

        const response = await getUserProfile();

        if ('Ok' in response) {


            userSate.profile = transformUserToProfile(response.Ok)
        } else {

            const err = response.Err;
            if ('UserNotFound' in err) {
                goto('/register')
            }
        }

    } catch (error) {
        console.error(error)
    }

}

function transformUserToProfile(user: User): Profile {

    const { updated_at, principal, country, kyc_tier, created_at, email, total_invested, kyc_status, phone_number, is_active, total_yield_earned } = user;

    return {
        'updated_at': formatBigIntNanoSecTimestamp(updated_at),
        principal,
        country,
        kyc_tier,
        created_at: formatBigIntNanoSecTimestamp(created_at),
        email,
        total_invested: Number(total_invested),
        kyc_status: convertKYCStatus(kyc_status),
        is_active,
        phone_number: phone_number[0],
    }

}




// Function to convert from discriminated union to simple union
export function convertKYCStatus(backendStatus: BackendKYCStatus): KYCStatus {
    if ('Rejected' in backendStatus) return 'Rejected';
    if ('Verified' in backendStatus) return 'Verified';
    if ('Expired' in backendStatus) return 'Expired';
    if ('Pending' in backendStatus) return 'Pending';

    // This should never happen, but TypeScript requires it
    throw new Error('Invalid KYC status');
}