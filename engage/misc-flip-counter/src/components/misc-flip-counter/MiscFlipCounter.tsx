import * as React from "react"
import { motion, useInView, animate, useReducedMotion } from "motion/react"
import { SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Flip counter — a bold stat that counts up like a digital counter.
// ═══ EMOTION     Definitive, quantified.
// ═══ SIGNATURE   A big tabular figure (single unit) that flips to the next.

export type MiscFlipCounterProps = {
  eyebrow?: string
  value?: number
  suffix?: string
  label?: string
  tone?: "paper" | "ink"
  className?: string
}

export function MiscFlipCounter({ eyebrow = "FINAL", value = 4281, suffix = "+", label = "Sections shipped", tone = "paper", className }: MiscFlipCounterProps) {
  const reduceMotion = useReducedMotion()
  const reduce = !!reduceMotion
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const [shown, setShown] = React.useState(reduce ? value : 0)
  React.useEffect(() => {
    if (reduce) {
      setShown(value)
      return
    }
    if (!inView) return
    const controls = animate(0, value, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setShown(Math.round(v)) })
    return () => controls.stop()
  }, [inView, value, reduce])
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={760} grain={!ink} rule="bottom" className={className}>
      <div className="text-center">
        <p className={cn("relative isolate overflow-hidden font-mono text-[11px] font-bold uppercase tracking-[0.3em]", ink ? "text-background/50" : "text-muted-foreground")}>{eyebrow}</p>
        <p className="mt-4">
          <span ref={ref} className="inline-block font-display text-7xl font-black tabular-nums tracking-tight sm:text-8xl" aria-live="polite" aria-atomic>
            {shown.toLocaleString()}
            {suffix}
          </span>
        </p>
        {label && <p className={cn("mt-3 font-mono text-[11px] font-bold uppercase tracking-widest", ink ? "text-background/55" : "text-muted-foreground")}>{label}</p>}
        <div className={cn("mx-auto mt-6 h-1 w-24 overflow-hidden rounded-full", ink ? "bg-background/15" : "bg-muted")} aria-hidden>
          <motion.div
            className={cn("h-full origin-left rounded-full", ink ? "bg-background" : "bg-foreground")}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: inView ? 1 : 0 }}
            transition={reduce ? { duration: 0 } : { duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    </SectionShell>
  )
}
