# matthewlew.github.io

**Matthew Lew — Design Systems Designer.** Personal portfolio + brand system.
*The system is the statement.*

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Portfolio — Work · Cases · AI Workflow · Skills · Contact |
| `brand-identity.html` | Brand system — Color · Type · Mark · Card · Rules · System |

Both are static, dependency-free HTML. Open `index.html` or push to GitHub Pages — no build step.

## Design system

Shared CSS custom properties across both files (never deviate):

```css
--bg:#FFFFFF; --bg-soft:#F6F6F4; --paper:#F5F0E8;
--ink:#0A0A0A; --ink-2:#5C5C5A; --ink-3:#B5B5B2; --rule:#D8D8D5;
--red:#C8391B;  /* signature accent — use sparingly */
--font-display:'DM Sans'; --font-body:'DM Sans'; --font-mono:'Space Mono';
```

**Rules:** full-width layouts · 1px hairline rules between sections · massive display type ·
monospace for all metadata · zero border-radius · no shadows · red as accent only.

Type is **DM Sans** throughout — bold weights for display, regular for body — with
**Space Mono** for all metadata. To swap in a custom family later: drop `.woff2` files in
`fonts/`, add an `@font-face`, and update `--font-display` / `--font-body` in both files.

## Local preview

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

---
© 2026 Matthew Lew · matttjlew@gmail.com · linkedin.com/in/mattjlew
