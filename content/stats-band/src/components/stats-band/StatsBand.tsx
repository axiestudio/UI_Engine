import * as React from "react"
import { useInView } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Stats band — a row of figures that count up on view.
// ═══ EMOTION     Proof, quantified.
// ═══ SIGNATURE   In-view triggered counting with a mono suffix.

export type StatItem = { id: string; value: number; suffix?: string; label: string; decimals?: number }

export type StatsBandProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  stats: StatItem[]
  tone?: "paper" | "ink"
  className?: string
}

export function StatsBand({ eyebrow = "NUMBERS", title = "Proof, counted.", subtitle = "Figures count up as the band enters view.", stats, tone = "paper", className }: StatsBandProps) {
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>
      <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.id} className={cn("rounded-xl border p-6 text-center", ink ? "border-background/15 bg-background/5" : "border-border bg-card")}>
              <dd className="font-display text-4xl font-bold tabular-nums sm:text-5xl">
                <Counter value={s.value} decimals={s.decimals} />
                <span className="text-2xl">{s.suffix}</span>
              </dd>
              <dt className={cn("mt-2 font-mono text-[11px] font-bold uppercase tracking-widest", ink ? "text-background/55" : "text-muted-foreground")}>{s.label}</dt>
            </div>
          ))}
        </dl>
      </InView>
    </SectionShell>
  )
}

function Counter({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const [shown, setShown] = React.useState(0)
  React.useEffect(() => {
    if (!inView) return
    let raf = 0
    const start = performance.now()
    const dur = 1200
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setShown(value * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value])
  return <span ref={ref}>{shown.toFixed(decimals)}</span>
}
