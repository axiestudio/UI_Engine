# gsap-underline-nav — UI preset

Navigation with an underline that **GSAP-tweens** between items: the underline measures the active/desired anchor and eases to it from `offsetLeft`/`offsetWidth` with a springy `to()`.

**Provenance:** GSAP (`gsap`); Motion-Primitives `in-view`.

```tsx
<GsapUnderlineNav
  brand="STUDIO"
  items={["Work", "Services", "Journal", "Studio"]}
/>
```
