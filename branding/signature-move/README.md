# signature-move — UI preset

Signature move spec the one hover gesture your brand owns demoed.

**Job:** codify the one gesture everyone copies.
**Signature:** a live sandbox, not a loop: your cursor is replaced inside the stage by the brand marker; every press blooms an ink ring at the exact touch point (recorded, not centered) and settles on a spring. The spec plate states the real numbers the code uses.

**Provenance:** shadcn/ui `new-york-v4` (`badge`, `card`, `button`); Motion-Primitives `cursor`, `in-view`; handcraft kit vendored per package.

```tsx
import { SignatureMove } from "signature-move"
import "signature-move/styles.css"

// Renders the crafted default demo; pass your own data (see props).
<SignatureMove />
```

Vendor strategy: source is yours (`files` ships `dist` + raw `src`); deps are peer-only (react, motion, radix-ui, cva, clsx, tailwind-merge, lucide-react).
