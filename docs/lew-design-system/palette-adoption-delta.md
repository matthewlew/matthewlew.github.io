# Palette ↔ LDS — the delta, the ceiling, and what palette owes back

**Date:** 2026-07-26 · **Scope:** `matthewlew/palette` (React + CSS modules, 3,119 lines of component CSS across 26 modules) against LDS v1 (`design-system/dist/lds.css`, 407 lines, 12 components).

Follows on from [adoption-audit.md](adoption-audit.md), which put palette in "Phase 4 — migrate". This is the measured version of that plan.

---

## The headline

**You can get to 90% on tokens and ~85% on generic chrome. You cannot get to 80–90% of palette's total CSS, and you shouldn't try.**

Measured against actual CSS weight:

| Bucket | Lines | % of CSS | Verdict |
|---|---:|---:|---|
| A — LDS can own outright | 801 | 26% | Swap to `.lds-*` |
| B — LDS tokens + shell, bespoke core | 1,936 | 62% | ~45% of these lines become LDS |
| C — irreducibly app-specific | 382 | 12% | Never LDS |
| **Realistic LDS-owned total** | **~1,672** | **~54%** | |

The gap between "54% of CSS" and "85% of the design system's surface area" is the gradient canvas: `ShapePreviews`, `CanvasHandles`, `SwatchTray`, `FlowEditor`, `TurrellSquare`, `NoiseOverlay`. That is the product. A design system that absorbed it would be a worse design system.

**So: 80–90% is the right target for buttons, search, typography, chips, modals, toasts, and sheets. 54% is the honest number for the whole app, and hitting it is a success.**

---

## The one thing blocking everything

LDS resolves color as `mode × emphasis → seven roles`. Every component reads `var(--background)` and `var(--text)`. That works because LDS assumes **the surface color is known at author time**.

**In palette, the surface is a user-generated gradient. It is not known at author time, and it changes every scroll.**

Palette solves this with runtime-computed ink that LDS has no concept of:

- `src/lib/titleColor.ts` — samples the gradient at the element's normalized (x, y), picks the gradient's *own* stop color with the best contrast against that local backdrop, falls back to white/black, enforces WCAG AA 4.5:1.
- `src/lib/glassTone.ts` — flips chrome tone when OKLCH lightness at that point exceeds 0.72.
- `.ghost-chip` in `index.css` — fill and border are `color-mix(in srgb, currentColor N%, transparent)`, so the whole chip derives from whatever ink was computed.

LDS's nearest offering is `.lds-glass`, a fixed `rgba(255,255,255,.14)` recipe. It is strictly less capable and would fail on light gradients.

**Consequence:** palette's most recognizable chrome — the floating pills over the gradient — cannot adopt LDS today at any percentage. That is 100% of the first screen.

This is the #1 contribution and the #1 blocker, and they are the same item.

> **Update 2026-07-26 — the CSS half of this is now shipped.** `emph-media` is in `dist/lds.css` and
> reproduces `.ghost-chip` exactly; see the contribution section below and [media-role.html](media-role.html).
> What remains is *choosing* the ink (the sampler), which is where WCAG-vs-APCA has to be settled.

---

## What palette should contribute back

Ranked by leverage for *other* projects, not just palette.

### 1. `emph-media` — an adaptive-ink emphasis role (highest value) — ✅ LANDED 2026-07-26

Shipped in `dist/lds.css`; live demo at [media-role.html](media-role.html). The role derives all seven
color roles from `currentColor`, so the consumer owns exactly one decision — the ink — and surface,
border, hover and pressed follow. Mix percentages are palette's shipped `.ghost-chip` values
(10/28/18/24%), and an `emph-media` button now reproduces that recipe **exactly**: verified against
the real `.ghost-chip` CSS, 9 of 10 computed properties identical and both render at 44×44.

