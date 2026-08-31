import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Press strip — a horizontal band of press mentions.
// ═══ EMOTION     Credible by association.
// ═══ SIGNATURE   A one-line marquee-like strip of quoted press outlets.

export type PressStripProps = {
  mentions?: { outlet: string; quote: string }[]
  tone?: "paper" | "ink"
  className?: string
}

export function PressStrip({
  mentions = [
    { outlet: "SITE OF THE DAY", quote: "“The cleanest section library we've seen.”" },
    { outlet: "DESIGN WEEKLY", quote: "“Sections that read like essays.”" },
    { outlet: "FRAME MAG", quote: "“A genuine point of view.”" },
  ],
  tone = "paper",
  className,
}: PressStripProps) {
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={1120} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <div className={cn("grid gap-4 border-y py-8 sm:grid-cols-3", ink ? "border-background/20" : "border-border")}>
          {mentions.map((m) => (
            <div key={m.outlet} className="text-center sm:not-last:border-r">
              <p className={cn("font-mono text-[10px] font-bold uppercase tracking-[0.3em]", ink ? "text-background/45" : "text-muted-foreground")}>{m.outlet}</p>
              <p className={cn("mt-2 text-sm font-medium leading-relaxed", ink ? "text-background/75" : "text-foreground")}>{m.quote}</p>
            </div>
          ))}
        </div>
      </InView>
    </SectionShell>
  )
}
