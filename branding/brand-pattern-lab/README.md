# brand-pattern-lab — UI preset

Generative brand pattern wall seed a pattern from the logo geometry.

**Job:** extend the identity from logo to pattern.
**Signature:** pattern wall seeded from a deterministic hash of the logo's geometry; the Reseed button (icon spins once) regenerates the whole wall with a staggered soak-in; a density rail flips the wall between 3 / 6 / 9 tiles per row.

**Provenance:** shadcn/ui `new-york-v4` (`badge`, `button`); Motion-Primitives `animated-background`, `in-view`; handcraft kit vendored per package.

```tsx
import { BrandPatternLab } from "brand-pattern-lab"
import "brand-pattern-lab/styles.css"

// Renders the crafted default demo; pass your own data (see props).
<BrandPatternLab />
```

Vendor strategy: source is yours (`files` ships `dist` + raw `src`); deps are peer-only (react, motion, radix-ui, cva, clsx, tailwind-merge, lucide-react).
