import * as React from "react"
import { InView } from "@/components/primitives/in-view"

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

const DEFAULT_STEPS = [
  { id: "p1", title: "Conversation", body: "An hour in the workshop. We listen more than we talk." },
  { id: "p2", title: "Drawing", body: "Full-scale on the floor. You stand inside it before we cut." },
  { id: "p3", title: "The build", body: "One maker, start to finish. You get photos on Fridays." },
  { id: "p4", title: "Delivery", body: "We carry it in, place it, and show you how to care for it." },
]
export function ProcessSteps({ eyebrow = "PROCESS", title = "How it works.", subtitle = "Four steps, in order, with no detours.", steps = DEFAULT_STEPS, tone = "paper", className }: ProcessStepsProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-5 sm:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>
      <ol className="mt-10 grid gap-4 sm:grid-cols-3">
        {steps.map((s, i) => (
          <InView key={s.id} once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}>
            <li className="relative rounded-xl border p-6">
              <span className={cn("font-mono text-[11px] font-bold tracking-[0.2em]", ink ? "text-background/45" : "text-muted-foreground")}>STEP {String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 font-display text-xl font-bold">{s.title}</h3>
              {s.body && <p className={cn("mt-2 text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{s.body}</p>}
              {i < steps.length - 1 && <span className={cn("absolute -right-2 top-1/2 hidden h-px w-4 sm:block", ink ? "bg-background/30" : "bg-border")} aria-hidden />}
            </li>
          </InView>
        ))}
      </ol>
    
  </div>
</section>
  )
}
