import { test, expect } from '@playwright/test';

test.describe('BitcoinUSTbills Wallet Operations', () => {
    test('Wallet page and balance display', async ({ page }) => {
        test.setTimeout(60000);

        // Navigate to wallet page
        await page.goto('http://localhost:5173/wallet');
        await page.waitForLoadState('networkidle');

        // Verify wallet page loaded
        await expect(page.locator('text=My Wallet')).toBeVisible();
        await expect(page.locator('text=Manage your funds and view transaction history')).toBeVisible();

        // Verify ckBTC balance section
        await expect(page.locator('text=ckBTC Balance')).toBeVisible();
        await expect(page.locator('text=0 ckBTC')).toBeVisible();

        // Verify action buttons
        await expect(page.getByRole('button', { name: '⬇ Deposit' })).toBeVisible();
        await expect(page.getByRole('button', { name: '⬆ Withdraw' })).toBeVisible();

        // Verify transaction history section
        await expect(page.locator('text=Recent Transactions')).toBeVisible();
    });

    test('Deposit functionality', async ({ page }) => {
        test.setTimeout(60000);

        await page.goto('http://localhost:5173/wallet');
        await page.waitForLoadState('networkidle');

        // Test deposit functionality
        await page.getByRole('button', { name: '⬇ Deposit' }).click();

        // Wait for deposit modal/dialog to appear
        await page.waitForSelector('text=Copy');
        await expect(page.getByText('Copy')).toBeVisible();

        // Test copy functionality
        await page.getByText('Copy').click();

        // Close deposit modal
        await page.getByLabel('Close').click();

        // Verify we're back on wallet page
        await expect(page.locator('text=My Wallet')).toBeVisible();
    });

    test('Withdraw functionality', async ({ page }) => {
        test.setTimeout(60000);

        await page.goto('http://localhost:5173/wallet');
        await page.waitForLoadState('networkidle');

        // Test withdraw functionality
        await page.getByRole('button', { name: '⬆ Withdraw' }).click();

        // Wait for withdraw form to appear
        await page.waitForSelector('input[placeholder="Enter Recipient Address"]');
        await expect(page.getByPlaceholder('Enter Recipient Address')).toBeVisible();
        await expect(page.getByPlaceholder('Enter Amount')).toBeVisible();

        // Test form interactions
        await page.getByPlaceholder('Enter Recipient Address').click();
        await page.getByPlaceholder('Enter Recipient Address').press('ControlOrMeta+c');
        await page.getByPlaceholder('Enter Amount').click();

        // Close withdraw modal
        await page.getByLabel('Close').click();

        // Verify we're back on wallet page
        await expect(page.locator('text=My Wallet')).toBeVisible();
    });
});

