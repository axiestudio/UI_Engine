# swatch-spectrum — UI preset

Color system explorer: click to copy token, contrast check, tint ramps.

**Job:** turn the palette from a picture into a tool.
**Signature:** swatch columns that stretch their flex-grow on hover/focus (CSS-eased, snappy on entry, slow on exit) and print token + live WCAG verdict; one click copies the hex and the column answers with a check and "· copied".

**Provenance:** shadcn/ui `new-york-v4` (`badge`); Motion-Primitives `in-view`; handcraft kit vendored per package.

```tsx
import { SwatchSpectrum } from "swatch-spectrum"
import "swatch-spectrum/styles.css"

// Renders the crafted default demo; pass your own data (see props).
<SwatchSpectrum />
```

Vendor strategy: source is yours (`files` ships `dist` + raw `src`); deps are peer-only (react, motion, radix-ui, cva, clsx, tailwind-merge, lucide-react).
