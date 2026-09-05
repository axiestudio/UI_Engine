import * as React from "react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — dashboards that roll digits instead of snapping.
// JOB      make a headline number legible AS it updates
// SIGNATURE odometer columns: each digit is its own vertical strip that slides
//           (sliding-number DNA) so 1,412→1,420 only moves two wheels; trend
//           chip recomputes vs previous; threshold breach tints the tile.
//           Backdrop spark is a static SVG path (viewBox-scaled, no resize
//           observer) so the tile never triggers a resize loop in dense grids.
// API      value (live prop; re-animate on change), label, format, warn/over.
//          sparkColor (default --chart-line-primary), sparkHeight (default 24).
// A11Y     final value is plain text for SR (aria-live polite on the sr span
//          only when it stabilises), visual wheels are aria-hidden; the spark
//          chart is aria-hidden with an sr-only descriptive label.

export type KpiTileLiveProps = { label: string; value: number; prev?: number; format?: (v: number) => string; unit?: string; danger?: boolean; spark?: number[]; sparkColor?: string; sparkHeight?: number; className?: string }

export function KpiTileLive({ label, value, prev, format, unit, danger, spark, sparkColor, sparkHeight = 24, className }: KpiTileLiveProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const gradientId = `kpi-spark-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const text = format ? format(value) : Math.round(value).toLocaleString()
  const delta = prev === undefined ? 0 : value - prev
  // ── spark path (pure SVG, no resize observer — recharts ResponsiveContainer
  // caused an infinite resize loop when 3 tiles mounted inside pricing-lab's
  // dense grid, so the backdrop spark is a static viewBox-scaled path). ──
  const sparkPath = React.useMemo(() => {
    if (!spark || spark.length < 2) return null
    const min = Math.min(...spark)
    const max = Math.max(...spark)
    const span = max - min || 1
    const W = 100
    const H = 24
    const PAD = 2
    const pts = spark.map((v, i) => {
      const x = PAD + (i / (spark.length - 1)) * (W - PAD * 2)
      const y = PAD + (1 - (v - min) / span) * (H - PAD * 2)
      return [x, y] as const
    })
    const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ")
    const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${H} L${pts[0][0].toFixed(1)},${H} Z`
    return { line, area }
  }, [spark])
  return (
    <div className={cn("relative isolate w-full min-w-0 overflow-hidden rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-shadow", danger && "border-[hsl(var(--err))]/40", className)}>
      {danger && <span aria-hidden className="absolute inset-0 bg-[hsl(var(--err)/0.05)]" />}
      <p className="truncate text-[13px] font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 flex min-w-0 flex-wrap items-end gap-x-2 gap-y-1">
        <div aria-hidden className="flex min-w-0 items-end tabular-nums">
          {text.split("").map((ch, i) => {
            const digit = /\d/.test(ch)
            if (!digit) return <span key={i} className="inline-block text-[24px] font-semibold leading-[26px] tracking-tight">{ch}</span>
            return (
              <span key={i} aria-hidden className="relative inline-block h-[26px] w-[1.05ch] shrink-0 overflow-hidden text-center">
                <span className="block text-[24px] font-semibold leading-[26px] tracking-tight tabular-nums motion-safe:transition-transform motion-safe:duration-500" style={{ transform: `translateY(-${Number(ch) * 26}px)`, transitionDuration: reduce ? "0ms" : undefined }}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <span key={n} className="flex h-[26px] items-center justify-center leading-[26px] tabular-nums">{n}</span>)}
                </span>
              </span>
            )
          })}
        </div>
        {unit && <span className="pb-0.5 truncate text-[13px] font-medium text-muted-foreground">{unit}</span>}
        {prev !== undefined && delta !== 0 && (
          <span className={cn("mb-0.5 flex shrink-0 items-center gap-0.5 rounded-full border border-border/60 px-1.5 py-0.5 text-xs font-medium tabular-nums transition-colors", delta > 0 === !danger ? "bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]" : "bg-[hsl(var(--err)/0.08)] text-[hsl(var(--err))]")}>
            {delta > 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{Math.abs(delta) > 999 ? `${(Math.abs(delta) / 1000).toFixed(1)}k` : Math.round(Math.abs(delta))}
          </span>
        )}
      </div>
      <p className="sr-only" aria-live="polite">{label}: {text}{unit ? " " + unit : ""}</p>
      {spark && spark.length > 1 && sparkPath && (() => {
        const sFirst = spark[0], sLast = spark[spark.length - 1]
        const sDelta = sFirst === 0 ? 0 : ((sLast - sFirst) / Math.abs(sFirst)) * 100
        const color = sparkColor ?? "var(--chart-line-primary)"
        return (
          <>
            <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 w-full opacity-[0.16]" style={{ height: sparkHeight }}>
              <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="h-full w-full">
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <path d={sparkPath.area} fill={`url(#${gradientId})`} stroke="none" />
                <path d={sparkPath.line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
            <p className="sr-only">{label} trend spark: {spark.length} samples, {sDelta >= 0 ? "up" : "down"} {Math.abs(sDelta).toFixed(1)}%</p>
          </>
        )
      })()}
    </div>
  )
}
