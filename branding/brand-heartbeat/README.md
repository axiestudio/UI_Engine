# brand-heartbeat — UI preset

Living logo strip: ECG pulse drives the mark's glow — the brand has a pulse.

**Job:** prove the brand is alive — and watched.
**Signature:** an ECG rail that redraws itself once per beat; the mark tile thumps in scale on the same clock and the live odometer climbs exactly one rate-per-beat — count and pulse share the same source truth.

**Provenance:** shadcn/ui `new-york-v4` (`badge`, `button`); Motion-Primitives `animated-number`, `in-view`; handcraft kit vendored per package.

```tsx
import { BrandHeartbeat } from "brand-heartbeat"
import "brand-heartbeat/styles.css"

// Renders the crafted default demo; pass your own data (see props).
<BrandHeartbeat />
```

Vendor strategy: source is yours (`files` ships `dist` + raw `src`); deps are peer-only (react, motion, radix-ui, cva, clsx, tailwind-merge, lucide-react).
