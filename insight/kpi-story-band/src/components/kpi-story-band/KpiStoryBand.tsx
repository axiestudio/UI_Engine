import * as React from "react"
import { motion } from "motion/react"
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell, Ordinal } from "@/components/primitives/handcraft"
import { SlidingNumber } from "@/components/primitives/sliding-number"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB      make the numbers argue for you
// ═══ EMOTION  the moment the chart proves the pitch
// ═══ SIGNATURE three KPI tiles where the sparkline draws itself on enter,
//               the value slides digit-by-digit, and the delta chip ticks
//   SITE      → landing proof bands, annual report openers
//   APP       → dashboards; values re-tick on prop change (live)
//   A11Y      aria-live polite on values; sparklines decorative + table fallback

export type Kpi = { label: string; value: number; prefix?: string; suffix?: string; delta: number; points: number[] }

export type KpiStoryBandProps = {
  kpis?: Kpi[]
  className?: string
}

const DEFAULT_KPIS: Kpi[] = [
  { label: "Annual recurring revenue", value: 482, prefix: "$", suffix: "k", delta: 34, points: [20, 32, 28, 44, 38, 52, 61, 58, 74, 82] },
  { label: "Net revenue retention", value: 127, suffix: "%", delta: 9, points: [60, 58, 64, 70, 68, 76, 84, 90, 96, 127] },
  { label: "Support first-response", value: 3, suffix: " min", delta: -41, points: [82, 76, 70, 66, 58, 44, 30, 22, 14, 8] },
]

function Spark({ points, up }: { points: number[]; up: boolean }) {
  const w = 160, h = 44
  const max = Math.max(...points), min = Math.min(...points)
  const d = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w
    const y = h - ((p - min) / (max - min || 1)) * (h - 6) - 3
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(" ")
  return (
    <svg viewBox={`0 0 ${w} ${h}`} aria-hidden className="mt-4 h-11 w-full text-current">
      <motion.path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} />
    </svg>
  )
}

function Tile({ kpi, index, total }: { kpi: Kpi; index: number; total: number }) {
  const up = kpi.delta >= 0
  return (
    <InView once delay={index * 0.1} className="h-full">
      <article className="flex h-full flex-col rounded-2xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <Ordinal n={index + 1} total={total} />
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[10px] font-black tabular-nums",
            up ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300" : "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-300")}>
            {up ? <TrendingUp className="size-3" aria-hidden /> : <TrendingDown className="size-3" aria-hidden />}
            {up ? "+" : ""}{kpi.delta}%
          </span>
        </div>
        <h3 className="mt-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{kpi.label}</h3>
        <p aria-live="polite" className="mt-2 font-display text-5xl font-black tabular-nums tracking-tight text-foreground">
          {kpi.prefix}
          <SlidingNumber value={kpi.value} />
          <span className="text-2xl text-muted-foreground">{kpi.suffix}</span>
        </p>
        <div className="mt-auto">
          <Spark points={kpi.points} up={up} />
          <span className="sr-only">{kpi.points.join(", ")}</span>
        </div>
      </article>
    </InView>
  )
}

export function KpiStoryBand({ kpis = DEFAULT_KPIS, className }: KpiStoryBandProps) {
  return (
    <SectionShell width={1120} rule="both" className={className}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <MonoLabel className="text-muted-foreground">THE NUMBERS · FY26</MonoLabel>
          <h2 className="mt-2 max-w-lg font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] text-foreground sm:text-[44px]">
            Proof, not adjectives.
          </h2>
        </div>
        <a href="#" className="group inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-foreground">
          Full report
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </a>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {kpis.map((k, i) => <Tile key={k.label} kpi={k} index={i} total={kpis.length} />)}
      </div>
    </SectionShell>
  )
}
