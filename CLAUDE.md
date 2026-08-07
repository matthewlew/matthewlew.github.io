# matthewlew.github.io

Portfolio site and **project hub**. Three pages, static, no build step, no
runtime, no framework binding. Do not introduce one.

| File | Purpose |
|------|---------|
| `index.html` | The hub — work, approach, project index, how to build on the system, contact |
| `about.html` | The portfolio — the page to send a recruiter |
| `brand-identity.html` | The brand system |

## The design system does not live here any more

LDS moved to **[matthewlew/lds](https://github.com/matthewlew/lds)**, along with
the decision record, One Token, and the old `tools.html` / "System Ops" page.
This repo is now a *consumer*.

That means the rule that used to dominate this file — every LDS change needs a
decision entry in the same commit — **is not this repo's rule any more.** It
lives in `docs/decisions/README.md` in the LDS repo, and applies when you are
working there. Do not re-add a decision log here.

## `vendor/lds/` is vendored. Do not edit it.

These pages paint from `vendor/lds/`, a **pinned snapshot** of the plain-CSS LDS
they were built against. Changes belong upstream in `matthewlew/lds`, not here.

It is a snapshot rather than a live dependency because of two things that are
both fixable, and until they are fixed this is a trap:

1. `matthewlew/lds` publishes its CSS nowhere a browser can reach — `site/` is
   gitignored, there is no `dist/`, Pages is not enabled. There is no URL to
   point a `<link>` at.
2. The CSS in that repo is a **different lineage**, not a newer commit of this
   one — the two `lds.css` files differ by ~1,800 lines. It is very nearly a
   superset, but `--grey-50`, `--grey-400`, `--grey-800` and `lds-tag--info`
   exist here and not there, and all four are in use on these pages.

So swapping `vendor/lds/` for the upstream CSS today breaks these pages
**quietly** — no error, just wrong greys and an unstyled footer tag. Close the
four gaps upstream and publish the CSS first.

## Constraints that fail quietly

Full reasoning for all of these is in the decision record, now at
`docs/decisions/decisions.md` in the LDS repo.

- **Put the theme and emphasis classes on the root element.** Custom properties
  inherit downward only, so `theme-product` or `emph-plain` on an inner wrapper
  leaves `body` resolving core defaults while the components inside look
  correctly themed. All three pages here set `emph-plain` on `<html>`.
- **These pages paint from tokens.** Never hardcode a font family or hex on a
  page that demonstrates the system — it will silently contradict the thing it
  is demonstrating. `about.html` and `brand-identity.html` alias their local
  names (`--ink`, `--accent`, …) onto LDS tokens at `:root` for exactly this
  reason; keep new work on that pattern rather than adding raw values.
- **Use the semantic type roles** (`--text-title/subhead/body/caption`), not the
  raw `--size-*` scale, and take the whole composite: the role carries leading
  and tracking too, so a page that takes only the font-size still drifts.
- **Contrast is APCA**, not WCAG 2.x. Verify against the floors rather than
  eyeballing; several "it looks fine" values measure under them.
- **`about.html` and `brand-identity.html` render in quirks mode** (no doctype).
  `index.html` has one. Adding a doctype to the other two is a real change with
  layout risk — do not do it incidentally, and expect the standards-mode result
  to differ from what you see today.

## The nav is in `site.css`. There is one of it.

All three pages take the same bar: `.nav > .nav__inner` with LDS's
`.lds-nav__logo` and `.lds-nav__links` inside it. The rules live in `site.css`,
linked by every page after `vendor/lds/lds.css`.

It used to be defined three times — once here on the LDS parts, and twice as a
hand-rolled `.nav-name` / `.nav-links` bar on `about.html` and
`brand-identity.html` that predated the hub. That is how those two drifted into
looking like a different site. Do not re-add a page-local nav rule; change
`site.css`.

The link *lists* stay per-page, because the anchors differ. The bar does not.

Note the bar takes `.lds-nav__logo` and `.lds-nav__links` but **not** `.lds-nav`
itself — that is a floating pill with a border, radius and shadow, and a sticky
full-bleed bar is a different object.

## Which page owns what

The two pages were both trying to be the portfolio: Starbucks, DoorDash and
GlossGenius each appeared three times across them, and the 80/90 rule was told
twice at different lengths. The split now:

- **`index.html` is the hub.** Projects, how to build on the system, contact,
  and a short credibility strip that links to About. It does *not* carry work
  history, metrics or approach any more.
- **`about.html` is the portfolio.** It owns the work history table, the proof
  metrics, the house rules and the capabilities list.

If you are adding biography, work history or positioning, it goes on About. If
you are adding a project or a way in, it goes on the hub.

## Adding a project to the hub

Two places, both required, or the project is discoverable from only one of them:

1. A card in the `#projects` section of `index.html`.
2. An entry in the `links` array in `global-nav.js` — that renders the hub
   widget present on every page. External projects take `external: true`.

## Local preview

```sh
python3 -m http.server 8000
```

Or the Browser preview tools with the `Static HTML Server` config in
`.claude/launch.json`.
