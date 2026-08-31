import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Process / steps — a numbered horizontal flow.
// ═══ EMOTION     Clarity of sequence.
// ═══ SIGNATURE   A 3-step process with connecting hairlines and ordinals.

export type ProcessStep = { id: string; title: string; body?: string }

export type ProcessStepsProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  steps: ProcessStep[]
  tone?: "paper" | "ink"
  className?: string
}

export function ProcessSteps({ eyebrow = "PROCESS", title = "How it works.", subtitle = "Three steps, in order, with no detours.", steps, tone = "paper", className }: ProcessStepsProps) {
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={1120} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>
      <ol className="mt-10 grid gap-4 sm:grid-cols-3">
        {steps.map((s, i) => (
          <InView key={s.id} once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}>
            <li className="relative rounded-2xl border p-6">
              <span className={cn("font-mono text-[11px] font-bold tracking-[0.2em]", ink ? "text-background/45" : "text-muted-foreground")}>STEP {String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 font-display text-xl font-bold">{s.title}</h3>
              {s.body && <p className={cn("mt-2 text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{s.body}</p>}
              {i < steps.length - 1 && <span className={cn("absolute -right-2 top-1/2 hidden h-px w-4 sm:block", ink ? "bg-background/30" : "bg-border")} aria-hidden />}
            </li>
          </InView>
        ))}
      </ol>
    </SectionShell>
  )
}
