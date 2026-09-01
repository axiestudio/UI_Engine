import * as React from "react"
import { InView } from "@/components/primitives/in-view"

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
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>
      <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          {partners.map((p) => (
            <span key={p} className={cn("font-display text-sm font-bold uppercase tracking-[0.14em] opacity-50", ink ? "text-background" : "text-foreground")}>{p}</span>
          ))}
        </div>
        {caption && <p className={cn("mt-6 font-mono text-[11px] font-bold uppercase tracking-widest", ink ? "text-background/50" : "text-muted-foreground")}>{caption}</p>}
      </InView>
    
  </div>
</section>
  )
}
