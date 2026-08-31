# brand-badge-wall — UI preset

Credential badge wall 3D tilt badges for awards and certs.

**Job:** display credentials as objects with weight.
**Signature:** monochrome struck-medallion cards that tilt under the cursor while an engraved sheen sweeps over the metal; grade is carried by ring engraving (gold = double bezel, bronze = engine-turned edge), never cartoon gold gradients.

**Provenance:** shadcn/ui `new-york-v4` (`badge`, `card`, `button`, `separator`); Motion-Primitives `glow-effect`, `in-view`, `tilt`; handcraft kit vendored per package.

```tsx
import { Grain } from "brand-badge-wall"
import "brand-badge-wall/styles.css"

// Renders the crafted default demo; pass your own data (see props).
<Grain />
```

Vendor strategy: source is yours (`files` ships `dist` + raw `src`); deps are peer-only (react, motion, radix-ui, cva, clsx, tailwind-merge, lucide-react).
