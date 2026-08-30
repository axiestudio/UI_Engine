# roadmap — UI preset

Public roadmap: Now / Next / Later (or custom `RoadmapStatus`) columns with status-badged item cards, tags, vote counts and an empty placeholder per column. `paper` (default) or `ink`.

**Provenance:** shadcn/ui `new-york-v4` (`badge`, `card`, `button`); Motion-Primitives `in-view`, `border-trail`.

```tsx
<Roadmap
  columns={[
    { status: "now", items: [{ title: "Recurring bookings", tag: "Booking", votes: 312 }] },
    { status: "next", items: [{ title: "Native mobile app", votes: 188 }] },
    { status: "later", items: [] },
  ]}
/>
```
