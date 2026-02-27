// Islamic Jali Pattern Machine
// Hankin's Polygons-in-Contact method for authentic geometric patterns

let params = {
  seed: 42,
  starType: 8,           // 6, 8, or 12 pointed stars
  contactAngle: 55,      // 35-75 degrees - controls star sharpness
  gridSize: 4,           // How many repeats
  connectionProb: 1.0,   // 1 = full pattern, lower = some lines omitted
  lineWeight: 2.5,
  imperfection: 0,
  bgColor: '#1a1a1a',
  fgColor: '#f5f0e6'
};

let canvas;
let hand = null;
let lines = []; // Store lines for SVG export

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
  randomSeed(params.seed);
  noiseSeed(params.seed);
  hand = createHand(params.seed);

  // Randomly vary parameters based on seed
  const starTypes = [6, 8, 8, 8, 12]; // Weighted toward 8
  params.starType = starTypes[floor(random(starTypes.length))];
  params.contactAngle = floor(random(40, 70));

  // Update UI to show generated values
  updateUIFromParams();

  redraw();
}

function updateUIFromParams() {
  const starSelect = document.getElementById('starType');
  if (starSelect) starSelect.value = params.starType;

  const angleSlider = document.getElementById('contactAngle');
  const angleValue = document.getElementById('angleValue');
  if (angleSlider) {
    angleSlider.value = params.contactAngle;
    if (angleValue) angleValue.textContent = params.contactAngle + '°';
  }
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

  lines = []; // Reset for SVG export

  push();
  translate(width / 2, height / 2);

  // Draw the Islamic pattern
  if (params.starType === 6) {
    drawHexagonalPattern();
  } else if (params.starType === 12) {
    drawTwelveFoldPattern();
  } else {
    drawSquarePattern();
  }

  pop();

  // Draw border
  strokeWeight(params.lineWeight * 1.5);
  rect(10, 10, width - 20, height - 20);
}

// ============================================
// 8-POINT STAR (Square Grid)
// ============================================

function drawSquarePattern() {
  const s = min(width, height) * 0.85 / params.gridSize;
  const grid = params.gridSize;
  const halfGrid = (grid - 1) / 2;
  const contactAngle = radians(params.contactAngle);

  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      const cx = (i - halfGrid) * s;
      const cy = (j - halfGrid) * s;

      hankinStar(cx, cy, s * 0.45, 8, contactAngle);
    }
  }
}

// ============================================
// 6-POINT STAR (Hexagonal Grid)
// ============================================

function drawHexagonalPattern() {
  const s = min(width, height) * 0.85 / params.gridSize;
  const grid = params.gridSize;
  const contactAngle = radians(params.contactAngle);

  const hSpace = s;
  const vSpace = s * sqrt(3) / 2;
  const halfGrid = (grid - 1) / 2;

  for (let j = 0; j < grid + 1; j++) {
    for (let i = 0; i < grid + 1; i++) {
      const offset = (j % 2) * (hSpace / 2);
      const cx = (i - halfGrid) * hSpace + offset - hSpace / 4;
      const cy = (j - halfGrid) * vSpace;

      hankinStar(cx, cy, s * 0.38, 6, contactAngle);
    }
  }
}

// ============================================
// 12-POINT STAR (Complex)
// ============================================

function drawTwelveFoldPattern() {
  const s = min(width, height) * 0.85 / params.gridSize;
  const grid = params.gridSize;
  const halfGrid = (grid - 1) / 2;
  const contactAngle = radians(params.contactAngle);

  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      const cx = (i - halfGrid) * s;
      const cy = (j - halfGrid) * s;

      // 12-fold with inner detail
      hankinStar(cx, cy, s * 0.45, 12, contactAngle);
      hankinStar(cx, cy, s * 0.25, 12, contactAngle * 0.7);
    }
  }
}

// ============================================
// HANKIN STAR CONSTRUCTION
// ============================================

