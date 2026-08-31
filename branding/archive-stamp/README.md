# archive-stamp — UI preset

Brand archive stamp wall wax seals of product eras stamp on click.

**Job:** archive the brand's eras as collectible seals.
**Signature:** paper wax seals float on the ink band: press one and it squashes, an ink ring ripples out, and a rotated "FILED" date stamp stays behind; the header tallies impressions.

**Provenance:** shadcn/ui `new-york-v4` (`badge`, `button`); Motion-Primitives `glow-effect`, `in-view`; handcraft kit vendored per package.

```tsx
import { ArchiveStamp } from "archive-stamp"
import "archive-stamp/styles.css"

// Renders the crafted default demo; pass your own data (see props).
<ArchiveStamp />
```

Vendor strategy: source is yours (`files` ships `dist` + raw `src`); deps are peer-only (react, motion, radix-ui, cva, clsx, tailwind-merge, lucide-react).
