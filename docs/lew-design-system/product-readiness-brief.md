# Future-proofing Road Trip with LDS

**A design system infrastructure brief.** No product changes proposed here — see
"Not in this brief" at the end.

**One page. Detail and evidence:** [`product-readiness.md`](product-readiness.md)

**Date:** 2026-07-31 · **Design:** Matt Lew · **Eng review:** Will Chen

---

## The impact we want

**Road Trip should be able to become anything.**

The app is in its infancy. It works, it's useful, and it's inconsistent — which is
completely fine for where it is. What matters is that it hasn't had an opinion
placed on it yet, and right now it's cheap to make it ready for one.

The goal isn't a specific look. It's **adaptability**: an app that can be as slick
as Google Flights or as sharp as Linear, and can change its mind later without a
rewrite. That's what a design system buys — the expression becomes a layer you
swap, not a thousand decisions baked into a thousand files.

**Who we're building for matters here.** Road Trip is for people who love camping,
the outdoors, and the road — people looking for adventure. The app today reads as
techy and utilitarian, which suits the people using it now and won't reach the
audience we want next. Being able to place a warmer, more inviting opinion on it
later is exactly the capability we're asking to build.

Doing this while the app is small is the whole point. **Every inconsistency we
catch now is one we don't pay for across fifty screens later** — and the codebase
gets easier to scale and build on as a side effect, not a separate project.

## Why this is the right thing for LDS too

LDS is young and has never carried a product. It has no table, no tabs, no
modal that actually behaves, no side sheet, no loading states, no responsive
layout — because nothing has ever asked it for them.

Road Trip asks for all of it at once, and that's the value. It is one extreme end
of the pressure a design system can be put under:

- **Dense data.** Tables, availability grids, site matrices. LDS has no table at
  all, and no real density story.
- **Constant loading.** Almost every panel is async. LDS has nothing that says
  "waiting" — no skeletons, no spinners, no progress.
- **Real responsive.** LDS contains **zero media queries.** Not one. Road Trip
  needs rail-to-segmented tabs, side sheets that become bottom sheets, and layouts
  that hold on a phone.
- **Modals and side sheets that work.** LDS's modal is paint with no behaviour.
  Road Trip's is a core interaction.
- **Maps.** Which LDS will deliberately *not* absorb — but it does need a colour
  approach for data identity that survives a theme change.

**Both systems get the infrastructure they need from the same work.** Road Trip
gets consistency and adaptability; LDS gets the product-tested components that
make it real for the next app. Neither is doing the other a favour.

## How we start — small

**Build the missing LDS components by adopting what Road Trip already has.**

This isn't inventing a component library from scratch. Road Trip already ships a
table, tabs, a working modal, toggles and confirm buttons — with lifecycle and
tests. The work is bringing those into LDS properly: rebuilt on LDS's colour
architecture, checked against the rest of the system, so they serve the next
product too and not just this one.

Then Road Trip picks them up — **by translation or by direct adoption, whichever
Will thinks is right.** Translation means Road Trip's existing tokens point at LDS
underneath and screens keep working untouched; adoption means moving to LDS
components outright. That's an engineering call and it doesn't block the first
part.

**In parallel, low-hanging fruit.** There's real work available right now that
doesn't wait on any of this: hardcoded colours (156 of them, including the same
campground colour defined five different ways), and pairs that don't meet
accessibility floors. Those are fixes, not migration.

## Three steps

**1. Fix what's already broken.** Hardcoded colours, failing contrast, focus
states, motion that ignores accessibility settings. Available immediately, in
both codebases.

**2. Bring Road Trip's components into LDS.** Table, tabs, modal, side sheet,
toggle, loading states — plus the responsive layout layer, which neither system
has today and is the biggest genuine gap.

**3. Road Trip adopts.** Translation or direct adoption, Will's call.

Sizing needs Will — I haven't put weeks against these.

## The honest cost

**Steps 1 and 2 change little a user can see.** That's the trade. What we get is
that the first time we want to place a real opinion on Road Trip — a warmer brand,
a different density, a look aimed at the audience we want — it's a theme, not a
quarter.

## What I need back

- **A yes on building the shared infrastructure**, and on doing it in LDS rather
  than only inside Road Trip.
- **Will:** translation or adoption for step 3, and how Road Trip pulls LDS in.
  Answerable now, independently of the rest.
- **Agreement that step 1 starts regardless.** It's bug-fixing.

## Not in this brief

**No product changes.** No new features, no redesigned flows, no visual redesign
of Road Trip. This is infrastructure — the capability to make those changes
cheaply later. When we want to place an actual opinion on the app, that's a
separate brief, and this work is what makes it a short one.

Also out of scope: the map surface itself. LDS supplies the colour scale so data
on the map stays consistent; pins, routes and overlays stay Road Trip's.
