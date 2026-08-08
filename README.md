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

Both pages load `@lew-ds/lds` directly from npm via jsDelivr, pinned to an
exact version — there is no vendored copy in this repo any more:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@lew-ds/lds@1.0.0/css/lds.css">
```

Bump the version in both `index.html` and `about.html` to pick up an LDS
release — pinned-version jsDelivr URLs cache as immutable, so there's no
cache to bust, just a version number to edit. See `CLAUDE.md` for what to
check before bumping.

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
