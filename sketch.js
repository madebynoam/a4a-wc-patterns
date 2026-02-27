// Jali Pattern Generator
// Based on Hankin's Polygons-in-Contact method
// Reference: Craig Kaplan's "Islamic Star Patterns from Polygons in Contact"

// ============================================
// PRESETS
// ============================================

const PRESETS = {
  'classic-star': {
    patternType: 'star8',
    contactAngle: 55,
    gridSize: 4,
    scale: 80,
    strokeWeight: 2,
    bgColor: '#f5f0e6',
    fgColor: '#2c2416',
    compositionMode: 'single',
    fillMode: false,
    lineCap: 'round',
    frameType: 'none',
    depth: false,
    lightEffect: false
  },
  'sidi-saiyyed': {
    patternType: 'rosette',
    contactAngle: 60,
    gridSize: 5,
    scale: 70,
    strokeWeight: 2,
    bgColor: '#f5f0e6',
    fgColor: '#2c2416',
    compositionMode: 'mixed',
    fillMode: false,
    lineCap: 'round',
    frameType: 'arch',
    depth: true,
    lightEffect: false
  },
  'gateway-jali': {
    patternType: 'star8',
    contactAngle: 55,
    gridSize: 5,
    scale: 85,
    strokeWeight: 3,
    bgColor: '#e8e4dc',
    fgColor: '#3d3830',
    compositionMode: 'mixed',
    fillMode: false,
    lineCap: 'round',
    frameType: 'none',
    depth: true,
    lightEffect: false
  },
  'art-deco-mumbai': {
    patternType: 'sunburst',
    contactAngle: 65,
    gridSize: 4,
    scale: 90,
    strokeWeight: 2.5,
    bgColor: '#0a3d62',
    fgColor: '#f8c291',
    compositionMode: 'single',
    fillMode: false,
    lineCap: 'square',
    frameType: 'none',
    depth: false,
    lightEffect: true
  },
  'moroccan-zellige': {
    patternType: 'star6',
    contactAngle: 45,
    gridSize: 5,
    scale: 75,
    strokeWeight: 1.5,
    bgColor: '#f0ebe3',
    fgColor: '#1e3a5f',
    compositionMode: 'single',
    fillMode: false,
    lineCap: 'round',
    frameType: 'none',
    depth: false,
    lightEffect: false
  },
  'gateway-arch': {
    patternType: 'star8',
    contactAngle: 55,
    gridSize: 5,
    scale: 70,
    strokeWeight: 2,
    bgColor: '#d4a574',
    fgColor: '#2c1810',
    compositionMode: 'single',
    fillMode: false,
    lineCap: 'round',
    frameType: 'arch',
    depth: true,
    lightEffect: false
  },
  'minimal': {
    patternType: 'star8',
    contactAngle: 55,
    gridSize: 3,
    scale: 120,
    strokeWeight: 1,
    bgColor: '#ffffff',
    fgColor: '#000000',
    compositionMode: 'single',
    fillMode: false,
    lineCap: 'round',
    frameType: 'none',
    depth: false,
    lightEffect: false
  }
};

let params = {
  patternType: 'star8',
  contactAngle: 55,
  gridSize: 4,
  scale: 80,
  strokeWeight: 2,
  bgColor: '#f5f0e6',
  fgColor: '#2c2416',
  compositionMode: 'single',
  seed: 42,
  fillMode: false,
  lineCap: 'round',
  frameType: 'none',
  // Phase 5: Visual polish
  depth: false,        // Carved stone shadow effect
  lightEffect: false,  // Dappled light through jali
  style: 'classic'     // classic, deco, minimal
};

let canvas;
let svgLines = [];

function setup() {
  const container = document.getElementById('canvas-container');
  const size = Math.min(container.offsetWidth - 80, container.offsetHeight - 80, 700);
  canvas = createCanvas(size, size);
  canvas.parent('canvas-container');

  setupControls();
  noLoop();
  redraw();
}

function draw() {
  svgLines = [];
  background(params.bgColor);

  push();
  translate(width / 2, height / 2);

  stroke(params.fgColor);
  strokeWeight(params.strokeWeight);
  strokeJoin(ROUND);

  if (params.lineCap === 'round') strokeCap(ROUND);
  else if (params.lineCap === 'square') strokeCap(SQUARE);
  else strokeCap(PROJECT);

  if (params.fillMode) {
    fill(params.fgColor);
    noStroke();
  } else {
    noFill();
  }

  // Draw light effect background if enabled
  if (params.lightEffect) {
    drawLightEffect();
  }

  // Draw depth shadow layer if enabled
  if (params.depth && !params.fillMode) {
    drawDepthLayer();
  }

  // Draw pattern
  const patternFunctions = {
    'star8': drawStar8Pattern,
    'star6': drawStar6Pattern,
    'star6Hex': drawStar6HexPattern,
    'rosette': drawRosettePattern,
    'hexLattice': drawHexPattern,
    'circles': drawCirclesPattern,
    'sunburst': drawSunburstPattern,
    'chevron': drawChevronPattern,
    'knotwork': drawKnotworkPattern,
    'octSquare': drawOctSquarePattern
  };

  if (params.compositionMode === 'quilt') {
    drawQuiltComposition();
  } else if (params.compositionMode === 'gradient') {
    drawGradientDeformation();
  } else if (params.compositionMode === 'mixed') {
    drawMixedComposition();
  } else if (params.compositionMode === 'organic') {
    drawOrganicComposition();
  } else {
    patternFunctions[params.patternType]();
  }

  // Draw frame
  if (params.frameType !== 'none') {
    drawFrame();
  }

  pop();
}

// ============================================
// PHASE 5: VISUAL EFFECTS
// ============================================

function drawLightEffect() {
  // Dappled light coming through jali - soft radial gradient
  push();
  noStroke();
  randomSeed(params.seed); // Seed for reproducibility

  // Create soft light rays
  const rays = 12;
  const maxR = width * 0.6;

  for (let i = 0; i < rays; i++) {
    const angle = (TWO_PI / rays) * i + frameCount * 0.001;
    const rayWidth = random(0.1, 0.25);

    // Soft gradient ray
    for (let r = maxR; r > 0; r -= 10) {
      const alpha = map(r, 0, maxR, 40, 5);
      fill(255, 248, 220, alpha);

      const x1 = cos(angle - rayWidth) * r;
      const y1 = sin(angle - rayWidth) * r;
      const x2 = cos(angle + rayWidth) * r;
      const y2 = sin(angle + rayWidth) * r;

      triangle(0, 0, x1, y1, x2, y2);
    }
  }

  // Central glow
  for (let r = 150; r > 0; r -= 5) {
    const alpha = map(r, 0, 150, 50, 0);
    fill(255, 250, 230, alpha);
    ellipse(0, 0, r * 2, r * 2);
  }

  pop();
}

