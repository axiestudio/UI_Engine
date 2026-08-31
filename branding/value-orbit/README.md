# value-orbit — UI preset

Core values orbit chips orbit the mark in gravity wells.

**Job:** make values graspable as objects in orbit.
**Signature:** value chips orbit the mark in dashed wells and bob on offset sine clocks; click (or hover, or arrow-navigate the ledger) pins one — the orbit freezes, the pinned chip letterpresses to ink, and the note column highlights its row.

**Provenance:** shadcn/ui `new-york-v4` (`badge`, `button`); Motion-Primitives `in-view`, `spinning-text`; handcraft kit vendored per package.

```tsx
import { ValueOrbit } from "value-orbit"
import "value-orbit/styles.css"

// Renders the crafted default demo; pass your own data (see props).
<ValueOrbit />
```

Vendor strategy: source is yours (`files` ships `dist` + raw `src`); deps are peer-only (react, motion, radix-ui, cva, clsx, tailwind-merge, lucide-react).
