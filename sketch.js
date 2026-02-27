// Generative Jali Machine
// Flow field + particle lines = organic lattice patterns
// Inspired by Tyler Hobbs' Fidenza approach

let params = {
  seed: 42,
  gridSize: 6,
  lineWeight: 2.5,
  flowStrength: 0.05,   // How much flow field influences direction
  wobble: 0.01,         // Hand-drawn imperfection
  density: 0.7,         // How many lines to draw
  symmetry: true,       // 4-fold mirror symmetry (Islamic aesthetic)
  connected: false,     // Lines connect at intersections vs overlap
  sunburst: 0,          // Art Deco sunburst rays (0 = none, 1 = full)
  sunburstSpread: 0.5,  // How spread out the rays are (0 = tight, 1 = wide)
  fountain: 0,          // Frozen fountain (0 = none, 1 = full)
  sideFountains: false, // Add smaller side arches (Gateway of India style)
  sideFountainHeight: 0.5, // Height of side fountains (0-1, relative to main)
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
  if (params.connected) {
    // Connected mode: each cell gets ONE diagonal, forming continuous zigzag paths
    for (let i = 0; i < iMax; i++) {
      for (let j = 0; j < jMax; j++) {
        if (random() < params.density * 0.9) {
          // Use noise to pick direction, creates coherent paths
          const dir = noise(i * 0.3, j * 0.3, params.seed * 0.1) > 0.5;
          if (dir) {
            segments.push([i, j, i + 1, j + 1, 'd1']); // \
          } else {
            segments.push([i + 1, j, i, j + 1, 'd2']); // /
          }
        }
      }
    }
  } else {
    // Original mode: independent random diagonals, can overlap
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

  // Art Deco sunburst - rays from bottom center to top grid points
  if (params.sunburst > 0) {
    drawSunburst(cx, cy, gridSize);
  }

  // Frozen fountain - nested arches using grid
  if (params.fountain > 0) {
    drawFrozenFountain(cx, cy, gridSize);
  }
}

// Art Deco sunburst - rays from bottom-center to grid points
function drawSunburst(cx, cy, gridSize) {
  const centerI = floor(gridSize / 2);
  const startX = margin + centerI * cellSize;
  const startY = margin + gridSize * cellSize;

  // Spread controls how many columns out from center to target (0 = just center, 1 = full width)
  const maxSpreadCols = floor(params.sunburstSpread * centerI) + 1;

  // Draw rays to grid points along the top row
  for (let i = -maxSpreadCols; i <= maxSpreadCols; i++) {
    const targetI = centerI + i;
    if (targetI < 0 || targetI > gridSize) continue;

    const targetX = margin + targetI * cellSize;
    const targetY = margin; // Top row

    line(startX, startY, targetX, targetY);
  }
}

// Frozen fountain - nested arches using grid points
function drawFrozenFountain(cx, cy, gridSize) {
  const centerI = floor(gridSize / 2);
  const maxLayers = floor(1 + params.fountain * 2); // 1-3 layers (narrower)
  const bottomY = margin + gridSize * cellSize;

  // Draw main central fountain (full height)
  drawFountainAt(centerI, maxLayers, bottomY, gridSize, true, gridSize);

  // Side fountains (Gateway of India style)
  if (params.sideFountains && maxLayers >= 1) {
    const sideWidth = 1; // Side fountains are single-layer
    // Height based on slider (aligned to grid rows)
    const sideMaxRows = max(1, floor(gridSize * params.sideFountainHeight));

    // Left side fountain - position it at grid edge
    const leftCenterI = 1;
    if (leftCenterI >= 1) {
      drawFountainAt(leftCenterI, sideWidth, bottomY, gridSize, false, sideMaxRows);
    }

    // Right side fountain - position it at grid edge
    const rightCenterI = gridSize - 1;
    if (rightCenterI <= gridSize - 1) {
      drawFountainAt(rightCenterI, sideWidth, bottomY, gridSize, false, sideMaxRows);
    }
  }
}

// Draw a single fountain at a given center position
function drawFountainAt(centerI, maxLayers, bottomY, gridSize, drawCenterLine, maxHeight) {
  // maxHeight = how many rows from bottom the fountain can reach
  const topLimit = margin + (gridSize - maxHeight) * cellSize;

  for (let layer = 1; layer <= maxLayers; layer++) {
    const leftI = centerI - layer;
    const rightI = centerI + layer;

    // Stay within grid bounds
    if (leftI < 0 || rightI > gridSize) continue;

    const leftX = margin + leftI * cellSize;
    const rightX = margin + rightI * cellSize;
    const archRadius = layer * cellSize;

    // Arch top Y position (but not above the height limit)
    const archTopY = max(topLimit, margin + layer * cellSize);

    // Left vertical line
    line(leftX, bottomY, leftX, archTopY);

    // Right vertical line
    line(rightX, bottomY, rightX, archTopY);

    // Arch connecting the tops
    const archCenterX = margin + centerI * cellSize;
    noFill();
    beginShape();
    for (let t = 0; t <= 20; t++) {
      const angle = PI + (t / 20) * PI;
      const x = archCenterX + cos(angle) * archRadius;
      const y = archTopY + sin(angle) * archRadius;
      vertex(x, y);
    }
    endShape();
  }

  // Central vertical line (optional) - goes to top limit
  if (drawCenterLine) {
    const centerX = margin + centerI * cellSize;
    line(centerX, bottomY, centerX, topLimit);
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

  // Wobble (hand-drawn jiggle)
  const wobbleSlider = document.getElementById('wobble');
  const wobbleValue = document.getElementById('wobbleValue');
  if (wobbleSlider) {
    wobbleSlider.value = params.wobble;
    wobbleSlider.addEventListener('input', (e) => {
      params.wobble = parseFloat(e.target.value);
      if (wobbleValue) wobbleValue.textContent = (e.target.value * 100).toFixed(0) + '%';
      redraw();
    });
  }

  // Connected toggle
  const connectedCheck = document.getElementById('connected');
  if (connectedCheck) {
    connectedCheck.checked = params.connected;
    connectedCheck.addEventListener('change', (e) => {
      params.connected = e.target.checked;
      redraw();
    });
  }

  // Sunburst
  const sunburstSlider = document.getElementById('sunburst');
  const sunburstValue = document.getElementById('sunburstValue');
  if (sunburstSlider) {
    sunburstSlider.value = params.sunburst;
    sunburstSlider.addEventListener('input', (e) => {
      params.sunburst = parseFloat(e.target.value);
      if (sunburstValue) sunburstValue.textContent = (e.target.value * 100).toFixed(0) + '%';
      redraw();
    });
  }

  // Sunburst Spread
  const spreadSlider = document.getElementById('sunburstSpread');
  const spreadValue = document.getElementById('spreadValue');
  if (spreadSlider) {
    spreadSlider.value = params.sunburstSpread;
    spreadSlider.addEventListener('input', (e) => {
      params.sunburstSpread = parseFloat(e.target.value);
      if (spreadValue) spreadValue.textContent = (e.target.value * 100).toFixed(0) + '%';
      redraw();
    });
  }

  // Frozen Fountain
  const fountainSlider = document.getElementById('fountain');
  const fountainValue = document.getElementById('fountainValue');
  if (fountainSlider) {
    fountainSlider.value = params.fountain;
    fountainSlider.addEventListener('input', (e) => {
      params.fountain = parseFloat(e.target.value);
      if (fountainValue) fountainValue.textContent = (e.target.value * 100).toFixed(0) + '%';
      redraw();
    });
  }

  // Side Fountains toggle
  const sideFountainsCheck = document.getElementById('sideFountains');
  if (sideFountainsCheck) {
    sideFountainsCheck.checked = params.sideFountains;
    sideFountainsCheck.addEventListener('change', (e) => {
      params.sideFountains = e.target.checked;
      redraw();
    });
  }

  // Side Fountain Height
  const sideHeightSlider = document.getElementById('sideFountainHeight');
  const sideHeightValue = document.getElementById('sideHeightValue');
  if (sideHeightSlider) {
    sideHeightSlider.value = params.sideFountainHeight;
    sideHeightSlider.addEventListener('input', (e) => {
      params.sideFountainHeight = parseFloat(e.target.value);
      if (sideHeightValue) sideHeightValue.textContent = (e.target.value * 100).toFixed(0) + '%';
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
  document.getElementById('copySVG')?.addEventListener('click', copySVGToClipboard);

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    // Cmd+Shift+S to copy SVG
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      copySVGToClipboard();
      return;
    }

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

  // Presets
  document.getElementById('savePreset')?.addEventListener('click', savePreset);
  loadPresets();
}

// ============================================
// PRESETS
// ============================================

function savePreset() {
  const presets = JSON.parse(localStorage.getItem('jaliPresets') || '[]');
  const preset = { ...params, id: Date.now() };
  presets.push(preset);
  localStorage.setItem('jaliPresets', JSON.stringify(presets));
  loadPresets();
}

function loadPresets() {
  const container = document.getElementById('presetList');
  if (!container) return;

  const presets = JSON.parse(localStorage.getItem('jaliPresets') || '[]');
  container.innerHTML = '';

  presets.forEach((preset, index) => {
    const btn = document.createElement('button');
    btn.className = 'preset-btn';
    btn.innerHTML = `#${preset.seed} <span class="delete">×</span>`;

    btn.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete')) {
        deletePreset(index);
      } else {
        applyPreset(preset);
      }
    });

    container.appendChild(btn);
  });
}

function applyPreset(preset) {
  // Apply all params
  Object.assign(params, preset);

  // Update all UI controls
  const updates = [
    ['seed', params.seed],
    ['gridSize', params.gridSize],
    ['diagonalProb', params.density],
    ['lineWeight', params.lineWeight],
    ['imperfection', params.flowStrength],
    ['wobble', params.wobble],
    ['sunburst', params.sunburst],
    ['sunburstSpread', params.sunburstSpread],
    ['fountain', params.fountain],
  ];

  updates.forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  });

  // Update checkboxes
  const connectedEl = document.getElementById('connected');
  if (connectedEl) connectedEl.checked = params.connected;

  const sideFountainsEl = document.getElementById('sideFountains');
  if (sideFountainsEl) sideFountainsEl.checked = params.sideFountains;

  const sideHeightEl = document.getElementById('sideFountainHeight');
  if (sideHeightEl) sideHeightEl.value = params.sideFountainHeight;
  const sideHeightValEl = document.getElementById('sideHeightValue');
  if (sideHeightValEl) sideHeightValEl.textContent = (params.sideFountainHeight * 100).toFixed(0) + '%';

  // Update displays
  document.getElementById('gridValue').textContent = params.gridSize;
  document.getElementById('diagValue').textContent = (params.density * 100).toFixed(0) + '%';
  document.getElementById('weightValue').textContent = params.lineWeight + 'px';
  document.getElementById('imperfectValue').textContent = (params.flowStrength * 100).toFixed(0) + '%';
  document.getElementById('wobbleValue').textContent = (params.wobble * 100).toFixed(0) + '%';
  document.getElementById('sunburstValue').textContent = (params.sunburst * 100).toFixed(0) + '%';
  document.getElementById('spreadValue').textContent = (params.sunburstSpread * 100).toFixed(0) + '%';
  document.getElementById('fountainValue').textContent = (params.fountain * 100).toFixed(0) + '%';

  // Update color swatch
  document.querySelectorAll('.color-swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.bg === params.bgColor);
  });

  redraw();
}

