import * as React from "react"
import { motion, animate, useMotionValue } from "motion/react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — dashboards that roll digits instead of snapping.
// JOB      make a headline number legible AS it updates
// SIGNATURE odometer columns: each digit is its own vertical strip that slides
//           (sliding-number DNA) so 1,412→1,420 only moves two wheels; trend
//           chip recomputes vs previous; threshold breach tints the tile.
// API      value (live prop; re-animate on change), label, format, warn/over.
// A11Y     final value is plain text for SR (aria-live polite on the sr span
//          only when it stabilises), visual wheels are aria-hidden.

export type KpiTileLiveProps = { label: string; value: number; prev?: number; format?: (v: number) => string; unit?: string; danger?: boolean; spark?: number[]; className?: string }

export function KpiTileLive({ label, value, prev, format, unit, danger, spark, className }: KpiTileLiveProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const text = format ? format(value) : Math.round(value).toLocaleString()
  const prevText = prev === undefined ? undefined : format ? format(prev) : Math.round(prev).toLocaleString()
  const delta = prev === undefined ? 0 : value - prev
  return (
    <div className={cn("relative overflow-hidden rounded-xl border bg-card p-4 font-sans transition-colors", danger && "border-[hsl(var(--err))]/50", className)}>
      {danger && <motion.span aria-hidden animate={{ opacity: [0.5, 0.15, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-[hsl(var(--err)/0.06)]" />}
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <div className="mt-1.5 flex items-end gap-2.5">
        <div aria-hidden className="flex tabular-nums">
          {text.split("").map((ch, i) => {
            const digit = /\d/.test(ch)
            if (!digit) return <span key={i} className="inline-block text-[30px] font-black leading-none">{ch}</span>
            return (
              <span key={i} aria-hidden className="relative inline-block h-[30px] w-[0.62ch] overflow-hidden">
                <motion.span className="block text-[30px] font-black leading-[30px]" initial={false} animate={{ y: reduce ? `-${Number(ch) * 30}px` : `-${Number(ch) * 30}px` }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 18, mass: 0.6 }}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <span key={n} className="block h-[30px] leading-[30px] text-center tabular-nums">{n}</span>)}
                </motion.span>
              </span>
            )
          })}
        </div>
        {unit && <span className="pb-0.5 text-[12px] font-bold text-muted-foreground">{unit}</span>}
        {prev !== undefined && delta !== 0 && (
          <motion.span key={value} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={cn("mb-1 flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[10px] font-black", delta > 0 === !danger ? "bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]" : "bg-[hsl(var(--err)/0.12)] text-[hsl(var(--err))]")}>
            {delta > 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{Math.abs(delta) > 999 ? `${(Math.abs(delta) / 1000).toFixed(1)}k` : Math.round(Math.abs(delta))}
          </motion.span>
        )}
      </div>
      <p className="sr-only" aria-live="polite">{label}: {text}{unit ? " " + unit : ""}</p>
      {spark && spark.length > 1 && (
        <svg aria-hidden viewBox="0 0 100 22" className="absolute bottom-0 left-0 h-6 w-full opacity-[0.16]">
          <path d={spark.map((v, i) => { const mn = Math.min(...spark), mx = Math.max(...spark), r = mx - mn || 1; return `${i ? "L" : "M"}${(i / (spark.length - 1)) * 100} ${22 - ((v - mn) / r) * 20}` }).join(" ")} fill="none" stroke="currentColor" strokeWidth={2} />
        </svg>
      )}
    </div>
  )
}
