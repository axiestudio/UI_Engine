# stats — UI preset

Count-up metrics band (ink) or bordered tiles (paper). Numbers animate on first in-view; strings render as-is. Respect reduce-motion (no spring, final value).

**Provenance:** Watermelon `stats-2` (verbatim `Stats2`), shadcn-lineage `card`/`button`; Motion-Primitives `animated-number`, `in-view`, `border-trail`.

```tsx
<Stats tone="ink" items={[{ value: 1839, suffix: "+", label: "Verified reviews", icon: MessagesSquare }, { value: 4.9, decimals: 1, label: "Average rating", suffix: "/5" }]} />
```
