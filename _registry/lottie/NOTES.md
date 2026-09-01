# Lottie — engine notes

**Tier:** 3D / Advanced Visuals · **Kind:** engine (npm peer, never copied) · **Peer:** `lottie-react ^3.1.1`

> Principle §10: Lottie = animation **assets** that play as part of the design.
> For animation that responds to interaction/state, use Rive instead —
> see the paired decision table in [`../rive/NOTES.md`](../rive/NOTES.md).

## Import contract

```tsx
import Lottie from "lottie-react"
<Lottie animationData={data} loop autoplay style={{ width: 120 }} />
```

- JSON assets live under the preset's `src/assets/`, imported (bundled) — never fetched.
- Keep assets small; a preset carrying megabytes of JSON is a design smell.
- Reduced motion: `autoplay={false}` + render the settled frame via `lottieRef.setFrame(last)`.
