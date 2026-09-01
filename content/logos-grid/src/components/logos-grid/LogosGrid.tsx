import * as React from "react"
import { InView } from "@/components/primitives/in-view"

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
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
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
    
  </div>
</section>
  )
}
