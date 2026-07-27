# Fonts

Two families, both from [Collletttivo](https://www.collletttivo.it), both under
the SIL Open Font License 1.1. `OFL.txt` is the licence as shipped by the
foundry; it covers both families.

| Family | Role | Weights here |
|---|---|---|
| **Ronzino** | `--th-body`, `--th-ui` | 400 Regular · 500 Medium · 700 Bold |
| **Coconat** | `--th-display` | 400 Regular · 600 Demi · 700 Bold |

Obliques are not shipped. `theme-portfolio` sets no italic anywhere, so loading
them would be four files nothing renders.

These are self-hosted rather than loaded from a font CDN. LDS installs over npm
from GitHub, and a theme that names a face it does not carry is a theme that
renders differently depending on whether the consumer happened to add the same
`<link>`. The OFL permits redistribution as long as this licence travels with
the files — hence `OFL.txt` sitting next to them rather than a line in a README
somewhere.

**Do not sell these files on their own.** That is the one thing the OFL forbids,
and it is the only restriction that applies to bundling them here.
