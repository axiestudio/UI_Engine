# brand-timeline-echo — UI preset

Heritage wall years ripple as echo cards through brand eras.

**Job:** show heritage without a boring table of years.
**Signature:** era cards echo off a shared rail: the selected era lifts on a hard-offset shadow and neighbours dim by distance; a diamond tick glides between eras on a layoutId spring, and the whole row answers arrow keys / Home / End.

**Provenance:** shadcn/ui `new-york-v4` (`separator`); Motion-Primitives `animated-group`, `in-view`; handcraft kit vendored per package.

```tsx
import { BrandTimelineEcho } from "brand-timeline-echo"
import "brand-timeline-echo/styles.css"

// Renders the crafted default demo; pass your own data (see props).
<BrandTimelineEcho />
```

Vendor strategy: source is yours (`files` ships `dist` + raw `src`); deps are peer-only (react, motion, radix-ui, cva, clsx, tailwind-merge, lucide-react).
