import * as React from "react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Team grid — people with role rails in a clean grid.
// ═══ EMOTION     Human, credible.
// ═══ SIGNATURE   Avatar card + name + role, image zooms on hover.

export type TeamMember = { id: string; name: string; role?: string; image?: string; bio?: string }

export type TeamGridProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  members?: TeamMember[]
  columns?: 2 | 3 | 4
  tone?: "paper" | "ink"
  className?: string
}

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_TEAM_GRID_MEMBERS = [ { id: "t1", name: "Ada Lindqvist", role: "Design lead" }, { id: "t2", name: "Milo Sato", role: "Motion" }, { id: "t3", name: "Iris Novak", role: "Engineering" }, ]


export function TeamGrid({ eyebrow = "TEAM", title = "The people behind it.", subtitle = "A small team, a broad surface.", members = DEMO_TEAM_GRID_MEMBERS, columns = 3, tone = "paper", className }: TeamGridProps) {
  const ink = tone === "ink"
  const cols = columns === 2 ? "sm:grid-cols-2" : columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3"
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-5 sm:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>
      <div className={cn("mt-10 grid grid-cols-1 gap-4", cols)}>
        {members.map((m, i) => (
          <InView key={m.id} once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}>
            <div className={cn("group rounded-xl border p-4", ink ? "border-background/15 bg-background/5" : "border-border bg-card")}>
              <div className="img-hover-wash aspect-square overflow-hidden rounded-xl bg-muted">
                {m.image ? <img src={m.image} alt={m.name} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-muted font-display text-3xl font-bold text-muted-foreground/40">{m.name.slice(0, 1)}</div>}
              </div>
              <div className="mt-4">
                <h3 className="font-display text-lg font-bold">{m.name}</h3>
                {m.role && <p className={cn("font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "text-background/55" : "text-muted-foreground")}>{m.role}</p>}
                {m.bio && <p className={cn("mt-2 text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{m.bio}</p>}
              </div>
            </div>
          </InView>
        ))}
      </div>
    
  </div>
</section>
  )
}
