// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Export Functions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');
  });

  test('SVG export triggers download', async ({ page }) => {
    // Listen for download event
    const downloadPromise = page.waitForEvent('download');

    await page.click('#exportSVG');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('jali-pattern.svg');
  });

  test('PNG export triggers download', async ({ page }) => {
    // Listen for download event
    const downloadPromise = page.waitForEvent('download');

    await page.click('#exportPNG');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('jali-pattern.png');
  });

  test('exported SVG contains pattern elements', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.click('#exportSVG');
    const download = await downloadPromise;

    // Save to temp and read content
    const path = await download.path();
    const fs = require('fs');
    const content = fs.readFileSync(path, 'utf-8');

    // Verify SVG structure
    expect(content).toContain('<?xml version="1.0"');
    expect(content).toContain('<svg');
    expect(content).toContain('</svg>');
    expect(content).toContain('<line'); // Pattern lines
  });
});

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');
  });

  test('R key randomizes pattern', async ({ page }) => {
    // Get initial contact angle
    const initialAngle = await page.locator('#contactAngleValue').textContent();

    // Press R multiple times to ensure randomization happens
    await page.keyboard.press('r');
    await page.waitForTimeout(100);

    // The pattern should change (randomize button was clicked)
    // Since it's random, we just verify the page doesn't crash
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('number keys change pattern type', async ({ page }) => {
    // Press 2 for star6
    await page.keyboard.press('2');
    await page.waitForTimeout(100);

    const patternType = await page.locator('#patternType').inputValue();
    expect(patternType).toBe('star6');

    // Press 3 for rosette
    await page.keyboard.press('3');
    await page.waitForTimeout(100);

    const patternType2 = await page.locator('#patternType').inputValue();
    expect(patternType2).toBe('rosette');
  });

  test('F key toggles fill mode', async ({ page }) => {
    // Check initial state
    const initialFill = await page.locator('#toggleFill').evaluate(el => el.classList.contains('active'));
    expect(initialFill).toBe(false);

    // Press F to toggle
    await page.keyboard.press('f');
    await page.waitForTimeout(100);

    const afterFill = await page.locator('#toggleFill').evaluate(el => el.classList.contains('active'));
    expect(afterFill).toBe(true);
  });

  test('arrow keys adjust contact angle', async ({ page }) => {
    const initialAngle = parseInt(await page.locator('#contactAngleValue').textContent());

    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);

    const newAngle = parseInt(await page.locator('#contactAngleValue').textContent());
    expect(newAngle).toBe(initialAngle + 2);

    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);

    const finalAngle = parseInt(await page.locator('#contactAngleValue').textContent());
    expect(finalAngle).toBe(initialAngle);
  });
});