function drawDepthLayer() {
  // Draw shadow offset to create carved stone depth effect
  push();

  // Shadow color (darker version of foreground)
  const shadowOffset = 3;
  const shadowColor = color(red(color(params.fgColor)) * 0.3,
                            green(color(params.fgColor)) * 0.3,
                            blue(color(params.fgColor)) * 0.3, 80);

  translate(shadowOffset, shadowOffset);
  stroke(shadowColor);
  strokeWeight(params.strokeWeight + 1);
  noFill();

  // Redraw pattern as shadow
  const patternFunctions = {
    'star8': drawStar8Pattern,
    'star6': drawStar6Pattern,
    'star6Hex': drawStar6HexPattern,
    'rosette': drawRosettePattern,
    'hexLattice': drawHexPattern,
    'circles': drawCirclesPattern,
    'sunburst': drawSunburstPattern,
    'chevron': drawChevronPattern,
    'knotwork': drawKnotworkPattern,
    'octSquare': drawOctSquarePattern
  };

  if (params.compositionMode === 'quilt') {
    drawQuiltComposition();
  } else if (params.compositionMode === 'gradient') {
    drawGradientDeformation();
  } else if (params.compositionMode === 'mixed') {
    drawMixedComposition();
  } else if (params.compositionMode === 'organic') {
    drawOrganicComposition();
  } else if (patternFunctions[params.patternType]) {
    patternFunctions[params.patternType]();
  }

  pop();
}

// ============================================
// ART DECO PATTERNS (Mumbai Style)
// ============================================

function drawSunburstPattern() {
  // Classic Art Deco sunburst/radiating rays
  const s = params.scale;
  const grid = params.gridSize;
  const halfGrid = (grid - 1) / 2;

  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      const cx = (i - halfGrid) * s;
      const cy = (j - halfGrid) * s;
      drawSunburstTile(cx, cy, s * 0.45);
    }
  }
}

function drawSunburstTile(cx, cy, r) {
  const contactAngle = radians(params.contactAngle);

  // Contact angle affects number of rays and proportions
  // Low angle (35°) = fewer, wider rays; High angle (75°) = more, tighter rays
  const rayCount = floor(map(contactAngle, radians(35), radians(75), 8, 24));
  const innerR = r * map(contactAngle, radians(35), radians(75), 0.2, 0.1);
  const midR = r * map(contactAngle, radians(35), radians(75), 0.4, 0.6);

  // Tip accent angle varies with contact angle
  const tipAngle = map(contactAngle, radians(35), radians(75), 0.4, 0.1);
  const accentLen = r * map(contactAngle, radians(35), radians(75), 0.3, 0.15);

  // Alternating long and short rays (Art Deco style)
  for (let i = 0; i < rayCount; i++) {
    const angle = (TWO_PI / rayCount) * i - HALF_PI;
    const isLong = i % 2 === 0;
    const rayLen = isLong ? r : midR;

    // Main ray
    drawLine(
      cx + cos(angle) * innerR,
      cy + sin(angle) * innerR,
      cx + cos(angle) * rayLen,
      cy + sin(angle) * rayLen
    );

    // Side accents on long rays (chevron tips)
    if (isLong) {
      const tipX = cx + cos(angle) * rayLen;
      const tipY = cy + sin(angle) * rayLen;

      drawLine(
        tipX, tipY,
        tipX + cos(angle + PI - tipAngle) * accentLen,
        tipY + sin(angle + PI - tipAngle) * accentLen
      );
      drawLine(
        tipX, tipY,
        tipX + cos(angle + PI + tipAngle) * accentLen,
        tipY + sin(angle + PI + tipAngle) * accentLen
      );
    }
  }

  // Concentric circles (Deco motif) - number varies with angle
  drawCircle(cx, cy, innerR);
  drawCircle(cx, cy, innerR * 2);
  if (contactAngle > radians(55)) {
    drawCircle(cx, cy, innerR * 3);
  }

  // Outer polygon frame - sides vary with contact angle
  const frameSides = floor(map(contactAngle, radians(35), radians(75), 6, 12));
  const framePoints = [];
  for (let i = 0; i < frameSides; i++) {
    const angle = (TWO_PI / frameSides) * i - HALF_PI + PI/frameSides;
    framePoints.push({
      x: cx + cos(angle) * r * 0.9,
      y: cy + sin(angle) * r * 0.9
    });
  }
  drawPoly(framePoints);
}

