# curtain-call

**JOB** — Land the visitor inside a theatre before the page starts.
**EMOTION** — Held breath: the house lights dim, the curtain closes.
**SIGNATURE** — Twin velvet panels (pleats, corner light, grain, lit seam) part on a wheel scrub; the welcome statement scales up behind the opening. Replicated and productionized from the engine's own intro gate.

Two modes:

- `mode="overlay"` (default) — a page-gate: `fixed inset-0 z-[95]`, body scroll locked until the curtain is fully open, then it unmounts and calls `onOpen`. Driven by wheel/touch/keyboard scrub, an **Enter** button (animated spring open), and skips entirely for `prefers-reduced-motion` visitors (`skipOnReducedMotion`, default).
- `mode="stage"` — an embeddable section. Pass the hero it reveals as `children`: the panels sit above it, ride the whole pinned span on a circInOut curve — slow start, gliding stop with both panels clear of the frame — then the whole curtain unmounts at open. Only the content remains: a scroll-pinned `h-screen` theatre inside a `stageHeight` wrapper (default `240vh`); scroll position through the wrapper drives the peel. No capture, no lock — the content after the section is what the curtain reveals.

```tsx
import { CurtainCall } from "curtain-call"

// intro gate (engine-style)
<CurtainCall kicker="MAISON" title="WELCOME" logo={{ src: "/mark.webp" }} />

// in-page theatre section
<CurtainCall mode="stage" kicker="COLLECTION 04" title="AUTUMN" hint="KEEP SCROLLING" />
```

## Tokens

The stage is a **deliberate dark band in every theme** — it paints from dedicated `--curtain`, `--curtain-lit`, `--curtain-glow`, `--curtain-text` (all HSL triplets; `.dark` lifts the velvet off a dark page background). Re-skin the theatre without touching code:

```css
:root { --curtain: 344 22% 8%; --curtain-glow: 36 80% 66%; } /* burgundy + gold */
```

## Sources

Design replicated from `engine/src/Curtain.tsx` (this repo's UI-engine gate), per `UI/HANDCRAFT-CHECKLIST.md`. Vendored: shadcn/ui `button` (new-york-v4), motion-primitives `in-view`, plus the in-repo `handcraft` kit (`Grain`). Motion via `motion/react` `useMotionValue`/`useTransform`/`useScroll`.

## A11y

Keyboard scrub (arrows / PageUp-Down / Space / Enter), real focus-visible Enter button, reduced-motion = no gate / no hint pulse, hint + panels `aria-hidden`, description copy is props.