function hankinStar(cx, cy, r, sides, contactAngle) {
  // Clamp contact angle
  contactAngle = constrain(contactAngle, radians(35), radians(75));

  // Get polygon vertices
  const verts = [];
  for (let i = 0; i < sides; i++) {
    const a = (TWO_PI / sides) * i - HALF_PI;
    verts.push({ x: cx + cos(a) * r, y: cy + sin(a) * r });
  }

  // Get edge midpoints with perpendicular angles
  const mids = [];
  for (let i = 0; i < sides; i++) {
    const v1 = verts[i];
    const v2 = verts[(i + 1) % sides];
    const mx = (v1.x + v2.x) / 2;
    const my = (v1.y + v2.y) / 2;
    const edgeAngle = atan2(v2.y - v1.y, v2.x - v1.x);
    const perpAngle = edgeAngle - HALF_PI;
    mids.push({ x: mx, y: my, perp: perpAngle });
  }

  const maxDist = r * 2;

  // For each edge, compute rays and find intersections
  for (let i = 0; i < sides; i++) {
    const m = mids[i];
    const mNext = mids[(i + 1) % sides];

    // Ray from current midpoint (perp + contactAngle)
    const ray1Angle = m.perp + contactAngle;
    // Ray from next midpoint (perp - contactAngle)
    const ray2Angle = mNext.perp - contactAngle;

    const intersection = rayIntersection(
      m.x, m.y, ray1Angle,
      mNext.x, mNext.y, ray2Angle
    );

    if (intersection) {
      const d1 = dist(m.x, m.y, intersection.x, intersection.y);
      const d2 = dist(mNext.x, mNext.y, intersection.x, intersection.y);

      if (d1 < maxDist && d2 < maxDist) {
        // Check connection probability
        if (shouldDraw(i, m.x, m.y)) {
          drawJaliLine(m.x, m.y, intersection.x, intersection.y);
        }
        if (shouldDraw(i + sides, mNext.x, mNext.y)) {
          drawJaliLine(intersection.x, intersection.y, mNext.x, mNext.y);
        }
      } else {
        // Fallback for extreme angles
        const shortLen = r * 0.4;
        if (shouldDraw(i, m.x, m.y)) {
          drawJaliLine(m.x, m.y, m.x + cos(ray1Angle) * shortLen, m.y + sin(ray1Angle) * shortLen);
        }
        if (shouldDraw(i + sides, mNext.x, mNext.y)) {
          drawJaliLine(mNext.x, mNext.y, mNext.x + cos(ray2Angle) * shortLen, mNext.y + sin(ray2Angle) * shortLen);
        }
      }
    }
  }
}

function rayIntersection(x1, y1, angle1, x2, y2, angle2) {
  const dx1 = cos(angle1);
  const dy1 = sin(angle1);
  const dx2 = cos(angle2);
  const dy2 = sin(angle2);

  const denom = dx1 * dy2 - dy1 * dx2;
  if (abs(denom) < 0.0001) return null;

  const t = ((x2 - x1) * dy2 - (y2 - y1) * dx2) / denom;

  if (t > 0) {
    return { x: x1 + dx1 * t, y: y1 + dy1 * t };
  }
  return null;
}

function shouldDraw(index, x, y) {
  if (params.connectionProb >= 1) return true;
  const n = noise(x * 0.01, y * 0.01, index * 0.1);
  return n < params.connectionProb;
}

// ============================================
// LINE DRAWING WITH IMPERFECTION
// ============================================

function drawJaliLine(x1, y1, x2, y2) {
  // Apply imperfection
  if (params.imperfection > 0) {
    const wobble = params.imperfection * 3;
    x1 += random(-wobble, wobble);
    y1 += random(-wobble, wobble);
    x2 += random(-wobble, wobble);
    y2 += random(-wobble, wobble);
  }

  line(x1, y1, x2, y2);
  lines.push({ x1, y1, x2, y2 });
}

// ============================================
// HUMAN HAND
// ============================================

