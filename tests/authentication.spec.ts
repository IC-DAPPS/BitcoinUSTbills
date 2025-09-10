import { test, expect } from '@playwright/test';
import { bitcoinUSTbillsUrl, loadTestEnv, waitForPageLoad } from './helpers';

test.describe('BitcoinUSTbills Authentication', () => {
    test('Internet Identity authentication flow', async ({ page }) => {
        test.setTimeout(60000);

        loadTestEnv();

        // Navigate to the main application
        await page.goto(bitcoinUSTbillsUrl());
        await waitForPageLoad(page);

        // Verify we're on the homepage
        await expect(page.locator('text=Democratize Treasury Investments')).toBeVisible();

        // Click on SEC Compliant & Secure section
        await page.locator('section').filter({ hasText: 'SEC Compliant & Secure' }).click();

        // Start Internet Identity authentication
        const page1Promise = page.waitForEvent('popup');
        await page.getByRole('button', { name: 'Login' }).click();
        const page1 = await page1Promise;

        // Complete Internet Identity setup
        const iiUrl = process.env.VITE_II_URL || 'http://localhost:4943';
        await page1.goto(`${iiUrl}/#authorize`);
        await waitForPageLoad(page1);

        // Create Internet Identity
        await page1.getByRole('button', { name: 'Create Internet Identity' }).click();
        await page1.waitForSelector('textbox[name="Type the characters you see"]');
        await page1.getByRole('textbox', { name: 'Type the characters you see' }).fill('a');
        await page1.getByRole('button', { name: 'Next' }).click();
        await page1.getByRole('button', { name: 'I saved it, continue' }).click();

        // Wait for authentication to complete
        await waitForPageLoad(page);

        // Verify authentication was successful (user should be logged in)
        await expect(page.locator('text=Logout')).toBeVisible();
    });
});

