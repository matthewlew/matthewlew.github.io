# LDS Adoption Audit — merging the ecosystem

**Date:** 2026-07-14 · **Goal:** get every repo under `github.com/matthewlew` onto the
same Lew Design System, without rewriting each app from scratch.

---

## What's out there (audited)

Every public repo, grouped by how it's built — because the *build* decides the *adoption path*.

| Repo | Type | Components today | LDS path |
|---|---|---|---|
| **one-token** | Foundation | 7 color roles, mode/hue/emph engine | ✅ **is** LDS's color layer |
| **open-icons** | Foundation | Parametric 24px icon foundry | ✅ **is** LDS's icon set |
| **palette** | React (bespoke CSS modules) | Drawer, ExportModal, Feed, Gallery, BoardShare, TabBar, UndoToast, GrainButton, LikeButton… | Migrate — token-swap, then component-swap |
| **tripblend** | React (**shadcn/ui** + Tailwind) | Full shadcn set (button, card, dialog, drawer, badge, alert…) | Bridge theme — map LDS tokens → shadcn vars |
| **pickleball-booker** | React (TS) | 1 (BookingForm) | Greenfield — build on LDS from the start |
| **scentmap** | Static HTML (multi-page) | Its **own** mini-DS: `design-system.css`, `components.css`, `layout.css` | Reconcile — replace its tokens with LDS |
| **tote / ping / waypoint / bklynclay-glaze** | Static HTML (single page) | Ad-hoc inline styles | Link `lds.css` + theme, adopt `.lds-*` |
| **subway** | Static PWA | `styles.css` | Link + adopt |
| **volleyball-rotation** | Static (multi-page + blog) | `style.css` | Link + adopt |

Private repos (`design-tokens`, `20Q2-Documentation-Website`) not audited — `design-tokens`
is a candidate to become the DTCG source of truth later.

---

## The four adoption paths

### 1. Static HTML sites → *link + adopt* (lowest effort)
`tote`, `ping`, `waypoint`, `subway`, `volleyball-rotation`, `bklynclay-glaze`.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/matthewlew/lew-design-system@v1/dist/lds.css">
<link rel="stylesheet" href="…/themes/_.css">   <!-- pick or fork a theme -->
<body class="theme-x mode-light emph-plain">
```
Then swap hand-rolled markup for `.lds-btn`, `.lds-card`, `.lds-field`, `.lds-banner`, icons via the sprite. Each site keeps its own theme file (its personality) but shares components + the icon set. **~1–2 hrs each.**

### 2. shadcn app (`tripblend`) → *bridge theme* (highest leverage)
Don't rip out shadcn. shadcn already reads CSS variables (`--background`, `--foreground`,
`--primary`, `--border`, `--radius`, `--ring`). Ship **one bridge file** that feeds LDS's
resolved tokens into those names:

```css
/* lds-shadcn-bridge.css — LDS drives shadcn */
.theme-portfolio.mode-light.emph-plain {
  --background: var(--background);      /* already LDS */
  --foreground: var(--text);
  --primary:    var(--c-600);
  --primary-foreground: #fff;
  --muted-foreground: var(--text-subdued);
  --border: var(--border);
  --ring:   var(--text-accent);
  --radius: var(--radius);
}
```
One file re-skins every shadcn component to LDS. No component rewrites. **~half a day**, and it also unlocks dark mode + hue swaps for free. This is the template for any future shadcn/Tailwind app.

### 3. Bespoke React (`palette`) → *migrate in two passes*
palette has no UI library — hand-written CSS-module components. Migrate cheapest-first:

- **Pass A · tokens (do first).** Replace `src/index.css`'s ad-hoc vars (`--text`, `--bg`,
  `--accent`, `--border`, spacing) with LDS's seven roles + theme knobs. Biggest consistency
  win for the least risk; nothing structural changes.
- **Pass B · components.** Swap the generic ones (GrainButton→`.lds-btn`, ExportModal→`.lds-modal`,
  UndoToast→a toast built on LDS tokens) for LDS. Keep the *app-specific* ones (Gallery,
  FlowEditor, SwatchTray) — just point them at LDS tokens. palette is also the **migration
  source**: its Drawer/Modal/Toast patterns are what LDS's next components should be built from.

### 4. Greenfield (`pickleball-booker`, future apps) → *start on LDS*
Import `lds.css` + a theme, use `.lds-*` from commit one. Zero migration cost — this is the
default going forward.

---

## Roadmap

**Phase 0 — ship LDS v1** (in progress): core CSS, icon sprite, Portfolio/Palette/Product
themes, docs site. Nothing can adopt what isn't published.

**Phase 1 — prove two paths.** (a) Retrofit the **portfolio** itself (partially done — footer
badge is live LDS). (b) Write the **shadcn bridge** for `tripblend`. These validate the two
hardest integration styles end to end.

**Phase 2 — sweep the static sites.** `tote`, `ping`, `waypoint`, `subway`,
`volleyball-rotation`, `bklynclay-glaze` — link + adopt, one theme file each. Fast, high-visibility.

**Phase 3 — reconcile scentmap.** Diff its `design-system.css` against LDS; replace its color
+ component tokens with LDS, keep its layout/responsive CSS. It's the test of "LDS absorbs an
existing mini-DS."

**Phase 4 — migrate palette.** Token pass, then component pass. Feed its component patterns
back into LDS as new Foundation components (Drawer, Toast, Tabs).

---

## Governance so it stays merged

- **One version, one CDN tag.** Every repo pins `@v1`; bumping the tag updates all of them.
- **Themes live with LDS**, not scattered — one file per project in `dist/themes/`.
- **No local color/spacing values** in any repo — lint for raw hex the way one-token prescribes.
- **New shared component?** It lands in LDS first, then repos consume it. Never the reverse.

---

*Audited from repo trees on 2026-07-14. Foundations (one-token, open-icons) already in LDS.*
