import * as React from "react"
import { Trophy } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Award strip — a row of accolades and honors.
// ═══ EMOTION     Recognized.
// ═══ SIGNATURE   A trophy-led grid of award/date pairs.

export type Award = { id: string; title: string; org?: string; year?: string }

export type AwardStripProps = {
  eyebrow?: string
  title?: React.ReactNode
  awards: Award[]
  tone?: "paper" | "ink"
  className?: string
}

export function AwardStrip({ eyebrow = "HONORS", title = "Recognized.", awards, tone = "paper", className }: AwardStripProps) {
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
      </InView>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {awards.map((a, i) => (
          <InView key={a.id} once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}>
            <div className={cn("flex h-full flex-col rounded-xl border p-6", ink ? "border-background/15 bg-background/5" : "border-border bg-card")}>
              <Trophy className="h-5 w-5 text-amber-400" />
              <h3 className="mt-4 font-display text-base font-bold">{a.title}</h3>
              {a.org && <p className={cn("mt-1 flex-1 text-sm font-medium", ink ? "text-background/65" : "text-muted-foreground")}>{a.org}</p>}
              {a.year && <span className={cn("mt-3 font-mono text-[11px] font-bold uppercase tracking-widest", ink ? "text-background/50" : "text-muted-foreground")}>{a.year}</span>}
            </div>
          </InView>
        ))}
      </div>
    </SectionShell>
  )
}
