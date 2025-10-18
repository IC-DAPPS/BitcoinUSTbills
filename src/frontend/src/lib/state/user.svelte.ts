import { authStore } from "$lib/stores/auth.store";
import type { KYCStatus, Profile, UserSate } from "$lib/types/state";
import { formatBigIntNanoSecTimestamp } from "$lib/utils/data-time.utils";
import { get } from "svelte/store";
import type { User } from "../../../../declarations/backend/backend.did";
import type { BackendKYCStatus } from "$lib/types/result";
import { goto } from "$app/navigation";

export const userSate: UserSate = $state({});

// Debug function to check if user is registered
export const checkUserRegistrationStatus = async () => {
    try {
        const { isAuthenticated, backend } = get(authStore);

        if (!isAuthenticated || !backend) {
            console.log('Not authenticated or backend not available');
            return false;
        }

        const isRegistered = await backend.is_user_registered();
        console.log('User registration status:', isRegistered);
        return isRegistered;
    } catch (error) {
        console.error('Error checking registration status:', error);
        return false;
    }
};

// Debug function to check total users in backend
export const checkTotalUsers = async () => {
    try {
        const { isAuthenticated, backend } = get(authStore);

        if (!isAuthenticated || !backend) {
            console.log('Not authenticated or backend not available');
            return 0;
        }

        const totalUsers = await backend.get_total_users();
        console.log('Total users in backend:', totalUsers);
        return totalUsers;
    } catch (error) {
        console.error('Error checking total users:', error);
        return 0;
    }
};

export const fetchUserProfile = async () => {
    try {
        const { isAuthenticated, backend } = get(authStore);

        if (!isAuthenticated || !backend) return;

        const response = await backend.get_user_profile();

        if ('Ok' in response) {
            userSate.profile = transformUserToProfile(response.Ok);
            console.log('User profile loaded successfully:', userSate.profile);
        } else {
            const err = response.Err;
            console.error('Error fetching user profile:', err);

            // Clear profile if user not found
            if (err && typeof err === 'object' && 'UserNotFound' in err) {
                console.log('User not found in backend - user needs to register');
                userSate.profile = null;
            }
        }

    } catch (error) {
        console.error('Error fetching user profile:', error);
        userSate.profile = null;
    }
};

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
    };
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