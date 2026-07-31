# LDS Product Readiness — the ask

**One page. Detail and evidence:** [`product-readiness.md`](product-readiness.md)

**Date:** 2026-07-31 · **Design:** Matt Lew · **Eng review:** Will Chen

---

## What I'm asking for

**Approval to do a round of infrastructure work on the Lew Design System before
any of it is applied to the Road Trip app.**

Not a Road Trip redesign. Not a migration. A block of work in the LDS repo that
makes LDS capable of carrying a product app — after which Road Trip adopts it
cheaply.

## Why

Road Trip needs a design system. LDS is the obvious candidate and it is genuinely
strong where it counts: colour architecture, contrast rigour, and a written
decision record. But it was built for a portfolio and static sites, and it is
missing most of what a dense, dark, data-heavy product app needs.

Concretely, LDS today has **no table, tabs, toast, tooltip, popover, drawer,
spinner, or skeleton**; its form support is a label and a text input; and it
contains **not one media query** — no breakpoints, no layout primitives, no
z-index scale.

Road Trip, meanwhile, already has good bones — eight real components with
lifecycle and tests, a living catalog, and a CI guardrail — sitting on a flat
82-line token file with no spacing scale, no type scale, and no theming.

**The two systems are complementary almost exactly.** LDS has the architecture
Road Trip lacks; Road Trip has the components LDS lacks.

## The decision on the table

Two ways to do this:

**A. System first** *(what I'm proposing)* — build the missing pieces in LDS,
each one reviewed against the existing architecture before it's written. Road
Trip adopts a finished system.

**B. App first** — port Road Trip onto LDS now and backfill the system as gaps
appear.

B is cheaper per step and worse per component: it produces components shaped by
one app's accidents, and it contradicts LDS's own standing rule that shared
components land in the system first. It also isn't really faster — the same
components get written either way, just with less thought and in a place they'll
have to be extracted from later.

**I'm asking to approve A.**

## What "reviewed before written" means

This is the part I care most about, and it's why this isn't just a build list.

Every component goes through a written audit first: does it already exist under
another name, what does it paint from, is its variation emphasis or hue or status
or structure, what does it need from the theme layer, are its states derived, and
what's its accessibility contract — measured, in both light and dark.

LDS has already paid for skipping this twice, and both are on the record: a
colour that meant two different things at two layers (31 call sites to fix), and
a primitive that shipped with exactly one consumer and was removed. The gate
exists to not buy that a third time.

## Shape of the work

| | |
|---|---|
| **Phase 0** | Foundations — contrast checks in CI, a shared focus token, reduced-motion, recover the palette generator |
| **Phase 1** | Two architecture questions that gate everything else |
| **Phase 2** | Base layer, then breakpoints and layout — the genuinely new design work |
| **Phase 3** | Forms — the largest single gap |
| **Phase 4** | Components, each through the gate |
| **Phase 5** | Road Trip adopts — via a token bridge, not a rewrite |

Phases 0–4 are in the LDS repo. **Road Trip is not touched until phase 5**, and
when it is, existing components keep working unchanged and gain light mode for
free.

Sizing needs Will — I haven't put weeks against these.

## What this costs, honestly

**Phases 0–4 produce no user-visible change in Road Trip.** That's the real cost
and it's the thing most likely to sink this. If that's not fundable, say so and
we do B deliberately rather than drifting into it.

There's also design work here that doesn't exist yet in either system —
breakpoints and layout are being authored from scratch, not ported.

## What I'd like out of review

- **Approve A or B**, explicitly.
- **Will:** how Road Trip consumes LDS, and whether the token-bridge approach in
  phase 5 is sound. Both answerable now, independently of everything else.
- **One thing worth doing regardless:** Road Trip has five conflicting copies of
  the same colour palette and 156 hardcoded hexes today. Its existing CI test can
  be extended to stop new ones. That's a bug fix, not migration work, and it
  doesn't depend on this decision at all.

## Not in scope

The map itself. LDS will supply a colour scale for data identity; it won't own
pins, routes, or overlays. Other repos keep their existing adoption paths.
