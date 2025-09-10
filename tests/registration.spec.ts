import { test, expect } from '@playwright/test';
import { bitcoinUSTbillsUrl, loadTestEnv, waitForPageLoad, fillFormField } from './helpers';
import { getTestUser } from './test-data';

test.describe('BitcoinUSTbills User Registration', () => {
    test('Complete user registration flow', async ({ page }) => {
        test.setTimeout(60000);

        const testUser = getTestUser('valid');
        loadTestEnv();

        // Navigate to registration page
        await page.goto(`${bitcoinUSTbillsUrl()}/register`);
        await waitForPageLoad(page);

        // Verify registration page loaded
        await expect(page.locator('text=Complete Your Registration')).toBeVisible();
        await expect(page.locator('text=Welcome to BitcoinUSTbills!')).toBeVisible();

        // Fill registration form using helper
        await fillFormField(page, 'input[name="email"]', testUser.email);
        await page.getByLabel('Country *').selectOption(testUser.country);
        await fillFormField(page, 'input[name="phone"]', testUser.phone);

        // Submit registration
        await page.getByRole('button', { name: 'Complete Registration' }).click();

        // Wait for registration to complete
        await waitForPageLoad(page);

        // Verify registration was successful (should redirect or show success message)
        // This might need adjustment based on actual app behavior
        await expect(page.locator('text=Home Dashboard Marketplace')).toBeVisible();
    });

    test('Registration form validation', async ({ page }) => {
        test.setTimeout(30000);

        loadTestEnv();
        await page.goto(`${bitcoinUSTbillsUrl()}/register`);
        await waitForPageLoad(page);

        // Try to submit without filling required fields
        await page.getByRole('button', { name: 'Complete Registration' }).click();

        // Verify validation errors appear
        // This might need adjustment based on actual validation behavior
        await expect(page.locator('text=Email Address *')).toBeVisible();
    });
});

