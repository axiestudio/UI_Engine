import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

// ═══ JOB         Feature rail — a horizontal scrollable rail of features.
// ═══ EMOTION     Dense, browsable.
// ═══ SIGNATURE   A snap-scroll horizontal rail of feature cards with arrows.

export type FeatureRailItem = { id: string; title: string; body?: string; icon?: LucideIcon }

export type FeatureRailProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  items: FeatureRailItem[]
  tone?: "paper" | "ink"
  className?: string
}

export function FeatureRail({ eyebrow = "RAIL", title = "Slide through the stack.", subtitle = "A snap-scroll rail of features.", items, tone = "paper", className }: FeatureRailProps) {
  const ink = tone === "ink"
  const ref = React.useRef<HTMLDivElement>(null)
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" })
  return (
    <SectionShell tone={tone} width={1280} grain={!ink} rule="bottom" className={className}>
      <div className="flex items-end justify-between gap-6">
        <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
        </InView>
        <div className="hidden shrink-0 gap-2 sm:flex">
          <button type="button" onClick={() => scroll(-1)} className="flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground hover:bg-accent" aria-label="Scroll back">←</button>
          <button type="button" onClick={() => scroll(1)} className="flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground hover:bg-accent" aria-label="Scroll forward">→</button>
        </div>
      </div>
      <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <div ref={ref} className="mt-10 grid grid-flow-col auto-cols-[78%] gap-4 overflow-x-auto pb-4 sm:auto-cols-[44%] lg:auto-cols-[32%] [scroll-snap-type:x_mandatory]">
          {items.map((it) => {
            const Icon = it.icon
            return (
              <div key={it.id} className={cn("rounded-2xl border p-6 [scroll-snap-align:start]", ink ? "border-background/15 bg-background/5" : "border-border bg-card")}>
                {Icon && <span className={cn("mb-4 flex h-10 w-10 items-center justify-center rounded-xl", ink ? "bg-background/10" : "bg-accent")}><Icon className="h-5 w-5" /></span>}
                <h3 className="font-display text-lg font-bold">{it.title}</h3>
                {it.body && <p className={cn("mt-2 text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{it.body}</p>}
              </div>
            )
          })}
        </div>
      </InView>
    </SectionShell>
  )
}
