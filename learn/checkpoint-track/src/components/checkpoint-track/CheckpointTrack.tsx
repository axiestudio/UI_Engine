import * as React from "react"
import { motion } from "motion/react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"

// ═══ JOB      make progress legible — calm, linear, scannable
// ═══ EMOTION  quiet momentum — no pulsing, no confetti
// ═══ SIGNATURE minimal stepper with 2px rail + numbered nodes + done check

export type Checkpoint = { label: string; note?: string }
export type CheckpointTrackProps = {
  steps?: Checkpoint[]
  current?: number
  onStepClick?: (index: number) => void
  className?: string
}

const DEFAULT_STEPS: Checkpoint[] = [
  { label: "Enroll", note: "2 min" },
  { label: "Baseline quiz", note: "8 min" },
  { label: "Module 1", note: "1 wk" },
  { label: "Module 2", note: "2 wks" },
  { label: "Final build", note: "3 wks" },
]

export function CheckpointTrack({ steps = DEFAULT_STEPS, current = 2, onStepClick, className }: CheckpointTrackProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const pct = steps.length > 1 ? (current / (steps.length - 1)) * 100 : 0

  return (
    <section className={cn("relative isolate w-full overflow-hidden", false && "bg-foreground", cn(className))}>
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-14 sm:py-16")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />TRACK · CHECKPOINTS</span>
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {Math.min(current + 1, steps.length)} of {steps.length}
        </span>
      </div>

      <div className="relative mt-8" role="list" aria-label="Course checkpoints">
        {/* rail */}
        <span aria-hidden className="absolute left-0 right-0 top-5 h-px bg-border" />
        <motion.span
          aria-hidden
          className="absolute left-0 top-5 h-px bg-foreground"
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={reduce ? { duration: 0 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />

        <div className="relative flex justify-between gap-2">
          {steps.map((s, i) => {
            const done = i < current
            const active = i === current
            const upcoming = i > current
            return (
              <InView key={s.label} once delay={i * 0.06} className="flex flex-1 flex-col items-center">
                <Button
                  variant="ghost"
                  role="listitem"
                  aria-current={active ? "step" : undefined}
                  aria-label={`${s.label} — ${done ? "completed" : active ? "current" : "upcoming"}${s.note ? `, ${s.note}` : ""}`}
                  onClick={() => onStepClick?.(i)}
                  className="group h-auto w-auto flex-col gap-0 rounded-xl p-0 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span
                    className={cn(
                      "relative grid size-10 place-items-center rounded-full border bg-background font-mono text-[11px] font-bold tabular-nums transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      done && "border-foreground bg-foreground text-background",
                      active && "border-foreground bg-background text-foreground shadow-sm ring-1 ring-foreground/10",
                      upcoming && "border-border text-muted-foreground"
                    )}
                  >
                    {done ? <Check className="size-4" aria-hidden /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      "mt-3 max-w-[14ch] text-center font-display text-sm font-semibold leading-tight",
                      done || active ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {s.label}
                  </span>
                  {s.note && <span className="mt-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{s.note}</span>}
                  <span className={cn("mt-1 h-1 w-1 rounded-full", active ? "bg-foreground" : "bg-transparent")} aria-hidden />
                </Button>
              </InView>
            )
          })}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        Step {current + 1} of {steps.length}: {steps[current]?.label}
      </p>
    
  </div>
</section>
  )
}
