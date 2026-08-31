import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Logos grid — a static grid of client wordmarks.
// ═══ EMOTION     Institutional trust.
// ═══ SIGNATURE   A bordered grid of monochrome wordmarks (no marquee).

export type LogosGridProps = {
  eyebrow?: string
  title?: React.ReactNode
  /** Wordmark labels rendered as styled text. */
  logos: string[]
  columns?: 2 | 3 | 4
  tone?: "paper" | "ink"
  className?: string
}

export function LogosGrid({ eyebrow = "TRUSTED BY", title = "In good company.", logos = ["NORTH", "ATELIER", "FIELDSETTER", "HELM", "VANTA", "LOOPLINE", "MERIDIAN", "OAKWORKS"], columns = 4, tone = "paper", className }: LogosGridProps) {
  const ink = tone === "ink"
  const cols = columns === 2 ? "sm:grid-cols-2" : columns === 3 ? "sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4"
  return (
    <SectionShell tone={tone} width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
      </InView>
      <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
        <div className={cn("mt-10 grid gap-px overflow-hidden rounded-xl border", cols)}>
          {logos.map((l) => (
            <div key={l} className={cn("flex items-center justify-center px-4 py-8", ink ? "border-background/10 bg-background/5" : "border-border bg-card")}>
              <span className="font-display text-sm font-bold uppercase tracking-[0.18em] opacity-60">{l}</span>
            </div>
          ))}
        </div>
      </InView>
    </SectionShell>
  )
}