function createHand(seed) {
  randomSeed(seed * 7);
  return {
    drift: random(-1, 1),
    pressure: random(0.9, 1.1)
  };
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

  // Generate
  const generateBtn = document.getElementById('generate');
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      params.seed = floor(random(100000));
      document.getElementById('seed').value = params.seed;
      generate();
    });
  }

  // Star type
  const starSelect = document.getElementById('starType');
  if (starSelect) {
    starSelect.addEventListener('change', (e) => {
      params.starType = parseInt(e.target.value);
      redraw();
    });
  }

  // Contact angle
  const angleSlider = document.getElementById('contactAngle');
  const angleValue = document.getElementById('angleValue');
  if (angleSlider) {
    angleSlider.addEventListener('input', (e) => {
      params.contactAngle = parseInt(e.target.value);
      if (angleValue) angleValue.textContent = e.target.value + '°';
      redraw();
    });
  }

  // Grid size
  const gridSlider = document.getElementById('gridSize');
  const gridValue = document.getElementById('gridValue');
  if (gridSlider) {
    gridSlider.addEventListener('input', (e) => {
      params.gridSize = parseInt(e.target.value);
      if (gridValue) gridValue.textContent = e.target.value;
      redraw();
    });
  }

  // Connection probability
  const connSlider = document.getElementById('connectionProb');
  const connValue = document.getElementById('connValue');
  if (connSlider) {
    connSlider.addEventListener('input', (e) => {
      params.connectionProb = parseFloat(e.target.value);
      if (connValue) connValue.textContent = (e.target.value * 100).toFixed(0) + '%';
      redraw();
    });
  }

  // Line weight
  const weightSlider = document.getElementById('lineWeight');
  const weightValue = document.getElementById('weightValue');
  if (weightSlider) {
    weightSlider.addEventListener('input', (e) => {
      params.lineWeight = parseFloat(e.target.value);
      if (weightValue) weightValue.textContent = e.target.value + 'px';
      redraw();
    });
  }

  // Imperfection
  const imperfectSlider = document.getElementById('imperfection');
  const imperfectValue = document.getElementById('imperfectValue');
  if (imperfectSlider) {
    imperfectSlider.addEventListener('input', (e) => {
      params.imperfection = parseFloat(e.target.value);
      if (imperfectValue) imperfectValue.textContent = (e.target.value * 100).toFixed(0) + '%';
      redraw();
    });
  }

  // Colors
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', (e) => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      e.target.classList.add('active');
      params.bgColor = e.target.dataset.bg;
      params.fgColor = e.target.dataset.fg;
      redraw();
    });
  });

  // Export
  document.getElementById('exportPNG')?.addEventListener('click', () => {
    saveCanvas('jali-' + params.seed, 'png');
  });

  document.getElementById('exportSVG')?.addEventListener('click', exportAsSVG);

  // Keyboard
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
  // Regenerate to capture lines
  randomSeed(params.seed);
  noiseSeed(params.seed);
  lines = [];

  push();
  translate(width / 2, height / 2);
  if (params.starType === 6) {
    drawHexagonalPattern();
  } else if (params.starType === 12) {
    drawTwelveFoldPattern();
  } else {
    drawSquarePattern();
  }
  pop();

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${params.bgColor}"/>
  <g stroke="${params.fgColor}" stroke-width="${params.lineWeight}" stroke-linecap="round" stroke-linejoin="round" fill="none" transform="translate(${width/2},${height/2})">
`;

  for (const l of lines) {
    svg += `    <line x1="${l.x1.toFixed(2)}" y1="${l.y1.toFixed(2)}" x2="${l.x2.toFixed(2)}" y2="${l.y2.toFixed(2)}"/>\n`;
  }

  svg += `  </g>
  <rect x="10" y="10" width="${width-20}" height="${height-20}" fill="none" stroke="${params.fgColor}" stroke-width="${params.lineWeight * 1.5}"/>
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
