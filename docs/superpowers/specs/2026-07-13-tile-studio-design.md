# Tile Studio — Design Spec

**Date:** 2026-07-13
**Status:** Approved for planning
**Author:** Matthew Lew (with Claude)

## 1. Purpose

A visual tool for designing and configuring **custom glaze tiles and tile works** for
firing at BKLYNCLAY. The artist designs a piece at its **finished (fired) size**; the tool
works backward through the clay **shrinkage rate** to produce **printable, dimensioned
wet-cut templates** (paper templates you cut clay against at the studio). It also plans how
a piece **installs on a real wall** — to scale, against a door/window and a human figure.

It is a companion to two existing apps:

- **Palette** (`~/Documents/palette`) — gradient generator. Tile Studio **imports gradients**
  from it as JSON.
- **bklynclay-glaze** (`~/Documents/bklynclay-glaze`) — glaze library / palette app. Not a
  code dependency for v1 (see §9), but the sibling studio tool.

## 2. Scope

### In scope (v1)

One piece type, end-to-end: the **Gradient Run / Airplane-Window** piece.

1. **Editor** — SVG canvas, chrome in Palette's design system, light/dark.
2. **Piece definition** at finished size: outline (rectangle run or airplane-window rounded
   rectangle), **cut-to-curve** edge tiles, bar height, grout gap, bar count/orientation.
3. **Gradient import** from Palette JSON, mapped across the bars by position (vertical
   gradient in v1).
4. **Shrinkage** — clay-body preset → single global shrink %, editable. Finished → wet-cut
   for every tile, including scaled curved-edge cut paths.
5. **Configurator** — enter the real span (e.g., 96 in floor-to-ceiling) + gap; solve bar
   count/height to fit; report finished + wet-cut sizes, quantities, total clay area.
6. **Installation view** — wall elevation with user-input **wall width & height**, optional
   **door and window** (size + position), a **scale figure**, piece placement + hang height,
   and **multi-piece sets** (diptych / triptych / row) with alignment and even spacing.
7. **Output** — printable draft templates (blueprint style): each tile dimensioned, paginated
   across **Letter or Tabloid** at a chosen scale (1:1, 1:2, 1:4) with registration/crop
   marks, tile IDs, title block, and cut list. Plus SVG and PDF export.
8. **Persistence** — localStorage autosave; project export/import as JSON.
9. **Units** — inches default, cm toggle.

### Out of scope (later, same foundation)

- Other piece types: frame (open/filled), oval/round, tile field/layout, custom freeform.
- Whole-tile (stepped) edge mode — v1 is cut-to-curve only.
- Horizontal / angled gradients and per-bar color banding — v1 is vertical.
- Anisotropic shrinkage (separate horizontal/vertical %).
- Live two-way sync with Palette or reuse of bklynclay-glaze glaze data / renderer.

## 3. Architecture

Standalone **static web app** — vanilla HTML/CSS/JS + SVG, **no build step**. Chosen for
print fidelity (SVG prints crisp at any scale), zero dependencies, and trivial GitHub Pages
deploy. Imports Palette's CSS custom-property tokens so the two apps share a look.

Home: its own directory/repo (final location decided at implementation), deployed to the
GitHub Pages site alongside the portfolio and Palette.

### Modules (each independently testable)

| Module | Responsibility | Depends on |
|--------|----------------|------------|
| `model.js` | Project/Piece/Tile data types, load/save JSON, localStorage | — |
| `shrinkage.js` | finished ↔ wet-cut conversion for lengths and SVG paths | — |
| `geometry.js` | outline shapes, bar subdivision, cut-to-curve clipping, tile derivation | — |
| `gradient.js` | parse Palette gradient JSON, sample color at position | — |
| `configurator.js` | solve bar count/size to fit a span + gap | geometry, shrinkage |
| `render-canvas.js` | live SVG of the piece in the editor | geometry, gradient |
| `render-install.js` | wall elevation: room, door/window, figure, piece(s), sets | geometry |
| `render-template.js` | paginated dimensioned wet-cut templates + cut list; PDF/SVG export | geometry, shrinkage |
| `ui.js` | editor chrome, panels, inputs, wiring | all above |

