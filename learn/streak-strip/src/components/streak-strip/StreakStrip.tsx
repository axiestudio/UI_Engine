import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

import { InView } from "@/components/primitives/in-view"

export type StreakStripProps = {
  days?: boolean[]
  minutesToday?: number
  lessonsDone?: number
  bestStreak?: number
  className?: string
}

const DEFAULT_DAYS = [true, true, false, true, true, true, true, true, true, true, true, false, true, true]
const LABELS = ["M", "T", "W", "T", "F", "S", "S"]

export function StreakStrip({ days = DEFAULT_DAYS, minutesToday = 32, lessonsDone = 87, bestStreak = 14, className }: StreakStripProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const streak = React.useMemo(() => {
    let n = 0
    for (let i = days.length - 1; i >= 0 && days[i]; i--) n++
    return n
  }, [days])
  const activeCount = days.filter(Boolean).length

  return (
    <section className={cn("relative isolate w-full overflow-hidden", className)}>
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />STREAK · CONSISTENCY</span>
        <span className="font-mono text-[11px] font-medium text-muted-foreground">{activeCount} of last {days.length} days</span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <InView once>
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-baseline gap-3">
              <p className="font-display text-4xl font-bold tabular-nums leading-none tracking-tight text-foreground">
                {streak}
                <span className="ml-1.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">days</span>
              </p>
              <span className="ml-auto font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Current streak</span>
            </div>
            <p className="sr-only">{streak} day streak</p>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-4">
              {[
                { v: minutesToday, l: "today" },
                { v: lessonsDone, l: "lessons" },
                { v: bestStreak, l: "best" },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <p className="font-display text-lg font-bold tabular-nums text-foreground">{s.v}</p>
                  <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </InView>

        <div>
          <div className="overflow-hidden rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex gap-1.5" aria-hidden>
              {days.map((d, i) => (
                <motion.span
                  key={i}
                  initial={reduce ? false : { scaleY: 0, opacity: 0 }}
                  whileInView={{ scaleY: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.28, delay: 0.08 + i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: "bottom" }}
                  className={cn("relative flex-1 rounded-md", d ? "h-10 bg-foreground" : "h-10 bg-muted")}
                />
              ))}
            </div>
            <div className="mt-2 flex gap-1.5" aria-hidden>
              {days.map((_, i) => (
                <span key={i} className="flex-1 text-center font-mono text-[10px] font-medium text-muted-foreground">
                  {LABELS[i % 7]}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-3 font-mono text-[11px] font-medium text-muted-foreground">Keep a 3-day minimum to protect the chain. Two misses reset the count.</p>
          <span className="sr-only">{activeCount} of last {days.length} days active</span>
        </div>
      </div>
    
  </div>
</section>
  )
}
