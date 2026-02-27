// Jali Line Grid Machine
// Lines form the lattice, voids are negative space

let params = {
  seed: 42,
  gridSize: 6,           // Number of grid divisions
  connectionProb: 0.7,   // Probability of drawing a connection
  diagonals: true,       // Include diagonal lines
  starNodes: 0.3,        // Probability of star decoration at nodes
  lineWeight: 3,
  imperfection: 0,       // Human hand amount
  bgColor: '#1a1a1a',
  fgColor: '#f5f0e6'
};

let canvas;
let hand = null;

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
  hand = createHand(params.seed);
  redraw();
}

function draw() {
  randomSeed(params.seed);
  noiseSeed(params.seed);

  background(params.bgColor);

  // Setup stroke
  stroke(params.fgColor);
  strokeWeight(params.lineWeight);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  noFill();

  const margin = 40;
  const gridSize = params.gridSize;
  const cellW = (width - margin * 2) / gridSize;
  const cellH = (height - margin * 2) / gridSize;

  // Generate grid points
  const points = [];
  for (let i = 0; i <= gridSize; i++) {
    points[i] = [];
    for (let j = 0; j <= gridSize; j++) {
      let x = margin + i * cellW;
      let y = margin + j * cellH;

      // Apply imperfection
      if (params.imperfection > 0) {
        const drift = params.imperfection * cellW * 0.15;
        x += applyHand(0, noise(i * 0.5, j * 0.5) * drift, 'position');
        y += applyHand(0, noise(i * 0.5 + 100, j * 0.5) * drift, 'position');
      }

      points[i][j] = { x, y };
    }
  }

  // Draw horizontal lines
  for (let j = 0; j <= gridSize; j++) {
    for (let i = 0; i < gridSize; i++) {
      if (shouldConnect(i, j, 'h')) {
        drawJaliLine(points[i][j], points[i + 1][j]);
      }
    }
  }

  // Draw vertical lines
  for (let i = 0; i <= gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (shouldConnect(i, j, 'v')) {
        drawJaliLine(points[i][j], points[i][j + 1]);
      }
    }
  }

  // Draw diagonal lines (if enabled)
  if (params.diagonals) {
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        // Diagonal: top-left to bottom-right
        if (shouldConnect(i, j, 'd1')) {
          drawJaliLine(points[i][j], points[i + 1][j + 1]);
        }
        // Diagonal: top-right to bottom-left
        if (shouldConnect(i, j, 'd2')) {
          drawJaliLine(points[i + 1][j], points[i][j + 1]);
        }
      }
    }
  }

  // Draw star decorations at some nodes
  for (let i = 0; i <= gridSize; i++) {
    for (let j = 0; j <= gridSize; j++) {
      if (shouldDrawStar(i, j)) {
        drawStarNode(points[i][j], cellW * 0.25);
      }
    }
  }

  // Draw border
  strokeWeight(params.lineWeight * 1.5);
  rect(margin * 0.5, margin * 0.5, width - margin, height - margin);
}

// ============================================
// CONNECTION LOGIC
// ============================================

function shouldConnect(i, j, type) {
  // Use noise for consistent but varied decisions
  const n = noise(i * 0.3 + j * 0.7, j * 0.3, type.charCodeAt(0) * 0.1);
  return n < params.connectionProb;
}

function shouldDrawStar(i, j) {
  // Stars at nodes based on noise
  const n = noise(i * 0.4, j * 0.4, 500);
  return n < params.starNodes;
}

// ============================================
// LINE DRAWING
// ============================================

function drawJaliLine(p1, p2) {
  let x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y;

  // Apply imperfection to endpoints
  if (params.imperfection > 0) {
    const wobble = params.imperfection * 2;
    x1 += random(-wobble, wobble);
    y1 += random(-wobble, wobble);
    x2 += random(-wobble, wobble);
    y2 += random(-wobble, wobble);
  }

  line(x1, y1, x2, y2);
}

function drawStarNode(p, size) {
  const rays = floor(random(4, 9)); // 4 to 8 rays
  const innerR = size * 0.3;
  const outerR = size;

  push();
  translate(p.x, p.y);

  if (params.imperfection > 0) {
    rotate(random(-0.1, 0.1) * params.imperfection);
  }

  for (let i = 0; i < rays; i++) {
    const angle = (TWO_PI / rays) * i - HALF_PI;
    const x1 = cos(angle) * innerR;
    const y1 = sin(angle) * innerR;
    const x2 = cos(angle) * outerR;
    const y2 = sin(angle) * outerR;
    line(x1, y1, x2, y2);
  }

  pop();
}

// ============================================
// HUMAN HAND
// ============================================

function createHand(seed) {
  randomSeed(seed * 7);
  return {
    driftAngle: random(TWO_PI),
    driftAmount: random(0.5, 1.5),
    weightVar: random(0.9, 1.1)
  };
}

