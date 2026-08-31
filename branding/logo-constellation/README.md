# logo-constellation — UI preset

Logomark system grid: every size, tone and clearspace variant of one mark.

**Job:** show one mark in every context it must survive.
**Signature:** constellation grid: hover or focus any cell and the rest of the grid dims to a quarter, the chosen variant lifts to 1.03 and its dashed clear-space rails draw in from the centre.

**Provenance:** shadcn/ui `new-york-v4` (`badge`); Motion-Primitives `in-view`; handcraft kit vendored per package.

```tsx
import { LogoConstellation } from "logo-constellation"
import "logo-constellation/styles.css"

// Renders the crafted default demo; pass your own data (see props).
<LogoConstellation />
```

Vendor strategy: source is yours (`files` ships `dist` + raw `src`); deps are peer-only (react, motion, radix-ui, cva, clsx, tailwind-merge, lucide-react).
