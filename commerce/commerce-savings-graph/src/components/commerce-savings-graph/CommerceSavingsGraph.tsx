import * as React from "react"
import { motion, useInView } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Savings graph — an animated bar chart of cost savings over time.
// ═══ EMOTION     See the value.
// ═══ SIGNATURE   A CSS/motion bar chart that grows into view with a highlighted base case.

export type SavingBar = { id: string; label: string; value: number; highlight?: boolean }

export type CommerceSavingsGraphProps = {
  eyebrow?: string
  title?: React.ReactNode
  bars: SavingBar[]
  caption?: string
  className?: string
}

export function CommerceSavingsGraph({ eyebrow = "SAVE", title = "The math adds up.", bars, caption = "Monthly savings over time", className }: CommerceSavingsGraphProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const max = Math.max(...bars.map((b) => b.value), 1)
  return (
    <SectionShell width={920} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">{title}</h2>
      </InView>
      <div ref={ref} className="mt-10 rounded-2xl border p-6">
        <div className="flex h-56 items-end gap-3">
          {bars.map((b, i) => (
            <div key={b.id} className="flex flex-1 flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: inView ? `${(b.value / max) * 100}%` : 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
                className={cn("w-full rounded-t-lg", b.highlight ? "bg-foreground" : "bg-muted-foreground/40")}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-3">
          {bars.map((b, i) => (
            <div key={b.id} className="flex flex-1 flex-col items-center">
              <span className="font-mono text-[11px] font-bold tabular-nums">{b.value}k</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{b.label}</span>
            </div>
          ))}
        </div>
        {caption && <p className="mt-6 text-center font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{caption}</p>}
      </div>
    </SectionShell>
  )
}
