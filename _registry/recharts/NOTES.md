# Recharts — engine notes

**Tier:** Visualization · **Kind:** engine (npm peer, never copied) · **Peer:** `recharts ^3.10.1`

> Principle: use the simplest visualization library that achieves the result.
> Recharts = plain utility charts. Bklit = design-forward charts. ECharts = heavy data.

## Import contract

```tsx
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
```

- Composable JSX — axes/tooltips/grid are declared children, all themeable.
- v3 keeps the v2 mental model; check the v3 migration notes before importing v2 snippets.

## In-repo reference

`app/kpi-tile-live` is the canonical styled usage — token-driven colors, no
hardcoded hex (HANDCRAFT-CHECKLIST rule), sparkline-scaled.

## Tool-choice within the visualization tier (per principle §8)

| Need | Tool |
|---|---|
| Polished, animated, design-statement charts | **Bklit** (vendored source) |
| Plain utility charts in app surfaces | **Recharts** |
| Large datasets, canvas-scale interaction | **ECharts** |

## Pitfalls

- Wrap in `ResponsiveContainer` — fixed widths break embedded presets.
- Tooltip content: pass a custom component reading our tokens; never accept the
  default dark-gray box in a brand preset.
- Animation: `isAnimationActive={false}` inside scroll-driven or frequently
  re-rendering surfaces.