function drawChevronPattern() {
  // Art Deco chevron/zigzag pattern
  const s = params.scale;
  const grid = params.gridSize;
  const halfGrid = (grid - 1) / 2;
  const contactAngle = radians(params.contactAngle);

  // Chevron amplitude based on contact angle
  const amplitude = s * 0.3 * map(contactAngle, radians(35), radians(75), 0.5, 1.2);

  for (let j = 0; j < grid; j++) {
    const cy = (j - halfGrid) * s * 0.8;

    // Draw chevron row
    const points = [];
    for (let i = 0; i <= grid * 2; i++) {
      const x = (i - grid) * s * 0.5;
      const y = cy + (i % 2 === 0 ? -amplitude : amplitude);
      points.push({ x, y });
    }

    // Draw the zigzag line
    for (let i = 0; i < points.length - 1; i++) {
      drawLine(points[i].x, points[i].y, points[i+1].x, points[i+1].y);
    }

    // Add horizontal accent lines (Deco detail)
    if (j % 2 === 0) {
      drawLine(-width/2, cy, width/2, cy);
    }
  }

  // Vertical dividers
  for (let i = 0; i < grid; i++) {
    const cx = (i - halfGrid + 0.5) * s;
    drawLine(cx, -height/2, cx, height/2);
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function drawLine(x1, y1, x2, y2) {
  line(x1, y1, x2, y2);
  svgLines.push({ x1, y1, x2, y2 });
}

function drawPoly(points, closed = true) {
  beginShape();
  for (const p of points) vertex(p.x, p.y);
  if (closed) endShape(CLOSE);
  else endShape();
  svgLines.push({ type: 'polygon', points: [...points], closed });
}

function drawCircle(cx, cy, r) {
  ellipse(cx, cy, r * 2, r * 2);
  svgLines.push({ type: 'ellipse', cx, cy, rx: r, ry: r });
}

// ============================================
// TRUE HANKIN CONSTRUCTION
// ============================================

// Core algorithm: From each edge midpoint, draw rays at ±contactAngle
// from the perpendicular. Where adjacent rays meet = star points.

function hankinStar(cx, cy, r, sides, contactAngle) {
  // Clamp contact angle to valid range (too small = parallel rays, too large = inverted)
  contactAngle = constrain(contactAngle, radians(35), radians(75));

  // Get polygon vertices
  const verts = [];
  for (let i = 0; i < sides; i++) {
    const a = (TWO_PI / sides) * i - HALF_PI;
    verts.push({ x: cx + cos(a) * r, y: cy + sin(a) * r });
  }

  // Get edge midpoints
  const mids = [];
  for (let i = 0; i < sides; i++) {
    const v1 = verts[i];
    const v2 = verts[(i + 1) % sides];
    const mx = (v1.x + v2.x) / 2;
    const my = (v1.y + v2.y) / 2;
    // Edge direction
    const edgeAngle = atan2(v2.y - v1.y, v2.x - v1.x);
    // Perpendicular pointing inward
    const perpAngle = edgeAngle - HALF_PI;
    mids.push({ x: mx, y: my, perp: perpAngle });
  }

  // Maximum allowed distance for intersection (prevents spikes at low angles)
  const maxDist = r * 2;

  // For each edge, compute the two rays and find intersections
  const lines = [];

  for (let i = 0; i < sides; i++) {
    const m = mids[i];
    const mNext = mids[(i + 1) % sides];

    // Ray from current midpoint going CW (perp + contactAngle)
    const ray1Angle = m.perp + contactAngle;
    // Ray from next midpoint going CCW (perp - contactAngle)
    const ray2Angle = mNext.perp - contactAngle;

    // Find intersection
    const intersection = rayIntersection(
      m.x, m.y, ray1Angle,
      mNext.x, mNext.y, ray2Angle
    );

    if (intersection) {
      // Check if intersection is within reasonable distance
      const d1 = dist(m.x, m.y, intersection.x, intersection.y);
      const d2 = dist(mNext.x, mNext.y, intersection.x, intersection.y);

      if (d1 < maxDist && d2 < maxDist) {
        lines.push({ x1: m.x, y1: m.y, x2: intersection.x, y2: intersection.y });
        lines.push({ x1: intersection.x, y1: intersection.y, x2: mNext.x, y2: mNext.y });
      } else {
        // Fallback: draw shorter rays toward center
        const shortLen = r * 0.4;
        lines.push({
          x1: m.x, y1: m.y,
          x2: m.x + cos(ray1Angle) * shortLen,
          y2: m.y + sin(ray1Angle) * shortLen
        });
        lines.push({
          x1: mNext.x, y1: mNext.y,
          x2: mNext.x + cos(ray2Angle) * shortLen,
          y2: mNext.y + sin(ray2Angle) * shortLen
        });
      }
    }
  }

  // Draw all lines
  for (const l of lines) {
    drawLine(l.x1, l.y1, l.x2, l.y2);
  }
}

function rayIntersection(x1, y1, angle1, x2, y2, angle2) {
  // Find intersection of two rays
  const dx1 = cos(angle1);
  const dy1 = sin(angle1);
  const dx2 = cos(angle2);
  const dy2 = sin(angle2);

  const denom = dx1 * dy2 - dy1 * dx2;
  if (abs(denom) < 0.0001) return null;

  const t = ((x2 - x1) * dy2 - (y2 - y1) * dx2) / denom;

  if (t > 0) {
    return {
      x: x1 + dx1 * t,
      y: y1 + dy1 * t
    };
  }
  return null;
}

// ============================================
// 8-POINT STAR (4.8.8 tiling - square/octagon)
// ============================================

function drawStar8Pattern() {
  const s = params.scale;
  const grid = params.gridSize;
  const contactAngle = radians(params.contactAngle);
  const halfGrid = (grid - 1) / 2;

  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      const cx = (i - halfGrid) * s;
      const cy = (j - halfGrid) * s;
      hankinStar(cx, cy, s * 0.45, 8, contactAngle);
    }
  }
}

// ============================================
// 6-POINT STAR (Hexagonal tiling)
// ============================================

function drawStar6Pattern() {
  const s = params.scale;
  const grid = params.gridSize;
  const contactAngle = radians(params.contactAngle);
  const halfGrid = (grid - 1) / 2;

  // Symmetrical square grid layout
  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      const cx = (i - halfGrid) * s;
      const cy = (j - halfGrid) * s;
      hankinStar(cx, cy, s * 0.4, 6, contactAngle);
    }
  }
}

function drawStar6HexPattern() {
  const s = params.scale;
  const grid = params.gridSize;
  const contactAngle = radians(params.contactAngle);

  // Hexagonal grid spacing (traditional Islamic layout)
  const hSpace = s;
  const vSpace = s * sqrt(3) / 2;
  const halfGrid = (grid - 1) / 2;

  for (let j = 0; j < grid; j++) {
    for (let i = 0; i < grid; i++) {
      const offset = (j % 2) * (hSpace / 2);
      const cx = (i - halfGrid) * hSpace + offset;
      const cy = (j - halfGrid) * vSpace;
      hankinStar(cx, cy, s * 0.35, 6, contactAngle);
    }
  }
}

// ============================================
// ROSETTE (12-fold or multi-layer)
// ============================================

function drawRosettePattern() {
  const s = params.scale;
  const grid = params.gridSize;
  const contactAngle = radians(params.contactAngle);
  const halfGrid = (grid - 1) / 2;

  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      const cx = (i - halfGrid) * s;
      const cy = (j - halfGrid) * s;

      // Draw multiple concentric stars for rosette effect
      hankinStar(cx, cy, s * 0.45, 12, contactAngle);
      hankinStar(cx, cy, s * 0.28, 12, contactAngle * 0.7);
    }
  }
}

