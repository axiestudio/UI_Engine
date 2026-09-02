import * as React from "react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Vertical timeline — dated milestone rail.
// ═══ EMOTION     Progress you can point to.
// ═══ SIGNATURE   A left rail with dated nodes and an alternating entry layout.

export type TimelineEntry = { id: string; date: string; title: string; body?: string }

export type TimelineVerticalProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  entries?: TimelineEntry[]
  tone?: "paper" | "ink"
  className?: string
}

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_TIMELINE_VERTICAL_ENTRIES = [ { id: "m1", date: "2024", title: "The idea", body: "Forty sections, one language." }, { id: "m2", date: "2025", title: "The build", body: "Tokens, primitives and so much wireframe." }, { id: "m3", date: "2026", title: "The launch", body: "A library you can ship a site from." }, ]


export function TimelineVertical({ eyebrow = "MILESTONES", title = "The road so far.", subtitle = "A vertical rail of dated milestones.", entries = DEMO_TIMELINE_VERTICAL_ENTRIES, tone = "paper", className }: TimelineVerticalProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
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
    
  </div>
</section>
  )
}
