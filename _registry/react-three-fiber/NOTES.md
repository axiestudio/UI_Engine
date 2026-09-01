# Three.js + React Three Fiber — engine notes

**Tier:** 3D / Advanced Visuals · **Kind:** engine (npm peers, never copied) · **Peers:** `three ^0.185.1`, `@react-three/fiber ^9.7.0`

> Principle §9: **3D should support the design, not become the design.** Use it
> when it creates a meaningful visual experience — product visualization,
> interactive objects, hero moments, visual storytelling.

## Import contract

```tsx
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"   // optional helper ecosystem
<Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5] }}>
  <mesh>…</mesh>
</Canvas>
```

- Raw `three` is the underlying engine; R3F is the React renderer — inside this
  workspace always go through R3F, never imperatively mixing both.
- `@types/three` ships separately — dev peer for editor support.

## Performance discipline (why 3D stays optional here)

- Clamp `dpr={[1, 2]}` — never native device pixels on phones.
- Static scenes: `frameloop="demand"` + `invalidate()` — battery-friendly.
- Lazy-load: `React.lazy(() => import("./scene"))` + suspense fallback = static
  visual placeholder, so the section works without WebGL.

## Pitfalls

- WebGL context limits — one Canvas per page section max; do not stack three Canvases.
- Reduced motion: pause the frameloop, render the settled frame.
- Load models via drei `useGLTF` with `useMemo` caching — never fetch inside render.
