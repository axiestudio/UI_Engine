import * as React from "react"
import { Gift } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Trial box — a no-commitment trial signup.
// ═══ EMOTION     Try before you buy.
// ═══ SIGNATURE   A contained trial box with a short value + CTA.

export type TrialBoxProps = {
  eyebrow?: string
  title?: React.ReactNode
  body?: React.ReactNode
  point?: string
  cta?: string
  tone?: "paper" | "ink"
  className?: string
}

export function TrialBox({ eyebrow = "TRY IT", title = "14 days, everything on.", body = "Full access to every section. Keep whatever you ship.", point = "No card required", cta = "Start trial", tone = "paper", className }: TrialBoxProps) {
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={760} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <div className={cn("rounded-2xl border p-8 text-center", ink ? "border-background/25 bg-background/5" : "border-foreground bg-card")}>
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent"><Gift className="h-6 w-6" /></span>
          <p className={cn("mt-5 font-mono text-[11px] font-bold uppercase tracking-[0.3em]", ink ? "text-background/50" : "text-muted-foreground")}>{eyebrow}</p>
          <h2 className="mt-3 font-display text-2xl font-black tracking-[-0.02em] sm:text-3xl">{title}</h2>
          <p className={cn("mx-auto mt-3 max-w-sm text-base font-medium leading-relaxed", ink ? "text-background/75" : "text-muted-foreground")}>{body}</p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <Button size="lg" className="h-11 rounded-full px-7 font-mono text-[11px] font-bold uppercase tracking-widest">{cta}</Button>
            {point && <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{point}</p>}
          </div>
        </div>
      </InView>
    </SectionShell>
  )
}
