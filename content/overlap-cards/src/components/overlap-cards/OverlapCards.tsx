import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Overlapping cards — cards that crest a section boundary.
// ═══ EMOTION     Layered, dimensional.
// ═══ SIGNATURE   A half-height card row that overhangs the next section edge.

export type OverlapCard = { id: string; title: string; body?: string; icon?: React.ReactNode }

export type OverlapCardsProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  cards: OverlapCard[]
  tone?: "paper" | "ink"
  className?: string
}

export function OverlapCards({ eyebrow = "LAYERS", title = "Cards that crest.", subtitle = "A row of cards overhangs the boundary between two bands.", cards, tone = "paper", className }: OverlapCardsProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate bg-background pb-28", ink && "bg-foreground text-background", className)}>
      <div className="absolute inset-0 -z-10 bg-muted/30" style={{ clipPath: "inset(0 0 45% 0)" }} />
      <div className="mx-auto max-w-[1280px] px-5 pt-16 sm:px-8 lg:pt-24">
        <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
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
