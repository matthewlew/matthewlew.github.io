# Lew Design System (LDS)

Plain CSS. No build step, no runtime, no framework binding.

- **Layer 1 — primitives:** greys, space, size, weight, motion, radius.
- **Layer 2 — One Token semantics:** `mode × emphasis → seven object-colour roles`.
- **Layer 3 — components:** `.lds-btn`, `.lds-card`, `.lds-field`, `.lds-tag`, `.lds-chip`, `.lds-banner`, `.lds-modal`, `.lds-list`, …
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
<span class="lds-tag lds-tag--success">Live</span>
<div class="lds-card emph-subtle">…</div>
```

### A hue is a colour, a status is a meaning

`hue-*` names a **colour** — `hue-red`, `hue-blue`, `hue-green`. It never names a
meaning, so there is no `hue-error`.

Meaning lives on the **component**, as a modifier: `lds-tag--error`,
`lds-banner--success`, `lds-inline--warning`. The five statuses are `error`,
`warning`, `caution`, `success` and `info`, and each is bound to a colour in
exactly one place — the status map in `lds.css`. Repointing a status is a
one-line edit there, and no consumer markup changes.

The shape matches `lds-btn--primary`: primary is a role that resolves to the
brand hue, not a hue named "primary".

### Four font roles

`--th-display` · `--th-body` · `--th-ui` · `--th-mono`

`--th-ui` is the **control** role — buttons, tags, chips, field labels. It is
separate from `--th-body` because a body font may legitimately be a serif, and a
serif is wrong on a button: a control is chrome, not prose. It defaults to
`--th-display`, so a theme gets sans controls without opting in.

Declare it **in the theme**, next to the other font roles — not once at `:root`.
A `:root` default resolves against core's values at the root element and
inherits down as a concrete font name, which then wins over a theme mounted
lower in the tree.

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

**Record the decision.** A change that alters a token's meaning, adds or removes
a role, reverses a prior call, or sets a constraint consumers must respect needs
an entry in [`decisions.md`](../docs/lew-design-system/decisions.md) **in the
same commit**. Trivial changes — typos, `dist` rebuilds, new examples — are
exempt.

If you cannot name what the change *ruled out*, it is not a decision: it is a
fact about the system, and it belongs here in the README instead.

The point is the reversals. `decisions.md` is where you find out that something
was already tried the other way and why it didn't hold, before you try it again.
Timeline view: [`decisions.html`](../docs/lew-design-system/decisions.html).
