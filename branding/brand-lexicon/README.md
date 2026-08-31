# brand-lexicon — UI preset

Lexicon wall brand dictionary terms flip cards with usage.

**Job:** define brand vocabulary with authority.
**Signature:** flip-card lexicon — one toggle button per term: the front is letterpress (ink offset shadow) with the pronunciation looping; pressing turns the card to a serif-italic usage sentence on the reverse. Reduced motion = instant flip.

**Provenance:** shadcn/ui `new-york-v4` (`badge`); Motion-Primitives `in-view`, `text-loop`; handcraft kit vendored per package.

```tsx
import { BrandLexicon } from "brand-lexicon"
import "brand-lexicon/styles.css"

// Renders the crafted default demo; pass your own data (see props).
<BrandLexicon />
```

Vendor strategy: source is yours (`files` ships `dist` + raw `src`); deps are peer-only (react, motion, radix-ui, cva, clsx, tailwind-merge, lucide-react).
