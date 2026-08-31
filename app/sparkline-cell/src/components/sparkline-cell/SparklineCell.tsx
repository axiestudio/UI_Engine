import * as React from "react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — a table column that reads like a stock watchlist.
// JOB      show trend inside a data row without leaving the row
// SIGNATURE the line draws itself with pathLength on first view; hover parks
//           a crosshair with a floating (x, y) tooltip snapped to the nearest
//           sample; an anomaly sample (|z| > 2) pulses red.
// API      values: number[] , format?(v) ⇒ tooltip string, tone auto from slope.
// A11Y     role="img" with computed alt: "trend up 12.4% over 30 samples".

export type SparklineCellProps = { values: number[]; labels?: string[]; format?: (v: number) => string; width?: number; height?: number; className?: string }

export function SparklineCell({ values, labels, format = (v) => String(Math.round(v * 100) / 100), width = 128, height = 34, className }: SparklineCellProps) {
  const [hover, setHover] = React.useState<number | null>(null)
  if (values.length < 2) return null
  const min = Math.min(...values), max = Math.max(...values), rng = max - min || 1
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const sd = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length) || 1
  const pts = values.map((v, i) => ({ x: (i / (values.length - 1)) * (width - 6) + 3, y: height - 4 - ((v - min) / rng) * (height - 10), v, i }))
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ")
  const first = values[0], last = values[values.length - 1]
  const delta = first === 0 ? 0 : ((last - first) / Math.abs(first)) * 100
  const up = delta >= 0
  const anomalous = pts.map((p) => Math.abs((p.v - mean) / sd))
  const hp = hover == null ? null : pts[Math.max(0, Math.min(pts.length - 1, Math.round((hover / width) * (pts.length - 1))))]
  return (
    <span className={cn("relative inline-block align-middle font-sans", className)}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`trend ${up ? "up" : "down"} ${Math.abs(delta).toFixed(1)}% over ${values.length} samples`} className={cn("overflow-visible")} onMouseMove={(e) => setHover(e.nativeEvent.offsetX)} onMouseLeave={() => setHover(null)}>
        <path d={d + ` L${pts[pts.length - 1].x} ${height} L${pts[0].x} ${height} Z`} fill={up ? "hsl(var(--ok))" : "hsl(var(--err))"} opacity={0.09} />
        <path d={d} fill="none" stroke={up ? "hsl(var(--ok))" : "hsl(var(--err))"} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <animate attributeName="stroke-dasharray" from="0 260" to="260 260" dur="0.9s" fill="freeze" begin="0s" />
        </path>
        {pts.map((p, i) => anomalous[i] > 2.4 && <circle key={i} cx={p.x} cy={p.y} r={2.4} fill="hsl(var(--err))"><animate attributeName="opacity" values="1;0.25;1" dur="1.6s" repeatCount="indefinite" /></circle>)}
        {hp && <g><line x1={hp.x} x2={hp.x} y1={0} y2={height} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 3" opacity={0.5} /><circle cx={hp.x} cy={hp.y} r={2.6} fill="hsl(var(--foreground))" /></g>}
      </svg>
      <span className={cn("ml-2 inline-block w-14 text-right font-mono text-[11px] font-medium tabular-nums", up ? "text-[hsl(var(--ok))]" : "text-[hsl(var(--err))]")}>{up ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%</span>
      {hp && (
        <span role="tooltip" className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md border border-border/70 bg-popover px-2 py-1 font-mono text-[11px] font-medium shadow-lg">
          {labels?.[hp.i] ? labels[hp.i] + " · " : ""}{format(hp.v)}
        </span>
      )}
    </span>
  )
}
