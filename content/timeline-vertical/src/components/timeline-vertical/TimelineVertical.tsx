import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Vertical timeline — dated milestone rail.
// ═══ EMOTION     Progress you can point to.
// ═══ SIGNATURE   A left rail with dated nodes and an alternating entry layout.

export type TimelineEntry = { id: string; date: string; title: string; body?: string }

export type TimelineVerticalProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  entries: TimelineEntry[]
  tone?: "paper" | "ink"
  className?: string
}

export function TimelineVertical({ eyebrow = "MILESTONES", title = "The road so far.", subtitle = "A vertical rail of dated milestones.", entries, tone = "paper", className }: TimelineVerticalProps) {
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={920} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>
      <ol className="relative mt-10 ml-3 border-l pl-8">
        {entries.map((e, i) => (
          <InView key={e.id} once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}>
            <li className="relative pb-8 last:pb-0">
              <span className={cn("absolute -left-[41px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-background", ink ? "border-background" : "border-foreground")}>
                <span className={cn("h-1.5 w-1.5 rounded-full", ink ? "bg-background" : "bg-foreground")} />
              </span>
              <p className={cn("font-mono text-[11px] font-bold uppercase tracking-widest", ink ? "text-background/55" : "text-muted-foreground")}>{e.date}</p>
              <h3 className="mt-1 font-display text-xl font-bold">{e.title}</h3>
              {e.body && <p className={cn("mt-2 text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{e.body}</p>}
            </li>
          </InView>
        ))}
      </ol>
    </SectionShell>
  )
}
