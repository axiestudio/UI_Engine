# Apache ECharts — engine notes

**Tier:** Visualization · **Kind:** engine (npm peer, never copied) · **Peer:** `echarts ^6.1.0`

> Principle: specialization, not habit. ECharts is the heavyweight — only when
> datasets/interactions outgrow Recharts and Bklit.

## Import contract

```ts
import * as echarts from "echarts/core"
import { LineChart } from "echarts/charts"
import { GridComponent, TooltipComponent } from "echarts/components"
import { CanvasRenderer } from "echarts/renderers"
echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])
```

- Tree-shake via `echarts/core` + `echarts.use` — the full import is megabytes.
- React wiring: `echarts.init(ref.current)` in an effect, `chart.setOption(option)`
  on data change, `chart.dispose()` on unmount, `ResizeObserver` → `chart.resize()`.

## Tool-choice within the visualization tier (per principle §8)

| Need | Tool |
|---|---|
| Design-forward marketing charts | Bklit |
| Simple React app charts | Recharts |
| Large data, canvas perf, exotic chart types | **ECharts** |

## Pitfalls

- Options are plain objects — keep them in `useMemo`, never rebuild per render.
- Theme: build a token-mapped theme object (ECharts themes accept CSS-var-resolved
  colors at init time; tokens resolve before init in our presets).
- Canvas rendering ignores DOM fonts until `chart.resize()` after font load.
