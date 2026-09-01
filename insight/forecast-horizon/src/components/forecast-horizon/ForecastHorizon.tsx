import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"


export type ForecastHorizonProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  history?: number[]
  growth?: number
  unit?: string
  className?: string
}

export function ForecastHorizon({
  eyebrow = "FORECAST · DRAG THE HORIZON",
  title = "Forecast horizon",
  subtitle = "Solid is history. Dashed is assumption. Drag to extend.",
  history = [18, 22, 26, 25, 31, 38, 44],
  growth = 14,
  unit = "k MRR",
  className,
}: ForecastHorizonProps) {
  const [months, setMonths] = React.useState(6)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  const W = 100, H = 100
  const all = React.useMemo(
    () => [...history, ...Array.from({ length: months }, (_, i) => Math.round(history[history.length - 1] * Math.pow(1 + growth / 100, i + 1)))],
    [history, months, growth],
  )
  const max = React.useMemo(() => Math.max(...all), [all])
  const min = React.useMemo(() => Math.min(...all), [all])

  const xy = React.useCallback(
    (v: number, i: number) => {
      const x = (i / (all.length - 1)) * W
      const y = H - ((v - min) / (max - min || 1)) * (H - 16) - 8
      return [x, y] as const
    },
    [all.length, min, max],
  )

  const histPath = React.useMemo(() => history.map((v, i) => `${i === 0 ? "M" : "L"}${xy(v, i)[0].toFixed(2)} ${xy(v, i)[1].toFixed(2)}`).join(" "), [history, xy])
  const fcSegment = React.useMemo(() => [history[history.length - 1], ...Array.from({ length: months }, (_, i) => all[history.length + i])], [history, months, all])
  const fcPath = React.useMemo(
    () => fcSegment.map((v, i) => `${i === 0 ? "M" : "L"}${xy(v, history.length - 1 + i)[0].toFixed(2)} ${xy(v, history.length - 1 + i)[1].toFixed(2)}`).join(" "),
    [fcSegment, history.length, xy],
  )
  const bandTop = React.useMemo(() => fcPath.replace(/L([\d.]+) ([\d.]+)/g, (_m, x, y) => `L${x} ${Math.max(0, Number(y) - 3.2).toFixed(2)}`), [fcPath])
  const bandBottom = React.useMemo(
    () => fcPath.replace(/M([\d.]+) ([\d.]+)/, "L$1 $2").replace(/L([\d.]+) ([\d.]+)/g, (_m, x, y) => `L${x} ${Math.min(100, Number(y) + 3.2).toFixed(2)}`),
    [fcPath],
  )

  const finalValue = all[all.length - 1]

  return (
    <section className={cn("relative isolate w-full overflow-hidden", className)}>
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>
          <h2 className="mt-3 font-display text-[28px] font-semibold leading-[1.05] tracking-[-0.022em] text-foreground sm:text-[34px]">{title}</h2>
          <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{subtitle}</p>
        </div>

        <div aria-live="polite" aria-atomic="true" className="shrink-0 rounded-xl border bg-card px-5 py-4 text-right shadow-sm">
          <span className="block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">+{months} months out</span>
          <span className="mt-1 block font-display text-[26px] font-semibold tabular-nums leading-none tracking-[-0.02em] text-foreground">
            {finalValue.toLocaleString()}
            <span className="ml-1 text-[12px] font-medium tracking-normal text-muted-foreground">{unit}</span>
          </span>
        </div>
      </div>

      <div className="relative mt-8 h-[300px] rounded-xl border bg-card p-4 shadow-sm">
        {/* chart area */}
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden className="absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)]">
          {/* grid */}
          <g className="text-chart-grid">
            {[0, 25, 50, 75, 100].map((x) => <line key={`v-${x}`} x1={x} x2={x} y1="0" y2="100" stroke="currentColor" strokeWidth="0.18" opacity="0.5" />)}
            {[0, 25, 50, 75, 100].map((y) => <line key={`h-${y}`} x1="0" x2="100" y1={y} y2={y} stroke="currentColor" strokeWidth="0.18" opacity="0.5" />)}
          </g>

          {/* confidence band */}
          <path d={`${bandTop} ${bandBottom.split(" ").reverse().join(" ").replace(/^L/, " L")} Z`} fill="hsl(var(--foreground))" fillOpacity="0.06" />

          {/* history solid */}
          <path d={histPath} fill="none" stroke="hsl(var(--foreground))" strokeWidth="2.2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />

          {/* forecast dashed — redraws with months prop, motion only on enter */}
          <motion.path
            key={months}
            d={fcPath}
            fill="none"
            stroke="hsl(var(--foreground))"
            strokeWidth="1.8"
            strokeDasharray="6 4"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
            initial={reduce ? undefined : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* seam node */}
          <circle
            cx={xy(history[history.length - 1], history.length - 1)[0]}
            cy={xy(history[history.length - 1], history.length - 1)[1]}
            r="2.8"
            fill="hsl(var(--background))"
            stroke="hsl(var(--foreground))"
            strokeWidth="1.8"
          />
        </svg>

        {/* today marker */}
        <span aria-hidden className="absolute inset-y-4 w-px bg-border" style={{ left: `${((history.length - 1) / (all.length - 1)) * 100}%` }} />
        <span
          className="absolute bottom-1 -translate-x-1/2 rounded-full border bg-background px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground shadow-sm"
          style={{ left: `${((history.length - 1) / (all.length - 1)) * 100}%` }}
        >
          Today
        </span>

        {/* y labels */}
        <div className="pointer-events-none absolute inset-y-4 left-4 flex flex-col justify-between py-1 font-mono text-[10px] font-medium tabular-nums text-muted-foreground/60">
          <span>{max}</span>
          <span>{Math.round((max + min) / 2)}</span>
          <span>{min}</span>
        </div>
      </div>

      <label className="mt-6 block">
        <span className="flex items-center justify-between font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          <span>Horizon</span>
          <output htmlFor="fc-months" className="rounded-full border bg-card px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums text-foreground shadow-sm">
            {months} {months === 1 ? "month" : "months"}
          </output>
        </span>
        <input
          id="fc-months"
          type="range"
          min={1}
          max={12}
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
          className="mt-3 w-full accent-foreground"
        />
        <span className="mt-1 flex justify-between font-mono text-[11px] text-muted-foreground">
          <span>1 mo</span>
          <span>12 mo</span>
        </span>
      </label>

      <p className="mt-3 font-mono text-[11px] font-medium tracking-wide text-muted-foreground">
        Model · {growth}% compounding · Solid = history · Dashed = assumption · Band = ±1σ confidence
      </p>
    
  </div>
</section>
  )
}
