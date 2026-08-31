import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Brand values — a principle list with big ordinals.
// ═══ EMOTION     A manifesto that reads fast.
// ═══ SIGNATURE   Numbered principles with a hairline rule between each.

export type ValueItem = { id: string; title: string; body?: string }

export type BrandValuesProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  values: ValueItem[]
  tone?: "paper" | "ink"
  className?: string
}

export function BrandValues({ eyebrow = "VALUES", title = "What we hold the line on.", subtitle = "Three principles that shape every decision.", values, tone = "paper", className }: BrandValuesProps) {
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={920} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>
      <div className={cn("mt-10 divide-y", ink ? "divide-background/15" : "divide-border")}>
        {values.map((v, i) => (
          <InView key={v.id} once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}>
            <div className={cn("grid gap-4 py-6 sm:grid-cols-[auto_1fr] sm:gap-8", ink ? "border-background/15" : "border-border")}>
              <span className={cn("font-display text-5xl font-black leading-none opacity-20", ink ? "text-background" : "text-foreground")}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-display text-xl font-bold">{v.title}</h3>
                {v.body && <p className={cn("mt-2 max-w-xl text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{v.body}</p>}
              </div>
            </div>
          </InView>
        ))}
      </div>
    </SectionShell>
  )
}
