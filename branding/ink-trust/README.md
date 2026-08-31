# ink-trust — UI preset

Brand manifesto band serif-italic statement turns to ink band with letterpress sign-off.

**Job:** make the manifesto land as one unbroken voice.
**Signature:** an inverted ink band: the manifesto reveals word-by-word (TextEffect), the band is signed with a press-seal that stamps SIGNED · SEALED in letterpress ink, and the statement copies to clipboard with receipt.

**Provenance:** shadcn/ui `new-york-v4` (`badge`, `button`, `separator`); Motion-Primitives `animated-group`, `in-view`, `text-effect`; handcraft kit vendored per package.

```tsx
import { InkTrust } from "ink-trust"
import "ink-trust/styles.css"

// Renders the crafted default demo; pass your own data (see props).
<InkTrust />
```

Vendor strategy: source is yours (`files` ships `dist` + raw `src`); deps are peer-only (react, motion, radix-ui, cva, clsx, tailwind-merge, lucide-react).
