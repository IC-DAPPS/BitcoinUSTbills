import { test, expect } from '@playwright/test';
import { getTestUser, TEST_CONFIG } from './test-data';
import { bitcoinUSTbillsUrl, loadTestEnv } from './helpers';

test.describe('BitcoinUSTbills Complete User Journey', () => {
    test('Complete user registration and wallet interaction flow', async ({ page }) => {
        test.setTimeout(TEST_CONFIG.timeout);

        const testUser = getTestUser('valid');
        loadTestEnv();

        // Navigate to the main application
        await page.goto(bitcoinUSTbillsUrl());
        await page.waitForLoadState('networkidle');

        // Verify we're on the homepage
        await expect(page.locator('text=Democratize Treasury Investments')).toBeVisible();

        // Click on SEC Compliant & Secure section
        await page.locator('section').filter({ hasText: 'SEC Compliant & Secure' }).click();

        // Start Internet Identity authentication
        const page1Promise = page.waitForEvent('popup');
        await page.getByRole('button', { name: 'Login' }).click();
        const page1 = await page1Promise;

        // Complete Internet Identity setup
        await page1.goto(`${TEST_CONFIG.iiUrl}/#authorize`);
        await page1.waitForLoadState('networkidle');

        // Create Internet Identity
        await page1.getByRole('button', { name: 'Create Internet Identity' }).click();
        await page1.waitForSelector('textbox[name="Type the characters you see"]');
        await page1.getByRole('textbox', { name: 'Type the characters you see' }).fill(testUser.captcha);
        await page1.getByRole('button', { name: 'Next' }).click();
        await page1.getByRole('button', { name: 'I saved it, continue' }).click();

        // Wait for authentication to complete
        await page.waitForLoadState('networkidle');

        // Navigate to registration page
        await page.goto(`${TEST_CONFIG.baseUrl}/register`);
        await page.waitForLoadState('networkidle');

        // Verify registration page loaded
        await expect(page.locator('text=Complete Your Registration')).toBeVisible();

        // Complete user registration
        await page.getByRole('textbox', { name: 'Email Address *' }).click();
        await page.getByRole('textbox', { name: 'Email Address *' }).fill(testUser.email);
        await page.getByLabel('Country *').selectOption(testUser.country);
        await page.getByRole('textbox', { name: 'Phone Number (Optional)' }).click();
        await page.getByRole('textbox', { name: 'Phone Number (Optional)' }).fill(testUser.phone);
        await page.getByRole('button', { name: 'Complete Registration' }).click();

        // Wait for registration to complete
        await page.waitForLoadState('networkidle');

        // Navigate to KYC page
        await page.getByRole('link', { name: 'KYC' }).click();
        await page.waitForLoadState('networkidle');

        // Verify KYC page loaded
        await expect(page.locator('text=KYC Verification')).toBeVisible();

        // Test document upload functionality
        const uploadElements = page.locator('text=Click to upload or drag and drop JPEG, PNG, WebP up to 10MB');
        await expect(uploadElements).toHaveCount(3); // Verify 3 upload areas exist

        // Click on upload areas (simulating user interaction)
        await uploadElements.first().click();
        await uploadElements.nth(1).click();
        await uploadElements.nth(2).click();

        // Navigate to Wallet page
        await page.getByRole('link', { name: 'Wallet' }).click();
        await page.waitForLoadState('networkidle');

        // Verify wallet page loaded
        await expect(page.locator('text=My Wallet')).toBeVisible();
        await expect(page.locator('text=ckBTC Balance')).toBeVisible();

        // Test deposit functionality
        await page.getByRole('button', { name: '⬇ Deposit' }).click();
        await page.waitForSelector('text=Copy');
        await page.getByText('Copy').click();
        await page.getByLabel('Close').click();

        // Test withdraw functionality
        await page.getByRole('button', { name: '⬆ Withdraw' }).click();
        await page.waitForSelector('input[placeholder="Enter Recipient Address"]');
        await page.getByPlaceholder('Enter Recipient Address').click();
        await page.getByPlaceholder('Enter Recipient Address').press('ControlOrMeta+c');
        await page.getByPlaceholder('Enter Amount').click();
        await page.getByLabel('Close').click();

        // Verify we're back on wallet page
        await expect(page.locator('text=My Wallet')).toBeVisible();
    });
});
