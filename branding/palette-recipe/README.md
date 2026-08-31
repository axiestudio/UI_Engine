# palette-recipe — UI preset

Color recipe cards mix ingredients with percentages get brand swatches.

**Job:** turn palette values into a recipe anyone can cook.
**Signature:** recipe cards: each ingredient is a measured row whose fill bar pours in on scroll; the yield plate is the actual weight-mixed hex, and one click copies it; ratios are text for AT, not just bar widths.

**Provenance:** shadcn/ui `new-york-v4` (`badge`, `card`, `button`, `separator`); Motion-Primitives `animated-number`, `in-view`; handcraft kit vendored per package.

```tsx
import { PaletteRecipes } from "palette-recipe"
import "palette-recipe/styles.css"

// Renders the crafted default demo; pass your own data (see props).
<PaletteRecipes />
```

Vendor strategy: source is yours (`files` ships `dist` + raw `src`); deps are peer-only (react, motion, radix-ui, cva, clsx, tailwind-merge, lucide-react).
