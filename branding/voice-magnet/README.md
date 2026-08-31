# voice-magnet — UI preset

Tone-of-voice dial: pick we-say / we-dont-say pairs with magnetic flip cards.

**Job:** define the voice: what we say, what we never say.
**Signature:** magnetic flip coins: the card drifts toward the cursor, and one press turns it — the front is letterpress "We say", the ink reverse is "We don't" with the line struck through. Reduced motion flips instantly. Both verdicts stay readable.

**Provenance:** shadcn/ui `new-york-v4` (`badge`); Motion-Primitives `in-view`, `magnetic`; handcraft kit vendored per package.

```tsx
import { VoiceMagnet } from "voice-magnet"
import "voice-magnet/styles.css"

// Renders the crafted default demo; pass your own data (see props).
<VoiceMagnet />
```

Vendor strategy: source is yours (`files` ships `dist` + raw `src`); deps are peer-only (react, motion, radix-ui, cva, clsx, tailwind-merge, lucide-react).
