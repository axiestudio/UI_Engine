import * as React from "react"
import { Tilt } from "@/components/primitives/tilt"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
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

export function InteractiveTiltCards({ eyebrow = "TACTILE", title = "Cards that respond.", items, tone = "paper", className }: InteractiveTiltCardsProps) {
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={1120} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
      </InView>
      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {items.map((it, i) => {
          const Icon = it.icon
          return (
            <InView key={it.id} once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}>
              <div className="[perspective:1000px]">
                <Tilt rotationFactor={10} className="h-full">
                  <div className={cn("relative flex h-full flex-col overflow-hidden rounded-2xl border p-6", ink ? "border-background/15 bg-background/5" : "border-border bg-card")}>
                    <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl" style={{ background: "radial-gradient(circle, hsl(var(--site-accent)/0.35), transparent 70%)" }} />
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
    </SectionShell>
  )
}
