# logos — UI preset

"Trusted by / press" strip: `variant="marquee"` uses `InfiniteSlider` (px/s speed, hover slow via speedOnHover-ready, reverse, edge fades) or `variant="wall"` bordered grid. Logos pass as `src` image, `icon` component, or wordmark fallback.

**Provenance:** Motion-Primitives `infinite-slider`, `in-view`; Watermelon `integrations-1..5` exported verbatim (their `SiSlack` import patched to a neutral glyph — react-icons 5.x removed brand glyphs).

```tsx
<Logos label="As seen in" logos={[{ name: "Health Weekly", src: "/lw.svg", href: "…" }]} />
<Logos variant="wall" columns={4} logos={[{ name: "Bokadirekt", icon: CalendarClock }]} />
```
