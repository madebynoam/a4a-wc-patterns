// Generative Jali Machine
// Flow field + particle lines = organic lattice patterns
// Inspired by Tyler Hobbs' Fidenza approach

let params = {
  seed: 42,
  gridSize: 6,
  lineWeight: 2.5,
  flowStrength: 0.3,    // How much flow field influences direction
  wobble: 0.02,         // Hand-drawn imperfection
  density: 0.7,         // How many lines to draw
  symmetry: true,       // 4-fold mirror symmetry (Islamic aesthetic)
  bgColor: '#1a1a1a',
  fgColor: '#f5f0e6'
};

let canvas;
let flowField;
let cellSize;
let margin = 40;

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
  redraw();
}

function draw() {
  randomSeed(params.seed);
  noiseSeed(params.seed);

  background(params.bgColor);
  stroke(params.fgColor);
  strokeWeight(params.lineWeight);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  noFill();

  const gridSize = params.gridSize;
  cellSize = (width - margin * 2) / gridSize;

  // Build flow field - angles at each grid point influenced by noise
  flowField = [];
  for (let i = 0; i <= gridSize; i++) {
    flowField[i] = [];
    for (let j = 0; j <= gridSize; j++) {
      // Base angle from noise, biased toward 45° increments (jali aesthetic)
      const noiseVal = noise(i * 0.5, j * 0.5, params.seed * 0.01);
      // Quantize to 8 directions but with some deviation
      const baseAngle = floor(noiseVal * 8) * (PI / 4);
      const deviation = (noise(i * 0.3, j * 0.3, 100) - 0.5) * params.flowStrength * PI;
      flowField[i][j] = baseAngle + deviation;
    }
  }

  // For symmetry: only generate top-left quadrant, mirror to others
  // For no symmetry: generate full grid
  const halfGrid = params.symmetry ? ceil(gridSize / 2) : gridSize;
  const cx = width / 2;
  const cy = height / 2;

  // Collect segments (in quadrant if symmetry, full grid otherwise)
  let segments = [];

  // Horizontal-ish connections
  const jMax = params.symmetry ? halfGrid : gridSize;
  const iMax = params.symmetry ? halfGrid : gridSize;

  for (let j = 0; j <= jMax; j++) {
    for (let i = 0; i < iMax; i++) {
      if (random() < params.density) {
        segments.push([i, j, i + 1, j, 'h']);
      }
    }
  }

  // Vertical-ish connections
  for (let i = 0; i <= iMax; i++) {
    for (let j = 0; j < jMax; j++) {
      if (random() < params.density) {
        segments.push([i, j, i, j + 1, 'v']);
      }
    }
  }

  // Diagonal connections - the jali magic
  for (let i = 0; i < iMax; i++) {
    for (let j = 0; j < jMax; j++) {
      const n1 = noise(i * 0.5, j * 0.5, 0);
      const n2 = noise(i * 0.5, j * 0.5, 100);

      if (n1 < params.density * 0.8) {
        segments.push([i, j, i + 1, j + 1, 'd1']);
      }

      if (n2 < params.density * 0.8) {
        segments.push([i + 1, j, i, j + 1, 'd2']);
      }
    }
  }

  // Draw all segments
  for (let seg of segments) {
    const x1 = margin + seg[0] * cellSize;
    const y1 = margin + seg[1] * cellSize;
    const x2 = margin + seg[2] * cellSize;
    const y2 = margin + seg[3] * cellSize;

    // Draw original (top-left quadrant or full)
    drawFlowingLinePixels(x1, y1, x2, y2);

    if (params.symmetry) {
      // Mirror horizontally (to top-right)
      drawFlowingLinePixels(2 * cx - x1, y1, 2 * cx - x2, y2);

      // Mirror vertically (to bottom-left)
      drawFlowingLinePixels(x1, 2 * cy - y1, x2, 2 * cy - y2);

      // Mirror both (to bottom-right)
      drawFlowingLinePixels(2 * cx - x1, 2 * cy - y1, 2 * cx - x2, 2 * cy - y2);
    }
  }
}

// Draw a line between two grid points, but let it flow organically
function drawFlowingLine(i1, j1, i2, j2) {
  const x1 = margin + i1 * cellSize;
  const y1 = margin + j1 * cellSize;
  const x2 = margin + i2 * cellSize;
  const y2 = margin + j2 * cellSize;
  drawFlowingLinePixels(x1, y1, x2, y2);
}

