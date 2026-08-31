# sound-of-brand — UI preset

Sonic identity card waveform motif notes brand voice taglines with shimmer.

**Job:** give the brand a sound — and let people hear it.
**Signature:** a waveform wall where each bar is a real pitch of the motif; hovering previews the note through WebAudio, clicking pins it, and "Play motif" runs the full arpeggio with the bars lighting in sequence. Sound is opt-in; nothing plays without a gesture.

**Provenance:** shadcn/ui `new-york-v4` (`badge`, `button`, `separator`); Motion-Primitives `glow-effect`, `text-shimmer-wave`; handcraft kit vendored per package.

```tsx
import { SoundOfBrand } from "sound-of-brand"
import "sound-of-brand/styles.css"

// Renders the crafted default demo; pass your own data (see props).
<SoundOfBrand />
```

Vendor strategy: source is yours (`files` ships `dist` + raw `src`); deps are peer-only (react, motion, radix-ui, cva, clsx, tailwind-merge, lucide-react).
