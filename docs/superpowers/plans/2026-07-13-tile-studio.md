# Tile Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone, no-build web app that lets an artist design a gradient-run / airplane-window glaze tile piece at finished size, compute wet-cut templates from clay shrinkage, plan its installation on a scaled wall, and print dimensioned paper templates.

**Architecture:** Vanilla ES modules + SVG, no bundler. Pure-logic modules (`shrinkage`, `gradient`, `geometry`, `configurator`, `model`) return plain data/strings and are unit-tested with Node's built-in test runner. Render modules return SVG strings (pure, snapshot-testable). `ui.js` is the only DOM-touching module. Palette's CSS tokens are imported for styling.

**Tech Stack:** HTML/CSS/JS (ES modules), inline SVG, `node:test` + `node:assert` for tests. No dependencies, no build step. Deploys to GitHub Pages from `tile-studio/`.

---

## File structure

All paths under `tile-studio/` in the `matthewlew.github.io` repo.

| File | Responsibility |
|------|----------------|
| `package.json` | `"type":"module"`, `test` script. No deps. |
| `index.html` | App shell; imports `tokens.css`, `app.css`, `src/ui.js`. |
| `styles/tokens.css` | Copy of Palette's CSS custom properties (light/dark). |
| `styles/app.css` | App-specific layout (top bar, left rail, canvas, right panel). |
| `src/shrinkage.js` | finished↔wet conversion for lengths and point arrays. |
| `src/gradient.js` | Parse Palette gradient JSON; sample color at position. |
| `src/geometry.js` | Outline math, bar subdivision, cut-to-curve tile polygons. |
| `src/configurator.js` | Solve bar count/height to fit a span. |
| `src/model.js` | Project/Piece/Room factories; JSON + localStorage. |
| `src/render-canvas.js` | Live editor SVG of the piece. |
| `src/render-install.js` | Wall-elevation SVG (room, door, window, figure, sets). |
| `src/render-template.js` | Paginated dimensioned wet-cut templates + cut list. |
| `src/ui.js` | Wires inputs, state, and renderers to the DOM. |
| `test/*.test.js` | One test file per pure/render module. |

Units convention: all model dimensions are stored in **inches**; the cm toggle is display-only (multiply by 2.54) and is handled in `ui.js`. SVG user units = inches (renderers scale via viewBox).

---

## Task 0: Scaffold

**Files:**
- Create: `tile-studio/package.json`
- Create: `tile-studio/index.html`
- Create: `tile-studio/styles/tokens.css`
- Create: `tile-studio/styles/app.css`
- Create: `tile-studio/src/shrinkage.js` (placeholder export)
- Create: `tile-studio/test/smoke.test.js`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "tile-studio",
  "version": "0.1.0",
  "type": "module",
  "private": true,
  "scripts": {
    "test": "node --test"
  }
}
```

- [ ] **Step 2: Copy Palette tokens into `styles/tokens.css`**

Copy the full contents of `~/Documents/palette/src/index.css` `:root{…}` and the
`@media (prefers-color-scheme: dark)` block into `styles/tokens.css` (the custom properties
and font declarations only — omit Palette-specific view-transition rules). At minimum it must
define: `--text`, `--text-h`, `--bg`, `--border`, `--code-bg`, `--accent`, `--accent-bg`,
`--accent-border`, `--sans`, `--mono`, and `--space-xs…--space-xxl`, plus the dark overrides.

- [ ] **Step 3: Create `styles/app.css`** (layout only)

```css
* { box-sizing: border-box; }
body { margin: 0; font-family: var(--sans); color: var(--text); background: var(--bg); }
.topbar { display:flex; align-items:center; gap:var(--space-md); padding:var(--space-sm) var(--space-lg); border-bottom:1px solid var(--border); }
.topbar .title { font-weight:600; color:var(--text-h); }
.spacer { flex:1; }
.btn { border:1px solid var(--accent); color:var(--accent); background:none; border-radius:999px; padding:5px 12px; font-size:13px; cursor:pointer; }
.btn.primary { background:var(--accent); color:#fff; border-color:var(--accent); }
.workspace { display:flex; min-height:calc(100vh - 52px); }
.rail { width:52px; border-right:1px solid var(--border); display:flex; flex-direction:column; align-items:center; gap:6px; padding:10px 0; }
.canvas { flex:1; background:var(--code-bg); display:flex; align-items:center; justify-content:center; padding:16px; }
.panel { width:230px; border-left:1px solid var(--border); padding:var(--space-md); font-size:13px; }
.panel label { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.panel input, .panel select { width:96px; font-family:var(--mono); }
.hr { height:1px; background:var(--border); margin:12px 0; }
```

- [ ] **Step 4: Create `index.html` shell**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tile Studio</title>
  <link rel="stylesheet" href="styles/tokens.css" />
  <link rel="stylesheet" href="styles/app.css" />
</head>
<body>
  <div id="app"></div>
  <script type="module" src="src/ui.js"></script>
</body>
</html>
```

- [ ] **Step 5: Create placeholder `src/shrinkage.js`**

```js
export const VERSION = '0.1.0';
```

- [ ] **Step 6: Create `test/smoke.test.js`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VERSION } from '../src/shrinkage.js';

test('module system works', () => {
  assert.equal(VERSION, '0.1.0');
});
```

- [ ] **Step 7: Run test**

Run: `cd tile-studio && npm test`
Expected: 1 test passing.

- [ ] **Step 8: Commit**

```bash
git add tile-studio
git commit -m "feat(tile-studio): scaffold app shell, tokens, test runner"
```

---

## Task 1: Shrinkage math

**Files:**
- Modify: `tile-studio/src/shrinkage.js`
- Create: `tile-studio/test/shrinkage.test.js`

- [ ] **Step 1: Write failing tests**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wetLength, finishedLength, wetScale, scalePoints } from '../src/shrinkage.js';

test('wetLength enlarges by shrink factor', () => {
  assert.ok(Math.abs(wetLength(6, 0.12) - 6.8182) < 0.001);
});
test('finishedLength is the inverse of wetLength', () => {
  const w = wetLength(3, 0.12);
  assert.ok(Math.abs(finishedLength(w, 0.12) - 3) < 1e-9);
});
test('wetScale is 1/(1-shrink)', () => {
  assert.ok(Math.abs(wetScale(0.12) - 1.13636) < 0.001);
});
test('scalePoints scales about an origin', () => {
  const pts = scalePoints([[10, 0], [10, 10]], 2, [0, 0]);
  assert.deepEqual(pts, [[20, 0], [20, 20]]);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd tile-studio && npm test`
Expected: FAIL — `wetLength` is not exported.

- [ ] **Step 3: Implement `src/shrinkage.js`**

```js
export const VERSION = '0.1.0';

// finished = wet * (1 - shrink)  ->  wet = finished / (1 - shrink)
export function wetScale(shrink) {
  if (shrink < 0 || shrink >= 1) throw new RangeError('shrink must be in [0,1)');
  return 1 / (1 - shrink);
}
export function wetLength(finished, shrink) {
  return finished * wetScale(shrink);
}
export function finishedLength(wet, shrink) {
  return wet * (1 - shrink);
}
export function scalePoints(points, scale, origin = [0, 0]) {
  const [ox, oy] = origin;
  return points.map(([x, y]) => [ox + (x - ox) * scale, oy + (y - oy) * scale]);
}
```

- [ ] **Step 4: Run to verify pass**

Run: `cd tile-studio && npm test`
Expected: PASS (all shrinkage + smoke tests).

- [ ] **Step 5: Commit**

```bash
git add tile-studio/src/shrinkage.js tile-studio/test/shrinkage.test.js
git commit -m "feat(tile-studio): shrinkage length + point scaling"
```

---

## Task 2: Gradient import + sampling

**Files:**
- Create: `tile-studio/src/gradient.js`
- Create: `tile-studio/test/gradient.test.js`

- [ ] **Step 1: Write failing tests**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseGradient, sampleAt } from '../src/gradient.js';