// Draw flowing line from pixel coordinates
function drawFlowingLinePixels(x1, y1, x2, y2) {

  // Number of segments - more = smoother curve
  const segments = 8;

  beginShape();
  for (let t = 0; t <= segments; t++) {
    const progress = t / segments;

    // Base position along straight line
    let x = lerp(x1, x2, progress);
    let y = lerp(y1, y2, progress);

    // Get flow influence at this point
    const gridI = (x - margin) / cellSize;
    const gridJ = (y - margin) / cellSize;
    const flowAngle = getFlowAngle(gridI, gridJ);

    // Displacement perpendicular to the line direction
    // Strongest in the middle, zero at endpoints
    const displacement = sin(progress * PI) * params.flowStrength * cellSize * 0.3;

    // Add flow-based curve
    const perpAngle = flowAngle + HALF_PI;
    x += cos(perpAngle) * displacement;
    y += sin(perpAngle) * displacement;

    // Add hand wobble
    if (params.wobble > 0 && t > 0 && t < segments) {
      x += random(-1, 1) * params.wobble * cellSize;
      y += random(-1, 1) * params.wobble * cellSize;
    }

    vertex(x, y);
  }
  endShape();
}

// Bilinear interpolation of flow field
function getFlowAngle(i, j) {
  const i0 = floor(constrain(i, 0, params.gridSize - 1));
  const j0 = floor(constrain(j, 0, params.gridSize - 1));
  const i1 = min(i0 + 1, params.gridSize);
  const j1 = min(j0 + 1, params.gridSize);

  const fi = i - i0;
  const fj = j - j0;

  // Simple average of surrounding angles
  const a00 = flowField[i0]?.[j0] || 0;
  const a10 = flowField[i1]?.[j0] || 0;
  const a01 = flowField[i0]?.[j1] || 0;
  const a11 = flowField[i1]?.[j1] || 0;

  const a0 = lerp(a00, a10, fi);
  const a1 = lerp(a01, a11, fi);

  return lerp(a0, a1, fj);
}

// ============================================
// CONTROLS
// ============================================

