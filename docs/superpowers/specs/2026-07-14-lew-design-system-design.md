# Lew Design System (LDS) — Design Spec

**Date:** 2026-07-14
**Status:** Draft for review
**Owner:** Matthew Lew

---

## Problem

Matthew has ~12 repos under `github.com/matthewlew` — a mix of static HTML sites
(`tote`, `scentmap`, `waypoint`, `ping`, `one-token`), TS/React apps (`palette`,
`tripblend`, `pickleball-booker`), and JS apps (`subway`, `bklynclay-glaze`,
`volleyball-rotation`). Each reinvents its own buttons, cards, and color logic.
Nothing is shared, so nothing feels like one body of work.

**Goal:** one shared component system every repo consumes, themed per project so
each keeps its own identity. Build a component once; re-skin it per project by
loading a theme file. No per-project rebuilds.

## Non-goals (v1)

- Migrating palette's real React components (follow-up).
- Retrofitting the portfolio pages (follow-up).
- React/Vue component wrappers (follow-up; CSS layer works in all of them today).
- A Style Dictionary build pipeline (documented as a future path; v1 is hand-authored CSS).
- Components beyond the Foundation set (Table, Tabs, Toast, Select, etc. — later).

## Foundation (decided)

- **Format:** framework-agnostic CSS + custom properties. No build step for consumers.
- **Color engine:** built on the existing `one-token` methodology (seven object roles
  resolved by `mode × hue × emphasis` container classes). LDS extends it past color.
- **Distribution:** a new **public** repo → GitHub Pages docs/gallery site + jsDelivr CDN.
- **Inspiration + migration target:** `palette` (its ghost-chip buttons, glass surfaces,
  toast/drawer/modal patterns) informs the aesthetic and will migrate into LDS later.

## Architecture — four token layers

| Layer | Contents | Source |
|---|---|---|
| 1 · Primitives | Grey scale + brand hue scales (50–950); `--space-*`, `--size-*` (type), `--radius-*`, `--weight-*`, `--ease-*`, `--dur-*` | one-token palettes, extended |
| 2 · Semantics | one-token's 7 color roles (`--background`, `--text`, `--text-accent`, `--text-subdued`, `--icon`, `--border`, `--border-subdued` + derived `--bg-hover/pressed`) **plus** `--font-display/body/mono`, `--radius`, `--card-shadow`, `--btn-shadow`, density | one-token engine + new non-color tokens |
| 3 · Components | Foundation set — reference only Layer 2 | new |
| 4 · Project themes | Per-repo file setting the six knobs (below) | new, one per repo |

Components never touch Layer 1 or raw values. Themes only touch Layer 1 primitives
and the six knobs. This boundary is the whole system.

## Theming — two axes (both kept)

1. **Runtime** (one-token): `.mode-{light,dark}` × `.hue-{brand,red,yellow,blue,grey}`
   × `.emph-{plain,soft,strong,stark}` classes on any container. Swaps dark mode,
   error surfaces, promo sections in-page.
2. **Project** (new): a `.theme-<name>` root class / theme file sets the personality.
   This is what makes portfolio ≠ palette. Scoped by class so multiple themes can
   coexist on one page (used by the docs gallery).

## The six themeable knobs (decided — keep all six)

1. **Brand hue** — one hex → an 11-step scale, feeds all seven color roles.
2. **Typography** — display / body / mono families. Biggest personality lever.
3. **Radius** — corner scale: sharp `0`, product `10px`, pill `999px`.
4. **Shadow / surface** — flat / soft-elevated / glass.
5. **Density** — spacing multiplier (compact ↔ airy).
6. **Default mode** — light or dark starting point (both always available at runtime).

**Fixed on purpose:** component structure, spacing rhythm, the seven color roles,
accessibility (WCAG AA) rules, interaction states.

## Look-and-feel decisions (decided)

- **Buttons:** ship `fill`, `outline`, `ghost` as variants. **Outline is the default**;
  **fill** for the single primary CTA per screen; **ghost** for tertiary/chrome.
  The theme sets the default (portfolio→outline, palette→ghost, product→fill).
  Never more than one fill per screen.
- **Surface:** **simple core** (flat, real 1px borders, no blur) is the default across
  all repos. **Glass is an opt-in** `--surface-glass` recipe that image-forward
  projects (palette) adopt. No blur cost where it isn't used.

## Foundation component set (v1)

Each references only Layer 2 semantics + knobs.

