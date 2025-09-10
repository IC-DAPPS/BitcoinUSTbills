import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { expect } from '@playwright/test';

export function saveTestData(filename: string, data: string): void {
    const outputDir = path.join(process.cwd(), 'test-output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(outputDir, filename),
        data
    );
}

export function readTestData(filename: string): string {
    const outputDir = path.join(process.cwd(), 'test-output');
    const filePath = path.join(outputDir, filename);

    if (!fs.existsSync(filePath)) {
        return ''; // test will fail
    }

    return fs.readFileSync(filePath, 'utf8').trim();
}

export function bitcoinUSTbillsUrl(): string {
    // Get app URL from environment or use default
    const baseUrl = process.env.VITE_APP_URL || 'http://localhost:5173';
    return baseUrl;
}

export function loadTestEnv(): void {
    const envPath = path.join(process.cwd(), '.env.development');

    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
    }

    // Set default values for testing
    process.env.VITE_APP_URL = process.env.VITE_APP_URL || 'http://localhost:5173';
    process.env.VITE_II_URL = process.env.VITE_II_URL || 'http://localhost:4943';
}

export function getTestEnv(key: string): string {
    const value = process.env[key];

    if (!value) {
        throw new Error(`Test environment variable ${key} not found. Make sure to call loadTestEnv() first.`);
    }

    return value;
}

// Helper function to wait for ckBTC balance to be at least a certain amount
export async function waitForCkBTCBalanceToBeAtLeast(page: any, minimumBalance: string, timeoutMs: number = 30000): Promise<void> {
    const balanceLocator = page.locator('[data-testid="ckbtc-balance"], .balance, #balance');

    await page.waitForFunction(
        (minBalance: string) => {
            const balanceElement = document.querySelector('[data-testid="ckbtc-balance"], .balance, #balance');
            if (!balanceElement) return false;

            const balanceText = balanceElement.textContent?.trim();
            if (!balanceText || balanceText.includes('Loading')) return false;

            const currentBalance = parseFloat(balanceText.replace(/[^\d.-]/g, ''));
            const minBalanceNum = parseFloat(minBalance);

            return !isNaN(currentBalance) && !isNaN(minBalanceNum) && currentBalance >= minBalanceNum;
        },
        minimumBalance,
        { timeout: timeoutMs }
    );
}

// Helper function to wait for list updates
export async function waitForListUpdate(
    page: any,
    listSelector: string,
    expectedItem: string,
    shouldContain: boolean = true,
    timeoutMs: number = 10000
): Promise<void> {
    const listLocator = page.locator(listSelector);

    // Wait for list to be ready (not loading)
    await expect(listLocator).not.toHaveText(/Loading\.\.\./);

    if (shouldContain) {
        // Wait for the specific item to appear in the list
        await expect(listLocator.locator('li, [data-testid*="item"]', { hasText: expectedItem })).toBeVisible({ timeout: timeoutMs });
    } else {
        // Wait for the specific item to be removed from the list with retry logic
        await expect(async () => {
            const listItems = await listLocator.locator('li, [data-testid*="item"]').allTextContents();
            expect(listItems).not.toContain(expectedItem);
        }).toPass({ timeout: timeoutMs, intervals: [500, 1000, 2000] });
    }
}

// Helper function to wait for input to clear
export async function waitForInputToClear(
    page: any,
    inputSelector: string,
    timeoutMs: number = 10000
): Promise<void> {
    await expect(async () => {
        const inputValue = await page.inputValue(inputSelector);
        expect(inputValue).toBe('');
    }).toPass({ timeout: timeoutMs, intervals: [100, 500, 1000] });
}

// Helper function to format ckBTC balance
export function formatCkBTCBalance(amount: bigint): string {
    const ckbtcAmount = Number(amount) / 100_000_000; // Convert from e8s to ckBTC
    return ckbtcAmount.toFixed(8);
}

// Helper function to wait for page to load completely
export async function waitForPageLoad(page: any): Promise<void> {
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
}

// Helper function to wait for element to be visible and clickable
export async function waitForElementToBeClickable(page: any, selector: string, timeoutMs: number = 10000): Promise<void> {
    const element = page.locator(selector);
    await element.waitFor({ state: 'visible', timeout: timeoutMs });
    await element.waitFor({ state: 'attached', timeout: timeoutMs });
}

// Helper function to fill form field with retry
export async function fillFormField(page: any, selector: string, value: string, timeoutMs: number = 5000): Promise<void> {
    const field = page.locator(selector);
    await field.waitFor({ state: 'visible', timeout: timeoutMs });
    await field.clear();
    await field.fill(value);

    // Verify the value was set
    const fieldValue = await field.inputValue();
    if (fieldValue !== value) {
        throw new Error(`Failed to fill field ${selector} with value ${value}. Got: ${fieldValue}`);
    }
}

// Helper function to create test data directory
export function ensureTestOutputDir(): void {
    const outputDir = path.join(process.cwd(), 'test-output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
}

// Helper function to cleanup test data
export function cleanupTestData(): void {
    const outputDir = path.join(process.cwd(), 'test-output');
    if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true });
    }
}


