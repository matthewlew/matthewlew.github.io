# matthewlew.github.io

**Matthew Lew — Design Systems Architect.** The portfolio, and the hub for the
projects around it.

Static, no build step. Open a page or push to GitHub Pages.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | The hub — work, approach, the project index, how to build on the system, contact |
| `about.html` | The portfolio — who I am, what I have shipped, how I work. The page to send a recruiter |
| `brand-identity.html` | The brand system — colour, type, mark, card, rules |

## Projects

The design system does not live here any more. It and everything built on it
are their own repos:

| Project | Repo |
|---------|------|
| Lew Design System | [matthewlew/lds](https://github.com/matthewlew/lds) |
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

It is a snapshot rather than a live dependency for two reasons, both temporary:

1. `matthewlew/lds` does not publish its CSS anywhere a browser can reach yet
   — `site/` is gitignored, there is no `dist/`, and Pages is not enabled.
2. The CSS in that repo is a **different lineage** from this snapshot, not a
   newer commit of it. It is very nearly a superset, but three tokens
   (`--grey-50`, `--grey-400`, `--grey-800`) and one class (`lds-tag--info`)
   exist here and not there, and all four are in use on these pages.

Closing those four gaps and publishing the CSS is what turns this directory
into a real dependency. Until then, swapping it out will break the pages
quietly rather than loudly.

## Local preview

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

Or use the Browser preview tools with the `Static HTML Server` config in
`.claude/launch.json`.

## A note on quirks mode

`index.html`, `about.html` and `brand-identity.html` render in **quirks mode**
— they have no doctype. Adding one is a real change with layout risk. Do not
do it incidentally.

---
© 2026 Matthew Lew · matttjlew@gmail.com · linkedin.com/in/mattjlew
