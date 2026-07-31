# Making Road Trip feel designed — and LDS able to do it

**One page. Detail and evidence:** [`product-readiness.md`](product-readiness.md)

**Date:** 2026-07-31 · **Design:** Matt Lew · **Eng review:** Will Chen

---

## The impact we want

**Road Trip should feel like Google Flights, not like an internal tool.**

Google Flights is dense, data-heavy, and full of tables, filters and dates — and
it still feels calm, familiar, and easy. Nothing about the domain forces a
utilitarian look. That's a design system doing its job.

Road Trip has the same shape of problem and doesn't have that system yet. Today
the app has **three different button styles**, three different toggles, and the
same campground colour defined **five times in five different values**. A user
doesn't read that as five bugs — they read it as an app that was assembled rather
than designed. Every screen teaches them the interface again.

What we want on the other side:

- **Familiar.** A button, a table, a date, a status pill look and behave the same
  everywhere. Users learn the app once.
- **Legible.** Every colour pair measured, not eyeballed — which matters most
  outdoors, on a phone, in daylight.
- **On brand.** It looks like something, instead of looking like defaults.
- **Fast to build.** New features assemble from parts instead of inventing them,
  so design quality stops depending on who wrote the screen.

## Why this is also the right move for LDS

The same work is what makes LDS worth having at all.

LDS is strong where it's hard to be strong — colour architecture, contrast
rigour, a written record of every decision. But it was built for a portfolio, and
it has never had to carry a real product. It has **no table, no tabs, no toast,
no dropdown, no drawer**; its form support is a label and a text input; and it
has **no responsive layout system at all**.

A design system that can't carry a product app is a style guide. Road Trip is the
first real test, and passing it is what turns LDS into something other products
can depend on. **We get a better app and a system worth adopting from the same
work.**

## The ask

**Build the missing pieces in LDS first, then bring Road Trip onto it.**

The alternative is to start converting Road Trip now and add to LDS whenever we
hit a gap. That's tempting and it's worse: we'd design a table while under
pressure to ship a screen, and end up with components shaped by one app's
deadlines that the next product can't reuse. Same amount of building either way
— the difference is whether we get a system out of it.

**One quality bar throughout:** every component gets thought through against the
rest of the system before it's built, not after. That's what stops us shipping a
second thing that means the same as an existing thing — which LDS has already
done once and paid to unwind.

## Three steps

**1. Fix the foundation.** Contrast checking that runs automatically, consistent
focus states, motion that respects accessibility settings. Unglamorous, quick,
and everything after it is safer.

**2. Build what's missing.** Layout and responsive behaviour first — that's the
biggest genuine gap, and it doesn't exist in either system today. Then forms,
then the components: table, tabs, dropdown, drawer, toast, loading states.

**3. Road Trip adopts.** Through a translation layer, not a rewrite: existing
screens keep working unchanged and pick up the new look, consistent spacing, and
light mode without being rebuilt one at a time.

Sizing needs Will — I haven't put weeks against these.

## The honest cost

**Steps 1 and 2 produce nothing a user can see.** That's the real trade, and it's
the thing most likely to sink this. The payoff is that step 3 is fast and the
fourth product is nearly free.

If that upfront stretch isn't fundable, tell me and we'll do it the other way
deliberately — knowing we're trading the system for the schedule — rather than
drifting into it.

## What I need back

- **A yes or no on doing the system work first.**
- **Will:** how Road Trip pulls LDS in, and whether the translation-layer approach
  in step 3 holds up. Both answerable now, independently of the rest.
- **One thing worth doing either way:** Road Trip's five conflicting colour
  palettes and 156 hardcoded colours are a bug today. Its existing tests can be
  extended to stop new ones. That's a fix, not a migration, and it doesn't wait
  on this decision.

## Not in scope

The map itself — pins, routes, overlays. LDS will supply the colour scale for
data on the map so it stays consistent, but the map surface stays Road Trip's.
