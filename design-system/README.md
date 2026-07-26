# Lew Design System (LDS)

Plain CSS. No build step, no runtime, no framework binding.

- **Layer 1 — primitives:** greys, space, size, weight, motion, radius.
- **Layer 2 — One Token semantics:** `mode × emphasis → seven object-colour roles`.
- **Layer 3 — components:** `.lds-btn`, `.lds-card`, `.lds-field`, `.lds-tag`, `.lds-chip`, `.lds-banner`, `.lds-modal`, …
- **Layer 4 — themes:** a theme supplies the `--c-*` brand ramp, `--th-*` fonts, radius, shadows, density, iconography. Core never hardcodes a hex.

Docs and live examples: <https://matthewlew.github.io/design-system/>

---

## Install

LDS lives in the `matthewlew.github.io` repo, and the package manifest sits at
that repo's root. Install it straight from GitHub — no registry, no hosting, no
recurring cost:

```bash
npm i "github:matthewlew/matthewlew.github.io#v1.0.0"
```

Pin the tag. A bare `github:matthewlew/matthewlew.github.io` tracks whatever is
on `main` at install time, which means an unversioned dependency that can drift
between a local install and CI.

For local development against an unpushed change, point at the checkout instead:

```bash
npm i "file:../matthewlew.github.io"
```

## Use

```js
import 'lew-design-system/hues.css'          // APCA hue ramps — load first
import 'lew-design-system'                   // core: primitives + semantics + components
import 'lew-design-system/themes/palette.css' // your theme — load last
```

Order matters: hues, then core, then theme. Then put the theme (and, if the
product is dark-native, the mode) on the root element:

```html
<html class="theme-palette mode-dark">
```

Everything else is composition. An object gets its colour from an emphasis
class, and optionally a hue class:

```html
<button class="lds-btn emph-strong">Publish</button>
<span class="lds-tag hue-success">Live</span>
<div class="lds-card emph-subtle">…</div>
```

## Themes

| Theme | For | Character |
|---|---|---|
| `themes/portfolio.css` | matthewlew.github.io | Editorial, light-default |
| `themes/product.css` | product surfaces | Neutral, functional |
| `themes/palette.css` | [palette](https://github.com/matthewlew/palette) | Chromeless, dark-native, media-forward |

`theme-palette` deliberately ships **no brand hue**. palette is a gradient
tool — the artwork is the colour, so the theme's `--c-*` ramp is a cool
neutral measured from palette's own surfaces. See the comment at the top of
that file.

## Adding to LDS

New shared components land in LDS first, then get consumed — not built in a
product and back-ported later. See
[`docs/lew-design-system/adoption-audit.md`](../docs/lew-design-system/adoption-audit.md)
and [`lds-dos-and-donts.md`](../docs/lew-design-system/lds-dos-and-donts.md).
