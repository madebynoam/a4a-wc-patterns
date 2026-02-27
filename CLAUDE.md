# A4A WC Patterns - Generative Jali + Art Deco

## What This Is

A generative pattern machine that fuses **Indian jali lattice** geometry with **Bombay Art Deco** motifs. Built for WordCamp Asia swag (enamel pins, tote bags, stickers). Each seed produces a unique pattern.

## Design Direction

**Jali + Art Deco fusion** - The intersection of:
- Traditional Islamic/Indian jali lattice (grid + diagonals)
- Bombay Art Deco elements (sunburst, frozen fountain arches)
- Gateway of India as primary inspiration

**Target aesthetic**: Clean line work suitable for enamel pins and screen printing. Hand-drawn feel optional via wobble parameter.

## Core Architecture

### Base Layer: Grid + Diagonals
- Configurable grid size (3-12)
- Horizontal and vertical lines form the lattice base
- Diagonals added per-cell based on noise/seed
- **Connected mode**: Each cell gets ONE diagonal direction (cleaner paths)
- **Overlapping mode**: Both diagonal directions possible per cell (more complex)

### Art Deco Elements

**Sunburst** (bottom-up rays)
- Rays from bottom-center grid point to top row grid points
- Spread control: how many columns wide
- Aligned to grid intersections

**Frozen Fountain** (nested arches)
- Vertical lines with semicircular arch tops
- Based on René Lalique's "frozen fountain" motif
- **Side Arches option**: Gateway of India triple-arch style
- Side height control: make flanking arches shorter

### Symmetry
- 4-fold mirror symmetry (generates top-left quadrant, mirrors to others)
- Creates balanced Islamic geometric feel

### Flow Field (subtle)
- Perlin noise creates directional flow at grid points
- Lines curve slightly based on flow (0-100%)
- Creates organic variation while maintaining structure

### Wobble (hand-drawn feel)
- Random displacement along line vertices
- 0% = perfectly straight
- Higher = sketchy/hand-carved aesthetic

## Parameters

| Parameter | Range | Purpose |
|-----------|-------|---------|
| Seed | number | Reproducible randomness |
| Grid Size | 3-12 | Density of lattice |
| Line Density | 0-100% | How many lines drawn |
| Line Weight | 1-6px | Stroke thickness |
| Flow/Curve | 0-100% | Flow field influence |
| Wobble | 0-10% | Hand-drawn imperfection |
| Connected | toggle | Single vs double diagonals |
| Sunburst | 0-100% | Ray count from bottom |
| Sunburst Spread | 0-100% | How wide the fan |
| Fountain | 0-100% | Nested arch layers |
| Side Arches | toggle | Gateway-style flanking arches |
| Side Height | 20-100% | Height of side arches |

## Color Palettes

- Dark mode: #1a1a1a bg, #f5f0e6 fg (cream on charcoal)
- Light mode: #f5f0e6 bg, #1a1a1a fg
- Teal Deco: #0a3d62 bg, #f8c291 fg (copper on teal)
- Bold Blue: #0240E4 bg, #f5f0e6 fg (WordCamp Asia blue)
- Clean: #ffffff bg, #000000 fg

## Presets System

Users can save current settings as presets (stored in localStorage). Click preset to restore all parameters. Good for finding "keeper" combinations.

## Export

- **SVG** - Vector for production (pins, print)
- **PNG** - Raster preview

## Tech Stack

- p5.js for rendering
- Vanilla JS, no build step
- Single HTML + JS file
- Python simple server for local dev (`npm run serve`)

## File Structure

```
/
├── index.html      # UI and styles
├── sketch.js       # All pattern generation logic
├── package.json    # Just has serve script
└── CLAUDE.md       # This file
```

## Key Functions

- `draw()` - Main render loop, builds flow field and draws segments
- `drawFlowingLinePixels()` - Draws curved line with flow + wobble
- `drawSunburst()` - Art Deco rays to grid points
- `drawFrozenFountain()` - Nested arches with optional side arches
- `drawFountainAt()` - Single fountain at given position
- `savePreset() / loadPresets() / applyPreset()` - Preset management

## Future Ideas

- More Art Deco motifs (chevrons, ziggurats, fan patterns)
- Mask/clip to arch shape for pin outline
- Batch export multiple seeds
- Color gradient support
- Animation mode

## Repository

https://github.com/madebynoam/a4a-wc-patterns
Branch: `generative-jali`
