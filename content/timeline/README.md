# timeline — UI preset

"Our story" milestones: center rail with absolite dots (geometry survives all breakpoints), alternating 50% cards on lg, rail BorderTrail glow, image cards, `now: true` state (filled dot + NOW chip). `layout="left"` for dense stories.

**Provenance:** Motion-Primitives `in-view`, `border-trail`, `text-loop` (`timeline__timeline` watermelon item skipped — it pulls `@dnd-kit` + `tunnel-rat`, wrong dependency surface for a read-only story block; rationale kept in engine notes).

```tsx
<Timeline items={[{ time: "2001", title: "Two rooms above the bakery" }, { time: "2026", title: "Live booking", now: true, image: "/p/2026.webp" }]} />
```
