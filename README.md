# matthewlew.github.io

**Matthew Lew — Design Systems Architect.** The portfolio, and the hub for the
projects around it.

Static, no build step. Open a page or push to GitHub Pages.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | The hub — work, approach, the project index, how to build on the system, contact |
| `about.html` | The portfolio — who I am, what I have shipped, how I work. The page to send a recruiter |

## Projects

The design system does not live here any more. It and everything built on it
are their own repos:

| Project | Repo |
|---------|------|
| Lew Design System — the showcase | <https://matthewlew.github.io/lds/> |
| Lew Design System — the repo | [matthewlew/lds](https://github.com/matthewlew/lds) |
| Decision record | [lds/docs/decisions](https://github.com/matthewlew/lds/blob/main/docs/decisions/decisions.md) |
| One Token | [matthewlew/one-token](https://github.com/matthewlew/one-token) |
| Open Icons | [matthewlew/open-icons](https://github.com/matthewlew/open-icons) |
| Palette | [matthewlew/palette](https://github.com/matthewlew/palette) |

`global-nav.js` renders the hub widget that links them together. Adding a
project means adding one entry to the `links` array in that file — it appears
on every page at once.

## How this site gets its CSS

`vendor/lds/` is a **pinned snapshot** of the plain-CSS LDS these pages were
built against, copied in when the design system moved out to its own repo.
It is a vendored dependency, not a source of truth: do not edit it here.

It is a snapshot only because nothing serves it yet. `matthewlew/lds` now
carries the identical files at its repo root `dist/` — byte for byte the same,
same lineage. Enable Pages on that repo and this becomes a one-line swap:

```html
<link rel="stylesheet" href="https://matthewlew.github.io/lds/dist/lds.css">
```

Do **not** point it at `packages/lds/css/` instead — that is the React
package's CSS and a different lineage, ~1,800 lines apart. Three tokens
(`--grey-50`, `--grey-400`, `--grey-800`) and one class (`lds-tag--info`) are
in use here and missing there, so that swap fails silently.

## Local preview

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

Or use the Browser preview tools with the `Static HTML Server` config in
`.claude/launch.json`.

## A note on quirks mode

`about.html` renders in **quirks mode** — it has no doctype. `index.html` has
one. Adding a doctype to About is a real change with layout risk. Do not do it
incidentally.

---
© 2026 Matthew Lew · matttjlew@gmail.com · linkedin.com/in/mattjlew