// ============================================
// HEXAGONAL LATTICE
// ============================================

function drawHexPattern() {
  const s = params.scale;
  const grid = params.gridSize + 1;
  const contactAngle = radians(params.contactAngle);

  const hSpace = s * 0.75;
  const vSpace = s * sqrt(3) / 2 * 0.75;
  const halfGrid = grid / 2;

  for (let j = 0; j < grid; j++) {
    for (let i = 0; i < grid; i++) {
      const offset = (j % 2) * (hSpace / 2);
      const cx = (i - halfGrid) * hSpace + offset;
      const cy = (j - halfGrid) * vSpace;

      // Hexagon outline
      const hexR = s * 0.35;
      const hexVerts = [];
      for (let k = 0; k < 6; k++) {
        const a = (TWO_PI / 6) * k;
        hexVerts.push({ x: cx + cos(a) * hexR, y: cy + sin(a) * hexR });
      }
      drawPoly(hexVerts);

      // Inner star
      hankinStar(cx, cy, hexR * 0.7, 6, contactAngle * 0.8);
    }
  }
}

// ============================================
// INTERLOCKING CIRCLES
// ============================================

function drawCirclesPattern() {
  const s = params.scale;
  const grid = params.gridSize;
  const contactAngle = radians(params.contactAngle);
  const halfGrid = (grid - 1) / 2;

  const r = s * 0.4;
  const overlap = r * map(contactAngle, radians(15), radians(75), 0.3, 0.7);

  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      const cx = (i - halfGrid) * s;
      const cy = (j - halfGrid) * s;

      // Main circle
      drawCircle(cx, cy, r);

      // Smaller decorative circles at cardinal points
      const smallR = r * 0.3;
      for (let k = 0; k < 4; k++) {
        const a = (TWO_PI / 4) * k;
        const px = cx + cos(a) * (r - smallR * 0.5);
        const py = cy + sin(a) * (r - smallR * 0.5);
        drawCircle(px, py, smallR);
      }

      // Radial lines
      for (let k = 0; k < 8; k++) {
        const a = (TWO_PI / 8) * k;
        const innerR = r * 0.2;
        drawLine(
          cx + cos(a) * innerR,
          cy + sin(a) * innerR,
          cx + cos(a) * r * 0.7,
          cy + sin(a) * r * 0.7
        );
      }
    }
  }
}

// ============================================
// KNOTWORK PATTERN (Celtic/Islamic Interlace)
// ============================================

function drawKnotworkPattern() {
  const s = params.scale;
  const grid = params.gridSize;
  const halfGrid = (grid - 1) / 2;

  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      const cx = (i - halfGrid) * s;
      const cy = (j - halfGrid) * s;
      drawKnotworkTile(cx, cy, s * 0.45);
    }
  }
}

function drawKnotworkTile(cx, cy, size) {
  const contactAngle = radians(params.contactAngle);

  // Knot band width varies with contact angle
  const bandWidth = size * map(contactAngle, radians(35), radians(75), 0.15, 0.08);
  const r = size * 0.9;

  // Draw interlocking bands forming a knot
  // Four curved bands that weave over/under

  // Band 1: Top-left to bottom-right curve
  const curve1Points = [];
  for (let t = 0; t <= 1; t += 0.05) {
    const angle = -PI * 0.75 + t * PI * 0.5;
    curve1Points.push({
      x: cx + cos(angle) * r,
      y: cy + sin(angle) * r
    });
  }

  // Band 2: Top-right to bottom-left curve
  const curve2Points = [];
  for (let t = 0; t <= 1; t += 0.05) {
    const angle = -PI * 0.25 + t * PI * 0.5;
    curve2Points.push({
      x: cx + cos(angle) * r,
      y: cy + sin(angle) * r
    });
  }

  // Band 3: Bottom-left to top-right
  const curve3Points = [];
  for (let t = 0; t <= 1; t += 0.05) {
    const angle = PI * 0.75 - t * PI * 0.5;
    curve3Points.push({
      x: cx + cos(angle) * r,
      y: cy + sin(angle) * r
    });
  }

  // Band 4: Bottom-right to top-left
  const curve4Points = [];
  for (let t = 0; t <= 1; t += 0.05) {
    const angle = PI * 0.25 - t * PI * 0.5;
    curve4Points.push({
      x: cx + cos(angle) * r,
      y: cy + sin(angle) * r
    });
  }

  // Draw the curves (simplified knot visual)
  drawPoly(curve1Points, false);
  drawPoly(curve2Points, false);
  drawPoly(curve3Points, false);
  drawPoly(curve4Points, false);

  // Central knot motif
  const innerR = size * 0.4;
  const knotSides = floor(map(contactAngle, radians(35), radians(75), 4, 8));
  const knotVerts = [];
  for (let k = 0; k < knotSides; k++) {
    const a = (TWO_PI / knotSides) * k - HALF_PI;
    knotVerts.push({ x: cx + cos(a) * innerR, y: cy + sin(a) * innerR });
  }
  drawPoly(knotVerts);

  // Diagonal crossing lines to suggest weaving
  const crossR = size * 0.6;
  drawLine(cx - crossR, cy - crossR, cx + crossR, cy + crossR);
  drawLine(cx + crossR, cy - crossR, cx - crossR, cy + crossR);
}

// ============================================
// OCTAGON-SQUARE TILING
// ============================================

function drawOctSquarePattern() {
  const s = params.scale;
  const grid = params.gridSize;
  const halfGrid = (grid - 1) / 2;

  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      const cx = (i - halfGrid) * s;
      const cy = (j - halfGrid) * s;
      drawOctSquareTile(cx, cy, s * 0.45);
    }
  }
}

