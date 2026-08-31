import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Team grid — people with role rails in a clean grid.
// ═══ EMOTION     Human, credible.
// ═══ SIGNATURE   Avatar card + name + role, image zooms on hover.

export type TeamMember = { id: string; name: string; role?: string; image?: string; bio?: string }

export type TeamGridProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  members: TeamMember[]
  columns?: 2 | 3 | 4
  tone?: "paper" | "ink"
  className?: string
}

export function TeamGrid({ eyebrow = "TEAM", title = "The people behind it.", subtitle = "A small team, a broad surface.", members, columns = 3, tone = "paper", className }: TeamGridProps) {
  const ink = tone === "ink"
  const cols = columns === 2 ? "sm:grid-cols-2" : columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3"
  return (
    <SectionShell tone={tone} width={1120} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>
      <div className={cn("mt-10 grid grid-cols-1 gap-4", cols)}>
        {members.map((m, i) => (
          <InView key={m.id} once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}>
            <div className={cn("group rounded-2xl border p-4", ink ? "border-background/15 bg-background/5" : "border-border bg-card")}>
              <div className="img-hover-wash aspect-square overflow-hidden rounded-xl bg-muted">
                {m.image ? <img src={m.image} alt={m.name} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-muted font-display text-3xl font-black text-muted-foreground/40">{m.name.slice(0, 1)}</div>}
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
    </SectionShell>
  )
}
