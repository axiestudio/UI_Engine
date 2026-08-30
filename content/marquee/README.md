# marquee — UI preset

Ticker-tape ribbon: infinite CSS marquee (translateX loop), pause-on-hover, reverse + speed props, optional leading chip, optional text items. `ink` (default) or `paper` tone. Reduced-motion users see a static row.

**Provenance:** shadcn/ui `new-york-v4` (`badge`); Motion-Primitives `text-loop`, `in-view`.

```tsx
<Marquee
  label="Trusted by"
  items={["Vercel", "Linear", "Raycast", "Notion", "Figma"]}
  speed={25}
  tone="ink"
/>
```
