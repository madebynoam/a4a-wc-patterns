# Jali Line Grid Machine

## What This Is

A generative machine that creates jali-style LINE GRID patterns. Each seed produces a unique lattice of intersecting lines.

## Core Principle

**Lines form the lattice.** The stone/metal is the LINES. The voids are the negative space between them. This is stroke-based, not fill-based.

## Structure

### Grid Points
- Regular grid of points across canvas
- Points can drift slightly with imperfection enabled

### Connections
- Horizontal lines between adjacent points
- Vertical lines between adjacent points
- Diagonal lines (optional) - both directions
- Not all connections are drawn - controlled by probability

### Decorations
- Star nodes at some intersections
- Radiating lines from center point
- Variable ray count (4-8)

## Parameters

### Seed
- Determines all random choices
- Same seed = same pattern (always)

### Grid Size
- Number of divisions (3-12)
- More divisions = denser pattern

### Connection Density
- Probability of drawing each possible line (0.3-1.0)
- Lower = more sparse/broken
- Higher = more complete grid

### Diagonals
- Toggle on/off
- Adds complexity and Islamic geometry feel

### Star Decorations
- Probability of star at each node (0-60%)
- Adds focal points and detail

### Line Weight
- Stroke thickness (1-8px)
- Thicker = bolder, pin-ready
- Thinner = delicate, detailed

### Imperfection
- Human hand simulation (0-100%)
- 0% = perfect geometry (pin-ready)
- 50%+ = hand-drawn feel (tote-ready)
- Affects: point positions, line endpoints

## Output

### SVG Export
- Pure vector lines
- Clean for production (laser cut, enamel pin, screen print)

### PNG Export
- Raster image
- For preview/sharing

## What This Is NOT

- Not filled shapes
- Not blobs or cells
- Not organic/flowing
- Not complex Islamic stars (yet)

It's a **line grid machine** - the foundation of jali patterns.