function drawOctSquareTile(cx, cy, size) {
  const contactAngle = radians(params.contactAngle);

  // Octagon proportions based on contact angle
  const octR = size * map(contactAngle, radians(35), radians(75), 0.85, 1.0);
  const squareR = size * map(contactAngle, radians(35), radians(75), 0.3, 0.2);

  // Draw octagon
  const octVerts = [];
  for (let k = 0; k < 8; k++) {
    const a = (TWO_PI / 8) * k - PI / 8;
    octVerts.push({ x: cx + cos(a) * octR, y: cy + sin(a) * octR });
  }
  drawPoly(octVerts);

  // Draw inner square (rotated 45 degrees)
  const sqVerts = [];
  for (let k = 0; k < 4; k++) {
    const a = (TWO_PI / 4) * k + PI / 4;
    sqVerts.push({ x: cx + cos(a) * squareR, y: cy + sin(a) * squareR });
  }
  drawPoly(sqVerts);

  // Connect octagon to square with lines (decorative detail)
  for (let k = 0; k < 4; k++) {
    const outerA = (TWO_PI / 8) * (k * 2 + 1) - PI / 8;
    const innerA = (TWO_PI / 4) * k + PI / 4;
    drawLine(
      cx + cos(outerA) * octR * 0.7,
      cy + sin(outerA) * octR * 0.7,
      cx + cos(innerA) * squareR,
      cy + sin(innerA) * squareR
    );
  }

  // Corner accent lines
  for (let k = 0; k < 8; k++) {
    const a = (TWO_PI / 8) * k - PI / 8;
    const nextA = (TWO_PI / 8) * ((k + 1) % 8) - PI / 8;
    const midA = (a + nextA) / 2;
    drawLine(
      cx + cos(midA) * octR * 0.5,
      cy + sin(midA) * octR * 0.5,
      cx + cos(midA) * octR * 0.8,
      cy + sin(midA) * octR * 0.8
    );
  }
}

// ============================================
// COMPOSITION MODES
// ============================================

function drawQuiltComposition() {
  const s = params.scale;
  const grid = params.gridSize;
  const halfGrid = (grid - 1) / 2;
  const patterns = [6, 8, 12]; // Different star types

  randomSeed(params.seed);

  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      const cx = (i - halfGrid) * s;
      const cy = (j - halfGrid) * s;

      // Cell border
      const cellSize = s * 0.9;
      const half = cellSize / 2;
      drawLine(cx - half, cy - half, cx + half, cy - half);
      drawLine(cx + half, cy - half, cx + half, cy + half);
      drawLine(cx + half, cy + half, cx - half, cy + half);
      drawLine(cx - half, cy + half, cx - half, cy - half);

      // Random star type and angle variation
      const sides = patterns[floor(random(patterns.length))];
      const angleVar = random(-10, 10);
      const contactAngle = radians(params.contactAngle + angleVar);

      hankinStar(cx, cy, cellSize * 0.4, sides, contactAngle);
    }
  }
}

function drawGradientDeformation() {
  const s = params.scale;
  const grid = params.gridSize;
  const halfGrid = (grid - 1) / 2;

  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      const cx = (i - halfGrid) * s;
      const cy = (j - halfGrid) * s;

      // Vary contact angle diagonally (stay in valid range)
      const t = (i + j) / ((grid - 1) * 2);
      const contactAngle = radians(lerp(40, 70, t));

      hankinStar(cx, cy, s * 0.45, 8, contactAngle);
    }
  }
}

function drawMixedComposition() {
  const s = params.scale;
  const grid = params.gridSize;
  const halfGrid = (grid - 1) / 2;

  const patternTypes = ['cross', 'diamond', 'star4', 'star6', 'star8', 'flower4', 'octSquare'];

  randomSeed(params.seed);

  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      const cx = (i - halfGrid) * s;
      const cy = (j - halfGrid) * s;

      const patternType = patternTypes[floor(random(patternTypes.length))];
      const rotation = floor(random(4)) * HALF_PI;
      const contactAngle = radians(params.contactAngle + random(-5, 5));
      const tileSize = s * 0.42;

      // Cell border
      push();
      stroke(params.fgColor);
      strokeWeight(params.strokeWeight * 1.2);
      const half = s * 0.48;
      drawLine(cx - half, cy - half, cx + half, cy - half);
      drawLine(cx + half, cy - half, cx + half, cy + half);
      drawLine(cx + half, cy + half, cx - half, cy + half);
      drawLine(cx - half, cy + half, cx - half, cy - half);
      pop();

      stroke(params.fgColor);
      strokeWeight(params.strokeWeight);

      push();
      translate(cx, cy);
      rotate(rotation);
      drawJaliTile(0, 0, tileSize, patternType, contactAngle);
      pop();
    }
  }
}

function drawOrganicComposition() {
  const s = params.scale;
  const grid = params.gridSize;
  const halfGrid = (grid - 1) / 2;

  randomSeed(params.seed);

  // First pass: draw flowing connecting lines (like vines or water)
  stroke(params.fgColor);
  strokeWeight(params.strokeWeight * 0.7);

  for (let i = 0; i < grid * 2; i++) {
    const startX = random(-width/2, width/2);
    const startY = random(-height/2, height/2);
    let x = startX, y = startY;

    beginShape();
    noFill();
    for (let step = 0; step < 8; step++) {
      curveVertex(x, y);
      x += random(-s * 0.5, s * 0.5);
      y += random(-s * 0.3, s * 0.5);
    }
    endShape();
  }

  // Second pass: draw varied patterns at grid points
  const patternTypes = [
    'star8', 'star6', 'star4', 'cross', 'diamond',
    'flower4', 'circle', 'empty', 'dots'
  ];

  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      const cx = (i - halfGrid) * s + random(-s * 0.1, s * 0.1);
      const cy = (j - halfGrid) * s + random(-s * 0.1, s * 0.1);

      const patternType = patternTypes[floor(random(patternTypes.length))];

      // Dramatic size variation
      const sizeMultiplier = random(0.6, 1.4);
      const tileSize = s * 0.4 * sizeMultiplier;

      // More rotation variety
      const rotation = random(TWO_PI);

      // Variable line weight per cell
      strokeWeight(params.strokeWeight * random(0.6, 1.5));
      stroke(params.fgColor);

      push();
      translate(cx, cy);
      rotate(rotation);

      const contactAngle = radians(params.contactAngle + random(-15, 15));

      switch (patternType) {
        case 'empty':
          // Just a subtle circle outline
          noFill();
          drawCircle(0, 0, tileSize * 0.3);
          break;
        case 'circle':
          drawCircle(0, 0, tileSize * 0.8);
          drawCircle(0, 0, tileSize * 0.4);
          break;
        case 'dots':
          // Scattered dots
          for (let d = 0; d < 5; d++) {
            const dx = random(-tileSize * 0.5, tileSize * 0.5);
            const dy = random(-tileSize * 0.5, tileSize * 0.5);
            drawCircle(dx, dy, random(2, 8));
          }
          break;
        default:
          drawJaliTile(0, 0, tileSize, patternType, contactAngle);
      }

      pop();

      // Occasionally add connecting lines to neighbors
      if (random() > 0.7 && i < grid - 1) {
        strokeWeight(params.strokeWeight * 0.5);
        const nextCx = ((i + 1) - halfGrid) * s;
        drawLine(cx + tileSize * 0.5, cy, nextCx - tileSize * 0.5, cy + random(-10, 10));
      }
    }
  }

  // Third pass: add some accent marks and imperfections
  strokeWeight(params.strokeWeight * 0.4);
  for (let i = 0; i < grid * 3; i++) {
    const x = random(-width/2 + 50, width/2 - 50);
    const y = random(-height/2 + 50, height/2 - 50);
    const len = random(5, 20);
    const angle = random(TWO_PI);
    drawLine(x, y, x + cos(angle) * len, y + sin(angle) * len);
  }
}

