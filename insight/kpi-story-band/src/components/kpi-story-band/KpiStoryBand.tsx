import * as React from "react"
import { motion } from "motion/react"
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

import { SlidingNumber } from "@/components/primitives/sliding-number"
import { InView } from "@/components/primitives/in-view"

export type Kpi = { label: string; value: number; prefix?: string; suffix?: string; delta: number; points: number[] }

export type KpiStoryBandProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  kpis?: Kpi[]
  href?: string
  hrefLabel?: string
  className?: string
}

const DEFAULT_KPIS: Kpi[] = [
  { label: "Annual recurring revenue", value: 482, prefix: "$", suffix: "k", delta: 34, points: [20, 32, 28, 44, 38, 52, 61, 58, 74, 82] },
  { label: "Net revenue retention", value: 127, suffix: "%", delta: 9, points: [60, 58, 64, 70, 68, 76, 84, 90, 96, 127] },
  { label: "Support first-response", value: 3, suffix: " min", delta: -41, points: [82, 76, 70, 66, 58, 44, 30, 22, 14, 8] },
]

function Spark({ points }: { points: number[] }) {
  const w = 160, h = 44
  const max = Math.max(...points), min = Math.min(...points)
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w
      const y = h - ((p - min) / (max - min || 1)) * (h - 6) - 3
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(" ")
  return (
    <svg viewBox={`0 0 ${w} ${h}`} aria-hidden className="mt-5 h-10 w-full text-foreground/70">
      <motion.path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  )
}

function Tile({ kpi, index, total }: { kpi: Kpi; index: number; total: number }) {
  const up = kpi.delta >= 0
  const isPositive = kpi.label.toLowerCase().includes("response") ? !up : up
  // For response time, down is good
  const good = isPositive
  return (
    <InView once delay={index * 0.06} className="h-full">
      <article className="group flex h-full flex-col rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:border-foreground/10">
        <div className="flex items-center justify-between">
          <span className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.2em] opacity-60")}>index + 1<span className="opacity-50"> / total</span></span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums",
              good
                ? "border-success/20 bg-success-muted text-success"
                : "border-warning/20 bg-warning-muted text-warning-foreground",
            )}
          >
            {up ? <TrendingUp className="size-3" aria-hidden /> : <TrendingDown className="size-3" aria-hidden />}
            {up ? "+" : ""}
            {kpi.delta}%
          </span>
        </div>

        <h3 className="mt-4 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{kpi.label}</h3>

        <p className="mt-2 font-display text-[34px] font-semibold tabular-nums leading-none tracking-[-0.025em] text-foreground">
          <span className="align-baseline text-[20px] font-medium text-muted-foreground">{kpi.prefix}</span>
          <SlidingNumber value={kpi.value} />
          <span className="ml-1 align-baseline text-[18px] font-medium tracking-normal text-muted-foreground">{kpi.suffix}</span>
        </p>

        <div className="mt-auto pt-2">
          <Spark points={kpi.points} />
          <span className="sr-only">{kpi.points.join(", ")}</span>
          <p className="mt-2 font-mono text-[11px] font-medium text-muted-foreground">
            {good ? "Trending up" : "Down"} {Math.abs(kpi.delta)}% vs prior period
          </p>
        </div>
      </article>
    </InView>
  )
}

export function KpiStoryBand({
  eyebrow = "THE NUMBERS · FY26",
  title = "Key metrics — FY26",
  subtitle = "Three core indicators. Change is vs. prior period.",
  kpis = DEFAULT_KPIS,
  href,
  hrefLabel = "Full report",
  className,
}: KpiStoryBandProps) {
  return (
    <section className={cn("relative isolate w-full overflow-hidden", false && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute top-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-t border-dashed", false ? "border-background/10" : "border-border")} />
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", false ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>
          <h2 className="mt-3 max-w-[14ch] font-display text-[28px] font-semibold leading-[1.02] tracking-[-0.022em] text-foreground sm:text-[36px]">
            {title}
          </h2>
          {subtitle && <p className="mt-2 max-w-[46ch] text-[13px] leading-6 text-muted-foreground">{subtitle}</p>}
        </div>
        {href ? (
          <a
            href={href}
            className="group inline-flex items-center gap-1.5 self-start rounded-full border bg-card px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground shadow-sm transition-colors hover:bg-accent sm:self-auto"
          >
            {hrefLabel}
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </a>
        ) : null}
      </div>

      <div className="mt-8 grid gap-4 sm:gap-5 md:grid-cols-3">
        {kpis.map((k, i) => (
          <Tile key={k.label} kpi={k} index={i} total={kpis.length} />
        ))}
      </div>
    
  </div>
</section>
  )
}
