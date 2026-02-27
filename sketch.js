// Cellular Jali Pattern Machine
// Negative space is the design - we carve holes from solid

let params = {
  seed: 42,
  density: 5,          // Grid size (3-8)
  wallThickness: 0.15, // 0.1 = thin walls, 0.3 = chunky
  roundness: 0.5,      // Corner radius factor
  imperfection: 0,     // 0 = perfect (pin), 0.5 = human (tote)
  bgColor: '#1a1a1a',
  fgColor: '#f5f0e6'
};

let canvas;
let hand = null; // Human hand characteristics

function setup() {
  const container = document.getElementById('canvas-container');
  const size = Math.min(container.offsetWidth - 80, container.offsetHeight - 80, 600);
  canvas = createCanvas(size, size);
  canvas.parent('canvas-container');

  setupControls();
  noLoop();
  generate();
}

function generate() {
  // Create hand signature for this seed
  hand = createHand(params.seed);
  redraw();
}

function draw() {
  // Seed everything
  randomSeed(params.seed);
  noiseSeed(params.seed);

  // Background (the "solid stone")
  background(params.fgColor);

  // Generate and draw voids (the carved holes)
  const voids = generateVoids();
  drawVoids(voids);

  // Draw border
  stroke(params.bgColor);
  strokeWeight(4);
  noFill();
  rect(2, 2, width - 4, height - 4);
}

// ============================================
// HUMAN HAND - Consistent imperfection per seed
// ============================================

function createHand(seed) {
  randomSeed(seed * 7); // Different sequence than main

  return {
    driftAngle: random(TWO_PI),           // Direction this hand tends to drift
    driftAmount: random(0.5, 1.5),        // How much drift
    sizeVariation: random(0.8, 1.2),      // Size tendency
    roundnessOffset: random(-0.1, 0.1),   // Corner radius tendency
    rotationBias: random(-0.1, 0.1)       // Slight rotation tendency
  };
}

function applyHand(value, variation, type) {
  if (params.imperfection === 0) return value;

  const amount = params.imperfection;
  const h = hand;

  switch(type) {
    case 'position':
      const drift = variation * h.driftAmount * amount * 10;
      return value + cos(h.driftAngle) * drift;
    case 'size':
      return value * lerp(1, h.sizeVariation, amount) * (1 + random(-0.1, 0.1) * amount);
    case 'roundness':
      return value + h.roundnessOffset * amount;
    case 'rotation':
      return value + h.rotationBias * amount + random(-0.05, 0.05) * amount;
    default:
      return value;
  }
}

// ============================================
// VOID GENERATION
// ============================================

function generateVoids() {
  const voids = [];
  const grid = params.density;
  const cellSize = width / grid;
  const margin = cellSize * 0.5;

  // Shape vocabulary with weights
  const shapes = [
    { type: 'circle', weight: 3 },
    { type: 'pill', weight: 2 },
    { type: 'cross', weight: 2 },
    { type: 'quatrefoil', weight: 1 },
    { type: 'trefoil', weight: 1 }
  ];
  const totalWeight = shapes.reduce((sum, s) => sum + s.weight, 0);

  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      // Base position (grid center)
      let cx = margin + i * cellSize + cellSize * 0.5;
      let cy = margin + j * cellSize + cellSize * 0.5;

      // Noise-driven drift from grid
      const noiseVal = noise(i * 0.5, j * 0.5);
      const driftX = map(noise(i * 0.3, j * 0.3, 0), 0, 1, -1, 1) * cellSize * 0.2;
      const driftY = map(noise(i * 0.3, j * 0.3, 100), 0, 1, -1, 1) * cellSize * 0.2;

      cx = applyHand(cx + driftX, noiseVal, 'position');
      cy = applyHand(cy + driftY, noiseVal, 'position');

      // Skip some cells for variation (based on noise)
      if (noise(i * 0.7, j * 0.7, 50) < 0.15) continue;

      // Select shape based on weighted probability
      const shapeType = selectWeightedShape(shapes, totalWeight, i, j);

      // Size based on noise and wall thickness
      const baseSize = cellSize * (1 - params.wallThickness * 2);
      const sizeNoise = map(noise(i * 0.4, j * 0.4, 200), 0, 1, 0.7, 1.1);
      const size = applyHand(baseSize * sizeNoise, noiseVal, 'size');

      // Rotation
      const rotation = applyHand(
        noise(i * 0.5, j * 0.5, 300) * HALF_PI,
        noiseVal,
        'rotation'
      );

      voids.push({
        type: shapeType,
        x: cx,
        y: cy,
        size: size,
        rotation: rotation,
        roundness: applyHand(params.roundness, noiseVal, 'roundness')
      });
    }
  }

  return voids;
}

function selectWeightedShape(shapes, totalWeight, i, j) {
  const r = noise(i * 0.6, j * 0.6, 999) * totalWeight;
  let cumulative = 0;

  for (const shape of shapes) {
    cumulative += shape.weight;
    if (r < cumulative) return shape.type;
  }

  return shapes[0].type;
}

