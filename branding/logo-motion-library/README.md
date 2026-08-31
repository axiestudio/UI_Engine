# logo-motion-library — UI preset

Logo motion rules replayable intro outro loading animation spec.

**Job:** document the logo's motion like a choreography score.
**Signature:** a two-pane score sheet: the move list on the left (specs in mono), the stage on the right with a ticking frame ruler; transport row replays takes, and a speed rail scrubs 0.5× / 1× / 2× through the same choreography.

**Provenance:** shadcn/ui `new-york-v4` (`badge`, `button`); Motion-Primitives `in-view`, `text-effect`; handcraft kit vendored per package.

```tsx
import { LogoMotionLibrary } from "logo-motion-library"
import "logo-motion-library/styles.css"

// Renders the crafted default demo; pass your own data (see props).
<LogoMotionLibrary />
```

Vendor strategy: source is yours (`files` ships `dist` + raw `src`); deps are peer-only (react, motion, radix-ui, cva, clsx, tailwind-merge, lucide-react).