1. **Button** — variants fill / outline / ghost; sizes sm/md; states hover/active/disabled (derived, never hand-written).
2. **Card** — surface, border, radius, optional shadow; label / title / body / divider / meta slots.
3. **Field / Input** — label + input + focus ring from `--text-accent`.
4. **Badge / Tag** — hue-tinted pill, radius from `--pill`.
5. **Banner** — one-token semantic banners: success / error / warning / info.
6. **Nav / Header** — logo + links + action, flat or elevated per theme.
7. **Modal / Dialog** — overlay + panel using surface/shadow knobs.

## Iconography (universal icon set — decided)

One shared icon set, built into the system — no per-project icons.

- **Canonical system:** the `open-icons` parametric foundry is the LDS icon standard.
  Its rules carry over unchanged: 24px grid; a 3-weight axis — **Light (stroke 1.0) /
  Regular (1.5) / Bold (2.0)**; and Generic / Product / Custom / Deprecated governance.
- **v1 payload:** ship `open-icons`' 15 signature glyphs (Files, Actions, Nav, Status,
  Forms, Media). These are the identity icons.
- **Coverage source:** **Phosphor (MIT)** is the sanctioned well to expand from. Its
  thin/regular/bold weights map onto Light/Regular/Bold; any glyph pulled in is
  normalized to the 24px grid and stroke before shipping. Phosphor is a source, not a
  co-equal set — everything ends up on the open-icons contract.
- **Delivery:** one `dist/icons.svg` sprite on the CDN. Icons are inline SVG using
  `stroke: currentColor`, so color inherits `--icon` (an existing One Token role) with
  zero per-icon styling.
  ```html
  <svg class="lds-icon"><use href="…/dist/icons.svg#search"/></svg>
  ```
  ```css
  .lds-icon{ width:var(--icon-size,20px); height:var(--icon-size,20px);
             color:var(--icon); stroke-width:var(--icon-weight,1.5); }
  ```
- **Theming:** icon **color** flows from `--icon`; `--icon-size` and `--icon-weight`
  are theme vars that align icon stroke to the theme's type weight
  (Portfolio→Regular, bold Product→Bold). This does **not** add a seventh knob — the
  set is universal and shared; only size/weight track the theme.
- **Machine-readable governance:** `dist/icons.json` carries each icon's name, category,
  scope (generic/product/custom/deprecated), and `hasFill` — usable by humans and agents,
  consistent with the "machine-readable design system" thesis.

## Repo shape

```
lew-design-system/            (new public repo)
  dist/
    lds.css                   core: primitives + semantics + components
    lds.min.css
    icons.svg                 universal icon sprite (open-icons set, currentColor)
    icons.json                machine-readable icon governance (name, category, scope)
    themes/
      portfolio.css           red #C8391B · DM Sans · radius 0 · flat · outline
      palette.css             violet #AA3BFF · system-ui · pill/rounded · glass · ghost
      product.css             blue #2563EB · Inter · 10px · soft · fill (reference theme)
      _template.css           blank theme to fork per project
  index.html                  docs + live component gallery (all themes side by side)
  README.md                   install, token reference, theming guide
  tokens/                     W3C DTCG JSON source (future Style Dictionary — documented, not built)
```

## Consumption

```html
<!-- any HTML site: two links, zero build -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/matthewlew/lew-design-system@v1/dist/lds.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/matthewlew/lew-design-system@v1/dist/themes/portfolio.css">
<body class="theme-portfolio mode-light hue-brand emph-plain">
```

TS/Vite apps `import` the same two files. Components use identical class names everywhere.

## Proof-of-concept (ships in v1)

- **Two real themes** — `portfolio` and `palette` — proving the same components render
  as two distinct brands. `product` included as a neutral reference theme.
- **Docs/gallery page** showing the Foundation set under all themes, with an interactive
  theme/mode/emphasis/button switcher (the pitch deck at `docs/lew-design-system/pitch.html`
  is the working prototype of this).

## Accessibility

- All text roles (`--text`, `--text-accent`, `--text-subdued`, `--icon`) meet WCAG AA
  (4.5:1) against `--background`, enforced by the one-token resolution rules.
- Focus rings on all interactive elements. Disabled = opacity 0.38 + `pointer-events:none`.
- Touch targets ≥ 44px on interactive controls.

## Open items for review

- Repo name: `lew-design-system` (proposed). Confirm or change.
- Whether `product` ships as a real third theme in v1 or is deferred.
- Version/tag strategy for the jsDelivr URL (`@v1` tag vs `@main`).
- Phosphor's role: confirmed as an expansion *source* normalized to the open-icons grid,
  not a co-equal set. Flag if you want it a larger presence.

---

*Built on One Token + open-icons · framework-agnostic · "The system is the statement."*
