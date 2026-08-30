# features — UI preset

Feature/services grid with cursor `Spotlight` cards (opt-out via `spotlight={false}`), icons, benefit bullets, action link, corner badge, `tone="ink"|"paper"`. Column clamp + staggered InView.

**Provenance:** Watermelon `feature-1`/`feature-2` (verbatim), `card`/`button` (+ `accordion` base required by feature-2); Motion-Primitives `spotlight`, `in-view`, `tilt`.

```tsx
<Features eyebrow="Services" title="Built around how you treat" items={[{ icon: Hand, title: "Deep tissue", description: "…", bullets: ["60 or 90 min"], badge: "Most booked", action: { label: "Book this", href: "#contact" } }]} />
```
