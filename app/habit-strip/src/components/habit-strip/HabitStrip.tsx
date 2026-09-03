import * as React from "react"
import { motion } from "motion/react"
import { Check, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB         Seven days, three habits, zero drama — tap the week honest.
// ═══ EMOTION     The quiet pride of a wall chart filling up.
// ═══ SIGNATURE   A boolean matrix you can poke: cells fill with ink, streaks
//                 count consecutive days from Mån and light a flame at ×2,
//                 and each row's thin bar re-inks to the week's completion.

export type HabitStripProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  heading?: string
  habits?: string[]
  /** boolean matrix [habit][day] — 7 days per habit. */
  initialGrid?: boolean[][]
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

const DAYS = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"]
const DAYS_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const DEFAULT_HABITS = ["Open early", "No-show follow-up", "Ledger note"]
const DEFAULT_GRID = [
  [true, true, true, true, false, false, false],
  [true, true, false, false, false, false, false],
  [true, false, false, false, false, false, false],
]

const streakOf = (row: boolean[]) => {
  let s = 0
  while (s < row.length && row[s]) s += 1
  return s
}

export function HabitStrip({
  eyebrow = "APP · HABIT STRIP",
  title = "The floor habits.",
  subtitle = "Three habits, seven days. Tap a cell to mark the day; streaks count consecutive days from Mån and each row keeps its own honest percentage.",
  heading = "The floor habits",
  habits = DEFAULT_HABITS,
  initialGrid = DEFAULT_GRID,
  caption = "TAP A DAY · STREAKS COUNT FROM MÅN",
  tone = "paper",
  className,
}: HabitStripProps) {
  const ink = tone === "ink"
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const [grid, setGrid] = React.useState<boolean[][]>(() => initialGrid)

  const toggle = (r: number, c: number) =>
    setGrid((cur) => cur.map((row, ri) => (ri === r ? row.map((v, ci) => (ci === c ? !v : v)) : row)))

  const hair = ink ? "border-background/15" : "border-border"

  return (
    <section className={cn("bg-background text-foreground", className)}>
      <div className="mx-auto w-full max-w-[920px] px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
      <InView
        once
        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
                <header className="">
          {eyebrow != null && (
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</span>
          )}
          <h2 className="text-3xl font-semibold tracking-tight sm:text-[34px] text-foreground">{title}</h2>
          {subtitle != null && (
            <p className="mt-2.5 text-sm leading-6 text-muted-foreground">{subtitle}</p>
          )}
        </header>
      </InView>

      <InView
        once
        variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <figure className="mt-10">
          <div className="mx-auto max-w-[480px]">
            <motion.div
              whileHover={reduce ? undefined : { y: -3 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className={cn(
                "overflow-hidden rounded-[16px] border bg-card shadow-[0_24px_52px_-30px_hsl(var(--foreground)/0.45)]",
                ink ? "border-background/15" : "border-border",
              )}
            >
              {/* ── chrome ── */}
              <div className={cn("border-b px-6 pb-5 pt-6", hair)}>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Quiet Times Studio · week 35</span>
                <h3 className="mt-3 font-display text-xl font-bold tracking-[-0.02em]">{heading}</h3>
              </div>

              <div className="px-6 py-5">
                <div role="grid" aria-label="Weekly habit strip">
                  {/* column headers */}
                  <div role="row" className="flex items-end gap-3 pb-2">
                    <span
                      role="columnheader"
                      className="flex-1 text-left font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground"
                    >
                      Habit
                    </span>
                    <div className="grid shrink-0 grid-cols-7 gap-1">
                      {DAYS.map((d) => (
                        <span
                          key={d}
                          role="columnheader"
                          className="w-7 text-center font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* habit rows */}
                  {habits.map((habit, ri) => {
                    const row = grid[ri] ?? Array<boolean>(DAYS.length).fill(false)
                    const done = row.filter(Boolean).length
                    const pct = Math.round((done / DAYS.length) * 100)
                    const streak = streakOf(row)
                    return (
                      <div key={habit} role="row" className="flex items-center gap-3 border-t border-border py-3">
                        <div className="min-w-0 flex-1">
                          <div role="rowheader" className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold">{habit}</span>
                            {streak >= 2 && (
                              <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[11px] font-bold text-primary">
                                <Flame className="size-3.5" aria-hidden />×{streak}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <div aria-hidden className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                              <motion.div
                                className="h-full rounded-full bg-primary"
                                initial={false}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                              />
                            </div>
                            <span
                              aria-label={`${pct} percent of this week done`}
                              className="w-9 shrink-0 text-right font-mono text-[10px] font-bold tabular-nums text-muted-foreground"
                            >
                              {pct}%
                            </span>
                          </div>
                        </div>
                        <div className="grid shrink-0 grid-cols-7 gap-1">
                          {row.map((isDone, di) => (
                            <div key={di} role="gridcell">
                              <motion.div whileTap={reduce ? undefined : { scale: 0.82 }} transition={{ type: "spring", stiffness: 520, damping: 18 }}>
                                <Button
                                  type="button"
                                  aria-pressed={isDone}
                                  aria-label={`${habit} — ${DAYS_FULL[di]} — ${isDone ? "done" : "not done"}`}
                                  onClick={() => toggle(ri, di)}
                                  className={cn(
                                    "grid size-7 place-items-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                    isDone
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-border bg-background text-transparent hover:border-muted-foreground/50",
                                  )}
                                >
                                  <Check className="size-3.5" aria-hidden />
                                </Button>
                              </motion.div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </div>

          <figcaption
            className={cn(
              "mx-auto mt-8 flex max-w-[480px] items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
              hair,
              ink ? "text-background/55" : "text-muted-foreground",
            )}
          >
            <span>{caption}</span>
            <span aria-hidden>●</span>
          </figcaption>
        </figure>
      </InView>
    </div>
    </section>
  )
}
