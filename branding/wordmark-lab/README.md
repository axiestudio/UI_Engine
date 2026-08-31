# wordmark-lab — UI preset

Variable wordmark playground: weight, slant, tracking, case — live brand type explorer.

**Job:** let a team explore their wordmark like an instrument.
**Signature:** a giant live wordmark, each letter springing into place, driven by weight/tracking sliders and a casing dial; the settings print themselves as a real, copyable CSS plate.

**Provenance:** shadcn/ui `new-york-v4` (`badge`, `card`, `button`); Motion-Primitives `in-view`, `text-effect`; handcraft kit vendored per package.

```tsx
import { WordmarkLab } from "wordmark-lab"
import "wordmark-lab/styles.css"

// Renders the crafted default demo; pass your own data (see props).
<WordmarkLab />
```

Vendor strategy: source is yours (`files` ships `dist` + raw `src`); deps are peer-only (react, motion, radix-ui, cva, clsx, tailwind-merge, lucide-react).