function setupControls() {
  const seedInput = document.getElementById('seed');
  if (seedInput) {
    seedInput.value = params.seed;
    seedInput.addEventListener('change', (e) => {
      params.seed = parseInt(e.target.value) || 0;
      generate();
    });
  }

  const generateBtn = document.getElementById('generate');
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      params.seed = floor(random(100000));
      document.getElementById('seed').value = params.seed;
      generate();
    });
  }

  const gridSlider = document.getElementById('gridSize');
  const gridValue = document.getElementById('gridValue');
  if (gridSlider) {
    gridSlider.addEventListener('input', (e) => {
      params.gridSize = parseInt(e.target.value);
      if (gridValue) gridValue.textContent = e.target.value;
      redraw();
    });
  }

  // Repurpose diagonalProb as density
  const diagSlider = document.getElementById('diagonalProb');
  const diagValue = document.getElementById('diagValue');
  if (diagSlider) {
    diagSlider.value = params.density;
    diagSlider.addEventListener('input', (e) => {
      params.density = parseFloat(e.target.value);
      if (diagValue) diagValue.textContent = (e.target.value * 100).toFixed(0) + '%';
      redraw();
    });
  }

  const weightSlider = document.getElementById('lineWeight');
  const weightValue = document.getElementById('weightValue');
  if (weightSlider) {
    weightSlider.addEventListener('input', (e) => {
      params.lineWeight = parseFloat(e.target.value);
      if (weightValue) weightValue.textContent = e.target.value + 'px';
      redraw();
    });
  }

  // Repurpose imperfection as flow strength
  const imperfectSlider = document.getElementById('imperfection');
  const imperfectValue = document.getElementById('imperfectValue');
  if (imperfectSlider) {
    imperfectSlider.value = params.flowStrength;
    imperfectSlider.addEventListener('input', (e) => {
      params.flowStrength = parseFloat(e.target.value);
      if (imperfectValue) imperfectValue.textContent = (e.target.value * 100).toFixed(0) + '%';
      redraw();
    });
  }

  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', (e) => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      e.target.classList.add('active');
      params.bgColor = e.target.dataset.bg;
      params.fgColor = e.target.dataset.fg;
      redraw();
    });
  });

  document.getElementById('exportPNG')?.addEventListener('click', () => {
    saveCanvas('jali-' + params.seed, 'png');
  });

  document.getElementById('exportSVG')?.addEventListener('click', exportAsSVG);

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
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

  const gridSize = params.gridSize;
  const localCellSize = (width - margin * 2) / gridSize;

  // Rebuild flow field for export
  const localFlowField = [];
  for (let i = 0; i <= gridSize; i++) {
    localFlowField[i] = [];
    for (let j = 0; j <= gridSize; j++) {
      const noiseVal = noise(i * 0.5, j * 0.5, params.seed * 0.01);
      const baseAngle = floor(noiseVal * 8) * (PI / 4);
      const deviation = (noise(i * 0.3, j * 0.3, 100) - 0.5) * params.flowStrength * PI;
      localFlowField[i][j] = baseAngle + deviation;
    }
  }

  function getLocalFlowAngle(i, j) {
    const i0 = floor(constrain(i, 0, gridSize - 1));
    const j0 = floor(constrain(j, 0, gridSize - 1));
    const i1 = min(i0 + 1, gridSize);
    const j1 = min(j0 + 1, gridSize);
    const fi = i - i0;
    const fj = j - j0;
    const a00 = localFlowField[i0]?.[j0] || 0;
    const a10 = localFlowField[i1]?.[j0] || 0;
    const a01 = localFlowField[i0]?.[j1] || 0;
    const a11 = localFlowField[i1]?.[j1] || 0;
    const a0 = lerp(a00, a10, fi);
    const a1 = lerp(a01, a11, fi);
    return lerp(a0, a1, fj);
  }

  function generatePath(i1, j1, i2, j2) {
    const x1 = margin + i1 * localCellSize;
    const y1 = margin + j1 * localCellSize;
    const x2 = margin + i2 * localCellSize;
    const y2 = margin + j2 * localCellSize;
    const segments = 8;

    let points = [];
    for (let t = 0; t <= segments; t++) {
      const progress = t / segments;
      let x = lerp(x1, x2, progress);
      let y = lerp(y1, y2, progress);

      const gridI = (x - margin) / localCellSize;
      const gridJ = (y - margin) / localCellSize;
      const flowAngle = getLocalFlowAngle(gridI, gridJ);

      const displacement = sin(progress * PI) * params.flowStrength * localCellSize * 0.3;
      const perpAngle = flowAngle + HALF_PI;
      x += cos(perpAngle) * displacement;
      y += sin(perpAngle) * displacement;

      if (params.wobble > 0 && t > 0 && t < segments) {
        x += random(-1, 1) * params.wobble * localCellSize;
        y += random(-1, 1) * params.wobble * localCellSize;
      }

      points.push({x, y});
    }

    return 'M ' + points.map(p => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' L ');
  }

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${params.bgColor}"/>
  <g stroke="${params.fgColor}" stroke-width="${params.lineWeight}" stroke-linecap="round" stroke-linejoin="round" fill="none">
`;

  // Horizontal connections
  for (let j = 0; j <= gridSize; j++) {
    for (let i = 0; i < gridSize; i++) {
      if (random() < params.density) {
        svg += `    <path d="${generatePath(i, j, i + 1, j)}"/>\n`;
      }
    }
  }

  // Vertical connections
  for (let i = 0; i <= gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (random() < params.density) {
        svg += `    <path d="${generatePath(i, j, i, j + 1)}"/>\n`;
      }
    }
  }

  // Diagonals
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const n1 = noise(i * 0.5, j * 0.5, 0);
      const n2 = noise(i * 0.5, j * 0.5, 100);

      if (n1 < params.density * 0.8) {
        svg += `    <path d="${generatePath(i, j, i + 1, j + 1)}"/>\n`;
      }

      if (n2 < params.density * 0.8) {
        svg += `    <path d="${generatePath(i + 1, j, i, j + 1)}"/>\n`;
      }
    }
  }

  svg += `  </g>
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

function windowResized() {
  const container = document.getElementById('canvas-container');
  const size = Math.min(container.offsetWidth - 80, container.offsetHeight - 80, 600);
  resizeCanvas(size, size);
  redraw();
}