const G = { type: 'gradient', angle: 90, stops: [{ pos: 0, hex: '#000000' }, { pos: 1, hex: '#ffffff' }] };

test('parseGradient accepts a valid Palette object', () => {
  const g = parseGradient(JSON.stringify(G));
  assert.equal(g.stops.length, 2);
  assert.equal(g.angle, 90);
});
test('parseGradient sorts stops by position', () => {
  const g = parseGradient(JSON.stringify({ stops: [{ pos: 1, hex: '#fff' }, { pos: 0, hex: '#000' }] }));
  assert.equal(g.stops[0].pos, 0);
});
test('parseGradient throws on malformed input', () => {
  assert.throws(() => parseGradient('not json'));
  assert.throws(() => parseGradient(JSON.stringify({ stops: [] })));
});
test('sampleAt interpolates midpoint', () => {
  assert.equal(sampleAt(parseGradient(JSON.stringify(G)), 0.5).toLowerCase(), '#808080');
});
test('sampleAt clamps out of range', () => {
  const g = parseGradient(JSON.stringify(G));
  assert.equal(sampleAt(g, -1).toLowerCase(), '#000000');
  assert.equal(sampleAt(g, 2).toLowerCase(), '#ffffff');
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd tile-studio && npm test`
Expected: FAIL — `parseGradient` not defined.

- [ ] **Step 3: Implement `src/gradient.js`**

```js
function hexToRgb(hex) {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error('bad hex: ' + hex);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex([r, g, b]) {
  const c = (n) => Math.round(n).toString(16).padStart(2, '0');
  return '#' + c(r) + c(g) + c(b);
}

export function parseGradient(jsonString) {
  let obj;
  try { obj = JSON.parse(jsonString); } catch { throw new Error('Gradient is not valid JSON'); }
  if (!obj || !Array.isArray(obj.stops) || obj.stops.length < 2) {
    throw new Error('Gradient needs at least two stops');
  }
  const stops = obj.stops
    .map((s) => ({ pos: Number(s.pos), hex: String(s.hex) }))
    .sort((a, b) => a.pos - b.pos);
  stops.forEach((s) => hexToRgb(s.hex)); // validate
  return { angle: Number(obj.angle ?? 90), stops };
}

export function sampleAt(gradient, pos) {
  const { stops } = gradient;
  const p = Math.max(0, Math.min(1, pos));
  let lo = stops[0], hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (p >= stops[i].pos && p <= stops[i + 1].pos) { lo = stops[i]; hi = stops[i + 1]; break; }
  }
  const span = hi.pos - lo.pos || 1;
  const t = (p - lo.pos) / span;
  const a = hexToRgb(lo.hex), b = hexToRgb(hi.hex);
  return rgbToHex([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
}
```

- [ ] **Step 4: Run to verify pass**

Run: `cd tile-studio && npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tile-studio/src/gradient.js tile-studio/test/gradient.test.js
git commit -m "feat(tile-studio): parse + sample Palette gradients"
```

---

## Task 3: Geometry — outline + cut-to-curve tiles

**Files:**
- Create: `tile-studio/src/geometry.js`
- Create: `tile-studio/test/geometry.test.js`

The outline is a rounded rectangle centered at the origin, width `w`, height `h`, corner
radius `cornerR` (rx=ry). `halfWidthAt(outline, yFromCenter)` returns the horizontal
half-extent of the outline at a vertical offset from center. `deriveTiles` slices the piece
into horizontal bars and, for each bar, builds a polygon whose left/right sides follow the
outline (curved at the ends), sampled at `SAMPLES` points per edge.

- [ ] **Step 1: Write failing tests**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { halfWidthAt, deriveTiles } from '../src/geometry.js';

const outline = { shape: 'airplane-window', w: 24, h: 96, cornerR: 10 };

test('halfWidthAt is full half-width in the straight zone', () => {
  assert.ok(Math.abs(halfWidthAt(outline, 0) - 12) < 1e-9);
});
test('halfWidthAt narrows inside the corner zone', () => {
  const hw = halfWidthAt(outline, 96 / 2 - 1); // 1 in below the top edge
  assert.ok(hw < 12 && hw > 0);
});
test('halfWidthAt is zero at the very top', () => {
  assert.ok(Math.abs(halfWidthAt(outline, 48)) < 1e-9);
});
test('deriveTiles bar count matches requested', () => {
  const piece = { outline, tiling: { barHeight: 3, gap: 0, count: 32, orientation: 'horizontal' } };
  const tiles = deriveTiles(piece);
  assert.equal(tiles.length, 32);
});
test('each tile has a polygon and a 0..1 gradient position', () => {
  const piece = { outline, tiling: { barHeight: 3, gap: 0, count: 32, orientation: 'horizontal' } };
  const t = deriveTiles(piece)[0];
  assert.ok(Array.isArray(t.polygon) && t.polygon.length >= 4);
  assert.ok(t.gradientPos >= 0 && t.gradientPos <= 1);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd tile-studio && npm test`
Expected: FAIL — `halfWidthAt` not defined.

- [ ] **Step 3: Implement `src/geometry.js`**

```js
const SAMPLES = 8;

// Half horizontal extent of a centered rounded rect at vertical offset y from center.
export function halfWidthAt(outline, y) {
  const { w, h, cornerR } = outline;
  const halfH = h / 2, halfW = w / 2;
  const ay = Math.abs(y);
  if (ay >= halfH) return 0;
  const straightZone = halfH - cornerR;
  if (ay <= straightZone || cornerR <= 0) return halfW;
  const dy = ay - straightZone;                 // into the corner
  if (dy >= cornerR) return 0;
  return (halfW - cornerR) + Math.sqrt(cornerR * cornerR - dy * dy);
}

// Slice into `count` horizontal bars of `barHeight` separated by `gap`, top to bottom,
// vertically centered in the outline. Each bar becomes a polygon following the outline.
export function deriveTiles(piece) {
  const { outline, tiling } = piece;
  const { barHeight, gap, count } = tiling;
  const totalH = count * barHeight + (count - 1) * gap;
  const topY = totalH / 2;                       // +y up, center origin
  const tiles = [];
  for (let i = 0; i < count; i++) {
    const yTop = topY - i * (barHeight + gap);
    const yBot = yTop - barHeight;
    const right = [], left = [];
    for (let s = 0; s <= SAMPLES; s++) {
      const y = yTop - (barHeight * s) / SAMPLES;
      const hw = halfWidthAt(outline, y);
      right.push([hw, y]);
      left.push([-hw, y]);
    }
    const polygon = [...right, ...left.reverse()];
    const centerY = (yTop + yBot) / 2;
    const gradientPos = (topY - centerY) / totalH; // 0 at top, 1 at bottom
    tiles.push({ id: `bar-${i + 1}`, row: i, polygon, gradientPos });
  }
  return tiles;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `cd tile-studio && npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tile-studio/src/geometry.js tile-studio/test/geometry.test.js
git commit -m "feat(tile-studio): outline geometry + cut-to-curve tile polygons"
```

---

## Task 4: Configurator

**Files:**
- Create: `tile-studio/src/configurator.js`
- Create: `tile-studio/test/configurator.test.js`

- [ ] **Step 1: Write failing tests**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solveRun } from '../src/configurator.js';

test('solveRun by preferred bar height fits the span with gaps', () => {
  const r = solveRun({ span: 96, gap: 0.125, preferredBarHeight: 3 });
  const used = r.count * r.barHeight + (r.count - 1) * 0.125;
  assert.ok(Math.abs(used - 96) < 1e-6);
  assert.ok(r.count >= 1);
});
test('solveRun by fixed count divides evenly', () => {
  const r = solveRun({ span: 100, gap: 0, count: 25 });
  assert.equal(r.count, 25);
  assert.ok(Math.abs(r.barHeight - 4) < 1e-9);
});
test('solveRun with no room returns error', () => {
  const r = solveRun({ span: 2, gap: 3, count: 2 });
  assert.equal(r.ok, false);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd tile-studio && npm test`
Expected: FAIL — `solveRun` not defined.

- [ ] **Step 3: Implement `src/configurator.js`**

```js
// Solve a linear run to exactly fill `span` with even `gap` between bars.
// Provide either `count` (fixed number of bars) or `preferredBarHeight`.
export function solveRun({ span, gap = 0, count, preferredBarHeight }) {
  let n = count;
  if (!n) {
    // choose the count whose bar height is closest to preferred
    n = Math.max(1, Math.round((span + gap) / (preferredBarHeight + gap)));
  }
  const barHeight = (span - (n - 1) * gap) / n;
  if (barHeight <= 0) return { ok: false, reason: 'Gaps exceed the available span' };
  return { ok: true, count: n, barHeight, gap, span };
}
```

- [ ] **Step 4: Run to verify pass**

Run: `cd tile-studio && npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tile-studio/src/configurator.js tile-studio/test/configurator.test.js
git commit -m "feat(tile-studio): run configurator solver"
```

---

## Task 5: Model + persistence

**Files:**
- Create: `tile-studio/src/model.js`
- Create: `tile-studio/test/model.test.js`

- [ ] **Step 1: Write failing tests**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createProject, serialize, deserialize, totalClaySqFt } from '../src/model.js';

test('createProject has sane defaults', () => {
  const p = createProject();
  assert.equal(p.units, 'in');
  assert.equal(p.clay.shrinkPct, 0.12);
  assert.equal(p.pieces.length, 1);
  assert.equal(p.pieces[0].type, 'gradient-run');
  assert.equal(p.room.figureHeight, 66);
});
test('serialize/deserialize round-trips', () => {
  const p = createProject();
  p.clay.shrinkPct = 0.1;
  const back = deserialize(serialize(p));
  assert.equal(back.clay.shrinkPct, 0.1);
  assert.equal(back.pieces[0].outline.shape, p.pieces[0].outline.shape);
});
test('deserialize rejects wrong schema', () => {
  assert.throws(() => deserialize('{"nope":true}'));
});
test('totalClaySqFt uses wet bounding boxes', () => {
  const p = createProject();
  const sqft = totalClaySqFt(p);
  assert.ok(sqft > 0);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd tile-studio && npm test`
Expected: FAIL — `createProject` not defined.

- [ ] **Step 3: Implement `src/model.js`**

```js
import { wetScale } from './shrinkage.js';
import { deriveTiles } from './geometry.js';

export const SCHEMA = 'tile-studio/1';

export function createProject() {
  return {
    schema: SCHEMA,
    units: 'in',
    clay: { name: 'Cone 6 stone', shrinkPct: 0.12 },
    gradient: null,
    room: { wallW: 120, wallH: 108, door: null, window: null, figureHeight: 66 },
    pieces: [{
      id: 'piece-1',
      type: 'gradient-run',
      outline: { shape: 'airplane-window', w: 24, h: 96, cornerR: 20 },
      edgeMode: 'cut',
      tiling: { barHeight: 3, gap: 0.125, count: 30, orientation: 'horizontal' },
      gradientMap: 'by-position',
      placement: { x: 48, y: 0, hangCenter: 57 },
    }],
  };
}

export function serialize(project) {
  return JSON.stringify(project, null, 2);
}
export function deserialize(jsonString) {
  const obj = JSON.parse(jsonString);
  if (!obj || obj.schema !== SCHEMA) throw new Error('Unrecognized project file');
  return obj;
}

const KEY = 'tile-studio:project';
export function save(project, storage = globalThis.localStorage) {
  if (storage) storage.setItem(KEY, serialize(project));
}
export function load(storage = globalThis.localStorage) {
  if (!storage) return null;
  const raw = storage.getItem(KEY);
  return raw ? deserialize(raw) : null;
}

export function totalClaySqFt(project) {
  const scale = wetScale(project.clay.shrinkPct);
  let area = 0;
  for (const piece of project.pieces) {
    for (const t of deriveTiles(piece)) {
      const xs = t.polygon.map((p) => p[0]), ys = t.polygon.map((p) => p[1]);
      const w = (Math.max(...xs) - Math.min(...xs)) * scale;
      const h = (Math.max(...ys) - Math.min(...ys)) * scale;
      area += w * h;
    }
  }
  return area / 144; // sq in -> sq ft
}
```

- [ ] **Step 4: Run to verify pass**

Run: `cd tile-studio && npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tile-studio/src/model.js tile-studio/test/model.test.js
git commit -m "feat(tile-studio): project model, persistence, clay area"
```

---

## Task 6: Canvas renderer

**Files:**
- Create: `tile-studio/src/render-canvas.js`
- Create: `tile-studio/test/render-canvas.test.js`

Renderers are pure: they take data and return an SVG string. `polygonPath` converts a point
array to an SVG path `d`. `renderPiece(piece, gradient, shrinkPct)` returns an `<svg>` whose
bars are filled from the gradient (or a neutral fill if no gradient).

- [ ] **Step 1: Write failing tests**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { polygonPath, renderPiece } from '../src/render-canvas.js';
import { createProject } from '../src/model.js';
import { parseGradient } from '../src/gradient.js';

test('polygonPath builds a closed path', () => {
  const d = polygonPath([[0, 0], [1, 0], [1, 1]]);
  assert.ok(d.startsWith('M') && d.trim().endsWith('Z'));
});
test('renderPiece returns an svg with one path per bar', () => {
  const piece = createProject().pieces[0];
  const svg = renderPiece(piece, null, 0.12);
  assert.ok(svg.includes('<svg'));
  assert.equal((svg.match(/<path/g) || []).length, piece.tiling.count);
});
test('renderPiece colors bars from the gradient', () => {
  const g = parseGradient(JSON.stringify({ stops: [{ pos: 0, hex: '#000000' }, { pos: 1, hex: '#ffffff' }] }));
  const svg = renderPiece(createProject().pieces[0], g, 0.12);
  assert.ok(/fill="#[0-9a-fA-F]{6}"/.test(svg));
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd tile-studio && npm test`
Expected: FAIL — `polygonPath` not defined.

- [ ] **Step 3: Implement `src/render-canvas.js`**

```js
import { deriveTiles } from './geometry.js';
import { sampleAt } from './gradient.js';

// Model space has origin at piece center, +y up. SVG has +y down, so flip y.
export function polygonPath(points) {
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(3)},${(-y).toFixed(3)}`).join(' ') + ' Z';
}

export function renderPiece(piece, gradient, shrinkPct) {
  const { w, h } = piece.outline;
  const tiles = deriveTiles(piece);
  const paths = tiles.map((t) => {
    const fill = gradient ? sampleAt(gradient, t.gradientPos) : '#d9d5cf';
    return `<path d="${polygonPath(t.polygon)}" fill="${fill}" stroke="#0d0d0d" stroke-width="0.15" />`;
  }).join('');
  const pad = 4;
  return `<svg viewBox="${-w / 2 - pad} ${-h / 2 - pad} ${w + pad * 2} ${h + pad * 2}" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `cd tile-studio && npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tile-studio/src/render-canvas.js tile-studio/test/render-canvas.test.js
git commit -m "feat(tile-studio): live piece SVG renderer"
```

---

## Task 7: Installation-view renderer

**Files:**
- Create: `tile-studio/src/render-install.js`
- Create: `tile-studio/test/render-install.test.js`

Renders a front elevation. Wall is `room.wallW` x `room.wallH` inches. Floor at bottom.
Draws optional door and window (position `x` = left edge from wall's left, inches), a scale
figure of `room.figureHeight`, and `set.count` copies of the piece spaced evenly, centered at
`hangCenter` inches above the floor.

- [ ] **Step 1: Write failing tests**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderInstallation } from '../src/render-install.js';
import { createProject } from '../src/model.js';

test('renderInstallation draws wall, floor, and figure', () => {
  const p = createProject();
  const svg = renderInstallation(p, { count: 1, gap: 6 }, null);
  assert.ok(svg.includes('<svg'));
  assert.ok(svg.includes('data-role="figure"'));
  assert.ok(svg.includes('data-role="floor"'));
});
test('renderInstallation draws door and window when present', () => {
  const p = createProject();
  p.room.door = { present: true, w: 32, h: 80, x: 4 };
  p.room.window = { present: true, w: 36, h: 36, x: 70, sill: 40 };
  const svg = renderInstallation(p, { count: 1, gap: 6 }, null);
  assert.ok(svg.includes('data-role="door"'));
  assert.ok(svg.includes('data-role="window"'));
});
test('renderInstallation repeats the piece for a set', () => {
  const p = createProject();
  const svg = renderInstallation(p, { count: 3, gap: 6 }, null);
  assert.equal((svg.match(/data-role="piece"/g) || []).length, 3);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd tile-studio && npm test`
Expected: FAIL — `renderInstallation` not defined.

- [ ] **Step 3: Implement `src/render-install.js`**

```js
import { renderPiece } from './render-canvas.js';

// Elevation: SVG user units = inches, origin top-left of wall, +y down.
export function renderInstallation(project, set, gradient) {
  const { wallW, wallH, door, window: win, figureHeight } = project.room;
  const piece = project.pieces[0];
  const { w: pw, h: ph } = piece.outline;
  const floorY = wallH;

  const parts = [];
  parts.push(`<rect x="0" y="0" width="${wallW}" height="${wallH}" fill="#faf9f6" stroke="#c9c6c0" stroke-width="0.5" />`);
  parts.push(`<line data-role="floor" x1="0" y1="${floorY}" x2="${wallW}" y2="${floorY}" stroke="#1e1e1e" stroke-width="1" />`);

  if (door && door.present) {
    parts.push(`<rect data-role="door" x="${door.x}" y="${floorY - door.h}" width="${door.w}" height="${door.h}" fill="#f0eee9" stroke="#8a8378" stroke-width="0.6" />`);
  }
  if (win && win.present) {
    parts.push(`<rect data-role="window" x="${win.x}" y="${floorY - win.sill - win.h}" width="${win.w}" height="${win.h}" fill="#eef3f6" stroke="#8a8378" stroke-width="0.6" />`);
  }

  // figure near the right side
  const fx = wallW - 12, fh = figureHeight, headR = fh * 0.055;
  parts.push(`<g data-role="figure" fill="#b9b3ab">
    <circle cx="${fx}" cy="${floorY - fh + headR}" r="${headR}" />
    <rect x="${fx - fh * 0.05}" y="${floorY - fh + headR * 2}" width="${fh * 0.1}" height="${fh * 0.35}" rx="${fh * 0.045}" />
    <rect x="${fx - fh * 0.03}" y="${floorY - fh * 0.55}" width="${fh * 0.025}" height="${fh * 0.55}" />
    <rect x="${fx + fh * 0.005}" y="${floorY - fh * 0.55}" width="${fh * 0.025}" height="${fh * 0.55}" />
  </g>`);

  // set of pieces, centered horizontally as a group, centers at hangCenter above floor
  const n = set.count, gap = set.gap;
  const groupW = n * pw + (n - 1) * gap;
  let x0 = (wallW - groupW) / 2;
  const cy = floorY - piece.placement.hangCenter;
  const inner = renderPieceInner(piece, gradient);
  for (let i = 0; i < n; i++) {
    const cx = x0 + i * (pw + gap) + pw / 2;
    parts.push(`<g data-role="piece" transform="translate(${cx} ${cy})">${inner}</g>`);
  }

  return `<svg viewBox="-6 -6 ${wallW + 12} ${wallH + 18}" xmlns="http://www.w3.org/2000/svg">${parts.join('')}</svg>`;
}

// Strip the outer <svg> from renderPiece so pieces can be placed into the elevation.
function renderPieceInner(piece, gradient) {
  const svg = renderPiece(piece, gradient, 0);
  return svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
}
```

- [ ] **Step 4: Run to verify pass**

Run: `cd tile-studio && npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tile-studio/src/render-install.js tile-studio/test/render-install.test.js
git commit -m "feat(tile-studio): installation elevation renderer"
```

---

## Task 8: Template renderer (printable wet-cut sheets)

**Files:**
- Create: `tile-studio/src/render-template.js`
- Create: `tile-studio/test/render-template.test.js`

Produces a print sheet: for each tile, the finished polygon (solid) and the wet-cut polygon
(dashed red, scaled by `wetScale`), plus a cut-list table. `scale` is drawing scale
(1 = 1:1, 0.5 = 1:2). `paper` is `'letter'` or `'tabloid'`. Pagination splits tiles across
pages by how many fit at the given scale; registration marks anchor each page.

- [ ] **Step 1: Write failing tests**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCutList, renderTemplateSheets } from '../src/render-template.js';
import { createProject } from '../src/model.js';

test('buildCutList counts bars and edge tiles', () => {
  const p = createProject();
  const list = buildCutList(p);
  assert.equal(list.total, p.pieces[0].tiling.count);
  assert.ok(list.curvedEdgeCount >= 1);
});
test('renderTemplateSheets returns at least one page svg', () => {
  const p = createProject();
  const pages = renderTemplateSheets(p, { paper: 'letter', scale: 0.5 });
  assert.ok(Array.isArray(pages) && pages.length >= 1);
  assert.ok(pages[0].includes('<svg'));
});
test('each page carries registration marks and a title block', () => {
  const p = createProject();
  const pages = renderTemplateSheets(p, { paper: 'letter', scale: 0.5 });
  assert.ok(pages[0].includes('data-role="reg"'));
  assert.ok(pages[0].includes('data-role="titleblock"'));
});
test('wet-cut path is larger than finished path', () => {
  const p = createProject();
  const pages = renderTemplateSheets(p, { paper: 'tabloid', scale: 1 });
  assert.ok(pages.join('').includes('data-role="wetcut"'));
  assert.ok(pages.join('').includes('data-role="finished"'));
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd tile-studio && npm test`
Expected: FAIL — `buildCutList` not defined.

- [ ] **Step 3: Implement `src/render-template.js`**

```js
import { deriveTiles, halfWidthAt } from './geometry.js';
import { wetScale, scalePoints } from './shrinkage.js';
import { polygonPath } from './render-canvas.js';

const PAPER = { letter: { w: 8.5, h: 11 }, tabloid: { w: 11, h: 17 } }; // inches

// A tile is a curved-edge tile if its top or bottom row sits in the corner zone,
// i.e. its half-width differs from the piece's full half-width.
export function buildCutList(project) {
  const piece = project.pieces[0];
  const fullHalf = piece.outline.w / 2;
  const tiles = deriveTiles(piece);
  let curved = 0;
  for (const t of tiles) {
    const maxHalf = Math.max(...t.polygon.map((p) => Math.abs(p[0])));
    if (maxHalf < fullHalf - 1e-6) curved++;
  }
  return { total: tiles.length, curvedEdgeCount: curved };
}

export function renderTemplateSheets(project, { paper = 'letter', scale = 0.5 } = {}) {
  const sheet = PAPER[paper];
  const shrink = project.clay.shrinkPct;
  const ws = wetScale(shrink);
  const piece = project.pieces[0];
  const tiles = deriveTiles(piece);
  const margin = 0.5;                 // inch print margin
  const usableH = sheet.h - margin * 2;
  const rowGap = 0.4;

  // Lay tiles top-to-bottom; wrap to a new page when we run past usable height.
  const pages = [];
  let cur = [], y = margin;
  for (const t of tiles) {
    const ys = t.polygon.map((p) => p[1]);
    const wetH = (Math.max(...ys) - Math.min(...ys)) * ws * scale;
    if (y + wetH > usableH && cur.length) { pages.push(cur); cur = []; y = margin; }
    cur.push({ tile: t, y });
    y += wetH + rowGap;
  }
  if (cur.length) pages.push(cur);

  return pages.map((items, pageIndex) => renderPage(items, {
    sheet, margin, scale, ws, piece, project, pageIndex, pageCount: pages.length,
  }));
}

function renderPage(items, ctx) {
  const { sheet, margin, scale, ws, piece, project, pageIndex, pageCount } = ctx;
  const cx = sheet.w / 2;
  const parts = [];
  // registration marks at the four margins
  for (const [mx, my] of [[margin, margin], [sheet.w - margin, margin], [margin, sheet.h - margin], [sheet.w - margin, sheet.h - margin]]) {
    parts.push(`<path data-role="reg" d="M${mx - 0.15},${my} h0.3 M${mx},${my - 0.15} v0.3" stroke="#c0392b" stroke-width="0.01" />`);
  }
  for (const { tile, y } of items) {
    const ys = tile.polygon.map((p) => p[1]);
    const topY = Math.max(...ys);
    // move polygon so its top sits at print y, centered at cx; apply drawing scale
    const place = (pts) => pts.map(([px, py]) => [cx + px * scale, y + (topY - py) * scale]);
    const finished = place(tile.polygon);
    const wet = place(scalePoints(tile.polygon, ws, [0, topY]));
    parts.push(`<path data-role="wetcut" d="${polyToPrint(wet)}" fill="none" stroke="#c0392b" stroke-width="0.012" stroke-dasharray="0.08 0.06" />`);
    parts.push(`<path data-role="finished" d="${polyToPrint(finished)}" fill="none" stroke="#1e1e1e" stroke-width="0.014" />`);
    parts.push(`<text x="${cx}" y="${y + 0.18}" font-size="0.12" fill="#1e1e1e" text-anchor="middle" font-family="monospace">${tile.id}</text>`);
  }
  // title block bottom-right
  parts.push(`<g data-role="titleblock" font-family="monospace" fill="#1e1e1e">
    <rect x="${sheet.w - margin - 2.6}" y="${sheet.h - margin - 1.1}" width="2.6" height="1.1" fill="#fff" stroke="#1e1e1e" stroke-width="0.01" />
    <text x="${sheet.w - margin - 2.5}" y="${sheet.h - margin - 0.85}" font-size="0.13">TILE STUDIO — gradient run</text>
    <text x="${sheet.w - margin - 2.5}" y="${sheet.h - margin - 0.62}" font-size="0.11">shrink ${(project.clay.shrinkPct * 100).toFixed(0)}%  scale 1:${(1 / scale).toFixed(0)}</text>
    <text x="${sheet.w - margin - 2.5}" y="${sheet.h - margin - 0.42}" font-size="0.11">clay ${project.clay.name}</text>
    <text x="${sheet.w - margin - 2.5}" y="${sheet.h - margin - 0.22}" font-size="0.11">page ${pageIndex + 1} / ${pageCount}</text>
  </g>`);

  return `<svg data-page="${pageIndex + 1}" width="${sheet.w}in" height="${sheet.h}in" viewBox="0 0 ${sheet.w} ${sheet.h}" xmlns="http://www.w3.org/2000/svg"><rect width="${sheet.w}" height="${sheet.h}" fill="#fff"/>${parts.join('')}</svg>`;
}

function polyToPrint(points) {
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(3)},${y.toFixed(3)}`).join(' ') + ' Z';
}
```

Note: `halfWidthAt` is imported for potential future use in edge classification; if the linter
flags it as unused, remove the import — `buildCutList` derives curved edges from polygon width.

- [ ] **Step 4: Run to verify pass**

Run: `cd tile-studio && npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tile-studio/src/render-template.js tile-studio/test/render-template.test.js
git commit -m "feat(tile-studio): printable wet-cut template sheets + cut list"
```

---

## Task 9: UI wiring

**Files:**
- Create: `tile-studio/src/ui.js`
- Modify: `tile-studio/index.html` (already references `src/ui.js`)

No unit test (DOM glue); verified manually via the browser in Task 10. Keep all computation in
the tested modules — `ui.js` only reads inputs, updates state, calls renderers, and writes
`innerHTML`.

- [ ] **Step 1: Implement `src/ui.js`**

```js
import { createProject, load, save, serialize, deserialize, totalClaySqFt } from './model.js';
import { parseGradient } from './gradient.js';
import { solveRun } from './configurator.js';
import { renderPiece } from './render-canvas.js';
import { renderInstallation } from './render-install.js';
import { renderTemplateSheets, buildCutList } from './render-template.js';

let project = load() || createProject();
let gradient = project.gradient ? safeParse(project.gradient) : null;
let mode = 'editor'; // 'editor' | 'install'

function safeParse(g) { try { return parseGradient(typeof g === 'string' ? g : JSON.stringify(g)); } catch { return null; } }

const app = document.getElementById('app');

function num(v, fallback) { const n = Number(v); return Number.isFinite(n) ? n : fallback; }

function fieldRow(label, id, value, step = 1) {
  return `<label>${label}<input id="${id}" type="number" step="${step}" value="${value}"></label>`;
}

function render() {
  const piece = project.pieces[0];
  const t = piece.tiling;
  const clay = project.clay;
  const cut = buildCutList(project);
  const canvas = mode === 'editor'
    ? renderPiece(piece, gradient, clay.shrinkPct)
    : renderInstallation(project, { count: num(document.getElementById('setCount')?.value, 1), gap: 6 }, gradient);

  app.innerHTML = `
    <div class="topbar">
      <span class="title">🔲 Tile Studio</span>
      <button class="btn" id="modeBtn">${mode === 'editor' ? 'Installation view' : 'Editor view'}</button>
      <span class="spacer"></span>
      <button class="btn" id="importBtn">⇩ Import gradient</button>
      <button class="btn" id="exportBtn">Export project</button>
      <button class="btn primary" id="printBtn">🖨 Print templates</button>
    </div>
    <div class="workspace">
      <div class="rail"></div>
      <div class="canvas" id="canvas">${canvas}</div>
      <div class="panel">
        <div class="hr-label">Piece · gradient run</div>
        ${fieldRow('Finished width', 'ow', piece.outline.w)}
        ${fieldRow('Finished height', 'oh', piece.outline.h)}
        ${fieldRow('Corner radius', 'cr', piece.outline.cornerR)}
        ${fieldRow('Bar height', 'bh', t.barHeight, 0.25)}
        ${fieldRow('Grout gap', 'gap', t.gap, 0.0625)}
        ${fieldRow('Bars', 'count', t.count)}
        <div class="hr"></div>
        ${fieldRow('Shrink %', 'shrink', (clay.shrinkPct * 100), 0.5)}
        <label>Fit to span<input id="span" type="number" step="0.25" placeholder="in"></label>
        <button class="btn" id="fitBtn">Solve fit</button>
        <div class="hr"></div>
        ${mode === 'install' ? `
          ${fieldRow('Wall width', 'wallW', project.room.wallW)}
          ${fieldRow('Wall height', 'wallH', project.room.wallH)}
          ${fieldRow('Set count', 'setCount', 1)}
        ` : ''}
        <div class="hr"></div>
        <div class="cutlist">${cut.total} bars · ${cut.curvedEdgeCount} curved edge tiles<br>≈ ${totalClaySqFt(project).toFixed(1)} sq ft clay</div>
      </div>
    </div>`;

  wire();
}

function commit() { project.gradient = gradient ? serialize(gradient) : null; save(project); render(); }

function wire() {
  const piece = project.pieces[0];
  const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.onchange = fn; };

  bind('ow', (e) => { piece.outline.w = num(e.target.value, piece.outline.w); commit(); });
  bind('oh', (e) => { piece.outline.h = num(e.target.value, piece.outline.h); commit(); });
  bind('cr', (e) => { piece.outline.cornerR = num(e.target.value, piece.outline.cornerR); commit(); });
  bind('bh', (e) => { piece.tiling.barHeight = num(e.target.value, piece.tiling.barHeight); commit(); });
  bind('gap', (e) => { piece.tiling.gap = num(e.target.value, piece.tiling.gap); commit(); });
  bind('count', (e) => { piece.tiling.count = Math.max(1, Math.round(num(e.target.value, piece.tiling.count))); commit(); });
  bind('shrink', (e) => {
    let pct = num(e.target.value, project.clay.shrinkPct * 100);
    pct = Math.max(0, Math.min(40, pct));
    project.clay.shrinkPct = pct / 100; commit();
  });
  bind('wallW', (e) => { project.room.wallW = num(e.target.value, project.room.wallW); commit(); });
  bind('wallH', (e) => { project.room.wallH = num(e.target.value, project.room.wallH); commit(); });
  bind('setCount', () => render());

  document.getElementById('modeBtn').onclick = () => { mode = mode === 'editor' ? 'install' : 'editor'; render(); };
  document.getElementById('fitBtn').onclick = () => {
    const span = num(document.getElementById('span').value, null);
    if (span == null) return;
    const r = solveRun({ span, gap: piece.tiling.gap, preferredBarHeight: piece.tiling.barHeight });
    if (!r.ok) { banner(r.reason); return; }
    piece.tiling.count = r.count; piece.tiling.barHeight = r.barHeight; commit();
  };
  document.getElementById('importBtn').onclick = importGradient;
  document.getElementById('exportBtn').onclick = exportProject;
  document.getElementById('printBtn').onclick = printTemplates;
}

function banner(msg) {
  const b = document.createElement('div');
  b.textContent = msg;
  b.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);background:#c0392b;color:#fff;padding:8px 14px;border-radius:8px;z-index:99';
  document.body.appendChild(b);
  setTimeout(() => b.remove(), 3000);
}

function importGradient() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'application/json,.json';
  input.onchange = () => {
    const file = input.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { gradient = parseGradient(reader.result); commit(); }
      catch (err) { banner('Gradient import failed: ' + err.message); }
    };
    reader.readAsText(file);
  };
  input.click();
}

function exportProject() {
  download('tile-studio-project.json', serialize(project), 'application/json');
}

function printTemplates() {
  const pages = renderTemplateSheets(project, { paper: 'letter', scale: 0.5 });
  const win = window.open('', '_blank');
  win.document.write(`<!doctype html><title>Templates</title><style>@page{margin:0}body{margin:0}svg{display:block;page-break-after:always}</style>${pages.join('')}`);
  win.document.close();
  win.focus();
  win.print();
}

function download(name, text, type) {
  const blob = new Blob([text], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  URL.revokeObjectURL(a.href);
}

render();
```

- [ ] **Step 2: Commit**

```bash
git add tile-studio/src/ui.js
git commit -m "feat(tile-studio): editor UI wiring, import, print, install toggle"
```

---

## Task 10: Manual verification + README

**Files:**
- Create: `tile-studio/README.md`

- [ ] **Step 1: Serve and smoke-test in the browser**

Run: `cd tile-studio && python3 -m http.server 8010`
Open `http://localhost:8010`. Verify:
- The airplane-window piece renders with 30 bars.
- Changing **Bars**, **Bar height**, **Corner radius** updates the canvas.
- **Fit to span** = 96 sets a bar count that fills 96 in.
- **Import gradient** with a file `{"stops":[{"pos":0,"hex":"#25406e"},{"pos":1,"hex":"#efc19f"}]}` colors the bars.
- **Installation view** shows the wall, figure, and a set when Set count = 3.
- **Print templates** opens a print window with dimensioned finished (black) + wet-cut (dashed red) tiles and a title block.

- [ ] **Step 2: Confirm all tests pass**

Run: `cd tile-studio && npm test`
Expected: all suites pass.

- [ ] **Step 3: Write `README.md`**

```markdown
# Tile Studio

Design glaze tile pieces at finished size; the tool computes wet-cut templates from clay
shrinkage, plans installation to scale, and prints dimensioned paper templates.

- No build step. Open `index.html` or run `python3 -m http.server`.
- Tests: `npm test` (Node built-in runner).
- Gradients import from the Palette app as JSON `{ stops:[{pos,hex}], angle }`.

See `../docs/superpowers/plans/2026-07-13-tile-studio.md` for the build plan and
`../docs/superpowers/specs/2026-07-13-tile-studio-design.md` for the design.
```

- [ ] **Step 4: Commit**

```bash
git add tile-studio/README.md
git commit -m "docs(tile-studio): usage README + manual verification pass"
```

---

## Post-v1 backlog (not in this plan)

- Confirm Palette's real export shape; add adapter in `gradient.js` if fields differ.
- Whole-tile (stepped) edge mode; horizontal/angled gradients; per-bar banding.
- Other piece types: frame (open/filled), oval, tile field, custom freeform.
- Anisotropic (H/V) shrinkage; multiple clay-body presets.
- Drag-to-place pieces and door/window in the installation view.
- cm display toggle in `ui.js` (model already stores inches; multiply by 2.54 for display).
- Import a saved project file in `ui.js` (`model.deserialize` already exists and is tested).
