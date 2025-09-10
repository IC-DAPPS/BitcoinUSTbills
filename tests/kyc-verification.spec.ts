import { test, expect } from '@playwright/test';

test.describe('BitcoinUSTbills KYC Verification', () => {
    test('KYC document upload interface', async ({ page }) => {
        test.setTimeout(60000);

        // Navigate to KYC page
        await page.goto('http://localhost:5173/kyc');
        await page.waitForLoadState('networkidle');

        // Verify KYC page loaded
        await expect(page.locator('text=KYC Verification')).toBeVisible();
        await expect(page.locator('text=Complete your identity verification')).toBeVisible();

        // Verify document upload requirements section
        await expect(page.locator('text=Document Upload Requirements')).toBeVisible();

        // Test document upload functionality
        const uploadElements = page.locator('text=Click to upload or drag and drop JPEG, PNG, WebP up to 10MB');
        await expect(uploadElements).toHaveCount(3); // Verify 3 upload areas exist

        // Verify upload areas are clickable
        await expect(uploadElements.first()).toBeVisible();
        await expect(uploadElements.nth(1)).toBeVisible();
        await expect(uploadElements.nth(2)).toBeVisible();

        // Click on upload areas (simulating user interaction)
        await uploadElements.first().click();
        await uploadElements.nth(1).click();
        await uploadElements.nth(2).click();

        // Verify upload areas are still functional after clicking
        await expect(uploadElements.first()).toBeVisible();
    });

    test('KYC page navigation', async ({ page }) => {
        test.setTimeout(30000);

        // Navigate to KYC page via navigation menu
        await page.goto('http://localhost:5173/');
        await page.waitForLoadState('networkidle');

        await page.getByRole('link', { name: 'KYC' }).click();
        await page.waitForLoadState('networkidle');

        // Verify we're on KYC page
        await expect(page.locator('text=KYC Verification')).toBeVisible();
    });
});

