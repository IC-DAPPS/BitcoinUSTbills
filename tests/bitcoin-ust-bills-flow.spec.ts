import { test, expect } from '@playwright/test';

test('BitcoinUSTbills Complete Flow', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Wait for Login button to be visible and clickable
    await page.waitForSelector('button:has-text("Login")', { state: 'visible' });

    // Set up popup listener before clicking
    const page1Promise = page.waitForEvent('popup', { timeout: 10000 });

    // Click Login button
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for popup to open
    const page1 = await page1Promise;
    await page1.getByRole('button', { name: 'Create Internet Identity' }).click();
    await page1.getByRole('textbox', { name: 'Type the characters you see' }).fill('a');
    await page1.getByRole('button', { name: 'Next' }).click();
    await page1.getByRole('button', { name: 'I saved it, continue' }).click();

    // Wait for the main page to update after authentication
    await page.waitForLoadState('networkidle');

    // Wait for the registration page to automatically appear after login
    await page.waitForSelector('textbox[name="Email Address *"]', { timeout: 10000 });

    await page.getByRole('textbox', { name: 'Email Address *' }).click();
    await page.getByRole('textbox', { name: 'Email Address *' }).fill('vv083150');
    await page.getByRole('textbox', { name: 'Email Address *' }).press('CapsLock');
    await page.getByRole('textbox', { name: 'Email Address *' }).fill('vv083150@gmail.com');
    await page.getByLabel('Country *').selectOption('Other');
    await page.getByRole('textbox', { name: 'Phone Number (Optional)' }).click();
    await page.getByRole('textbox', { name: 'Phone Number (Optional)' }).fill('7389345065');
    await page.getByRole('button', { name: 'Complete Registration' }).click();
    await page.getByRole('link', { name: 'KYC' }).click();
    await page.getByRole('img').first().click();
    await page.getByText('JPEG, PNG, WebP up to 10MB').nth(1).click();
    await page.getByText('Click to upload or drag and drop JPEG, PNG, WebP up to 10MB').nth(2).click();
    await page.getByRole('link', { name: 'Wallet' }).click();
    await page.getByRole('button', { name: '⬇ Deposit' }).click();
    await page.getByText('Copy').click();
    await page.getByLabel('Close').click();
    await page.getByRole('button', { name: '⬆ Withdraw' }).click();
    await page.getByPlaceholder('Enter Recipient Address').click();
    await page.getByPlaceholder('Enter Recipient Address').fill('pxwlj-vkp36-fmiii-2jlf7-uffvq-iqskk-wgvo2-avqv4-zk2mx-frtz6-xqe');
    await page.getByPlaceholder('Enter Amount').click();
    await page.getByPlaceholder('Enter Amount').fill('100');
    await page.getByLabel('Close').click();
});