// ============================================
// VOID DRAWING (Carving holes)
// ============================================

function drawVoids(voids) {
  fill(params.bgColor);
  noStroke();

  for (const v of voids) {
    push();
    translate(v.x, v.y);
    rotate(v.rotation);

    switch(v.type) {
      case 'circle':
        drawCircleVoid(v.size, v.roundness);
        break;
      case 'pill':
        drawPillVoid(v.size, v.roundness);
        break;
      case 'cross':
        drawCrossVoid(v.size, v.roundness);
        break;
      case 'quatrefoil':
        drawQuatrefoilVoid(v.size, v.roundness);
        break;
      case 'trefoil':
        drawTrefoilVoid(v.size, v.roundness);
        break;
    }

    pop();
  }
}

function drawCircleVoid(size, roundness) {
  ellipse(0, 0, size, size);
}

function drawPillVoid(size, roundness) {
  const w = size;
  const h = size * 0.5;
  const r = h * 0.5;

  rectMode(CENTER);

  // Draw as rounded rect
  beginShape();
  // Top left corner
  for (let a = PI; a <= PI + HALF_PI; a += 0.1) {
    vertex(-w/2 + r + cos(a) * r, -h/2 + r + sin(a) * r);
  }
  // Top right corner
  for (let a = -HALF_PI; a <= 0; a += 0.1) {
    vertex(w/2 - r + cos(a) * r, -h/2 + r + sin(a) * r);
  }
  // Bottom right corner
  for (let a = 0; a <= HALF_PI; a += 0.1) {
    vertex(w/2 - r + cos(a) * r, h/2 - r + sin(a) * r);
  }
  // Bottom left corner
  for (let a = HALF_PI; a <= PI; a += 0.1) {
    vertex(-w/2 + r + cos(a) * r, h/2 - r + sin(a) * r);
  }
  endShape(CLOSE);
}

function drawCrossVoid(size, roundness) {
  const armWidth = size * 0.35;
  const armLength = size * 0.5;
  const r = armWidth * roundness * 0.5;

  // Draw cross as 4 overlapping circles + center
  ellipse(0, 0, armWidth, armWidth); // Center
  ellipse(0, -armLength * 0.6, armWidth * 0.9, armWidth * 0.9); // Top
  ellipse(0, armLength * 0.6, armWidth * 0.9, armWidth * 0.9);  // Bottom
  ellipse(-armLength * 0.6, 0, armWidth * 0.9, armWidth * 0.9); // Left
  ellipse(armLength * 0.6, 0, armWidth * 0.9, armWidth * 0.9);  // Right

  // Fill gaps
  rectMode(CENTER);
  rect(0, 0, armWidth * 0.7, armLength * 1.2);
  rect(0, 0, armLength * 1.2, armWidth * 0.7);
}

function drawQuatrefoilVoid(size, roundness) {
  const lobeSize = size * 0.45;
  const offset = size * 0.25;

  // Four lobes
  ellipse(offset, 0, lobeSize, lobeSize);
  ellipse(-offset, 0, lobeSize, lobeSize);
  ellipse(0, offset, lobeSize, lobeSize);
  ellipse(0, -offset, lobeSize, lobeSize);

  // Center fill
  ellipse(0, 0, lobeSize * 0.8, lobeSize * 0.8);
}

function drawTrefoilVoid(size, roundness) {
  const lobeSize = size * 0.5;
  const offset = size * 0.28;

  // Three lobes at 120 degrees
  for (let i = 0; i < 3; i++) {
    const angle = (TWO_PI / 3) * i - HALF_PI;
    ellipse(cos(angle) * offset, sin(angle) * offset, lobeSize, lobeSize);
  }

  // Center fill
  ellipse(0, 0, lobeSize * 0.6, lobeSize * 0.6);
}

// ============================================
// CONTROLS
// ============================================

