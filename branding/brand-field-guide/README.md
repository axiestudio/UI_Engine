# brand-field-guide — UI preset

Do dont field guide split cards that stamp APPROVED or AVOID on toggle.

**Job:** make the rules memorable by showing the wrong way too.
**Signature:** do/don't split cards on a paper ledger: pressing "test the mistake" fails the don't side live — dashed destructive tint, strikethrough, and an AVOID rubber stamp that springs in rotated; the why-line stays as the dry moral.

**Provenance:** shadcn/ui `new-york-v4` (`badge`, `card`, `button`, `separator`); Motion-Primitives `animated-group`, `in-view`; handcraft kit vendored per package.

```tsx
import { BrandFieldGuide } from "brand-field-guide"
import "brand-field-guide/styles.css"

// Renders the crafted default demo; pass your own data (see props).
<BrandFieldGuide />
```

Vendor strategy: source is yours (`files` ships `dist` + raw `src`); deps are peer-only (react, motion, radix-ui, cva, clsx, tailwind-merge, lucide-react).
