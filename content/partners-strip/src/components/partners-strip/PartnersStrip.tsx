import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Partners strip — a logo band with a supporting caption.
// ═══ EMOTION     Built with the best.
// ═══ SIGNATURE   Two rows of partner wordmarks, muted.

export type PartnersStripProps = {
  eyebrow?: string
  title?: React.ReactNode
  partners?: string[]
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function PartnersStrip({ eyebrow = "PARTNERS", title = "Alongside the best.", partners = ["FIGMA", "VITE", "MOTION", "RADIX", "TAILWIND", "LUCIDE"], caption = "Built on open tooling", tone = "paper", className }: PartnersStripProps) {
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={1120} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
      </InView>
      <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          {partners.map((p) => (
            <span key={p} className={cn("font-display text-sm font-black uppercase tracking-[0.14em] opacity-50", ink ? "text-background" : "text-foreground")}>{p}</span>
          ))}
        </div>
        {caption && <p className={cn("mt-6 font-mono text-[11px] font-bold uppercase tracking-widest", ink ? "text-background/50" : "text-muted-foreground")}>{caption}</p>}
      </InView>
    </SectionShell>
  )
}
