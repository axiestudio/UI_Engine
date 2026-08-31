import * as React from "react"
import { motion, useInView, useReducedMotion } from "motion/react"
import { SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Loading sequence — a staged pre-loader with a progress bar and status line.
// ═══ EMOTION     A confident boot.
// ═══ SIGNATURE   A percent counter + staged status lines that resolve as the bar fills.

export type MiscLoadingSequenceProps = {
  eyebrow?: string
  steps?: string[]
  className?: string
}

export function MiscLoadingSequence({ eyebrow = "BOOT", steps = ["Resolving tokens", "Mounting sections", "Warming motion primitives", "Ready"], className }: MiscLoadingSequenceProps) {
  const reduceMotion = useReducedMotion()
  const reduce = !!reduceMotion
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const [pct, setPct] = React.useState(reduce ? 100 : 0)
  React.useEffect(() => {
    if (reduce) {
      setPct(100)
      return
    }
    if (!inView) return
    let raf = 0
    const start = performance.now()
    const dur = 2200
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      setPct(Math.round(p * 100))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, reduce])
  const stepIdx = Math.min(steps.length - 1, Math.floor((pct / 100) * steps.length))
  return (
    <SectionShell width={760} grain rule="bottom" className={className}>
      <div ref={ref} className="py-10 sm:py-16" role="status" aria-live="polite" aria-label={`Loading: ${steps[stepIdx]} ${pct}%`}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-muted-foreground">{eyebrow}</p>
        <div className="mt-8 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-display text-5xl font-black tabular-nums tracking-tight sm:text-6xl">
              {pct}
              <span className="text-2xl font-bold text-muted-foreground">%</span>
            </p>
            <p className={cn("font-mono text-[11px] font-bold uppercase tracking-widest", stepIdx === steps.length - 1 ? "text-emerald-600" : "text-muted-foreground")}>
              {steps[stepIdx]}
              {stepIdx < steps.length - 1 ? "…" : " ✓"}
            </p>
          </div>
          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Loading progress">
            <motion.div className="h-full rounded-full bg-foreground" style={{ width: `${pct}%` }} transition={reduce ? { duration: 0 } : undefined} />
          </div>
          <ul className="mt-6 space-y-1.5">
            {steps.map((s, i) => (
              <li key={s} className={cn("flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors", i <= stepIdx ? "text-foreground" : "text-muted-foreground/40")}>
                <span className={cn("h-1.5 w-1.5 rounded-full", i < stepIdx ? "bg-emerald-500" : i === stepIdx ? "bg-[hsl(var(--site-accent))]" : "bg-muted-foreground/30")} />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionShell>
  )
}
