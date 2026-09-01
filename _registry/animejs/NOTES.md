# Anime.js v4 — engine notes

**Tier:** Animation · **Kind:** engine (npm peer, never copied) · **Peer:** `animejs ^4.5.0`

> Principle: choose the animation tool by the *type* of animation. Anime.js v4 is
> the ergonomic middle — a full engine (timeline, drag, scroll, SVG, text) without
> GSAP's plugin matrix. Everything imports from one package.

## Import contract (v4 — a complete rewrite vs v3)

```ts
import { animate, createTimeline, createTimer, createDraggable, createScope, onScroll, stagger, utils, svg, text } from "animejs"
```

- v4 uses **named exports** — `import anime from 'animejs'` (v3) no longer exists.
- Sub-modules: `animejs/timeline`, `animejs/draggable`, `animejs/events` (onScroll),
  `animejs/svg`, `animejs/text`, `animejs/waapi`, `animejs/easings`, `animejs/utils`, …
  (see `moduleMap` in `library.json`). Top-level import pulls the whole engine —
  it's small; don't micro-chunk imports for bundle size.

## Module map (the docs sidebar, mapped)

| Need | Module | Key API |
|---|---|---|
| One-shot tweens | `animation` | `animate(targets, { to, from, delay, duration, ease, composition })` |
| Sequences | `timeline` | `createTimeline({ defaults }).add(anim, "<-=100")` — labels, position params |
| Timers/loops | `timer` | `createTimer({ loop, alternate, onLoop })` — heartbeat effects |
| Value stagger | `utils` | `stagger(80, { from: "center", ease, grid, axis })` |
| Scroll-linked | `events` | `onScroll({ target, enter: "bottom top", leave, sync })` — thresholds + sync modes |
| Drag | `draggable` | `createDraggable(el, { snap, releaseEase, onRelease })` — spring release physics |
| SVG | `svg` | `svg.morphTo(path)`, `svg.createDrawable(selector)`, `svg.createMotionPath(path)` |
| Text | `text` | `text.split(el, { chars, words, lines, accessible })`, `scrambleText` (4.5) |
| Layout transitions | `layout` | record/animate with `enterFrom`, `leaveTo`, `swapAt` — FLIP-style |
| React | `scope` | `createScope({ root }).add(fn)` → `scope.revert()` — our recipe |
| WAAPI | `waapi` | hardware-accelerated `animate` with anime defaults (spring eases included) |
| 3D | `adapters` | Three.js adapter (materials/uniforms, instanced meshes) |

## React wiring (what the recipe encodes)

```
useLayoutEffect → if (reduce) return → scope = createScope({ root }).add(setup) → cleanup scope.revert()
```

- `createScope` scopes selector text (`.card` only matches inside root) — required
  for side-by-side presets, and `revert()` makes StrictMode double-invocation safe.
- Function-based values (`delay: stagger(80)`) run inside the scope; keep all
  animate/timeline creation inside `scope.add()` so revert cleans them.

## Tool-choice within the animation tier (per principle §3)

| Problem | Reach for |
|---|---|
| In-view entrances, text effects, hover FX | **Motion Primitives** (first stop) |
| Stagger choreography, SVG morph/draw, draggable, scramble text | **Anime.js** |
| Long scrubbed/pinned scroll storytelling, SplitText-per-line layouts | **GSAP** (ScrollTrigger/SplitText) |
| Interactive physics tied to React state | **React Spring** |

## Pitfalls

- `onScroll` is Anime's ScrollObserver — sync modes (`sync: true` = playback
  progress) for scrub, thresholds like `"bottom top+=100"`. Don't mix with GSAP
  ScrollTrigger on the same element.
- v4 `alternate: true` + `loop: 2` plays forward-then-backward *per loop* — different
  mental model than GSAP's yoyo.
- Reduced motion: early-return the scope AND set final values in markup/CSS, never
  animate from hidden without a static fallback.
- `utils.cleanInlineStyles(targets)` after revert-sensitive sequences to avoid
  lingering inline transforms in the preset.