function applyHand(value, variation, type) {
  if (params.imperfection === 0) return value;

  const amount = params.imperfection;
  const h = hand;

  if (type === 'position') {
    const drift = variation * h.driftAmount * amount;
    return value + cos(h.driftAngle + variation) * drift;
  }

  return value;
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

  // Grid size
  const gridSlider = document.getElementById('gridSize');
  const gridValue = document.getElementById('gridValue');
  if (gridSlider) {
    gridSlider.addEventListener('input', (e) => {
      params.gridSize = parseInt(e.target.value);
      if (gridValue) gridValue.textContent = e.target.value;
      generate();
    });
  }

  // Connection probability
  const connSlider = document.getElementById('connectionProb');
  const connValue = document.getElementById('connValue');
  if (connSlider) {
    connSlider.addEventListener('input', (e) => {
      params.connectionProb = parseFloat(e.target.value);
      if (connValue) connValue.textContent = (e.target.value * 100).toFixed(0) + '%';
      generate();
    });
  }

  // Diagonals toggle
  const diagToggle = document.getElementById('diagonals');
  if (diagToggle) {
    diagToggle.addEventListener('change', (e) => {
      params.diagonals = e.target.checked;
      generate();
    });
  }

  // Star nodes
  const starSlider = document.getElementById('starNodes');
  const starValue = document.getElementById('starValue');
  if (starSlider) {
    starSlider.addEventListener('input', (e) => {
      params.starNodes = parseFloat(e.target.value);
      if (starValue) starValue.textContent = (e.target.value * 100).toFixed(0) + '%';
      generate();
    });
  }

  // Line weight
  const weightSlider = document.getElementById('lineWeight');
  const weightValue = document.getElementById('weightValue');
  if (weightSlider) {
    weightSlider.addEventListener('input', (e) => {
      params.lineWeight = parseFloat(e.target.value);
      if (weightValue) weightValue.textContent = e.target.value + 'px';
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

  // Export
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

  const margin = 40;
  const gridSize = params.gridSize;
  const cellW = (width - margin * 2) / gridSize;
  const cellH = (height - margin * 2) / gridSize;

  // Generate points
  const points = [];
  for (let i = 0; i <= gridSize; i++) {
    points[i] = [];
    for (let j = 0; j <= gridSize; j++) {
      let x = margin + i * cellW;
      let y = margin + j * cellH;
      if (params.imperfection > 0) {
        const drift = params.imperfection * cellW * 0.15;
        x += applyHand(0, noise(i * 0.5, j * 0.5) * drift, 'position');
        y += applyHand(0, noise(i * 0.5 + 100, j * 0.5) * drift, 'position');
      }
      points[i][j] = { x, y };
    }
  }

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${params.bgColor}"/>
  <g stroke="${params.fgColor}" stroke-width="${params.lineWeight}" stroke-linecap="round" stroke-linejoin="round" fill="none">
`;

  // Horizontal lines
  for (let j = 0; j <= gridSize; j++) {
    for (let i = 0; i < gridSize; i++) {
      if (shouldConnect(i, j, 'h')) {
        svg += svgLine(points[i][j], points[i + 1][j]);
      }
    }
  }

  // Vertical lines
  for (let i = 0; i <= gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (shouldConnect(i, j, 'v')) {
        svg += svgLine(points[i][j], points[i][j + 1]);
      }
    }
  }

  // Diagonals
  if (params.diagonals) {
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (shouldConnect(i, j, 'd1')) {
          svg += svgLine(points[i][j], points[i + 1][j + 1]);
        }
        if (shouldConnect(i, j, 'd2')) {
          svg += svgLine(points[i + 1][j], points[i][j + 1]);
        }
      }
    }
  }

  // Star nodes
  for (let i = 0; i <= gridSize; i++) {
    for (let j = 0; j <= gridSize; j++) {
      if (shouldDrawStar(i, j)) {
        svg += svgStar(points[i][j], cellW * 0.25);
      }
    }
  }

  // Border
  svg += `    <rect x="${margin * 0.5}" y="${margin * 0.5}" width="${width - margin}" height="${height - margin}" stroke-width="${params.lineWeight * 1.5}"/>
`;

  svg += `  </g>
</svg>`;

  downloadSVG(svg);
}

function svgLine(p1, p2) {
  let x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y;
  if (params.imperfection > 0) {
    const wobble = params.imperfection * 2;
    x1 += random(-wobble, wobble);
    y1 += random(-wobble, wobble);
    x2 += random(-wobble, wobble);
    y2 += random(-wobble, wobble);
  }
  return `    <line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}"/>\n`;
}

function svgStar(p, size) {
  const rays = floor(random(4, 9));
  const innerR = size * 0.3;
  const outerR = size;

  let lines = '';
  for (let i = 0; i < rays; i++) {
    const angle = (TWO_PI / rays) * i - HALF_PI;
    const x1 = p.x + cos(angle) * innerR;
    const y1 = p.y + sin(angle) * innerR;
    const x2 = p.x + cos(angle) * outerR;
    const y2 = p.y + sin(angle) * outerR;
    lines += `    <line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}"/>\n`;
  }
  return lines;
}

function downloadSVG(svg) {
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
  generate();
}
