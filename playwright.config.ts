import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { bitcoinUSTbillsDfxUrl } from './tests/helpers';

// Load dfx environment variables from .env.development
dotenv.config({ path: '.env.development' });

export default defineConfig({
    testDir: './tests',
    use: {
        ...devices['Desktop Chrome'],
        headless: true // Use headless mode for faster execution
    },
    projects: [
        {
            name: 'authentication',
            testMatch: /.*authentication.*\.spec\.ts/,
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'registration',
            testMatch: /.*registration.*\.spec\.ts/,
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'kyc-verification',
            testMatch: /.*kyc-verification.*\.spec\.ts/,
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'wallet-operations',
            testMatch: /.*wallet-operations.*\.spec\.ts/,
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'complete-journey',
            testMatch: /.*bitcoin-ust-bills-recorded.*\.spec\.ts/,
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: process.env.VITE_DEV_SERVER ? {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: true,
        timeout: 5000,
    } : undefined,
    // Global test timeout
    timeout: 120000,
    // Retry failed tests
    retries: 3,
    // Retry only on certain failures
    retry: {
        retries: 3,
        // Retry on network issues, timeouts, and assertion failures
        mode: 'retry',
    },
    // Parallel execution
    workers: process.env.CI ? 1 : undefined,
    // Reporter configuration
    reporter: [
        ['html'],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/results.xml' }]
    ],
    // Test output directory
    outputDir: 'test-results/',
    // Global setup and teardown
    globalSetup: './tests/global-setup.ts',
    globalTeardown: './tests/global-teardown.ts',
});

