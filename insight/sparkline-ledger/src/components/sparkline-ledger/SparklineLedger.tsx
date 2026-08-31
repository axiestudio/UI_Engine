import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB      make a table of metrics readable as pulses
// ═══ EMOTION  ledger calm — numbers with heartbeats
// ═══ SIGNATURE rows draw their sparkline on hover (path draws left→right
//               in 400ms) and the delta cell flips color on crossing zero
//   SITE      → proof/ops pages, investor updates
//   APP       → table widgets; rows are props; live values re-render
//   A11Y      real table semantics; sr numbers; focusable rows

export type LedgerRow = { name: string; unit?: string; current: number; delta: number; points: number[] }

export type SparklineLedgerProps = {
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
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${((i / (points.length - 1)) * w).toFixed(1)} ${(h - ((p - min) / (max - min || 1)) * (h - 4) - 2).toFixed(1)}`).join(" ")
  return (
    <svg viewBox={`0 0 ${w} ${h}`} aria-hidden className="h-7 w-[120px]">
      <motion.path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: active ? 1 : 0.999 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </svg>
  )
}

export function SparklineLedger({ rows = DEFAULT_ROWS, className }: SparklineLedgerProps) {
  const [hover, setHover] = React.useState<number | null>(null)
  return (
    <SectionShell width={760} className={className}>
      <MonoLabel className="text-muted-foreground">LEDGER · PULSE PER ROW</MonoLabel>
      <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">The numbers, breathing.</h2>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left">
          <caption className="sr-only">Key metrics with trend and delta</caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="pb-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Metric</th>
              <th scope="col" className="pb-3 text-right font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Now</th>
              <th scope="col" className="hidden pb-3 text-center font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground sm:table-cell">7 pt trend</th>
              <th scope="col" className="pb-3 text-right font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Δ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r, i) => {
              const up = r.delta >= 0
              return (
                <tr key={r.name} tabIndex={0} aria-label={`${r.name}: ${r.current}${r.unit ?? ""}, ${up ? "up" : "down"} ${Math.abs(r.delta)}`}
                  onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
                  className={cn("transition-colors", hover === i ? "bg-muted/40" : "hover:bg-muted/20")}>
                  <th scope="row" className="py-3.5 font-display text-[15px] font-bold text-foreground">{r.name}</th>
                  <td className="py-3.5 text-right font-display text-lg font-black tabular-nums text-foreground">
                    {r.current.toLocaleString()}<span className="text-xs text-muted-foreground">{r.unit}</span>
                  </td>
                  <td className="hidden py-3.5 text-center sm:table-cell">
                    <span className="inline-block text-foreground/80"><MiniSpark points={r.points} active={hover === i} /></span>
                  </td>
                  <td className={cn("py-3.5 text-right font-mono text-[12px] font-black tabular-nums", up ? "text-emerald-700 dark:text-emerald-400" : "text-sky-700 dark:text-sky-400")}>
                    {up ? "▲" : "▼"} {Math.abs(r.delta)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">hover a row · the line draws itself</p>
    </SectionShell>
  )
}
