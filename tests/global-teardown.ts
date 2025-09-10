import type { FullConfig } from '@playwright/test';
import { cleanupTestData } from './helpers';

async function globalTeardown(config: FullConfig) {
    console.log('Cleaning up global test environment...');

    // Cleanup test data
    cleanupTestData();

    console.log('Global teardown completed');
}

export default globalTeardown;


