# matthewlew.github.io

Portfolio site and **project hub**. Two pages, static, no build step, no
runtime, no framework binding. Do not introduce one.

| File | Purpose |
|------|---------|
| `index.html` | The hub — work, approach, project index, how to build on the system, contact |
| `about.html` | The portfolio — the page to send a recruiter |

## The design system does not live here any more

LDS moved to **[matthewlew/lds](https://github.com/matthewlew/lds)**, along with
the decision record, the philosophy notes, One Token, and the old `tools.html` /
"System Ops" page. This repo is now a *consumer*.

**The showcase at <https://matthewlew.github.io/lds/> is the source of truth for
what the system looks like.** `brand-identity.html` used to live here and was a
thinner, older duplicate of it — six sections against fourteen, everything it
covered covered better there. It was retired and its one unique section, the ML
monogram, moved into the showcase. Do not recreate a system-showcase page here.

That means the rule that used to dominate this file — every LDS change needs a
decision entry in the same commit — **is not this repo's rule any more.** It
lives in `docs/decisions/README.md` in the LDS repo, and applies when you are
working there. Do not re-add a decision log here.

## LDS is loaded from npm. There is no vendored copy any more.

These pages used to paint from `vendor/lds/`, a pinned snapshot of LDS's CSS
copied in when the design system moved out to its own repo. That snapshot is
gone. `@lew-ds/lds` is now published to the public npm registry, and both
pages load it straight from there via jsDelivr, pinned to an exact version:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@lew-ds/lds@1.0.0/css/lds.css">
```

**Always pin the version, never `@latest`.** jsDelivr caches a pinned-version
URL as immutable, so bumping means editing the version in the URL, not waiting
on a cache. To pick up a new LDS release: check the new version's CSS still
defines everything these pages reference (`--gray-*`, not `--grey-*` — that
was the pre-npm spelling and no longer exists anywhere in the system), bump
the version in both `index.html` and `about.html`, and check the pages
visually before pushing — nothing here checks that automatically.

The one icon on `about.html` not covered by LDS component classes
(`checkboxFilled` in the footer) loads the same way, from
`@lew-ds/open-icons` via jsDelivr.

## Constraints that fail quietly

Full reasoning for all of these is in the decision record, now at
`docs/decisions/decisions.md` in the LDS repo.

- **Put the theme and emphasis classes on the root element.** Custom properties
  inherit downward only, so `theme-product` or `emph-plain` on an inner wrapper
  leaves `body` resolving core defaults while the components inside look
  correctly themed. Both pages here set `emph-plain` on `<html>`.
- **These pages paint from tokens.** Never hardcode a font family or hex on a
  page that demonstrates the system — it will silently contradict the thing it
  is demonstrating. `about.html` aliases its local names (`--ink`, `--accent`,
  …) onto LDS tokens at `:root` for exactly this reason; keep new work on that
  pattern rather than adding raw values.
- **Use the semantic type roles** (`--text-title/subhead/body/caption`), not the
  raw `--size-*` scale, and take the whole composite: the role carries leading
  and tracking too, so a page that takes only the font-size still drifts.
- **Contrast is APCA**, not WCAG 2.x. Verify against the floors rather than
  eyeballing; several "it looks fine" values measure under them.
- **`about.html` renders in quirks mode** (no doctype). `index.html` has one.
  Adding a doctype to About is a real change with layout risk — do not do it
  incidentally, and expect the standards-mode result to differ from what you
  see today.

## The nav is in `site.css`. There is one of it.

Both pages take the same bar: `.nav > .nav__inner` with LDS's
`.lds-nav__logo` and `.lds-nav__links` inside it. The rules live in `site.css`,
linked by every page after `vendor/lds/lds.css`.

It used to be defined three times — once on the LDS parts in `index.html`, and
twice as a hand-rolled `.nav-name` / `.nav-links` bar on the pages that predated
the hub. That is how they drifted into looking like a different site. Do not
re-add a page-local nav rule; change `site.css`.

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
