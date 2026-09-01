# React Spring — engine notes

**Tier:** Animation · **Kind:** engine (npm peer, never copied) · **Peer:** `@react-spring/web ^10.1.2`

> Principle: choose the animation tool by the *type* of animation. React Spring is
> for **interactive physics** — motion that derives from React state and interrupts.

## Import contract

```tsx
import { useSpring, useTrail, useTransition, useChain, animated, config } from "@react-spring/web"
const styles = useSpring({ opacity: open ? 1 : 0, transform: open ? "scale(1)" : "scale(0.96)" })
return <animated.div style={styles} />
```

- Render via `animated.*` components (no re-render per frame — values update via ref).
- Springs re-derive when deps change: `useSpring(params, [deps])`; `api.start()` for imperative control.
- `useTransition` for enter/exit lists (mount/unmount-aware); `useTrail` for stagger follow-through.
- Easing presets: `config.gentle | wobbly | stiff | slow | molasses` or `{ tension, friction }`.

## Tool-choice within the animation tier (per principle §3)

| Motion | Tool |
|---|---|
| Entrance choreography | Motion Primitives / anime.js |
| Drag with momentum (DOM-level) | anime.js Draggable / GSAP Draggable |
| Motion follows React state, interrupts freely, spring feel | **React Spring** |

## Pitfalls

- Never animate `top/left/width` — springs on transforms/opacity only (perf).
- Interrupting a duration-based animation mid-flight snaps; springs don't — that's
  the reason this library exists.
- SSR: values compute client-side; render the resting state as initial.
