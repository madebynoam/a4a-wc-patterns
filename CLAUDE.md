# Cellular Jali Pattern Machine

## What This Is

A generative machine that creates jali-style patterns. Each seed produces a unique, valid pattern suitable for enamel pins (clean) or tote bags (with imperfection).

## Core Principle

**Negative space is the design.** We don't draw lines - we carve holes from solid. The voids let light through. The stone remains.

## Visual Language

### Cellular, Not Geometric
- Inspired by carved stone jali screens
- Organic but structured - like cells, bones, or maze walls
- Thick walls with soft/rounded corners
- Loose grid - structured but imperfect

### Shape Vocabulary
- **Circle** - simple round void
- **Pill** - rounded rectangle / capsule
- **Cross** - plus shape with rounded ends
- **Trefoil** - three-lobed clover shape
- **Quatrefoil** - four-lobed shape

### Placement Rules
- Base grid provides structure
- Each cell drifts from grid center (noise-driven)
- Shapes can rotate
- Adjacent shapes can merge when close
- Some cells can be empty (variation)

## The Machine

### Input
- **Seed** - determines all random choices
- **Density** - how many voids (sparse to dense)
- **Wall thickness** - how chunky the stone
- **Roundness** - corner radius
- **Imperfection** - human hand amount (0-100%)

### Output
- Same seed = same pattern (always)
- Different seeds = different valid patterns
- Clean SVG for production

## Human Hand Layer (Optional)

When enabled, adds subtle craftsman imperfection:

- **Endpoint drift** - shapes don't align perfectly
- **Size wobble** - slight variation in shape sizes
- **Corner variation** - roundness varies slightly
- **Asymmetry** - shapes slightly irregular

This is OFF by default (pin-ready). Turn ON for screen print / tote bag.

## Output Formats

### Pin-Ready (Imperfection: 0%)
- Perfect geometry
- Uniform line weights
- Clean intersections
- Works at small scale

### Tote-Ready (Imperfection: 20-50%)
- Subtle human touch
- Slight variations throughout
- Same pattern, organic feel

## Technical Constraints

- p5.js for rendering
- SVG export must be clean vectors
- No gradients, no textures
- Single color (foreground/background)
- Boolean operations: solid minus voids

## What This Is NOT

- Not flow fields or organic generative art
- Not perfect Islamic star patterns
- Not random noise
- Not hand-drawn sketchy style

It's a **machine that makes cellular stone screens** with controlled variation.
