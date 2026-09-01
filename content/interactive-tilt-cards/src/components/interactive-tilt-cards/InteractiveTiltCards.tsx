import * as React from "react"
import { Tilt } from "@/components/primitives/tilt"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

// ═══ JOB         Tilt-cards — magnetic, glowing cards that tilt and lift on hover.
// ═══ EMOTION     Premium, tactile.
// ═══ SIGNATURE   A row of cards with Tilt + GlowEffect, each with an icon.

export type TiltCardItem = { id: string; title: string; body?: string; icon?: LucideIcon }

export type InteractiveTiltCardsProps = {
  eyebrow?: string
  title?: React.ReactNode
  items: TiltCardItem[]
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_ITEMS = [
  { id: "i1", title: "Joints for decades", body: "Mortise and tenon, glued and pinned. No staples, ever." },
  { id: "i2", title: "Finishes that age well", body: "Hardwax oil you can renew with a rag and an afternoon." },
  { id: "i3", title: "Repairs without drama", body: "Every piece is documented; parts stay standard." },
]
export function InteractiveTiltCards({ eyebrow = "TACTILE", title = "Cards that respond.", items = DEFAULT_ITEMS, tone = "paper", className }: InteractiveTiltCardsProps) {
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
      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {items.map((it, i) => {
          const Icon = it.icon
          return (
            <InView key={it.id} once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}>
              <div className="[perspective:1000px]">
                <Tilt rotationFactor={10} className="h-full">
                  <div className={cn("relative flex h-full flex-col overflow-hidden rounded-xl border p-6", ink ? "border-background/15 bg-background/5" : "border-border bg-card")}>
                    <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl" style={{ background: "radial-gradient(circle, hsl(var(--primary)/0.35), transparent 70%)" }} />
                    {Icon && <span className={cn("mb-4 flex h-11 w-11 items-center justify-center rounded-xl", ink ? "bg-background/10" : "bg-accent")}><Icon className="h-5 w-5" /></span>}
                    <h3 className="font-display text-lg font-bold">{it.title}</h3>
                    {it.body && <p className={cn("mt-2 text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{it.body}</p>}
                  </div>
                </Tilt>
              </div>
            </InView>
          )
        })}
      </div>
    
  </div>
</section>
  )
}