// Simple jali tile patterns (like carved stone screens)
function drawJaliTile(cx, cy, size, patternType, contactAngle) {
  switch (patternType) {
    case 'cross':
      // Simple cross shape - very common in jalis
      const cw = size * 0.35;
      const ch = size * 0.9;
      drawLine(cx - cw, cy - ch, cx - cw, cy + ch);
      drawLine(cx + cw, cy - ch, cx + cw, cy + ch);
      drawLine(cx - ch, cy - cw, cx + ch, cy - cw);
      drawLine(cx - ch, cy + cw, cx + ch, cy + cw);
      // Connect corners
      drawLine(cx - cw, cy - ch, cx - ch, cy - cw);
      drawLine(cx + cw, cy - ch, cx + ch, cy - cw);
      drawLine(cx - cw, cy + ch, cx - ch, cy + cw);
      drawLine(cx + cw, cy + ch, cx + ch, cy + cw);
      break;

    case 'diamond':
      // Diamond/rhombus shape
      const dr = size * 0.85;
      const innerDr = size * 0.4;
      // Outer diamond
      drawLine(cx, cy - dr, cx + dr, cy);
      drawLine(cx + dr, cy, cx, cy + dr);
      drawLine(cx, cy + dr, cx - dr, cy);
      drawLine(cx - dr, cy, cx, cy - dr);
      // Inner diamond
      drawLine(cx, cy - innerDr, cx + innerDr, cy);
      drawLine(cx + innerDr, cy, cx, cy + innerDr);
      drawLine(cx, cy + innerDr, cx - innerDr, cy);
      drawLine(cx - innerDr, cy, cx, cy - innerDr);
      break;

    case 'star4':
      // Simple 4-point star
      hankinStar(cx, cy, size, 4, contactAngle);
      break;

    case 'flower4':
      // Simple 4-petal flower shape
      const fr = size * 0.7;
      const petalR = size * 0.5;
      for (let k = 0; k < 4; k++) {
        const a = (TWO_PI / 4) * k;
        const px = cx + cos(a) * fr * 0.4;
        const py = cy + sin(a) * fr * 0.4;
        drawCircle(px, py, petalR);
      }
      // Center
      drawCircle(cx, cy, size * 0.25);
      break;

    case 'star6':
      hankinStar(cx, cy, size * 0.9, 6, contactAngle);
      break;

    case 'star8':
      hankinStar(cx, cy, size, 8, contactAngle);
      break;

    case 'octSquare':
      drawOctSquareTile(cx, cy, size);
      break;

    default:
      hankinStar(cx, cy, size, 8, contactAngle);
  }
}

function drawTile(cx, cy, size, patternType, contactAngle) {
  switch (patternType) {
    case 'star8':
      hankinStar(cx, cy, size, 8, contactAngle);
      break;
    case 'star6':
    case 'star6Hex':
      hankinStar(cx, cy, size * 0.9, 6, contactAngle);
      break;
    case 'rosette':
      hankinStar(cx, cy, size, 12, contactAngle);
      hankinStar(cx, cy, size * 0.6, 12, contactAngle * 0.7);
      break;
    case 'hexLattice':
      // Hexagon outline with inner star
      const hexR = size * 0.8;
      const hexVerts = [];
      for (let k = 0; k < 6; k++) {
        const a = (TWO_PI / 6) * k;
        hexVerts.push({ x: cx + cos(a) * hexR, y: cy + sin(a) * hexR });
      }
      drawPoly(hexVerts);
      hankinStar(cx, cy, hexR * 0.6, 6, contactAngle * 0.8);
      break;
    case 'circles':
      // Main circle with decorative elements
      const r = size * 0.85;
      drawCircle(cx, cy, r);
      const smallR = r * 0.3;
      for (let k = 0; k < 4; k++) {
        const a = (TWO_PI / 4) * k;
        drawCircle(cx + cos(a) * (r - smallR * 0.5), cy + sin(a) * (r - smallR * 0.5), smallR);
      }
      for (let k = 0; k < 8; k++) {
        const a = (TWO_PI / 8) * k;
        drawLine(cx + cos(a) * r * 0.2, cy + sin(a) * r * 0.2, cx + cos(a) * r * 0.7, cy + sin(a) * r * 0.7);
      }
      break;
    case 'sunburst':
      drawSunburstTile(cx, cy, size * 0.9);
      break;
    case 'knotwork':
      drawKnotworkTile(cx, cy, size);
      break;
    case 'octSquare':
      drawOctSquareTile(cx, cy, size);
      break;
    default:
      hankinStar(cx, cy, size, 8, contactAngle);
  }
}

// ============================================
// FRAME
// ============================================

