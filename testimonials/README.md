# testimonials — UI preset

Social proof section, data-driven only (no fabricated reviews in src).

## Variants
- `variant="marquee"` — dual-row CSS marquee (keyframe `ui-marquee_x` added locally), pauses on hover, degrades to `motion-reduce: animation none` + a scroll-snap row under `prefers-reduced-motion`, includes `.sr-only` full copy.
- `variant="carousel"` — Motion-Primitives `Carousel` with drag, `CarouselNavigation` + `CarouselIndicator`.

`summary` animates rating/count on first in-view (spring number that respects reduced motion).

## Provenance
| Source | Item |
| --- | --- |
| Motion-Primitives | `carousel`, `animated-number`, `in-view` |
| Watermelon UI registry | `testimonials-1`, `testimonials-2` (exported verbatim), `card`, `avatar`, `button` |
| shadcn registry | `carousel` base required by `testimonials-1` (UI-kit only, marked in header) |

## Use
```tsx
<Testimonials
  variant="marquee"
  summary={{ rating: 4.9, reviewCount: 1839 }}
  items={[{ author: "Jane", rating: 5, body: "…", source: "Google" }]}
/>
```
Build: `npm run build --workspace=UI/testimonials`.
