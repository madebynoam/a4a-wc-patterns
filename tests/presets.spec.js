// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Presets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');
  });

  const presets = [
    'classic-star',
    'sidi-saiyyed',
    'gateway-jali',
    'art-deco-mumbai',
    'moroccan-zellige',
    'gateway-arch',
    'minimal'
  ];

  for (const preset of presets) {
    test(`renders ${preset} preset correctly`, async ({ page }) => {
      await page.selectOption('#preset', preset);

      // Wait for canvas to update
      await page.waitForTimeout(200);

      // Take screenshot for visual comparison
      const canvas = page.locator('canvas');
      await expect(canvas).toHaveScreenshot(`preset-${preset}.png`, {
        maxDiffPixelRatio: 0.01
      });
    });
  }

  test('preset updates all UI controls', async ({ page }) => {
    // Apply sidi-saiyyed preset
    await page.selectOption('#preset', 'sidi-saiyyed');
    await page.waitForTimeout(100);

    // Verify composition mode was updated
    const compositionMode = await page.locator('#compositionMode').inputValue();
    expect(compositionMode).toBe('mixed');

    // Verify frame type was updated
    const frameType = await page.locator('#frameType').inputValue();
    expect(frameType).toBe('arch');
  });

  test('custom option preserves current settings', async ({ page }) => {
    // Change some settings
    await page.selectOption('#patternType', 'rosette');
    await page.fill('#contactAngle', '65');

    // Select custom (empty value)
    await page.selectOption('#preset', '');

    // Verify settings were preserved
    const patternType = await page.locator('#patternType').inputValue();
    expect(patternType).toBe('rosette');
  });
});
