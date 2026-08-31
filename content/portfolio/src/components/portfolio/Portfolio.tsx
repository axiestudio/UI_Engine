import * as React from "react"
import { ArrowUpRight } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Portfolio / projects — hover-zoom project grid.
// ═══ EMOTION     Work that speaks for itself.
// ═══ SIGNATURE   A 3-col project grid where the image zooms on hover.

export type ProjectItem = { id: string; title: string; category?: string; image?: string; year?: string }

export type PortfolioProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  items: ProjectItem[]
  columns?: 2 | 3
  tone?: "paper" | "ink"
  className?: string
}

export function Portfolio({
  eyebrow = "WORK",
  title = "Selected projects.",
  subtitle = "A grid of work — image zooms on hover, category and year sit beside the title.",
  items,
  columns = 3,
  tone = "paper",
  className,
}: PortfolioProps) {
  const ink = tone === "ink"
  const cols = columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"
  return (
    <SectionShell tone={tone} width={1280} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>
      <div className={cn("mt-10 grid grid-cols-1 gap-4", cols)}>
        {items.map((p, i) => (
          <InView key={p.id} once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}>
            <a href="#" className="group block" aria-label={p.title}>
              <div className="img-hover-wash aspect-[4/3] rounded-xl border bg-muted">
                {p.image ? <img src={p.image} alt={p.title} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-muted" />}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold">{p.title}</h3>
                  {p.category && <p className={cn("font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "text-background/55" : "text-muted-foreground")}>{p.category}</p>}
                </div>
                <div className={cn("flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "text-background/55" : "text-muted-foreground")}>
                  {p.year}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </div>
            </a>
          </InView>
        ))}
      </div>
    </SectionShell>
  )
}
