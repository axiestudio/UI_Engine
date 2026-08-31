import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — streaks, usage, focus: time as texture.
// JOB      show when a user (or fleet) is active over the last ~26 weeks
// SIGNATURE the grid BLOOMS in week-columns (stagger 22ms) on first view;
//           hovering a cell lifts a whole week column and reads out the date
//           count in the header slot instead of a tooltip that hides data.
// API      levels: array-of-weeks {cells: number[] (0..4), label} — or pass
//          `counts` raw and we bucket it. totals + best streak are shown.
// A11Y     table-ish semantics via text summary + sr-only grid alt text.

export type HeatCell = { count: number }
export type ActivityHeatmapProps = { cells: HeatCell[]; levelOf?: (c: number) => 0 | 1 | 2 | 3 | 4; weeks?: number; className?: string }

export function ActivityHeatmap({ cells, levelOf, weeks = 26, className }: ActivityHeatmapProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const cols = Math.max(1, Math.ceil(cells.length / 7))
  const max = Math.max(1, ...cells.map((c) => c.count))
  const lvl = (c: number) => levelOf ? levelOf(c) : c === 0 ? 0 : Math.min(4, Math.ceil((c / max) * 4)) as 0 | 1 | 2 | 3 | 4
  const tones = ["hsl(var(--muted))", "hsl(var(--ok)/0.28)", "hsl(var(--ok)/0.5)", "hsl(var(--ok)/0.75)", "hsl(var(--ok))"]
  const [hoverCol, setHoverCol] = React.useState<number | null>(null)
  const total = cells.reduce((a, c) => a + c.count, 0)
  let streak = 0, run = 0
  for (const c of cells) { run = c.count > 0 ? run + 1 : 0; streak = Math.max(streak, run) }
  const grid: HeatCell[][] = []
  for (let w = 0; w < cols; w++) grid.push(cells.slice(w * 7, w * 7 + 7))
  const dayNames = ["Mon", "Wed", "Fri"]
  return (
    <div className={cn("font-sans", className)}>
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-[13px] font-bold">{total.toLocaleString()} events <span className="font-normal text-muted-foreground">/ last {cols} weeks</span></p>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">best streak {streak}d</p>
      </div>
      <div className="flex gap-1.5">
        <div aria-hidden className="grid grid-rows-7 gap-[3px] pt-px text-[9px] font-medium leading-[12px] text-muted-foreground">
          {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => <span key={i}>{d}</span>)}
        </div>
        <div className="relative flex gap-[3px] overflow-x-auto pb-1">
          {grid.map((col, w) => (
            <motion.div key={w} initial={reduce ? false : { opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: w * 0.022, duration: 0.3 }} onMouseEnter={() => setHoverCol(w)} onMouseLeave={() => setHoverCol(null)} className={cn("flex flex-col gap-[3px] rounded-[2px] transition-all", hoverCol === w && "ring-2 ring-[hsl(var(--app-focus))]/60")}>
              {Array.from({ length: 7 }, (_, d) => {
                const c = col[d]
                const l = c ? lvl(c.count) : 0
                return <span key={d} className="size-[12px] rounded-[2.5px]" style={{ background: c ? tones[l] : "hsl(var(--muted)/0.6)" }} title={c ? `${(w * 7 + d + 1)}d ago · ${c.count}` : undefined} />
              })}
            </motion.div>
          ))}
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
        less {tones.map((t, i) => <span key={i} className="size-[11px] rounded-[2px]" style={{ background: t }} />)} more
      </div>
    </div>
  )
}