function drawFrame() {
  const margin = 30;
  const fw = width / 2 - margin;
  const fh = height / 2 - margin;

  // Use large rectangles to mask outside - ensure full coverage
  fill(params.bgColor);
  noStroke();

  const bigNum = width + height; // Guaranteed to cover everything

  if (params.frameType === 'square') {
    // Top
    rect(-bigNum, -bigNum, bigNum * 2, bigNum - fh);
    // Bottom
    rect(-bigNum, fh, bigNum * 2, bigNum);
    // Left
    rect(-bigNum, -fh, bigNum - fw, fh * 2);
    // Right
    rect(fw, -fh, bigNum, fh * 2);
  } else if (params.frameType === 'circle') {
    const r = min(fw, fh) * 0.95;
    for (let y = -height / 2; y < height / 2; y += 3) {
      for (let x = -width / 2; x < width / 2; x += 3) {
        if (dist(x, y, 0, 0) > r) {
          rect(x, y, 4, 4);
        }
      }
    }
  } else if (params.frameType === 'arch' || params.frameType === 'roundArch') {
    const archH = fh * 0.4;
    const isPointed = params.frameType === 'arch';

    for (let y = -height / 2; y < height / 2; y += 3) {
      for (let x = -width / 2; x < width / 2; x += 3) {
        let inside = false;

        if (x >= -fw && x <= fw && y <= fh) {
          if (y >= -fh + archH) {
            inside = true;
          } else {
            if (isPointed) {
              const archRadius = fw * 1.2;
              const leftCenter = { x: -fw + archRadius * 0.3, y: -fh + archH };
              const rightCenter = { x: fw - archRadius * 0.3, y: -fh + archH };
              if (x <= 0) {
                inside = dist(x, y, leftCenter.x, leftCenter.y) < archRadius;
              } else {
                inside = dist(x, y, rightCenter.x, rightCenter.y) < archRadius;
              }
            } else {
              inside = dist(x, y, 0, -fh + archH) < min(fw, archH);
            }
          }
        }

        if (!inside) {
          rect(x, y, 4, 4);
        }
      }
    }
  }

  // Frame outline
  stroke(params.fgColor);
  strokeWeight(params.strokeWeight * 2);
  noFill();

  if (params.frameType === 'square') {
    rect(-fw, -fh, fw * 2, fh * 2);
  } else if (params.frameType === 'circle') {
    ellipse(0, 0, min(fw, fh) * 1.9, min(fw, fh) * 1.9);
  } else if (params.frameType === 'arch' || params.frameType === 'roundArch') {
    const archH = fh * 0.4;
    const isPointed = params.frameType === 'arch';

    // Draw arch outline
    beginShape();
    vertex(-fw, fh);
    vertex(-fw, -fh + archH);

    if (isPointed) {
      // Pointed arch with bezier curves
      const cp = archH * 1.5;
      bezierVertex(-fw, -fh + archH - cp, -fw * 0.3, -fh - archH * 0.5, 0, -fh - archH * 0.3);
      bezierVertex(fw * 0.3, -fh - archH * 0.5, fw, -fh + archH - cp, fw, -fh + archH);
    } else {
      // Round arch
      for (let i = 0; i <= 30; i++) {
        const a = PI + (PI * i / 30);
        vertex(cos(a) * fw, -fh + archH + sin(a) * archH);
      }
    }

    vertex(fw, -fh + archH);
    vertex(fw, fh);
    endShape(CLOSE);
  }
}

// ============================================
// PRESETS APPLICATION
// ============================================

function applyPreset(name) {
  const preset = PRESETS[name];
  if (!preset) return;

  // Apply all preset values to params
  Object.assign(params, preset);
  // Use preset seed if defined, otherwise keep current seed
  if (preset.seed === undefined) {
    params.seed = 42; // Default deterministic seed for presets
  }

  // Update all UI controls to match
  document.getElementById('patternType').value = params.patternType;
  document.getElementById('contactAngle').value = params.contactAngle;
  document.getElementById('contactAngleValue').textContent = params.contactAngle;
  document.getElementById('gridSize').value = params.gridSize;
  document.getElementById('gridSizeValue').textContent = params.gridSize;
  document.getElementById('gridSizeValue2').textContent = params.gridSize;
  document.getElementById('scale').value = params.scale;
  document.getElementById('scaleValue').textContent = params.scale;
  document.getElementById('strokeWeight').value = params.strokeWeight;
  document.getElementById('strokeWeightValue').textContent = params.strokeWeight;
  document.getElementById('compositionMode').value = params.compositionMode;
  document.getElementById('lineCap').value = params.lineCap;
  document.getElementById('frameType').value = params.frameType;

  // Update fill/stroke toggle
  document.getElementById('toggleFill').classList.toggle('active', params.fillMode);
  document.getElementById('toggleStroke').classList.toggle('active', !params.fillMode);

  // Update visual effects toggles
  document.getElementById('toggleDepth').classList.toggle('active', params.depth);
  document.getElementById('toggleLight').classList.toggle('active', params.lightEffect);

  // Update color swatch selection
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    const isMatch = swatch.dataset.bg === params.bgColor && swatch.dataset.fg === params.fgColor;
    swatch.classList.toggle('active', isMatch);
  });

  redraw();
}

// ============================================
// CONTROLS
// ============================================

