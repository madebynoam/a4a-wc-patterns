# Islamic Jali Pattern Machine

## What This Is

A generative machine that creates authentic Islamic geometric patterns using the Hankin method. Each seed produces a unique star pattern.

## Core Method: Hankin's Polygons-in-Contact

This is how real Islamic geometric patterns are constructed:

1. **Base polygon grid** - Squares (8-point), hexagons (6-point), or dodecagons (12-point)
2. **Edge midpoints** - Find the midpoint of each polygon edge
3. **Contact angle rays** - From each midpoint, draw rays inward at the contact angle
4. **Ray intersections** - Where adjacent rays meet = star vertices
5. **Connect points** - Lines form the characteristic star patterns

## Star Types

### 6-Point Star (Hexagonal Grid)
- Based on hexagonal tiling
- 60° rotational symmetry
- Common in Moroccan/North African patterns

### 8-Point Star (Square Grid)
- Based on square tiling
- 45° rotational symmetry
- Most common Islamic pattern (Gateway of India, etc.)

### 12-Point Star (Complex)
- Layered construction
- More intricate detail
- Often used as focal points

## Contact Angle

The contact angle (35°-75°) controls star sharpness:
- **Low angle (35-45°)** = Sharp, pointy stars
- **Medium angle (50-60°)** = Classic proportions
- **High angle (65-75°)** = Soft, rounded stars

## Parameters

### Seed
- Determines star type and contact angle
- Same seed = same pattern

### Grid Density
- How many star repeats (2-8)
- More = denser pattern

### Line Density
- Probability of drawing each line (50-100%)
- Lower = some lines omitted for variation

### Line Weight
- Stroke thickness
- Thicker = bolder, pin-ready

### Imperfection
- Human hand simulation
- 0% = perfect (pin)
- Higher = hand-drawn feel (tote)

## Output

- **SVG** - Clean vectors for production
- **PNG** - Raster for preview

## What Makes It Islamic

- Rotational symmetry around star centers
- Interlocking stars that tessellate
- Secondary shapes in negative space (kites, hexagons)
- Mathematical precision in angles
- Based on actual historical construction methods
