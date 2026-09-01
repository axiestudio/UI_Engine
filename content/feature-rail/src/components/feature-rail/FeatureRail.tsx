import * as React from "react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

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
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1280), ["--shell-w" as string]: `${(1280)}px` }}>

      <div className="flex items-end justify-between gap-6">
        <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
        </InView>
        <div className="hidden shrink-0 gap-2 sm:flex">
          <Button type="button" onClick={() => scroll(-1)} aria label="Scroll back" variant="default" size="icon" className={flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground hover:bg-accent}>←
          <Button type="button" onClick={() => scroll(1)} aria label="Scroll forward" variant="default" size="icon" className={flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground hover:bg-accent}>→
        </div>
      </div>
      <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <div ref={ref} className="mt-10 grid grid-flow-col auto-cols-[78%] gap-4 overflow-x-auto pb-4 sm:auto-cols-[44%] lg:auto-cols-[32%] [scroll-snap-type:x_mandatory]">
          {items.map((it) => {
            const Icon = it.icon
            return (
              <div key={it.id} className={cn("rounded-xl border p-6 [scroll-snap-align:start]", ink ? "border-background/15 bg-background/5" : "border-border bg-card")}>
                {Icon && <span className={cn("mb-4 flex h-10 w-10 items-center justify-center rounded-xl", ink ? "bg-background/10" : "bg-accent")}><Icon className="h-5 w-5" /></span>}
                <h3 className="font-display text-lg font-bold">{it.title}</h3>
                {it.body && <p className={cn("mt-2 text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{it.body}</p>}
              </div>
            )
          })}
        </div>
      </InView>
    
  </div>
</section>
  )
}
