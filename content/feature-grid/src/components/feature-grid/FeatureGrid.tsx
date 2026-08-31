import * as React from "react"
import { Check } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

// ═══ JOB         Icon-led feature grid (bento-free, clean columns).
// ═══ EMOTION     Clear, confident value framing.
// ═══ SIGNATURE   A 2xN grid of features each with its own icon chip.

export type FeatureItem = { id: string; title: string; body?: string; icon?: LucideIcon }

export type FeatureGridProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  items: FeatureItem[]
  columns?: 2 | 3 | 4
  tone?: "paper" | "ink"
  className?: string
}

export function FeatureGrid({
  eyebrow = "FEATURES",
  title = "Everything you need to ship.",
  subtitle = "The sections, tokens and patterns you reach for on every build.",
  items,
  columns = 3,
  tone = "paper",
  className,
}: FeatureGridProps) {
  const ink = tone === "ink"
  const cols = columns === 2 ? "sm:grid-cols-2" : columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3"
  return (
    <SectionShell tone={tone} width={1120} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>
      <div className={cn("mt-10 grid grid-cols-1 gap-4", cols)}>
        {items.map((item, i) => {
          const Icon = item.icon
          return (
            <InView key={item.id} once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}>
              <div className={cn("h-full rounded-2xl border p-6", ink ? "border-background/15 bg-background/5" : "border-border bg-card")}>
                <div className="flex items-center gap-3">
                  <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", ink ? "bg-background/10 text-background" : "bg-accent text-foreground")}>
                    {Icon ? <Icon className="h-5 w-5" /> : <Check className="h-5 w-5" />}
                  </span>
                  <h3 className="font-display text-lg font-bold">{item.title}</h3>
                </div>
                {item.body && <p className={cn("mt-3 text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{item.body}</p>}
              </div>
            </InView>
          )
        })}
      </div>
    </SectionShell>
  )
}
