import * as React from "react"
import { motion } from "motion/react"
import { RefreshCw, Star, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"

export type HeadlineMetric = {
  id: string
  label: string
  value: number
  decimals?: number
  grouped?: boolean
  unit?: string
  delta: number
  deltaKind?: "percent" | "absolute"
  range: [number, number]
}

const DEFAULT_METRICS: HeadlineMetric[] = [
  { id: "visits", label: "Visits", value: 1284, grouped: true, delta: 12, deltaKind: "percent", range: [900, 1600] },
  { id: "colour", label: "Colour mixed", value: 62.5, decimals: 1, unit: "L", delta: 3.1, range: [48, 76] },
  { id: "noshows", label: "No-shows", value: 11, delta: -6, range: [3, 18] },
  { id: "rating", label: "Google rating", value: 4.9, decimals: 1, unit: "", delta: 0.2, range: [4.5, 5] },
]

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

function formatMetric(m: HeadlineMetric) {
  const s = m.value.toFixed(m.decimals ?? 0)
  if (!m.grouped) return s
  const [int, dec] = s.split(".")
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return dec ? `${grouped}.${dec}` : grouped
}

function Odometer({ text, unit, reduce }: { text: string; unit?: string; reduce: boolean }) {
  return (
    <span className="inline-flex items-end tabular-nums">
      <span aria-live="polite" className="sr-only">
        {text}
        {unit ? ` ${unit}` : ""}
      </span>
      {text.split("").map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={i} aria-hidden className="inline-block h-[1em] overflow-hidden leading-none">
            <motion.span
              className="flex flex-col will-change-transform"
              initial={{ y: "0%" }}
              animate={{ y: `-${Number(ch) * 10}%` }}
              transition={reduce ? { duration: 0 } : { duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}
            >
              {DIGITS.map((d) => (
                <span key={d} className="block h-[1em] leading-none">
                  {d}
                </span>
              ))}
            </motion.span>
          </span>
        ) : (
          <span key={i} aria-hidden className="inline-block h-[1em] overflow-hidden whitespace-pre leading-none">
            {ch}
          </span>
        )
      )}
    </span>
  )
}

function DeltaChip({ metric }: { metric: HeadlineMetric }) {
  const up = metric.delta >= 0
  const percent = (metric.deltaKind ?? "absolute") === "percent"
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-2 py-0.5 font-mono text-[10px] font-bold tabular-nums",
        up ? "text-primary" : "text-muted-foreground"
      )}
    >
      {up ? <ArrowUp className="size-3" aria-hidden /> : <ArrowDown className="size-3" aria-hidden />}
      {percent ? `${Math.abs(metric.delta)}%` : `${up ? "+" : "−"}${Math.abs(metric.delta).toFixed(metric.decimals ?? 0)}`}
    </span>
  )
}

export type MetricsHeadlineProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  caption?: string
  metrics?: HeadlineMetric[]
  tone?: "paper" | "ink"
  className?: string
}

export function MetricsHeadline({
  eyebrow = "Quiet Times Studio · Metrics",
  title = "October, at a glance.",
  subtitle = "Four numbers the studio runs on. The odometers roll on load.",
  caption = "KPI BAND · ODOMETER ROLL",
  metrics = DEFAULT_METRICS,
  tone = "paper",
  className,
}: MetricsHeadlineProps) {
  const ink = tone === "ink"
  const reduce = React.useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  )
  const [rows, setRows] = React.useState<HeadlineMetric[]>(metrics)

  const simulate = () =>
    setRows((prev) =>
      prev.map((m) => {
        const [lo, hi] = m.range
        const raw = lo + Math.random() * (hi - lo)
        const value = m.decimals ? Number(raw.toFixed(m.decimals)) : Math.round(raw)
        const delta =
          (m.deltaKind ?? "absolute") === "percent"
            ? Math.round(((value - m.value) / m.value) * 100)
            : Number((value - m.value).toFixed(m.decimals ?? 0))
        return { ...m, value, delta }
      })
    )

  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <div className="flex flex-wrap items-end justify-between gap-6">
        <InView
          once
          variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="min-w-0 flex-1"
        >
            <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
        </InView>
        <InView
          once
          variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.1 }}
        >
          <Button type='button' onClick={simulate} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" variant="default">
            <RefreshCw className="size-3.5" aria-hidden />
            Simulate
          </Button>
        </InView>
      </div>

      <InView
        once
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: reduce ? 0 : 0.9, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.12 }}
      >
        <div className="mt-10">
          <div
            className={cn(
              "overflow-hidden rounded-2xl border bg-card",
              ink ? "border-background/15" : "border-border"
            )}
          >
            <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
              {rows.map((m) => (
                <div key={m.id} className="p-6 lg:p-7">
                  <div className="flex font-display text-[36px] font-bold leading-none sm:text-[42px] lg:text-[46px]">
                    <Odometer text={formatMetric(m)} unit={m.unit} reduce={reduce} />
                    {m.id === "rating" && <Star aria-hidden className="ml-1 size-4 text-warning" />}
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      {m.label}
                      {m.unit ? ` · ${m.unit}` : ""}
                    </p>
                    <DeltaChip metric={m} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            <span>{caption}</span>
            <span aria-hidden>●</span>
          </p>
        </div>
      </InView>
    
  </div>
</section>
  )
}