function deletePreset(index) {
  const presets = JSON.parse(localStorage.getItem('jaliPresets') || '[]');
  presets.splice(index, 1);
  localStorage.setItem('jaliPresets', JSON.stringify(presets));
  loadPresets();
}

// ============================================
// SVG EXPORT
// ============================================

function generateSVGString() {
  randomSeed(params.seed);
  noiseSeed(params.seed);

  const gridSize = params.gridSize;
  const localCellSize = (width - margin * 2) / gridSize;
  const cx = width / 2;
  const cy = height / 2;

  // Rebuild flow field for export (must match draw() exactly)
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

  function generatePathFromPixels(x1, y1, x2, y2) {
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

  // Match draw() exactly: collect segments first
  const halfGrid = params.symmetry ? ceil(gridSize / 2) : gridSize;
  const jMax = params.symmetry ? halfGrid : gridSize;
  const iMax = params.symmetry ? halfGrid : gridSize;

  let segments = [];

  // Horizontal connections (same order as draw())
  for (let j = 0; j <= jMax; j++) {
    for (let i = 0; i < iMax; i++) {
      if (random() < params.density) {
        segments.push([i, j, i + 1, j]);
      }
    }
  }

  // Vertical connections
  for (let i = 0; i <= iMax; i++) {
    for (let j = 0; j < jMax; j++) {
      if (random() < params.density) {
        segments.push([i, j, i, j + 1]);
      }
    }
  }

  // Diagonals - respect connected mode
  if (params.connected) {
    for (let i = 0; i < iMax; i++) {
      for (let j = 0; j < jMax; j++) {
        if (random() < params.density * 0.9) {
          const dir = noise(i * 0.3, j * 0.3, params.seed * 0.1) > 0.5;
          if (dir) {
            segments.push([i, j, i + 1, j + 1]);
          } else {
            segments.push([i + 1, j, i, j + 1]);
          }
        }
      }
    }
  } else {
    for (let i = 0; i < iMax; i++) {
      for (let j = 0; j < jMax; j++) {
        const n1 = noise(i * 0.5, j * 0.5, 0);
        const n2 = noise(i * 0.5, j * 0.5, 100);
        if (n1 < params.density * 0.8) {
          segments.push([i, j, i + 1, j + 1]);
        }
        if (n2 < params.density * 0.8) {
          segments.push([i + 1, j, i, j + 1]);
        }
      }
    }
  }

  // Draw all segments with symmetry mirroring
  for (let seg of segments) {
    const x1 = margin + seg[0] * localCellSize;
    const y1 = margin + seg[1] * localCellSize;
    const x2 = margin + seg[2] * localCellSize;
    const y2 = margin + seg[3] * localCellSize;

    // Original (top-left quadrant or full)
    svg += `    <path d="${generatePathFromPixels(x1, y1, x2, y2)}"/>\n`;

    if (params.symmetry) {
      // Mirror horizontally (to top-right)
      svg += `    <path d="${generatePathFromPixels(2 * cx - x1, y1, 2 * cx - x2, y2)}"/>\n`;
      // Mirror vertically (to bottom-left)
      svg += `    <path d="${generatePathFromPixels(x1, 2 * cy - y1, x2, 2 * cy - y2)}"/>\n`;
      // Mirror both (to bottom-right)
      svg += `    <path d="${generatePathFromPixels(2 * cx - x1, 2 * cy - y1, 2 * cx - x2, 2 * cy - y2)}"/>\n`;
    }
  }

  // Sunburst rays
  if (params.sunburst > 0) {
    const centerI = floor(gridSize / 2);
    const startX = margin + centerI * localCellSize;
    const startY = margin + gridSize * localCellSize;
    const maxSpreadCols = floor(params.sunburstSpread * centerI) + 1;

    for (let i = -maxSpreadCols; i <= maxSpreadCols; i++) {
      const targetI = centerI + i;
      if (targetI < 0 || targetI > gridSize) continue;

      const targetX = margin + targetI * localCellSize;
      const targetY = margin;
      svg += `    <line x1="${startX}" y1="${startY}" x2="${targetX}" y2="${targetY}"/>\n`;
    }
  }

  // Frozen fountain
  if (params.fountain > 0) {
    const centerI = floor(gridSize / 2);
    const maxLayers = floor(1 + params.fountain * 2);
    const bottomY = margin + gridSize * localCellSize;

    // Helper to draw a fountain
    function svgFountain(cI, layers, drawCenter, maxHeight) {
      let result = '';
      const topLimit = margin + (gridSize - maxHeight) * localCellSize;

      for (let layer = 1; layer <= layers; layer++) {
        const leftI = cI - layer;
        const rightI = cI + layer;
        if (leftI < 0 || rightI > gridSize) continue;

        const leftX = margin + leftI * localCellSize;
        const rightX = margin + rightI * localCellSize;
        const archRadius = layer * localCellSize;
        const archTopY = Math.max(topLimit, margin + layer * localCellSize);
        const archCenterX = margin + cI * localCellSize;

        // Vertical lines
        result += `    <line x1="${leftX}" y1="${bottomY}" x2="${leftX}" y2="${archTopY}"/>\n`;
        result += `    <line x1="${rightX}" y1="${bottomY}" x2="${rightX}" y2="${archTopY}"/>\n`;

        // Arch (semicircle)
        let archPoints = [];
        for (let t = 0; t <= 20; t++) {
          const angle = Math.PI + (t / 20) * Math.PI;
          const x = archCenterX + Math.cos(angle) * archRadius;
          const y = archTopY + Math.sin(angle) * archRadius;
          archPoints.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
        }
        result += `    <path d="M ${archPoints.join(' L ')}"/>\n`;
      }

      // Center line
      if (drawCenter) {
        const centerX = margin + cI * localCellSize;
        result += `    <line x1="${centerX}" y1="${bottomY}" x2="${centerX}" y2="${topLimit}"/>\n`;
      }

      return result;
    }

    // Main fountain
    svg += svgFountain(centerI, maxLayers, true, gridSize);

    // Side fountains
    if (params.sideFountains && maxLayers >= 1) {
      const sideMaxRows = Math.max(1, floor(gridSize * params.sideFountainHeight));
      svg += svgFountain(1, 1, false, sideMaxRows);
      svg += svgFountain(gridSize - 1, 1, false, sideMaxRows);
    }
  }

  svg += `  </g>
</svg>`;

  return svg;
}

function exportAsSVG() {
  const svg = generateSVGString();
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

function copySVGToClipboard() {
  const svg = generateSVGString();
  navigator.clipboard.writeText(svg).then(() => {
    showToast('SVG copied to clipboard');
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }
}

function windowResized() {
  const container = document.getElementById('canvas-container');
  const size = Math.min(container.offsetWidth - 80, container.offsetHeight - 80, 600);
  resizeCanvas(size, size);
  redraw();
}
