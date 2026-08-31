# mission-etch — UI preset

Mission statement etched in glass text outline fills on scroll haptic ticks.

**Job:** make the mission statement felt, not skimmed.
**Signature:** outlined mission type fills clause-by-clause on scroll: each line is stroked glass until the ink sweeps in from the left; a fill meter and clause ordinals keep score, and the sign-off rule closes the cut.

**Provenance:** shadcn/ui `new-york-v4` (`badge`, `card`, `button`, `separator`); Motion-Primitives `in-view`, `text-effect`; handcraft kit vendored per package.

```tsx
import { MissionEtch } from "mission-etch"
import "mission-etch/styles.css"

// Renders the crafted default demo; pass your own data (see props).
<MissionEtch />
```

Vendor strategy: source is yours (`files` ships `dist` + raw `src`); deps are peer-only (react, motion, radix-ui, cva, clsx, tailwind-merge, lucide-react).
