import * as React from "react"
import { InView } from "@/components/primitives/in-view"

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
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

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
    
  </div>
</section>
  )
}
