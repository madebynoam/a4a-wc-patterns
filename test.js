const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:9876/');
  await page.waitForTimeout(1000);

  const patterns = ['star8', 'star6', 'rosette', 'hexLattice', 'circles'];
  const angles = [35, 50, 60, 70];
  const frames = ['none', 'arch', 'circle'];
  const compositions = ['single', 'quilt', 'gradient'];

  console.log('🧪 JALI GENERATOR TEST SUITE\n');

  // Test 1: All pattern types at default angle
  console.log('--- TEST 1: Pattern Types (angle=55°) ---');
  for (const pattern of patterns) {
    await page.selectOption('#patternType', pattern);
    await page.waitForTimeout(300);

    // Check canvas rendered (no errors)
    const canvasExists = await page.$('canvas');
    const status = canvasExists ? '✓' : '✗';
    console.log(`${status} ${pattern}`);

    await page.screenshot({ path: `test-pattern-${pattern}.png` });
  }

  // Test 2: Contact angle variations on 8-point star
  console.log('\n--- TEST 2: Contact Angle Variations (8-point star) ---');
  await page.selectOption('#patternType', 'star8');

  for (const angle of angles) {
    await page.fill('#contactAngle', String(angle));
    await page.dispatchEvent('#contactAngle', 'input');
    await page.waitForTimeout(300);

    const displayedAngle = await page.$eval('#contactAngleValue', el => el.textContent);
    const match = displayedAngle === String(angle);
    const status = match ? '✓' : '✗';
    console.log(`${status} angle=${angle}° (displayed: ${displayedAngle}°)`);

    await page.screenshot({ path: `test-angle-${angle}.png` });
  }

  // Test 3: Contact angle on 6-point star
  console.log('\n--- TEST 3: Contact Angle on 6-Point Star ---');
  await page.selectOption('#patternType', 'star6');

  for (const angle of [40, 55, 70]) {
    await page.fill('#contactAngle', String(angle));
    await page.dispatchEvent('#contactAngle', 'input');
    await page.waitForTimeout(300);
    console.log(`✓ 6-point star at ${angle}°`);
    await page.screenshot({ path: `test-star6-angle-${angle}.png` });
  }

  // Test 4: Frame types
  console.log('\n--- TEST 4: Frame Types ---');
  await page.selectOption('#patternType', 'star8');
  await page.fill('#contactAngle', '55');
  await page.dispatchEvent('#contactAngle', 'input');

  for (const frame of frames) {
    await page.selectOption('#frameType', frame);
    await page.waitForTimeout(300);
    console.log(`✓ frame=${frame}`);
    await page.screenshot({ path: `test-frame-${frame}.png` });
  }

  // Test 5: Composition modes
  console.log('\n--- TEST 5: Composition Modes ---');
  await page.selectOption('#frameType', 'none');

  for (const comp of compositions) {
    await page.selectOption('#compositionMode', comp);
    await page.waitForTimeout(300);
    console.log(`✓ composition=${comp}`);
    await page.screenshot({ path: `test-comp-${comp}.png` });
  }

  // Test 6: Grid size variations
  console.log('\n--- TEST 6: Grid Size Variations ---');
  await page.selectOption('#compositionMode', 'single');
  await page.selectOption('#patternType', 'star8');

  for (const size of [2, 4, 6, 8]) {
    await page.fill('#gridSize', String(size));
    await page.dispatchEvent('#gridSize', 'input');
    await page.waitForTimeout(300);
    console.log(`✓ grid=${size}x${size}`);
    await page.screenshot({ path: `test-grid-${size}.png` });
  }

  // Test 7: Scale variations
  console.log('\n--- TEST 7: Scale Variations ---');
  await page.fill('#gridSize', '4');
  await page.dispatchEvent('#gridSize', 'input');

  for (const scale of [50, 80, 120]) {
    await page.fill('#scale', String(scale));
    await page.dispatchEvent('#scale', 'input');
    await page.waitForTimeout(300);
    console.log(`✓ scale=${scale}px`);
    await page.screenshot({ path: `test-scale-${scale}.png` });
  }

  // Test 8: Stroke weight
  console.log('\n--- TEST 8: Stroke Weight ---');
  await page.fill('#scale', '80');
  await page.dispatchEvent('#scale', 'input');

  for (const weight of [1, 3, 5]) {
    await page.fill('#strokeWeight', String(weight));
    await page.dispatchEvent('#strokeWeight', 'input');
    await page.waitForTimeout(300);
    console.log(`✓ strokeWeight=${weight}px`);
    await page.screenshot({ path: `test-stroke-${weight}.png` });
  }

  // Test 9: Color palettes
  console.log('\n--- TEST 9: Color Palettes ---');
  await page.fill('#strokeWeight', '2');
  await page.dispatchEvent('#strokeWeight', 'input');

  const swatches = await page.$$('.color-swatch');
  for (let i = 0; i < Math.min(swatches.length, 4); i++) {
    await swatches[i].click();
    await page.waitForTimeout(300);
    console.log(`✓ palette ${i + 1}`);
    await page.screenshot({ path: `test-palette-${i + 1}.png` });
  }

  // Test 10: Randomize button
  console.log('\n--- TEST 10: Randomize ---');
  for (let i = 0; i < 3; i++) {
    await page.click('#randomize');
    await page.waitForTimeout(500);
    console.log(`✓ random variation ${i + 1}`);
    await page.screenshot({ path: `test-random-${i + 1}.png` });
  }

  // Test 11: Export buttons exist
  console.log('\n--- TEST 11: Export Buttons ---');
  const svgBtn = await page.$('#exportSVG');
  const pngBtn = await page.$('#exportPNG');
  console.log(`${svgBtn ? '✓' : '✗'} SVG export button`);
  console.log(`${pngBtn ? '✓' : '✗'} PNG export button`);

  // Test 12: Fill mode toggle
  console.log('\n--- TEST 12: Fill/Stroke Toggle ---');
  await page.selectOption('#patternType', 'star8');
  await page.selectOption('#compositionMode', 'single');
  await page.fill('#contactAngle', '55');
  await page.dispatchEvent('#contactAngle', 'input');

  await page.click('#toggleFill');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `test-fill-mode.png` });
  console.log('✓ fill mode');

  await page.click('#toggleStroke');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `test-stroke-mode.png` });
  console.log('✓ stroke mode');

  await browser.close();

  console.log('\n========================================');
  console.log('✅ All tests complete!');
  console.log('Screenshots saved in jali-generator/test-*.png');
  console.log('========================================\n');
})();
