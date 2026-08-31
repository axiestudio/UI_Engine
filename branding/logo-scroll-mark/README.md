# logo-scroll-mark — UI preset

Scroll-drawn logomark SVG path draws itself as you scrub down the page.

**Job:** make the logomark an event, not a decoration.
**Signature:** scrub-drawn SVG: strokes pull along a spring-smoothed scroll value; the side hairline runs on the same number; a state badge flips in-progress → drawn; and at full draw a sign-off tick stamps in once, rotated and pressed.

**Provenance:** shadcn/ui `new-york-v4` (`badge`); Motion-Primitives `in-view`, `scroll-progress`; handcraft kit vendored per package.

```tsx
import { LogoScrollMark } from "logo-scroll-mark"
import "logo-scroll-mark/styles.css"

// Renders the crafted default demo; pass your own data (see props).
<LogoScrollMark />
```

Vendor strategy: source is yours (`files` ships `dist` + raw `src`); deps are peer-only (react, motion, radix-ui, cva, clsx, tailwind-merge, lucide-react).
