import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Timeline-scrub — a horizontal timeline you scrub through milestones.
// ═══ EMOTION     Clock the progress.
// ═══ SIGNATURE   A draggable/scroll-scrubbed timeline with an active marker.

export type ScrubMilestone = { id: string; year: string; title: string; body?: string }

export type InteractiveTimelineScrubProps = {
  eyebrow?: string
  title?: React.ReactNode
  milestones: ScrubMilestone[]
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_MILESTONES = [
  { id: "ms1", year: "2014", title: "A borrowed garage", body: "One bench, one router, the owner's espresso machine." },
  { id: "ms2", year: "2017", title: "First craft standard", body: "Written on a single sheet, still pinned to the wall." },
  { id: "ms3", year: "2021", title: "The workshop opens", body: "Six benches, north light, a proper dust plant." },
  { id: "ms4", year: "2026", title: "Still finishing", body: "Same standard sheet. Third rewrite, same rule: finish." },
]
export function InteractiveTimelineScrub({ eyebrow = "SCRUB", title = "Drag through the years.", milestones = DEFAULT_MILESTONES, tone = "paper", className }: InteractiveTimelineScrubProps) {
  const ink = tone === "ink"
  const trackRef = React.useRef<HTMLDivElement>(null)
  const [pos, setPos] = React.useState(0)
  const active = Math.min(milestones.length - 1, Math.floor(pos * milestones.length))
  const onPointer = (clientX: number) => {
    const el = trackRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setPos(Math.max(0, Math.min(1, (clientX - r.left) / r.width)))
  }
  const m = milestones[active]
  return (
    <SectionShell tone={tone} width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
      </InView>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}>
        <div ref={trackRef}
          className="relative mt-10 h-20 select-none cursor-ew-resize touch-none"
          onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); onPointer(e.clientX) }}
          onPointerMove={(e) => { if (e.buttons) onPointer(e.clientX) }}
        >
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted" />
          <motion.div className="absolute top-1/2 h-1 origin-left -translate-y-1/2 rounded-full bg-foreground" style={{ scaleX: pos, width: "100%" }} />
          <motion.div className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground ring-4 ring-background"
            style={{ left: `${pos * 100}%` }} />
        </div>
        <div className="mt-6 flex justify-between font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {milestones.map((mi) => <span key={mi.id}>{mi.year}</span>)}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
          <p className="font-display text-5xl font-bold opacity-20">{m.year}</p>
          <div>
            <h3 className="font-display text-xl font-bold">{m.title}</h3>
            {m.body && <p className={cn("mt-1 text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{m.body}</p>}
          </div>
        </div>
      </InView>
    </SectionShell>
  )
}
