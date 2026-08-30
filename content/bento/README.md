# bento — UI preset

Asymmetric highlight grid: cells declare `span` (`{ sm, lg }`), `image` (cover + overlay title), `tone: "ink"`, `icon` and a free `content` slot (embeds, counters, mini widgets). Cursor `Spotlight` on non-image cells (opt out via `spotlight={false}`). Staggered InView entrance; 170px auto-row rhythm.

**Provenance:** Watermelon `bento-1` (verbatim reference composition, 936-line showcase), `card`; Motion-Primitives `spotlight`, `in-view`.

```tsx
<Bento cells={[
  { id: "studio", image: "/studio.webp", title: "The studio", span: { sm: 2, lg: 2 } },
  { title: "Late openings", description: "Until 21:00 weekdays.", icon: Clock, tone: "ink" },
  { title: "Live booking", content: <MyWidget />, span: { lg: 2 } },
]} />
```
