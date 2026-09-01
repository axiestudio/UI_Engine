import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { ArrowDown, ArrowUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"


export type LedgerRow = { name: string; unit?: string; current: number; delta: number; points: number[] }

export type SparklineLedgerProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  rows?: LedgerRow[]
  className?: string
}

const DEFAULT_ROWS: LedgerRow[] = [
  { name: "MRR", unit: "$k", current: 48, delta: 6.2, points: [30, 33, 31, 36, 40, 44, 48] },
  { name: "Active teams", current: 12048, delta: 3.8, points: [90, 94, 99, 104, 111, 116, 120] },
  { name: "Churn", unit: "%", current: 1.4, delta: -0.3, points: [2.8, 2.6, 2.2, 2.0, 1.8, 1.6, 1.4] },
  { name: "NPS", current: 61, delta: 9, points: [38, 41, 45, 50, 52, 57, 61] },
  { name: "Support CSAT", unit: "%", current: 96, delta: 1.1, points: [90, 92, 93, 92, 94, 95, 96] },
]

function MiniSpark({ points, active }: { points: number[]; active: boolean }) {
  const w = 120, h = 28
  const max = Math.max(...points), min = Math.min(...points)
  const range = max - min || 1
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${((i / (points.length - 1)) * w).toFixed(1)} ${(h - ((p - min) / range) * (h - 6) - 3).toFixed(1)}`)
    .join(" ")
  return (
    <svg viewBox={`0 0 ${w} ${h}`} aria-hidden className="h-7 w-[120px] text-foreground/70">
      <motion.path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0.0, opacity: 0.4 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: active ? 0.5 : 0.35, ease: "easeOut" }}
      />
    </svg>
  )
}

export function SparklineLedger({
  eyebrow = "LEDGER · PULSE PER ROW",
  title = "Key metrics — latest week",
  subtitle = "Seven points. Week-over-week change. Hover the trend.",
  rows = DEFAULT_ROWS,
  className,
}: SparklineLedgerProps) {
  const [hover, setHover] = React.useState<number | null>(null)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  return (
    <section className={cn("relative isolate w-full overflow-hidden", className)}>
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (760), ["--shell-w" as string]: `${(760)}px` }}>

      <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>
      <h2 className="mt-3 font-display text-[28px] font-semibold leading-[1.05] tracking-[-0.022em] text-foreground sm:text-[34px]">{title}</h2>
      {subtitle && <p className="mt-2 max-w-[52ch] text-[13px] leading-6 text-muted-foreground">{subtitle}</p>}

      <div className="mt-8 overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left">
            <caption className="sr-only">Key metrics with trend and delta</caption>
            <thead>
              <tr className="border-b bg-muted/40">
                <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Metric
                </th>
                <th scope="col" className="px-4 py-3 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Now
                </th>
                <th scope="col" className="hidden px-4 py-3 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground sm:table-cell">
                  7-pt trend
                </th>
                <th scope="col" className="px-4 py-3 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  WoW
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((r, i) => {
                const up = r.delta >= 0
                const isChurn = r.name.toLowerCase().includes("churn")
                const good = isChurn ? !up : up
                const active = hover === i
                return (
                  <tr
                    key={r.name}
                    tabIndex={0}
                    aria-label={`${r.name}: ${r.current}${r.unit ?? ""}, ${good ? "up" : "down"} ${Math.abs(r.delta)}`}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                    className={cn(
                      "transition-colors focus-within:bg-muted/40 focus:outline-none",
                      active ? "bg-muted/50" : "hover:bg-muted/30",
                    )}
                  >
                    <th scope="row" className="px-4 py-3.5 font-display text-[14px] font-semibold text-foreground">
                      {r.name}
                    </th>
                    <td className="px-4 py-3.5 text-right font-display text-[15px] font-semibold tabular-nums text-foreground">
                      {r.current.toLocaleString()}
                      <span className="ml-1 text-[12px] font-medium text-muted-foreground">{r.unit}</span>
                    </td>
                    <td className="hidden px-4 py-3.5 text-center sm:table-cell">
                      <span className="inline-block">
                        <MiniSpark points={r.points} active={!reduce && active} />
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span
                        className={cn(
                          "inline-flex items-center justify-end gap-1 rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums",
                          good
                            ? "border-success/20 bg-success-muted text-success"
                            : "border-warning/20 bg-warning-muted text-warning-foreground",
                        )}
                      >
                        {good ? <ArrowUp className="size-3" aria-hidden /> : <ArrowDown className="size-3" aria-hidden />}{Math.abs(r.delta)}
                        {r.unit === "%" || r.unit === "$k" ? "" : "%"}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t bg-muted/20 px-4 py-2.5 font-mono text-[11px] font-medium tracking-wide text-muted-foreground">
          Hover or focus a row to highlight its sparkline · Values are live props
        </div>
      </div>
    
  </div>
</section>
  )
}