Wired into `.lds-btn`, `.lds-tag` and `.lds-chip` (each paints from an explicit emphasis list, so a
new role is inert until added). `.lds-glass` was rewritten to paint the media tokens instead of a
hardcoded white wash — it now adapts to light backdrops, and falls back to the old recipe when used
without `emph-media`. Two additions came out of the work: `.lds-btn--icon` (square at `--target-min`
— palette's chrome is mostly icon-only, and every `.lds-btn` carried label padding), and
`--glass-bg`/`--glass-border` (`.lds-glass` must not read the inherited `--background`, or it turns
opaque white inside any `.emph-plain`).

`.mode-dark` deliberately does **not** flip the role: media chrome is backdrop-relative, not
mode-relative.

**RESOLVED 2026-07-26 — APCA, and the sampler shipped.** `lew-design-system/ink` (LDS v1.1.0)
implements APCA and is verified against the `apca-w3` reference across a 3,456-pair gamut sweep
(exact agreement). Palette migrated off WCAG; measured across all 146 published gradients at the
eight anchors `titleColorAt` is really called with (1,160 samples):

| | old (WCAG) | new (APCA) |
|---|---:|---:|
| mean APCA Lc of chosen ink | 62.9 | **71.3** |
| below the Lc 75 floor | 69.3% | **46.6%** |
| on-brand palette ink retained | 42.6% | **49.3%** |

60.3% of samples got more legible, 23.2% less, 16.6% unchanged — and **all** of the "less legible"
ones still clear the floor (they are cases where on-brand ink beats a max-contrast white knockout,
which is the intended trade). **Zero** samples regressed below the floor.

The residual 46.6% is not a shortfall: it is *exactly* the set of backdrops where no ink of any
colour can reach Lc 75. On mid-tones APCA's body floor is unreachable, so the sampler takes the best
available. It hits the floor in 100% of cases where the floor is physically achievable.

Two findings worth carrying to other consumers:

- **Enforcing the floor naively destroys on-brand ink.** Only ~6% of palette stops clear Lc 75
  outright, so ~94% of labels would collapse to flat white/black. The fix is to walk the chosen
  colour along its OKLCH lightness axis with hue held.
- **That walk needs real gamut mapping.** Per-channel sRGB clamping shifts hue — a vivid pink pushed
  lighter drifted ~29° toward magenta, defeating the point. Backing chroma off until the round-trip
  preserves hue brings worst-case drift to 2.0°.

Still worth knowing: APCA and WCAG disagree on **6 of 21** chart swatches, all mid-tones, with APCA
choosing white where WCAG chooses black. Side-by-side, black reads better on those swatches — so
treat APCA's near-ties (<2 Lc apart) as genuinely undecided rather than a verdict.

Original writeup:


A seventh emphasis that means "I sit on an image or gradient; derive my ink from the backdrop." Every project with photography, video, hero imagery, or album art needs this. `scentmap` and `bklynclay-glaze` both have image-heavy surfaces today.

Ships as: the CSS recipe (`color-mix` off `currentColor`) plus a tiny JS helper for the sampling. The CSS half alone covers most cases if the consumer sets `color`.

**Caveat to resolve first:** palette enforces **WCAG 4.5:1**; LDS standardizes on **APCA Lc** (`dist/apca-palette.css`, `docs/apca-palette.md`). Contributing this means porting the threshold logic to APCA, or LDS accepting a documented dual standard. Do not paper over this — the two disagree in the mid-tones, which is exactly where gradients live.

### 2. Six missing components palette already has working

| LDS gap | Palette source | Lines | Generalizes? |
|---|---|---:|---|
| **Toast / snackbar** | `UndoToast` | 49 | Universal — every app needs undo |
| **Sheet / drawer** | `Drawer`, `EditMode` | 298 | Universal, incl. the responsive bottom-sheet→side-panel flip |
| **Tabs / segmented control** | `TabBar` | 196 | Universal |
| **Search field** | `SearchBar` | 99 | `.lds-field` has no search affordance, icon, or clear |
| **Keyboard hint / `<kbd>`** | `ShortcutHints` | 85 | Any desktop app; palette's is unusually well-built |
| **Tooltip / hint** | `Hint` | 14 | Universal |

That is 741 lines of solved, shipped, tested UI. LDS gets six components; palette deletes six modules. Both sides win.

### 3. A real motion layer

LDS has `--dur-fast: 120ms`, `--dur-base: 180ms`, one easing. Palette runs a considerably more developed system: a 320ms `cubic-bezier(0.22, 1, 0.36, 1)` deceleration curve applied consistently across view-transition groups, sheet slide up/down, and the responsive slide-in-right — with a documented reason (mismatched easing between the card resize and the sheet slide "reads as jank even at full frame rate").

LDS should absorb `--dur-slow`, the deceleration curve, and the view-transition group conventions. Motion is the most commonly re-invented thing across the eight static sites in the audit.

### 4. Elevation + touch-target tokens

Palette layers a lot of floating chrome and standardizes on 44px touch targets. LDS has a `--density` multiplier but no `--target-min` and no z-index scale. Both are cheap to add and prevent every consumer from inventing their own.

---

## What's weak in LDS *for palette specifically*

1. ~~**No adaptive-ink role.**~~ **MOSTLY FIXED 2026-07-26** — `emph-media` shipped; only the ink sampler (and the contrast-standard call behind it) is outstanding. Covered above.
2. **Light-default, dark-opt-in.** LDS resolves light in `:root` and needs `.mode-dark` to flip. Palette is dark-native (`GALLERY_SURFACE = #101014`). Workable — put `mode-dark` on `<html>` — but every LDS default is the wrong way round, so palette pays a specificity tax on every component. LDS should support a theme declaring its base mode.
3. ~~**Type scale is off by one step.**~~ **FIXED 2026-07-26.** Palette's workhorse is **13px** (25 uses) with 11px captions (13 uses); the theme mapped body→`--size-3` (14px) and caption→`--size-1` (12px), so adopting as-written would have silently restyled the whole app one step larger. `theme-palette` now maps body→`--size-2` and caption→`--size-0`.
4. ~~**`theme-palette` is purple; palette is chromeless.**~~ **FIXED 2026-07-26.** The theme shipped a violet `--c-*` ramp that would compete with every artwork on screen. It is now a cool neutral ramp — and not an invented one: converting palette's 19 ad-hoc CSS colors to OKLCH shows they land on the *same lightness steps as the LDS grey ramp*, at hue ≈285 with ~0.02 chroma. So the new ramp is the LDS grey ramp rotated onto palette's measured hue, with six of eleven steps snapped to hexes palette already ships (`#E5E4E7`, `#8D8894`, `#6B6375`, `#2E303A`, `#1C1A20`, `#101014`). Every emphasis pair LDS resolves from it clears WCAG AA 4.5:1 — checked, not eyeballed; the tightest is `emph-strong` at 5.73:1.
5. **Governance contradicts the product.** `lds-dos-and-donts.md` says "Don't add shadows or gradients-as-decoration. It breaks the structural language." Palette is a gradient tool with `--card-shadow` and `--btn-shadow` defined in its own LDS theme. The rule needs an explicit carve-out for media-forward products, or it will be ignored — and a rule that gets ignored erodes the rest.
6. ~~**Distribution doesn't fit a bundled app.**~~ **FIXED 2026-07-26.** The audit proposed a `<link>` from jsDelivr; palette is Vite + CSS modules, so that meant an unversioned network dependency in the critical path and no bundler involvement at all. LDS is now an npm package — manifest at the repo root, `exports` mapping into `design-system/dist`, installable straight from GitHub with no registry and no hosting cost:

   ```
   npm i "github:matthewlew/matthewlew.github.io#v1.0.0"
   ```

   Packs to 14.4 kB / 10 files (verified with `npm pack`); all seven export subpaths resolve (verified against a real install). Pin the tag — a bare `github:` spec tracks `main` at install time, which reintroduces the drift this was meant to remove.
7. **No React bindings.** Not required — global classes work — but palette loses type safety and composition. Worth deciding deliberately rather than by default.

---

## Sequenced plan

**Gate 0 — unblock (LDS side). ✅ DONE 2026-07-26.** LDS ships as an npm package (root `package.json`, `exports` into `design-system/dist`, installable from GitHub). `theme-palette` rewritten to the measured neutral ramp with corrected 13px/11px type. Three tokens added to core along the way, all purely additive: `--dur-slow` + `--ease-decelerate` (palette's deceleration curve, contribution #3), `--radius-xl` (16px — the one step of palette's radius distribution LDS lacked), and `--target-min` (contribution #4). Verified in the browser: every stylesheet parses, the theme resolves `--text-body: 13px` / `--text-caption: 11px`, and the emphasis surfaces render neutral rather than violet.

**Pass A — tokens (palette side, ~half a day, low risk).** Replace `src/index.css`'s ad-hoc vars with LDS roles. Palette only references 14 unique custom properties and uses `var()` 83 times, so the surface is small. Real debt to retire: **73 raw hex occurrences (9 unique) and 184 `rgba()` literals** across the modules, plus **12 distinct border-radius values** collapsing to LDS's four. Biggest consistency win available, nothing structural changes.

**Pass B — adaptive ink (joint). ✅ DONE 2026-07-26.** `emph-media` landed, wired into button/tag/chip, demoed, and verified to reproduce `.ghost-chip` exactly. WCAG-vs-APCA resolved in favour of **APCA**; `lew-design-system/ink` shipped in v1.1.0 and palette migrated onto it with measured results (above). What remains is cosmetic rather than blocking: porting palette's `.ghost-chip` *markup* onto the role, which folds naturally into Pass C.

**Pass C — component swap (palette side, ~2 days).** Bucket A: SearchBar, UndoToast, Drawer, GeometryTabs, CollectionsRow, ShortcutHints, Hint, GrainButton, LikeButton, TabBar, BlockStack → `.lds-*`. Contribute the six missing components upward as you go, per the audit's rule that new shared components land in LDS first.

**Pass D — token-only for the rest.** Gallery, ExportModal, SavedBrowser, BoardShare, PaletteTitle, ScrollTicker, GradientPage, EditMode keep their markup and point at LDS tokens.

**Never.** ShapePreviews, CanvasHandles, SwatchTray, FlowEditor, TurrellSquare, NoiseOverlay.

---

## The tradeoff to be honest about

LDS is themable so it can serve eight-plus projects. That generality is what makes it worth having, and it is also why it currently can't express palette's signature surface: a system that assumes a knowable background is a *simpler, better* system for seven of those projects.

The right move is not to bend LDS around palette. It is to add **one new emphasis role** that names the case LDS is missing — surfaces whose color is decided at runtime — and let palette be the proof. If that role is designed for palette alone it will be a wart. If it's designed as "on-media," it pays off for every project that ever puts text on a photo.
