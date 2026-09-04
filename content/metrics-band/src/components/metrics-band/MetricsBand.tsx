import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { AnimatedNumber } from "@/components/primitives/animated-number"

import { cn } from "@/lib/utils"

// ═══ JOB         Metrics band — key performance figures in a compact row.
// ═══ EMOTION     Hard numbers, softly animated.
// ═══ SIGNATURE   A slim band of AnimatedNumber metrics with a caption.

export type MetricItem = { id: string; value: number; suffix?: string; label: string; decimals?: number }

export type MetricsBandProps = {
  eyebrow?: string
  title?: React.ReactNode
  metrics?: MetricItem[]
  tone?: "paper" | "ink"
  className?: string
}

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_METRICS_BAND_METRICS = [{id:"m1",value:40,suffix:"+",label:"Sections"},{id:"m2",value:12,label:"Installs"}]


export function MetricsBand({ eyebrow = "METRICS", title = "The numbers.", metrics = DEMO_METRICS_BAND_METRICS, tone = "paper", className }: MetricsBandProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-5 sm:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <div className="flex items-end justify-between gap-4">
            <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
        </div>
      </InView>
      <dl className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-xl border sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.id} className={cn("p-6", ink ? "bg-background/5" : "bg-card")}>
            <dd className="font-display text-3xl font-bold tabular-nums sm:text-4xl">
              <AnimatedNumber value={m.value} decimals={m.decimals} />
              <span className="text-xl">{m.suffix}</span>
            </dd>
            <dt className={cn("mt-1 font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "text-background/55" : "text-muted-foreground")}>{m.label}</dt>
          </div>
        ))}
      </dl>
    
  </div>
</section>
  )
}
