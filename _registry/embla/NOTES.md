# Embla Carousel — engine notes

**Tier:** Interaction · **Kind:** engine (npm peer, never copied) · **Peer:** `embla-carousel-react ^8.6.0`

> Principle: libraries solve technical problems. Embla owns the *mechanics* of
> carousels; the visual design (chrome, typography, spacing, motion) is ours.

## Import contract

```tsx
import useEmblaCarousel from "embla-carousel-react"   // v8 default import — portable across builds
const [emblaRef, embla] = useEmblaCarousel({ ...options })
```

- Attach `emblaRef` to the **viewport** (the overflow-hidden element); slides must be its direct flex children.
- `embla` (API) is `undefined` until init — always guard (`if (!embla) return`).
- The React hook destroys the instance on unmount; no manual cleanup needed.

## Options our presets actually use

| Option | Values seen in-repo | Note |
|---|---|---|
| `align` | `"start"` \| `"center"` | `"center"` for hero/testimonial rails |
| `containScroll` | `"keepSnaps"` \| `"trimSnaps"` \| `false` | `"keepSnaps"` pairs with `dragFree` chip rails; `false` with `axis: "y"` |
| `dragFree` | `true` | momentum flick, snaps only on interaction |
| `loop` | `true` \| `false` | needs enough slide width to wrap |
| `axis` | `"x"` \| `"y"` | vertical rails set `axis: "y"` |

## API surface used in-repo

`scrollTo(index, jump?)` · `scrollPrev()` / `scrollNext()` · `selectedScrollSnap()` ·
`scrollSnapList()` · `canScrollPrev()` / `canScrollNext()` · `containerNode()` ·
`on(event, cb)` / `off(event, cb)` — events: `"select"`, `"reInit"`.

Recipe: [`recipes/use-embla-selected.tsx`](./recipes/use-embla-selected.tsx) wires the
select/reInit event pair into `{ selectedIndex, snapCount, canPrev, canNext }`.

## Pitfalls

- Always `off()` every `on()` — presets run side-by-side in one page.
- `loop: true` silently does nothing when slides don't overflow; check `canScrollNext`.
- With `dragFree`, snap points still exist (`containScroll: "keepSnaps"` keeps them).
- Plugins (autoplay, wheel-gestures, auto-height) are **separate npm packages** —
  add them to `library.json` → `packages` before first use, never ad hoc.
- a11y: wrap viewport in `role="region"` + `aria-roledescription="carousel"`,
  label prev/next buttons (`aria-label`), mirror `selectedIndex` for screen readers.
