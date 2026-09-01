import * as React from "react"
import { Check } from "lucide-react"
import { InView } from "@/components/primitives/in-view"

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
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>
      <div className={cn("mt-10 grid grid-cols-1 gap-4", cols)}>
        {items.map((item, i) => {
          const Icon = item.icon
          return (
            <InView key={item.id} once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}>
              <div className={cn("h-full rounded-xl border p-6", ink ? "border-background/15 bg-background/5" : "border-border bg-card")}>
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
    
  </div>
</section>
  )
}
