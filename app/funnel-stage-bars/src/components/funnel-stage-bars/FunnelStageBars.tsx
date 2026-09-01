import * as React from "react"
import { cn } from "@/lib/utils"
import {
  FunnelChart,
  type FunnelStage as ChartFunnelStage,
} from "@/components/bklit/funnel-chart"

// ═══ APP-PRIMARY — analytics funnels that explain their own drops.
// JOB      show conversion between stages as one honest funnel
// BUILD    rebuilt on the vendored Bklit FunnelChart (halo rings, curved
//          edges, spring hover) with this package's drop-off signature
//          reimplemented as Bklit-style "−N lost" chips between segments.
// API      stages [{label, value}] + eyebrow/topLabel/className (unchanged),
//          plus layers / edges / orientation / showDropOff / controlled hover.
// A11Y     figure/figcaption + an ol of focusable stage rows (visible focus
//          ring); the funnel itself is role="img" with a conversion summary;
//          prefers-reduced-motion collapses the entrance to instant layout.

export type FunnelStage = { label: string; value: number }
export type FunnelStageBarsProps = {
  stages: FunnelStage[]
  eyebrow?: string
  topLabel?: string
  className?: string
  /** Halo ring count per segment. Default 2 */
  layers?: number
  /** Segment edge style. Default "curved" */
  edges?: "curved" | "straight"
  /** Funnel flow direction. Default "horizontal" */
  orientation?: "horizontal" | "vertical"
  /** Render "−N lost" chips between consecutive stages. Default true */
  showDropOff?: boolean
  /** Controlled hover — index of the highlighted stage */
  hoveredIndex?: number | null
  /** Hover change callback (also fires for keyboard focus) */
  onHoverChange?: (index: number | null) => void
}

const GAP = 4

/** Map a stage's share of the top stage onto the 5-step chart scale tokens. */
function scaleColor(share: number): string {
  const idx = Math.min(5, Math.max(1, Math.round(share * 4) + 1))
  return `var(--chart-scale-0${idx})`
}

export function FunnelStageBars({
  stages,
  eyebrow = "CONVERSION FUNNEL",
  topLabel,
  className,
  layers = 2,
  edges = "curved",
  orientation = "horizontal",
  showDropOff = true,
  hoveredIndex,
  onHoverChange,
}: FunnelStageBarsProps) {
  const reduce = React.useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  )
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const [sz, setSz] = React.useState({ w: 0, h: 0 })

  React.useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => {
      const { width, height } = el.getBoundingClientRect()
      if (width > 0 && height > 0) setSz({ w: width, h: height })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const top = Math.max(0, stages[0]?.value ?? 0)
  const final = stages.at(-1)?.value ?? 0
  const convPct = top > 0 ? ((final / top) * 100).toFixed(1) : "0.0"
  const n = stages.length
  const horiz = orientation === "horizontal"

  const chartData: ChartFunnelStage[] = stages.map((st) => ({
    label: st.label,
    value: st.value,
    displayValue: st.value.toLocaleString(),
    color: scaleColor(top > 0 ? st.value / top : 0),
  }))

  const segLen =
    n > 0 ? ((horiz ? sz.w : sz.h) - GAP * (n - 1)) / n : 0

  const ariaLabel = `${eyebrow}: ${stages.map((s) => s.label).join(" → ")}; ${convPct}% overall conversion`

  return (
    <figure className={cn("font-sans", className)}>
      <figcaption className="mb-4 flex items-baseline justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{eyebrow}</p>
        {topLabel && <p className="text-sm font-medium">{topLabel}: <span className="font-semibold text-[hsl(var(--info))]">{convPct}%</span></p>}
      </figcaption>
      {n > 0 && (
        <div ref={wrapRef} className="relative">
          <div role="img" aria-label={ariaLabel}>
            <FunnelChart
              data={chartData}
              layers={layers}
              edges={edges}
              orientation={orientation}
              staggerDelay={reduce ? 0 : 0.08}
              enterTransition={reduce ? { duration: 0 } : undefined}
              hoveredIndex={hoveredIndex}
              onHoverChange={onHoverChange}
            />
          </div>
          {showDropOff &&
            sz.w > 0 &&
            stages.map((st, i) => {
              if (i === 0) return null
              const drop = stages[i - 1].value - st.value
              if (drop <= 0) return null
              const center = segLen * i + GAP * (i - 1) + GAP / 2
              return (
                <div
                  aria-hidden
                  key={`drop-${st.label}`}
                  className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-background/80 px-2 py-0.5 font-mono text-[10px] font-semibold text-[hsl(var(--err))] backdrop-blur-sm"
                  style={{
                    left: horiz ? center : sz.w / 2,
                    top: horiz ? sz.h / 2 : center,
                    borderColor: "hsl(var(--err) / 0.25)",
                  }}
                >
                  −{drop.toLocaleString()} lost
                </div>
              )
            })}
          <ol className="pointer-events-none absolute inset-0 z-40 m-0 list-none p-0">
            {stages.map((st, i) => {
              const prev = i === 0 ? st.value : stages[i - 1].value
              const drop = prev - st.value
              const share = top > 0 ? st.value / top : 0
              const pos: React.CSSProperties = horiz
                ? { left: (segLen + GAP) * i, width: segLen, top: 0, height: "100%" }
                : { top: (segLen + GAP) * i, height: segLen, left: 0, width: "100%" }
              return (
                <li
                  key={st.label}
                  tabIndex={0}
                  aria-label={`${st.label}: ${st.value.toLocaleString()} (${Math.round(share * 100)}% of first stage)${i > 0 && drop > 0 ? `, ${drop.toLocaleString()} lost from previous stage` : ""}`}
                  className="absolute rounded-md pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  style={pos}
                  onFocus={() => onHoverChange?.(i)}
                  onBlur={() => onHoverChange?.(null)}
                />
              )
            })}
          </ol>
        </div>
      )}
    </figure>
  )
}
