# Rive / Lottie — engine notes (paired tiers)

**Tier:** 3D / Advanced Visuals · **Kind:** engines (npm peers, never copied)
**Peers:** `@rive-app/react-canvas ^4.33.0` · `lottie-react ^3.1.1`

> Principle §10: **interactive animation vs animation assets.**
> Use **Rive** when the animation responds to interaction or state.
> Use **Lottie** when the animation is an asset that plays as part of the design.

## Rive — import contract

```tsx
import { useRive, useStateMachineInput } from "@rive-app/react-canvas"
const { rive, RiveComponent } = useRive({ src: "hero.riv", stateMachines: "SM", autoplay: true })
const hover = useStateMachineInput(rive, "SM", "hover")
<button onMouseEnter={() => hover?.fire()} />
```

- State machines are the point — inputs (`fire`, `number`, `boolean`) drive the art.
- WASM loads at runtime; wrap in `React.lazy`/suspense with a static fallback.

## Lottie — import contract

```tsx
import Lottie from "lottie-react"
<Lottie animationData={data} loop autoplay style={{ width: 120 }} />
```

- JSON assets live under the preset's `src/assets/`, imported (bundled) not fetched.
- Keep assets small — a preset carrying megabytes of JSON is a design smell.

## Decision

| Need | Tool |
|---|---|
| Responds to hover/click/state | **Rive** |
| Plays once/loops as a design asset | **Lottie** |
| Code-driven motion instead of authored art | anime.js / Motion Primitives / GSAP |
