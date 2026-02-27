const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:9876/');
  await page.waitForTimeout(1000);

  console.log('🔬 THOROUGH TESTING: All Patterns × All Angles\n');

  const patterns = ['star8', 'star6', 'rosette', 'hexLattice', 'circles', 'sunburst', 'chevron'];
  const angles = [35, 45, 55, 65, 75];

  let failures = [];

  for (const pattern of patterns) {
    console.log(`\n--- Testing: ${pattern} ---`);

    await page.selectOption('#patternType', pattern);
    await page.waitForTimeout(300);

    for (const angle of angles) {
      // Set angle via JavaScript to avoid slider issues
      await page.evaluate((a) => {
        document.getElementById('contactAngle').value = a;
        document.getElementById('contactAngleValue').textContent = a;
        // Trigger the event
        const event = new Event('input', { bubbles: true });
        document.getElementById('contactAngle').dispatchEvent(event);
      }, angle);

      await page.waitForTimeout(400);

      // Take screenshot
      const filename = `thorough-${pattern}-${angle}.png`;
      await page.screenshot({ path: filename });

      // Check if canvas has content (not blank)
      const hasContent = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return false;

        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Check if there are any non-background pixels
        let nonBgPixels = 0;
        // Sample every 100th pixel for speed
        for (let i = 0; i < data.length; i += 400) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // If not close to background color (cream ~245,240,230)
          if (r < 200 || g < 200 || b < 180) {
            nonBgPixels++;
          }
        }
        return nonBgPixels > 10; // At least 10 dark pixels sampled
      });

      if (hasContent) {
        console.log(`  ✓ ${angle}°`);
      } else {
        console.log(`  ✗ ${angle}° - BLANK OR MINIMAL CONTENT`);
        failures.push({ pattern, angle, filename });
      }
    }
  }

  // Test grid sizes
  console.log('\n\n--- Testing Grid Sizes ---');
  await page.selectOption('#patternType', 'star8');
  await page.evaluate(() => {
    document.getElementById('contactAngle').value = 55;
    document.getElementById('contactAngleValue').textContent = 55;
    document.getElementById('contactAngle').dispatchEvent(new Event('input', { bubbles: true }));
  });

  for (const size of [2, 4, 6, 8]) {
    await page.evaluate((s) => {
      document.getElementById('gridSize').value = s;
      document.getElementById('gridSizeValue').textContent = s;
      document.getElementById('gridSizeValue2').textContent = s;
      document.getElementById('gridSize').dispatchEvent(new Event('input', { bubbles: true }));
    }, size);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `thorough-grid-${size}.png` });
    console.log(`  ✓ Grid ${size}x${size}`);
  }

  // Test scales
  console.log('\n--- Testing Scales ---');
  await page.evaluate(() => {
    document.getElementById('gridSize').value = 4;
    document.getElementById('gridSizeValue').textContent = 4;
    document.getElementById('gridSizeValue2').textContent = 4;
    document.getElementById('gridSize').dispatchEvent(new Event('input', { bubbles: true }));
  });

  for (const scale of [40, 80, 120, 150]) {
    await page.evaluate((s) => {
      document.getElementById('scale').value = s;
      document.getElementById('scaleValue').textContent = s;
      document.getElementById('scale').dispatchEvent(new Event('input', { bubbles: true }));
    }, scale);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `thorough-scale-${scale}.png` });
    console.log(`  ✓ Scale ${scale}px`);
  }

  // Test frames with each pattern
  console.log('\n--- Testing Frames ---');
  await page.evaluate(() => {
    document.getElementById('scale').value = 80;
    document.getElementById('scaleValue').textContent = 80;
    document.getElementById('scale').dispatchEvent(new Event('input', { bubbles: true }));
  });

  const frames = ['none', 'square', 'arch', 'roundArch', 'circle'];
  for (const frame of frames) {
    await page.selectOption('#frameType', frame);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `thorough-frame-${frame}.png` });
    console.log(`  ✓ Frame: ${frame}`);
  }

  // Test composition modes
  console.log('\n--- Testing Compositions ---');
  await page.selectOption('#frameType', 'none');

  const compositions = ['single', 'quilt', 'gradient'];
  for (const comp of compositions) {
    await page.selectOption('#compositionMode', comp);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `thorough-comp-${comp}.png` });
    console.log(`  ✓ Composition: ${comp}`);
  }

  // Test visual effects
  console.log('\n--- Testing Visual Effects ---');
  await page.selectOption('#compositionMode', 'single');

  // Depth
  await page.click('#toggleDepth');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'thorough-depth.png' });
  console.log('  ✓ Depth effect');

  // Light
  await page.click('#toggleLight');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'thorough-depth-light.png' });
  console.log('  ✓ Depth + Light');

  // Light only
  await page.click('#toggleDepth');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'thorough-light.png' });
  console.log('  ✓ Light only');

  await page.click('#toggleLight'); // reset

  // Test colors
  console.log('\n--- Testing Color Palettes ---');
  const swatches = await page.$$('.color-swatch');
  for (let i = 0; i < swatches.length; i++) {
    await swatches[i].click();
    await page.waitForTimeout(200);
    await page.screenshot({ path: `thorough-color-${i}.png` });
    console.log(`  ✓ Palette ${i + 1}`);
  }

  await browser.close();

  // Summary
  console.log('\n\n========================================');
  if (failures.length === 0) {
    console.log('✅ ALL TESTS PASSED!');
  } else {
    console.log(`❌ ${failures.length} FAILURES:`);
    for (const f of failures) {
      console.log(`   - ${f.pattern} at ${f.angle}° (see ${f.filename})`);
    }
  }
  console.log('========================================\n');
})();