function setupControls() {
  // Seed
  const seedInput = document.getElementById('seed');
  if (seedInput) {
    seedInput.value = params.seed;
    seedInput.addEventListener('change', (e) => {
      params.seed = parseInt(e.target.value) || 0;
      generate();
    });
  }

  // Generate button
  const generateBtn = document.getElementById('generate');
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      params.seed = floor(random(100000));
      document.getElementById('seed').value = params.seed;
      generate();
    });
  }

  // Density
  const densitySlider = document.getElementById('density');
  const densityValue = document.getElementById('densityValue');
  if (densitySlider) {
    densitySlider.addEventListener('input', (e) => {
      params.density = parseInt(e.target.value);
      if (densityValue) densityValue.textContent = e.target.value;
      generate();
    });
  }

  // Wall thickness
  const wallSlider = document.getElementById('wallThickness');
  const wallValue = document.getElementById('wallValue');
  if (wallSlider) {
    wallSlider.addEventListener('input', (e) => {
      params.wallThickness = parseFloat(e.target.value);
      if (wallValue) wallValue.textContent = (e.target.value * 100).toFixed(0) + '%';
      generate();
    });
  }

  // Roundness
  const roundSlider = document.getElementById('roundness');
  const roundValue = document.getElementById('roundValue');
  if (roundSlider) {
    roundSlider.addEventListener('input', (e) => {
      params.roundness = parseFloat(e.target.value);
      if (roundValue) roundValue.textContent = (e.target.value * 100).toFixed(0) + '%';
      generate();
    });
  }

  // Imperfection
  const imperfectSlider = document.getElementById('imperfection');
  const imperfectValue = document.getElementById('imperfectValue');
  if (imperfectSlider) {
    imperfectSlider.addEventListener('input', (e) => {
      params.imperfection = parseFloat(e.target.value);
      if (imperfectValue) imperfectValue.textContent = (e.target.value * 100).toFixed(0) + '%';
      generate();
    });
  }

  // Color swatches
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', (e) => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      e.target.classList.add('active');
      params.bgColor = e.target.dataset.bg;
      params.fgColor = e.target.dataset.fg;
      generate();
    });
  });

  // Export buttons
  const exportPNG = document.getElementById('exportPNG');
  if (exportPNG) {
    exportPNG.addEventListener('click', () => {
      saveCanvas('jali-' + params.seed, 'png');
    });
  }

  const exportSVG = document.getElementById('exportSVG');
  if (exportSVG) {
    exportSVG.addEventListener('click', exportAsSVG);
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;

    switch(e.key.toLowerCase()) {
      case ' ':
      case 'g':
        e.preventDefault();
        document.getElementById('generate').click();
        break;
      case 's':
        exportAsSVG();
        break;
      case 'p':
        saveCanvas('jali-' + params.seed, 'png');
        break;
    }
  });
}

// ============================================
// SVG EXPORT
// ============================================

function exportAsSVG() {
  randomSeed(params.seed);
  noiseSeed(params.seed);

  const voids = generateVoids();

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${params.fgColor}"/>
  <g fill="${params.bgColor}">
`;

  for (const v of voids) {
    svg += generateShapeSVG(v);
  }

  svg += `  </g>
  <rect x="2" y="2" width="${width-4}" height="${height-4}" fill="none" stroke="${params.bgColor}" stroke-width="4"/>
</svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'jali-' + params.seed + '.svg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateShapeSVG(v) {
  const transform = `transform="translate(${v.x.toFixed(2)},${v.y.toFixed(2)}) rotate(${degrees(v.rotation).toFixed(2)})"`;

  switch(v.type) {
    case 'circle':
      return `    <circle cx="0" cy="0" r="${(v.size/2).toFixed(2)}" ${transform}/>\n`;

    case 'pill':
      const pw = v.size;
      const ph = v.size * 0.5;
      const pr = ph * 0.5;
      return `    <rect x="${(-pw/2).toFixed(2)}" y="${(-ph/2).toFixed(2)}" width="${pw.toFixed(2)}" height="${ph.toFixed(2)}" rx="${pr.toFixed(2)}" ${transform}/>\n`;

    case 'cross':
      const cw = v.size * 0.35;
      const cl = v.size * 0.5;
      // Simplified as two overlapping rects
      return `    <g ${transform}>
      <rect x="${(-cw/2).toFixed(2)}" y="${(-cl).toFixed(2)}" width="${cw.toFixed(2)}" height="${(cl*2).toFixed(2)}" rx="${(cw*0.3).toFixed(2)}"/>
      <rect x="${(-cl).toFixed(2)}" y="${(-cw/2).toFixed(2)}" width="${(cl*2).toFixed(2)}" height="${cw.toFixed(2)}" rx="${(cw*0.3).toFixed(2)}"/>
    </g>\n`;

    case 'quatrefoil':
    case 'trefoil':
      // For complex shapes, use circles
      const lobes = v.type === 'quatrefoil' ? 4 : 3;
      const lobeSize = v.size * (v.type === 'quatrefoil' ? 0.45 : 0.5);
      const offset = v.size * (v.type === 'quatrefoil' ? 0.25 : 0.28);

      let circles = `    <g ${transform}>\n`;
      for (let i = 0; i < lobes; i++) {
        const angle = (TWO_PI / lobes) * i - (v.type === 'trefoil' ? HALF_PI : 0);
        const lx = cos(angle) * offset;
        const ly = sin(angle) * offset;
        circles += `      <circle cx="${lx.toFixed(2)}" cy="${ly.toFixed(2)}" r="${(lobeSize/2).toFixed(2)}"/>\n`;
      }
      circles += `      <circle cx="0" cy="0" r="${(lobeSize * (v.type === 'quatrefoil' ? 0.4 : 0.3)).toFixed(2)}"/>\n`;
      circles += `    </g>\n`;
      return circles;

    default:
      return '';
  }
}

function windowResized() {
  const container = document.getElementById('canvas-container');
  const size = Math.min(container.offsetWidth - 80, container.offsetHeight - 80, 600);
  resizeCanvas(size, size);
  generate();
}