## 4. Data model

```js
Project {
  units: 'in' | 'cm',
  clay: { name, shrinkPct },        // e.g. { name:'Cone 6 stone', shrinkPct:0.12 }
  gradient: Gradient | null,
  room: Room,
  pieces: Piece[]
}

Gradient {                          // imported from Palette
  stops: [{ pos: 0..1, hex }],
  angle: number                     // v1 uses 90 (vertical)
}

Piece {
  id,
  type: 'gradient-run',
  outline: { shape:'airplane-window'|'rectangle', w, h, cornerR },   // finished size
  edgeMode: 'cut',
  tiling: { barHeight, gap, count, orientation:'horizontal' },
  gradientMap: 'by-position',
  placement: { x, y, hangCenter }   // in installation view
}

// Derived (not persisted): computed from Piece + shrinkage
Tile {
  id, row,
  finishedPath,                     // SVG path at finished size (clipped at edges)
  wetCutPath,                       // finishedPath scaled by 1/(1-shrinkPct)
  color                             // sampled from gradient at the tile's position
}

Room {
  wallW, wallH,                     // user input
  door:   { present, w, h, x } | null,
  window: { present, w, h, x, sill } | null,
  figureHeight                      // default 66 in
}
```

## 5. Core rule — shrinkage

Designer works at **finished** size. For any linear dimension `f`:

```
wet = f / (1 - shrinkPct)
```

Curved edge tiles: the finished tile is clipped to the outline, then the **whole clipped
path** is scaled by `1/(1 - shrinkPct)` about the piece origin so the fired curve lands
correctly. `shrinkage.js` exposes `wetLength(f)`, `wetPath(pathData)`, and the inverse.

## 6. Configurator

Input: target finished span, grout gap, and either a fixed bar count or a preferred bar
height. Output: solved `{ barHeight, count }` that tiles the span with even gaps, plus a
report of finished sizes, wet-cut sizes, total tile count, and total clay area (sq ft / m²).

## 7. Installation view

Front-on wall elevation. User inputs `wallW`, `wallH`, and optional door/window with size +
position. Renders floor/ceiling lines, door, window, a scale figure (default 5'6"), and the
piece(s) at true scale with a hang-height dimension (default gallery center 57 in).
Multi-piece sets: choose count (2–5), alignment (centers / tops / bottoms), and even spacing;
tool distributes them and dimensions the gaps.

## 8. Output / templates

Blueprint-style draft (paper look): solid = finished tile, dashed red = wet-cut, dimension
lines, title block (shape, finished size, shrink %, wet-cut, clay, scale, qty), and a cut
list. Paginate across **Letter or Tabloid** at scale 1:1 / 1:2 / 1:4 with registration/crop
marks and tile IDs so multi-page 1:1 templates reassemble. Export SVG and PDF.

## 9. Palette integration (the one contract)

Tile Studio reads a gradient JSON. Proposed shape:

```json
{ "type": "gradient", "angle": 90, "stops": [ { "pos": 0, "hex": "#25406e" }, { "pos": 1, "hex": "#efc19f" } ] }
```

**Open item:** confirm/adjust this shape against what Palette actually exports (add an adapter
in `gradient.js` if the field names differ). This is the only cross-app dependency in v1.

## 10. Error handling

- Invalid gradient JSON → non-blocking banner; keep last good gradient.
- Configurator with no solution (gap ≥ span) → inline message, no crash.
- Shrink % outside 0–40% → warn, clamp.
- localStorage unavailable → in-memory session + notice.

## 11. Testing

- `shrinkage.js`, `geometry.js`, `gradient.js`, `configurator.js` — pure functions, unit
  tested (finished↔wet round-trips, tiling counts, gradient sampling, solver edge cases).
- Render modules — snapshot key SVG outputs.
- Manual: import a Palette gradient, solve a 96 in run, print a 1:2 template, verify
  dimensions and the installation figure read at correct scale.

## 12. Open items

1. Confirm Palette's exported gradient JSON shape (§9).
2. Final home (portfolio repo subfolder vs. own repo).
3. Default clay-body presets + shrink percentages to seed.
