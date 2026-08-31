# typo-ramp-brand — UI preset

Type specimen ramp display scale ladder from micro to mega with tracking.

**Job:** prove the type system holds from footnote to billboard.
**Signature:** a ramp ladder of true `<button>` rungs — hovering/focusing one indents and fully inks it, the rest fade to whisper; the side waterfall prints every size live so the eye measures the jump, and the spec plate updates as you move.

**Provenance:** shadcn/ui `new-york-v4` (`badge`, `card`, `button`, `separator`); Motion-Primitives `in-view`, `text-effect`; handcraft kit vendored per package.

```tsx
import { TypoRampBrand } from "typo-ramp-brand"
import "typo-ramp-brand/styles.css"

// Renders the crafted default demo; pass your own data (see props).
<TypoRampBrand />
```

Vendor strategy: source is yours (`files` ships `dist` + raw `src`); deps are peer-only (react, motion, radix-ui, cva, clsx, tailwind-merge, lucide-react).
