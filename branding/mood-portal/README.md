# mood-portal — UI preset

Moodboard iris portal hover petals of imagery that open like an aperture.

**Job:** show the mood of the brand as an openable object.
**Signature:** aperture petals: blob-shaped colour fields that tilt toward the cursor; one opens a spring-morph dialog with Radix focus handling, the note set in serif italic. Text colour on each petal is computed from the mood tint, not guessed per id.

**Provenance:** shadcn/ui `new-york-v4` (`badge`, `card`, `button`, `separator`, `dialog`); Motion-Primitives `tilt`; handcraft kit vendored per package.

```tsx
import { MoodPortal } from "mood-portal"
import "mood-portal/styles.css"

// Renders the crafted default demo; pass your own data (see props).
<MoodPortal />
```

Vendor strategy: source is yours (`files` ships `dist` + raw `src`); deps are peer-only (react, motion, radix-ui, cva, clsx, tailwind-merge, lucide-react).
