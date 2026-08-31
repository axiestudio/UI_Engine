import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { BorderTrail } from "@/components/primitives/border-trail"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Capabilities — a framed grid where each card self-draws its edge.
// ═══ EMOTION     Precision, engineering.
// ═══ SIGNATURE   BorderTrail light circles each capability card as it enters.

export type Capability = { id: string; title: string; body?: string }

export type CapabilitiesProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  items: Capability[]
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_ITEMS = [
  { id: "1", title: "Measured twice", body: "Every cut is checked against the drawing before it leaves the bench." },
  { id: "2", title: "Named hands", body: "The person who built your piece signs the back panel." },
  { id: "3", title: "Quiet hardware", body: "Soft-close everything. You hear the room, not the fittings." },
  { id: "4", title: "Ten-year promise", body: "If a joint fails, we drive out and refit it. In writing." },
]
export function Capabilities({ eyebrow = "CAPABILITIES", title = "What we do well.", subtitle = "Each card draws its own edge as you reach it.", items = DEFAULT_ITEMS, tone = "paper", className }: CapabilitiesProps) {
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {items.map((c, i) => (
          <InView key={c.id} once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}>
            <div className={cn("relative h-full overflow-hidden rounded-xl border p-6", ink ? "border-background/15 bg-background/5" : "border-border bg-card")}>
              <BorderTrail size={52} className={cn("bg-[hsl(var(--primary)/0.7)]")} transition={{ ease: "linear", duration: 4 }} />
              <span className={cn("font-mono text-[11px] font-bold tracking-[0.2em]", ink ? "text-background/45" : "text-muted-foreground")}>{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 font-display text-lg font-bold">{c.title}</h3>
              {c.body && <p className={cn("mt-2 text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{c.body}</p>}
            </div>
          </InView>
        ))}
      </div>
    </SectionShell>
  )
}
