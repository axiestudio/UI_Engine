import * as React from "react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Overlapping cards — cards that crest a section boundary.
// ═══ EMOTION     Layered, dimensional.
// ═══ SIGNATURE   A half-height card row that overhangs the next section edge.

export type OverlapCard = { id: string; title: string; body?: string; icon?: React.ReactNode }

export type OverlapCardsProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  cards?: OverlapCard[]
  tone?: "paper" | "ink"
  className?: string
}

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_OVERLAP_CARDS_CARDS = [ { id: "o1", title: "Design", body: "Editorial, hand-tuned." }, { id: "o2", title: "Motion", body: "One move per section." }, { id: "o3", title: "Ship", body: "Install one package at a time." }, ]


export function OverlapCards({ eyebrow = "LAYERS", title = "Cards that crest.", subtitle = "A row of cards overhangs the boundary between two bands.", cards = DEMO_OVERLAP_CARDS_CARDS, tone = "paper", className }: OverlapCardsProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate bg-background pb-28", ink && "bg-foreground text-background", className)}>
      <div className="absolute inset-0 -z-10 bg-muted/30" style={{ clipPath: "inset(0 0 45% 0)" }} />
      <div className="mx-auto max-w-[1280px] px-5 pt-16 sm:px-8 lg:pt-24">
        <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
        </InView>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {cards.map((c, i) => (
            <InView key={c.id} once variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}>
              <div className={cn("rounded-xl border bg-card p-6 shadow-xl", i === 1 && "sm:-translate-y-4")}>
                {c.icon && <div className="mb-4">{c.icon}</div>}
                <h3 className="font-display text-xl font-bold">{c.title}</h3>
                {c.body && <p className={cn("mt-2 text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{c.body}</p>}
              </div>
            </InView>
          ))}
        </div>
      </div>
    </section>
  )
}
