import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Price banner — a single loud pricing callout.
// ═══ EMOTION     Deal, right now.
// ═══ SIGNATURE   Full-bleed-style banner with a big price and one CTA.

export type PriceBannerProps = {
  eyebrow?: string
  title?: React.ReactNode
  price?: string
  period?: string
  note?: string
  cta?: string
  tone?: "paper" | "ink"
  className?: string
}

export function PriceBanner({ eyebrow = "LAUNCH OFFER", title = "Everything, one price.", price = "€0", period = "/ until June", note = "Then €12/mo", cta = "Start free", tone = "paper", className }: PriceBannerProps) {
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={1120} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <div className={cn("flex flex-col items-center justify-between gap-6 rounded-2xl border p-10 text-center md:flex-row md:text-left", ink ? "border-background/25 bg-background/5" : "border-foreground bg-card")}>
          <div>
            <p className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.3em]", ink ? "text-background/50" : "text-muted-foreground")}>{eyebrow}</p>
            <h2 className="mt-2 font-display text-2xl font-black tracking-[-0.02em] sm:text-3xl">{title}</h2>
            <p className="mt-2 font-display text-5xl font-black">
              {price}<span className="text-lg font-medium text-muted-foreground">{period}</span>
            </p>
            {note && <p className={cn("mt-1 text-sm font-medium", ink ? "text-background/60" : "text-muted-foreground")}>{note}</p>}
          </div>
          <Button size="lg" className="h-12 rounded-full px-8 font-mono text-[11px] font-bold uppercase tracking-widest">{cta}</Button>
        </div>
      </InView>
    </SectionShell>
  )
}
