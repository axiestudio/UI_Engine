import * as React from "react"
import { Trophy } from "lucide-react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Award strip — a row of accolades and honors.
// ═══ EMOTION     Recognized.
// ═══ SIGNATURE   A trophy-led grid of award/date pairs.

export type Award = { id: string; title: string; org?: string; year?: string }

export type AwardStripProps = {
  eyebrow?: string
  title?: React.ReactNode
  awards?: Award[]
  tone?: "paper" | "ink"
  className?: string
}

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_AWARD_STRIP_AWARDS = [{id:"a1",title:"Site of the Day",org:"Awwwards",year:"2025"},{id:"a2",title:"Best UI",org:"FWA",year:"2025"},{id:"a3",title:"MVP",org:"CSSDA",year:"2024"}]


export function AwardStrip({ eyebrow = "HONORS", title = "Recognized.", awards = DEMO_AWARD_STRIP_AWARDS, tone = "paper", className }: AwardStripProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
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
    
  </div>
</section>
  )
}
