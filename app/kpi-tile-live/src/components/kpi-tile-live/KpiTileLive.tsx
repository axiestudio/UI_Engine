import * as React from "react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { Area, AreaChart, YAxis } from "recharts"
import { cn } from "@/lib/utils"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"

// ═══ APP-PRIMARY — dashboards that roll digits instead of snapping.
// JOB      make a headline number legible AS it updates
// SIGNATURE odometer columns: each digit is its own vertical strip that slides
//           (sliding-number DNA) so 1,412→1,420 only moves two wheels; trend
//           chip recomputes vs previous; threshold breach tints the tile.
//           Backdrop spark is a real recharts Area chart (shadcn chart
//           convention, fitted y-domain so the line never reads flat).
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
  return (
    <div className={cn("relative isolate overflow-hidden rounded-xl border border-border/70 bg-card p-5 transition-shadow shadow-sm", danger && "border-[hsl(var(--err))]/40", className)}>
      {danger && <span aria-hidden className="absolute inset-0 bg-[hsl(var(--err)/0.05)]" />}
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="mt-1.5 flex items-end gap-2.5">
        <div aria-hidden className="flex tabular-nums">
          {text.split("").map((ch, i) => {
            const digit = /\d/.test(ch)
            if (!digit) return <span key={i} className="inline-block text-[30px] font-semibold leading-none tracking-tight">{ch}</span>
            return (
              <span key={i} aria-hidden className="relative inline-block h-[30px] w-[0.6ch] overflow-hidden">
                <span className="block text-[30px] font-semibold leading-[30px] tracking-tight motion-safe:transition-transform motion-safe:duration-500" style={{ transform: `translateY(-${Number(ch) * 30}px)`, transitionDuration: reduce ? "0ms" : undefined }}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <span key={n} className="block h-[30px] leading-[30px] text-center tabular-nums">{n}</span>)}
                </span>
              </span>
            )
          })}
        </div>
        {unit && <span className="pb-0.5 text-sm font-medium text-muted-foreground">{unit}</span>}
        {prev !== undefined && delta !== 0 && (
          <span key={value} className={cn("mb-1 flex items-center gap-0.5 rounded-full border border-border/60 px-1.5 py-0.5 text-xs font-medium tabular-nums", delta > 0 === !danger ? "bg-[hsl(var(--ok)/0.08)] text-[hsl(var(--ok))]" : "bg-[hsl(var(--err)/0.08)] text-[hsl(var(--err))]")}>
            {delta > 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{Math.abs(delta) > 999 ? `${(Math.abs(delta) / 1000).toFixed(1)}k` : Math.round(Math.abs(delta))}
          </span>
        )}
      </div>
      <p className="sr-only" aria-live="polite">{label}: {text}{unit ? " " + unit : ""}</p>
      {spark && spark.length > 1 && (() => {
        const data = spark.map((v, i) => ({ i, v }))
        const sFirst = spark[0], sLast = spark[spark.length - 1]
        const sDelta = sFirst === 0 ? 0 : ((sLast - sFirst) / Math.abs(sFirst)) * 100
        const chartConfig = {
          spark: { label, color: sparkColor ?? "var(--chart-line-primary)" },
        } satisfies ChartConfig
        return (
          <>
            <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 w-full opacity-[0.16]" style={{ height: sparkHeight }}>
              <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
                <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-spark)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--color-spark)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
                  <Area dataKey="v" type="monotone" stroke="var(--color-spark)" strokeWidth={2} fill={`url(#${gradientId})`} isAnimationActive={false} />
                </AreaChart>
              </ChartContainer>
            </div>
            <p className="sr-only">{label} trend spark: {spark.length} samples, {sDelta >= 0 ? "up" : "down"} {Math.abs(sDelta).toFixed(1)}%</p>
          </>
        )
      })()}
    </div>
  )
}
