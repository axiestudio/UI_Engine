import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { AnimatedNumber } from "@/components/primitives/animated-number"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Metrics band — key performance figures in a compact row.
// ═══ EMOTION     Hard numbers, softly animated.
// ═══ SIGNATURE   A slim band of AnimatedNumber metrics with a caption.

export type MetricItem = { id: string; value: number; suffix?: string; label: string; decimals?: number }

export type MetricsBandProps = {
  eyebrow?: string
  title?: React.ReactNode
  metrics: MetricItem[]
  tone?: "paper" | "ink"
  className?: string
}

export function MetricsBand({ eyebrow = "METRICS", title = "The numbers.", metrics, tone = "paper", className }: MetricsBandProps) {
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <div className="flex items-end justify-between gap-4">
          <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
        </div>
      </InView>
      <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border sm:grid-cols-4">
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
    </SectionShell>
  )
}
