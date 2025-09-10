// Test data management for BitcoinUSTbills tests

export interface TestUser {
    email: string;
    phone: string;
    country: string;
    captcha: string;
}

export interface TestConfig {
    baseUrl: string;
    iiUrl: string;
    timeout: number;
}

// Test data constants
export const TEST_USERS: Record<string, TestUser> = {
    valid: {
        email: 'test@bitcoinustbills.com',
        phone: '1234567890',
        country: 'Other',
        captcha: 'a'
    },
    invalid: {
        email: 'invalid-email',
        phone: '123',
        country: 'Other',
        captcha: 'x'
    },
    admin: {
        email: 'admin@bitcoinustbills.com',
        phone: '9876543210',
        country: 'United States',
        captcha: 'a'
    }
};

// Test configuration
export const TEST_CONFIG: TestConfig = {
    baseUrl: 'http://localhost:5173',
    iiUrl: 'http://umunu-kh777-77774-qaaca-cai.localhost:8080',
    timeout: 120000
};

// Helper functions for test data
export function getTestUser(type: keyof typeof TEST_USERS = 'valid'): TestUser {
    return { ...TEST_USERS[type] };
}

export function generateRandomEmail(): string {
    const timestamp = Date.now();
    return `test-${timestamp}@bitcoinustbills.com`;
}

export function generateRandomPhone(): string {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

// Test data cleanup
export function cleanupTestData(): void {
    // This would clean up any test data created during tests
    // Implementation depends on your backend API
    console.log('Cleaning up test data...');
}

// Test data validation
export function validateTestUser(user: TestUser): boolean {
    return !!(
        user.email &&
        user.email.includes('@') &&
        user.phone &&
        user.phone.length >= 10 &&
        user.country &&
        user.captcha
    );
}

