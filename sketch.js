// Jali Lattice Generator
// Simple: grid + diagonals = lattice pattern

let params = {
  seed: 42,
  gridSize: 6,
  diagonalProb: 0.5,    // Probability of each diagonal
  lineWeight: 2.5,
  imperfection: 0,
  bgColor: '#1a1a1a',
  fgColor: '#f5f0e6'
};

let canvas;

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
  strokeCap(SQUARE);
  strokeJoin(MITER);
  noFill();

  const margin = 40;
  const gridSize = params.gridSize;
  const cellW = (width - margin * 2) / gridSize;
  const cellH = (height - margin * 2) / gridSize;

  // Draw the base grid (all horizontal and vertical lines)
  // Horizontals
  for (let j = 0; j <= gridSize; j++) {
    const y = margin + j * cellH;
    drawLine(margin, y, width - margin, y);
  }

  // Verticals
  for (let i = 0; i <= gridSize; i++) {
    const x = margin + i * cellW;
    drawLine(x, margin, x, height - margin);
  }

  // Now add diagonals based on seed
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const x = margin + i * cellW;
      const y = margin + j * cellH;

      // Use noise to decide which diagonals to draw
      const n1 = noise(i * 0.5, j * 0.5, 0);
      const n2 = noise(i * 0.5, j * 0.5, 100);

      // Diagonal: top-left to bottom-right
      if (n1 < params.diagonalProb) {
        drawLine(x, y, x + cellW, y + cellH);
      }

      // Diagonal: top-right to bottom-left
      if (n2 < params.diagonalProb) {
        drawLine(x + cellW, y, x, y + cellH);
      }
    }
  }
}

function drawLine(x1, y1, x2, y2) {
  if (params.imperfection > 0) {
    const w = params.imperfection * 3;
    x1 += random(-w, w);
    y1 += random(-w, w);
    x2 += random(-w, w);
    y2 += random(-w, w);
  }
  line(x1, y1, x2, y2);
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

  const diagSlider = document.getElementById('diagonalProb');
  const diagValue = document.getElementById('diagValue');
  if (diagSlider) {
    diagSlider.addEventListener('input', (e) => {
      params.diagonalProb = parseFloat(e.target.value);
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

  const imperfectSlider = document.getElementById('imperfection');
  const imperfectValue = document.getElementById('imperfectValue');
  if (imperfectSlider) {
    imperfectSlider.addEventListener('input', (e) => {
      params.imperfection = parseFloat(e.target.value);
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

  const margin = 40;
  const gridSize = params.gridSize;
  const cellW = (width - margin * 2) / gridSize;
  const cellH = (height - margin * 2) / gridSize;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${params.bgColor}"/>
  <g stroke="${params.fgColor}" stroke-width="${params.lineWeight}" stroke-linecap="square" stroke-linejoin="miter" fill="none">
`;

  // Horizontals
  for (let j = 0; j <= gridSize; j++) {
    const y = margin + j * cellH;
    svg += `    <line x1="${margin}" y1="${y}" x2="${width - margin}" y2="${y}"/>\n`;
  }

  // Verticals
  for (let i = 0; i <= gridSize; i++) {
    const x = margin + i * cellW;
    svg += `    <line x1="${x}" y1="${margin}" x2="${x}" y2="${height - margin}"/>\n`;
  }

  // Diagonals
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const x = margin + i * cellW;
      const y = margin + j * cellH;

      const n1 = noise(i * 0.5, j * 0.5, 0);
      const n2 = noise(i * 0.5, j * 0.5, 100);

      if (n1 < params.diagonalProb) {
        svg += `    <line x1="${x}" y1="${y}" x2="${x + cellW}" y2="${y + cellH}"/>\n`;
      }

      if (n2 < params.diagonalProb) {
        svg += `    <line x1="${x + cellW}" y1="${y}" x2="${x}" y2="${y + cellH}"/>\n`;
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
