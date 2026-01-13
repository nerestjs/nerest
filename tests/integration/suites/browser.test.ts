import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { type Browser, chromium } from '@playwright/test';
import { BASE_URL } from '../constants.js';

describe('In-browser functionality', () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should hydrate the header app', async () => {
    const page = await browser.newPage();

    await page.goto(`${BASE_URL}/api/header/examples/five`);

    await page.waitForSelector(
      '[data-app-name="header"][data-app-hydrated="true"]'
    );
  });

  it('should handle button clicks correctly', async () => {
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/api/header/examples/five`);

    // Wait for hydration
    await page.waitForSelector(
      '[data-app-name="header"][data-app-hydrated="true"]'
    );

    const button = page.locator('button');
    await button.click();
    await button.click();

    const buttonText = await button.textContent();
    expect(buttonText).toBe('2');
  });
});
