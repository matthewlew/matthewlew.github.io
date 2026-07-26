# APCA-tuned palette

A light + dark color system for LDS, built on **APCA** (Accessible Perceptual
Contrast Algorithm) instead of WCAG 2.x. Reproduces the Oct 2025 rebrand method:
11 symmetric steps per hue, tuned to a fixed contrast curve, verified — not eyeballed.

**Files:** [`apca-palette.css`](../../design-system/dist/apca-palette.css) ·
verification swatch: [`apca-palette.html`](apca-palette.html) · generator:
`/tmp/claude-501/apca_palette.py`

## The construction

- **11 steps, symmetric.** Step *N* and step *(1000 − N)* mirror around 500
  (50+950, 100+900, 200+800, 300+700, 400+600).
- **Tuned to an APCA curve, not WCAG.** Each step's Lc (lightness contrast) vs
  **white** is solved to hit a fixed target:

  | step | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
  |---|---|---|---|---|---|---|---|---|---|---|---|
  | Lc vs white | 0 | 9 | 17 | 27 | 40 | 57 | **72** | 82 | 91 | 100 | 103 |

- **How.** Each color is placed in OKLCH (even perceptual steps, constant hue),
  chroma muted toward the ends, and its lightness binary-searched until the measured
  APCA hits the target. Every hue lands on the same curve (verified in the swatch).

## Why APCA over WCAG

WCAG 2.x contrast ratio is a simple luminance ratio that misjudges mid-tones and
dark mode. APCA models perceived lightness difference and polarity, so a step that
"passes" actually reads. It reports **Lc 0–106** with published use-case ranges.

> This page is the **how** — the curve, the construction, the ranges. The
> decision itself, what it ruled out, and where WCAG still applies live in
> [`decisions.md`](decisions.md).

## Use-case ranges → which step for what (light mode, text on white)

| APCA | Use | Palette step on white |
|---|---|---|
| Lc 90 | Body text, columns, ≥14px/400 | **step 900** |
| Lc 75 | Min body text ≥18px/400 | step 700–800 |
| **Lc 60** | Content text (not body), 24px/400 or 16px/700 | **step 600 (Lc 72)** clears it |
| **Lc 45** | Large/heavy only — headlines 36px, 24px bold | **step 400 (Lc 40)** ≈ this tier |
| Lc 30 | Placeholder / disabled / solid non-text | step 300 |
| Lc 15 | Invisibility floor — borders, ≥5px non-text | step 200 |

AAA = add Lc 15 to each. So body text at AAA wants ~step 950.

## Light + dark

The scale is one set of values used **both** ways:

- **Light mode** — dark text on light bg (normal polarity). Use high steps for text
  (600–950), low steps for surfaces/borders (50–300).
- **Dark mode** — light text on dark bg (reverse polarity). Flip: low steps (50–400)
  become text, high steps (800–950) become surfaces.

**APCA is intentionally polarity-asymmetric**, so contrast doesn't mirror exactly:
step 600-on-white measures Lc +72, while its complement step 400-on-black measures
about Lc −63. That's expected — the spec gives a separate **Dark Mode Maximum of
Lc −90** for large text. Practically: in dark mode, step your text one notch lighter
than the light-mode complement to match perceived contrast. Always verify with the
swatch / an APCA checker rather than assuming symmetry.

## Hues

`gray`, `gloss-gray` (cool neutral), `red`, `sunset`, `gold`, `yellow`, `pink`,
`green`, `blue`, `sky`. Exposed as `--<hue>-<step>` (e.g. `--red-600`), drop-in
compatible with One Token's `--c-*` (point a `.hue-*` class at any hue's scale).

## Wiring into LDS

Point One Token's brand scale at an APCA hue:
```css
.hue-red { --c-50:var(--red-50); /* … */ --c-600:var(--red-600); --c-950:var(--red-950); }
```
Because the steps are contrast-calibrated, the emphasis resolution (soft/strong/stark)
inherits guaranteed contrast — `emph-strong` text on `--c-500/600` clears Lc 60 by
construction, so buttons and banners are accessible without per-color checking.
