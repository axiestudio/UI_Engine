# co-brand-lockup — UI preset

Co-brand lockup builder drag two marks get approved lockups.

**Job:** make co-branding a designed moment, not a squash & stretch.
**Signature:** the two partner marks sit in dashed clear-space frames on a dotted stage and magnetically lean toward each other on hover; the segmented rail re-arranges the lockup (| / × / stacked) and the separator flies between positions on a shared layoutId spring.

**Provenance:** shadcn/ui `new-york-v4` (`button`); Motion-Primitives `dock`, `in-view`, `magnetic`; handcraft kit vendored per package.

```tsx
import { CoBrandLockup } from "co-brand-lockup"
import "co-brand-lockup/styles.css"

// Renders the crafted default demo; pass your own data (see props).
<CoBrandLockup />
```

Vendor strategy: source is yours (`files` ships `dist` + raw `src`); deps are peer-only (react, motion, radix-ui, cva, clsx, tailwind-merge, lucide-react).
