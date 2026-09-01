# GSAP — engine notes

**Tier:** Animation · **Kind:** engine (npm peer, never copied) · **Peer:** `gsap ^3.15.0`

> Principle: choose the animation tool by the *type* of animation. GSAP is for
> complex, highly controlled motion — not the default for every fade.

## Import contract

```tsx
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
gsap.registerPlugin(ScrollTrigger)   // once, at module scope — never inside render/effects
```

- All plugins ship in the npm package and are free since 3.13 (Webflow) —
  `SplitText`, `InertiaPlugin`, `DrawSVGPlugin` included. See `plugins` in `library.json`.
- Unused plugin imports still bundle; only import what the preset registers.

## The in-repo pattern (what `with-gsap` recipe encodes)

```
useLayoutEffect → if (reduce) return → ctx = gsap.context(() => {…}, rootRef) → cleanup ctx.revert()
```

- `useLayoutEffect` (not `useEffect`) — avoids first-frame flash before transforms apply.
- `gsap.context` scopes selector text (`.panel` only matches inside rootRef) and makes
  the whole setup revertable — required for React StrictMode double-invocation.
- `prefers-reduced-motion` gate first: the component must render its static,
  fully-readable end state when motion is reduced.
- ScrollTrigger scenes: `scrollTrigger: { trigger: rootRef.current, start: "top 70%", end: …, scrub: true|<n> }`.

## Choosing inside GSAP (per principle doc §3)

| Problem | Tool |
|---|---|
| Sequenced/layered entrance, hero scenes | `gsap.timeline()` + stagger |
| Scroll-scrubbed drawing/parallax/pin | ScrollTrigger (`scrub`) |
| Element moves between layouts | `Flip.getState()` / `Flip.from()` |
| Drag with momentum | `Draggable` + `InertiaPlugin` |
| Per-character text reveals | `SplitText` |
| Pointer-follow effects | `gsap.quickTo()` (no re-render per move) |

## Pitfalls

- Never animate layout properties (`top/left/width`) when a transform works.
- `ctx.revert()` must kill ScrollTriggers created inside the context — don't
  create triggers outside it.
- Timelines with `defaults: { ease: "none" }` for scrub; eased timelines for entrances.
- Set initial hidden state with `gsap.set()` inside the context (not CSS `opacity-0`),
  otherwise reduced-motion and no-JS render blank.
