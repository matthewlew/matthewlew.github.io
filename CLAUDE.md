# matthewlew.github.io

Portfolio site, and the home of the **Lew Design System (LDS)** in
`design-system/`. LDS ships as plain CSS — no build step, no runtime, no
framework binding. Do not introduce one.

## The one rule that is easy to break

**A change to LDS needs an entry in
[`docs/lew-design-system/decisions.md`](docs/lew-design-system/decisions.md), in
the same commit**, when it:

- alters what a token means
- adds or removes a role, component, or theme
- reverses a prior call
- sets a constraint consumers must respect

Exempt: typos, `dist` rebuilds, new example pages, and additions that follow an
existing pattern without changing it.

The test for whether something is a decision at all: **name what it ruled out.**
If nothing was ruled out it is a fact about the system, and it belongs in
`design-system/README.md` instead.

Write the entry as part of the work, while the reasoning is still in hand — not
afterwards from the diff. The diff shows what changed; only you know why, and
what you rejected on the way. An optional `**Cost:**` line carries the live
gotcha someone will hit later.

**Reversals matter most.** They are what stops a mistake being repeated. If you
are undoing an earlier decision, mark it `reversal` and amend the entry you are
overturning rather than deleting it — the record should show that the other way
was tried and why it did not hold.

Entry format and the metadata grammar are documented at the top of
`decisions.md`.

## Checks

```bash
node scripts/check-decisions.mjs        # structure; exits 1 on problems
node scripts/check-decisions.mjs --fix  # regenerate the header split line
```

The grammar lives in `docs/lew-design-system/decisions-parser.mjs` and is shared
by the validator and by `decisions.html`, which renders the record. Change the
grammar in one place only.

The validator checks **structure, never reasoning**. A green run means
well-formed, not well-reasoned.

## Constraints worth knowing before you edit

These are all recorded in `decisions.md` with their full reasoning; this is the
short list of things that fail *quietly*.

- **Put the theme and emphasis classes on the root element.** Custom properties
  inherit downward only, so `theme-product` or `emph-plain` on an inner wrapper
  leaves `body` resolving core defaults while the components inside look
  correctly themed.
- **Showcase and docs pages paint from tokens.** Never hardcode a font family or
  hex on a page that demonstrates the system — it will silently contradict the
  thing it is demonstrating.
- **Use the semantic type roles** (`--text-title/subhead/body/caption`), not the
  raw `--size-*` scale, and take the whole composite: the semantic role carries
  leading and tracking too, so a page that takes only the font-size still
  drifts.
- **Core carries the portfolio brand**, and therefore hardcodes hexes: the oat
  grey ramp, the green `--c-*` ramp, `--link`, `--cta`. This reversed the older
  "core never hardcodes a hex" rule. A *theme* is now only what a surface
  declares in order to diverge from that brand — which is why the portfolio has
  no theme file at all.
- **Brand ramps are steeper than the `apca-palette.css` curve**, and have to be
  — on the flat curve `c-200` measures Lc 0.0 against `c-50` and every tinted
  surface loses its border.
- **Contrast is APCA**, not WCAG 2.x. Verify against the floors rather than
  eyeballing; several "it looks fine" values measure under them.
- `index.html` and `about.html` render in **quirks mode** (no doctype). Adding
  one is a real change with layout risk — do not do it incidentally.

## Local preview

Use the Browser preview tools with the `Static HTML Server` config in
`.claude/launch.json`. `decisions.html` fetches `decisions.md` at runtime, so it
needs to be served over http — opening the file directly will not work.
