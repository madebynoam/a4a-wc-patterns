// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Pattern Types', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');
  });

  const patterns = [
    'star8',
    'star6',
    'star6Hex',
    'rosette',
    'hexLattice',
    'circles',
    'sunburst',
    'chevron',
    'knotwork',
    'octSquare'
  ];

  for (const pattern of patterns) {
    test(`renders ${pattern} pattern`, async ({ page }) => {
      await page.selectOption('#patternType', pattern);
      await page.waitForTimeout(200);

      const canvas = page.locator('canvas');
      await expect(canvas).toHaveScreenshot(`pattern-${pattern}.png`, {
        maxDiffPixelRatio: 0.01
      });
    });
  }
});

test.describe('Composition Modes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');
  });

  const modes = ['single', 'mixed', 'organic', 'quilt', 'gradient'];

  for (const mode of modes) {
    test(`renders ${mode} composition mode`, async ({ page }) => {
      await page.selectOption('#compositionMode', mode);
      await page.waitForTimeout(200);

      const canvas = page.locator('canvas');
      await expect(canvas).toHaveScreenshot(`composition-${mode}.png`, {
        maxDiffPixelRatio: 0.01
      });
    });
  }
});

test.describe('Mixed Composition', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');
  });

  test('mixed mode shows variety of patterns', async ({ page }) => {
    await page.selectOption('#compositionMode', 'mixed');
    await page.waitForTimeout(200);

    // Canvas should render without errors
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('mixed mode is seeded and reproducible', async ({ page }) => {
    await page.selectOption('#compositionMode', 'mixed');
    await page.waitForTimeout(200);

    // Take first screenshot
    const canvas = page.locator('canvas');
    const screenshot1 = await canvas.screenshot();

    // Reload and apply same settings
    await page.reload();
    await page.waitForSelector('canvas');
    await page.selectOption('#compositionMode', 'mixed');
    await page.waitForTimeout(200);

    // The pattern should be the same (seeded)
    const screenshot2 = await canvas.screenshot();

    // Compare screenshots - they should be identical
    expect(screenshot1.equals(screenshot2)).toBe(true);
  });
});

test.describe('Frame Types', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');
  });

  const frames = ['none', 'square', 'arch', 'roundArch', 'circle'];

  for (const frame of frames) {
    test(`renders ${frame} frame`, async ({ page }) => {
      await page.selectOption('#frameType', frame);
      await page.waitForTimeout(200);

      const canvas = page.locator('canvas');
      await expect(canvas).toHaveScreenshot(`frame-${frame}.png`, {
        maxDiffPixelRatio: 0.01
      });
    });
  }
});

test.describe('Visual Effects', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');
  });

  test('depth effect renders correctly', async ({ page }) => {
    await page.click('#toggleDepth');
    await page.waitForTimeout(200);

    const canvas = page.locator('canvas');
    await expect(canvas).toHaveScreenshot('effect-depth.png', {
      maxDiffPixelRatio: 0.01
    });
  });

  test('light effect renders correctly', async ({ page }) => {
    await page.click('#toggleLight');
    await page.waitForTimeout(200);

    const canvas = page.locator('canvas');
    await expect(canvas).toHaveScreenshot('effect-light.png', {
      maxDiffPixelRatio: 0.01
    });
  });
});
