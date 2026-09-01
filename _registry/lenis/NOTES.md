# Lenis — engine notes

**Tier:** Animation · **Kind:** engine (npm peer, never copied) · **Peer:** `lenis ^1.3.26`

> Principle: specialized libraries for specialized problems. Lenis owns page-scroll
> feel; GSAP ScrollTrigger and anime onScroll own what happens *during* scroll.

## Import contract

```ts
import Lenis from "lenis"
const lenis = new Lenis({ autoRaf: true })   // v1.3+: built-in raf loop
```

- One instance per page, created at the page/shell level — never inside a section
  preset (our presets are embeddable; a second instance breaks the first).
- Without `autoRaf`, drive it: `function raf(t){ lenis.raf(t); requestAnimationFrame(raf) }`.
- Cleanup: `lenis.destroy()` on unmount.
- CSS: `html.lenis, html.lenis body { height: auto }` + `.lenis.lenis-smooth { scroll-behavior: auto !important }` — import `lenis/dist/lenis.css`.

## Integration with the other tiers

- GSAP: `lenis.on("scroll", ScrollTrigger.update)`; `gsap.ticker.add((t) => lenis.raf(t * 1000))`.
- Anime.js: `lenis.on("scroll", ({ scroll }) => …)` or feed its engine.
- Anchor/CTA buttons: `lenis.scrollTo(target, { offset, duration })` instead of native `scrollIntoView`.

## Pitfalls

- `prefers-reduced-motion: reduce` → skip instantiation entirely (native scroll).
- Fixed-chrome presets (`--fixed-inset-*`) are unaffected, but sticky headers need
  `sticky` (not JS-fixed) to work with transformed scroll.
- Do not combine with CSS `scroll-behavior: smooth` — Lenis replaces it.