function setupControls() {
  // Preset selector
  const presetSelect = document.getElementById('preset');
  if (presetSelect) {
    presetSelect.addEventListener('change', (e) => {
      if (e.target.value) {
        applyPreset(e.target.value);
      }
    });
  }

  document.getElementById('patternType').addEventListener('change', (e) => {
    params.patternType = e.target.value;
    redraw();
  });

  const contactAngle = document.getElementById('contactAngle');
  const contactAngleValue = document.getElementById('contactAngleValue');
  contactAngle.addEventListener('input', (e) => {
    params.contactAngle = parseInt(e.target.value);
    contactAngleValue.textContent = e.target.value;
    redraw();
  });

  const gridSize = document.getElementById('gridSize');
  const gridSizeValue = document.getElementById('gridSizeValue');
  const gridSizeValue2 = document.getElementById('gridSizeValue2');
  gridSize.addEventListener('input', (e) => {
    params.gridSize = parseInt(e.target.value);
    gridSizeValue.textContent = e.target.value;
    gridSizeValue2.textContent = e.target.value;
    redraw();
  });

  const scale = document.getElementById('scale');
  const scaleValue = document.getElementById('scaleValue');
  scale.addEventListener('input', (e) => {
    params.scale = parseInt(e.target.value);
    scaleValue.textContent = e.target.value;
    redraw();
  });

  const strokeWeightSlider = document.getElementById('strokeWeight');
  const strokeWeightValue = document.getElementById('strokeWeightValue');
  strokeWeightSlider.addEventListener('input', (e) => {
    params.strokeWeight = parseFloat(e.target.value);
    strokeWeightValue.textContent = e.target.value;
    redraw();
  });

  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', (e) => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      e.target.classList.add('active');
      params.bgColor = e.target.dataset.bg;
      params.fgColor = e.target.dataset.fg;
      redraw();
    });
  });

  document.getElementById('compositionMode').addEventListener('change', (e) => {
    params.compositionMode = e.target.value;
    redraw();
  });

  document.getElementById('toggleFill').addEventListener('click', () => {
    params.fillMode = true;
    document.getElementById('toggleFill').classList.add('active');
    document.getElementById('toggleStroke').classList.remove('active');
    redraw();
  });

  document.getElementById('toggleStroke').addEventListener('click', () => {
    params.fillMode = false;
    document.getElementById('toggleStroke').classList.add('active');
    document.getElementById('toggleFill').classList.remove('active');
    redraw();
  });

  document.getElementById('lineCap').addEventListener('change', (e) => {
    params.lineCap = e.target.value;
    redraw();
  });

  document.getElementById('frameType').addEventListener('change', (e) => {
    params.frameType = e.target.value;
    redraw();
  });

  // Visual effects toggles
  document.getElementById('toggleDepth').addEventListener('click', () => {
    params.depth = !params.depth;
    document.getElementById('toggleDepth').classList.toggle('active', params.depth);
    redraw();
  });

  document.getElementById('toggleLight').addEventListener('click', () => {
    params.lightEffect = !params.lightEffect;
    document.getElementById('toggleLight').classList.toggle('active', params.lightEffect);
    redraw();
  });

  document.getElementById('randomize').addEventListener('click', () => {
    params.contactAngle = floor(random(25, 70));
    params.gridSize = floor(random(3, 7));
    params.scale = floor(random(60, 120));
    params.seed = floor(random(10000));

    const patterns = ['star8', 'star6', 'star6Hex', 'rosette', 'hexLattice', 'circles', 'sunburst', 'chevron', 'knotwork', 'octSquare'];
    params.patternType = patterns[floor(random(patterns.length))];

    document.getElementById('patternType').value = params.patternType;
    document.getElementById('contactAngle').value = params.contactAngle;
    document.getElementById('contactAngleValue').textContent = params.contactAngle;
    document.getElementById('gridSize').value = params.gridSize;
    document.getElementById('gridSizeValue').textContent = params.gridSize;
    document.getElementById('gridSizeValue2').textContent = params.gridSize;
    document.getElementById('scale').value = params.scale;
    document.getElementById('scaleValue').textContent = params.scale;

    redraw();
  });

  document.getElementById('exportPNG').addEventListener('click', () => {
    saveCanvas('jali-pattern', 'png');
  });

  document.getElementById('exportSVG').addEventListener('click', exportSVG);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    switch (e.key.toLowerCase()) {
      case 'r':
        document.getElementById('randomize').click();
        break;
      case 's':
        exportSVG();
        break;
      case 'p':
        saveCanvas('jali-pattern', 'png');
        break;
      case 'f':
        params.fillMode = !params.fillMode;
        document.getElementById('toggleFill').classList.toggle('active', params.fillMode);
        document.getElementById('toggleStroke').classList.toggle('active', !params.fillMode);
        redraw();
        break;
      case '1': params.patternType = 'star8'; document.getElementById('patternType').value = 'star8'; redraw(); break;
      case '2': params.patternType = 'star6'; document.getElementById('patternType').value = 'star6'; redraw(); break;
      case '3': params.patternType = 'rosette'; document.getElementById('patternType').value = 'rosette'; redraw(); break;
      case '4': params.patternType = 'hexLattice'; document.getElementById('patternType').value = 'hexLattice'; redraw(); break;
      case '5': params.patternType = 'circles'; document.getElementById('patternType').value = 'circles'; redraw(); break;
      case '6': params.patternType = 'sunburst'; document.getElementById('patternType').value = 'sunburst'; redraw(); break;
      case '7': params.patternType = 'chevron'; document.getElementById('patternType').value = 'chevron'; redraw(); break;
      case '8': params.patternType = 'knotwork'; document.getElementById('patternType').value = 'knotwork'; redraw(); break;
      case '9': params.patternType = 'octSquare'; document.getElementById('patternType').value = 'octSquare'; redraw(); break;
      case 'arrowup':
        params.contactAngle = min(75, params.contactAngle + 2);
        document.getElementById('contactAngle').value = params.contactAngle;
        document.getElementById('contactAngleValue').textContent = params.contactAngle;
        redraw();
        break;
      case 'arrowdown':
        params.contactAngle = max(15, params.contactAngle - 2);
        document.getElementById('contactAngle').value = params.contactAngle;
        document.getElementById('contactAngleValue').textContent = params.contactAngle;
        redraw();
        break;
    }
  });
}

// ============================================
// SVG EXPORT
// ============================================

function exportSVG() {
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${params.bgColor}"/>
  <g stroke="${params.fgColor}" stroke-width="${params.strokeWeight}" fill="none" transform="translate(${width/2}, ${height/2})">
`;

  for (const item of svgLines) {
    if (item.type === 'ellipse') {
      svg += `    <ellipse cx="${item.cx.toFixed(2)}" cy="${item.cy.toFixed(2)}" rx="${item.rx.toFixed(2)}" ry="${item.ry.toFixed(2)}"/>\n`;
    } else if (item.type === 'polygon') {
      const pts = item.points.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
      svg += item.closed ? `    <polygon points="${pts}"/>\n` : `    <polyline points="${pts}"/>\n`;
    } else {
      svg += `    <line x1="${item.x1.toFixed(2)}" y1="${item.y1.toFixed(2)}" x2="${item.x2.toFixed(2)}" y2="${item.y2.toFixed(2)}"/>\n`;
    }
  }

  svg += `  </g>\n</svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'jali-pattern.svg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function windowResized() {
  const container = document.getElementById('canvas-container');
  const size = Math.min(container.offsetWidth - 80, container.offsetHeight - 80, 700);
  resizeCanvas(size, size);
  redraw();
}
