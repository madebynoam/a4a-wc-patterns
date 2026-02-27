const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:9876/');
  await page.waitForTimeout(1000);

  console.log('🎨 PHASE 5: VISUAL POLISH TESTS\n');

  // Test Art Deco patterns
  console.log('--- Art Deco Patterns ---');

  await page.selectOption('#patternType', 'sunburst');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-sunburst.png' });
  console.log('✓ Sunburst pattern');

  await page.selectOption('#patternType', 'chevron');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-chevron.png' });
  console.log('✓ Chevron pattern');

  // Test depth effect
  console.log('\n--- Depth Effect (Carved Stone) ---');
  await page.selectOption('#patternType', 'star8');
  await page.waitForTimeout(300);

  await page.click('#toggleDepth');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-depth-on.png' });
  console.log('✓ Depth effect ON');

  await page.click('#toggleDepth');
  await page.waitForTimeout(300);

  // Test light effect
  console.log('\n--- Light Effect (Dappled Light) ---');
  await page.click('#toggleLight');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-light-on.png' });
  console.log('✓ Light effect ON');

  // Both effects together
  console.log('\n--- Combined Effects ---');
  await page.click('#toggleDepth');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-both-effects.png' });
  console.log('✓ Both depth + light');

  // Art Deco sunburst with arch frame
  console.log('\n--- Art Deco + Arch Frame ---');
  await page.click('#toggleLight'); // turn off
  await page.click('#toggleDepth'); // turn off
  await page.selectOption('#patternType', 'sunburst');
  await page.selectOption('#frameType', 'arch');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-deco-arch.png' });
  console.log('✓ Sunburst in arch frame');

  // Gateway of India style - star8 with depth, basalt colors
  console.log('\n--- Gateway of India Style ---');
  await page.selectOption('#patternType', 'star8');
  await page.selectOption('#frameType', 'arch');

  // Click basalt color (2nd swatch)
  const swatches = await page.$$('.color-swatch');
  await swatches[1].click();
  await page.waitForTimeout(300);

  await page.click('#toggleDepth');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-gateway-style.png' });
  console.log('✓ Gateway of India style (basalt + depth + arch)');

  await browser.close();

  console.log('\n========================================');
  console.log('✅ Phase 5 tests complete!');
  console.log('========================================\n');
})();
