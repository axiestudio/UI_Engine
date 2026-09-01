import * as React from "react"
import { useInView } from "motion/react"
import { InView } from "@/components/primitives/in-view"

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
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
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
    
  </div>
</section>
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
