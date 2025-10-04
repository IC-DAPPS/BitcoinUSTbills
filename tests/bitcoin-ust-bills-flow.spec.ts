import { test, expect } from '@playwright/test';

test('BitcoinUSTbills Complete Flow', async ({ page }) => {
    // Enable popups and disable popup blocker
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('http://localhost:5173/');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Wait for Login button to be visible and clickable
    await page.waitForSelector('button:has-text("Login")', { state: 'visible' });

    // Set up popup listener before clicking with longer timeout
    const page1Promise = page.waitForEvent('popup', { timeout: 30000 });

    // Click Login button
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for popup to open
    const page1 = await page1Promise;
    await page1.getByRole('button', { name: 'Create Internet Identity' }).click();

    // Wait for CAPTCHA input to be ready and editable
    await page1.waitForSelector('#captchaInput', { state: 'visible' });
    await page1.waitForFunction(() => {
        const input = document.querySelector('#captchaInput') as HTMLInputElement;
        return input && !input.disabled && input.offsetParent !== null;
    }, { timeout: 15000 });

    // Fill CAPTCHA
    await page1.getByRole('textbox', { name: 'Type the characters you see' }).fill('a');
    await page1.getByRole('button', { name: 'Next' }).click();
    await page1.getByRole('button', { name: 'I saved it, continue' }).click();

    // Wait for the main page to update after authentication
    await page.waitForLoadState('networkidle');

    // Wait for authentication to complete - check if user is logged in
    await page.waitForSelector('button:has-text("Logout")', { timeout: 15000 });

    // Navigate to dashboard to check registration status
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForLoadState('networkidle');

    // Check if user needs to complete registration
    await page.waitForSelector('a:has-text("Complete Registration")', { timeout: 10000 });
    await page.getByRole('link', { name: 'Complete Registration' }).click();

    // Wait for the registration page to load
    await page.waitForSelector('h1:has-text("Complete Your Registration")', { timeout: 10000 });

    // Fill registration form
    await page.getByRole('textbox', { name: 'Email Address *' }).click();
    await page.getByRole('textbox', { name: 'Email Address *' }).fill('vish@gmail.com');
    await page.getByLabel('Country *').selectOption('United States');
    await page.getByRole('textbox', { name: 'Phone Number (Optional)' }).click();
    await page.getByRole('textbox', { name: 'Phone Number (Optional)' }).fill('8305742710');
    await page.getByRole('button', { name: 'Complete Registration' }).click();

    // Wait for redirect to dashboard after registration
    await page.waitForLoadState('networkidle');

    // Wait for dashboard to load properly and check if registration is complete
    await page.waitForSelector('text="Welcome back, vish@gmail.com"', { timeout: 15000 });

    // Navigate to wallet page
    await page.goto('http://localhost:5173/wallet');

    // Wait for wallet page to load with shorter timeout
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

    // Wait for the deposit button to be visible
    await page.waitForSelector('button:has-text("⬇ Deposit")', { state: 'visible', timeout: 10000 });
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
