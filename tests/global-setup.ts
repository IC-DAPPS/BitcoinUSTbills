import type { FullConfig } from '@playwright/test';
import { ensureTestOutputDir, cleanupTestData } from './helpers';

async function globalSetup(config: FullConfig) {
    console.log('Setting up global test environment...');

    // Ensure test output directory exists
    ensureTestOutputDir();

    // Cleanup any existing test data
    cleanupTestData();

    console.log('Global setup completed');
}

export default globalSetup;


