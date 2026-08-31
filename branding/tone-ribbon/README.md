# tone-ribbon — UI preset

Voice ticker ribbon infinite slider of sayings in brand tone.

**Job:** let the brand voice run like a wire through the page.
**Signature:** two counter-running ribbons of sayings; hovering slows the top ribbon to a near-stop so a line can be read; every item ends on a rotated diamond tick.

**Provenance:** shadcn/ui `new-york-v4` (`badge`); Motion-Primitives `infinite-slider`, `text-shimmer`; handcraft kit vendored per package.

```tsx
import { ToneRibbon } from "tone-ribbon"
import "tone-ribbon/styles.css"

// Renders the crafted default demo; pass your own data (see props).
<ToneRibbon />
```

Vendor strategy: source is yours (`files` ships `dist` + raw `src`); deps are peer-only (react, motion, radix-ui, cva, clsx, tailwind-merge, lucide-react).
