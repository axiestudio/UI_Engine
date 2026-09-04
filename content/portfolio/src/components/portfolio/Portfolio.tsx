import * as React from "react"
import { ArrowUpRight } from "lucide-react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Portfolio / projects — hover-zoom project grid.
// ═══ EMOTION     Work that speaks for itself.
// ═══ SIGNATURE   A 3-col project grid where the image zooms on hover.

export type ProjectItem = { id: string; title: string; category?: string; image?: string; year?: string }

export type PortfolioProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  items?: ProjectItem[]
  columns?: 2 | 3
  tone?: "paper" | "ink"
  className?: string
}


// Self-demo defaults: bare mount (= tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_PORTFOLIO_ITEMS = [ { id: "p1", title: "Nord Studio", category: "Brand site", year: "2025", image: "/showcase/content/content-03-product.webp" }, { id: "p2", title: "Atelier", category: "E-commerce", year: "2025", image: "/showcase/content/content-04-architecture.webp" }, { id: "p3", title: "Field Notes", category: "Editorial", year: "2024", image: "/showcase/content/content-05-workshop.webp" }, ]

export function Portfolio({
  eyebrow = "WORK",
  title = "Selected projects.",
  subtitle = "A grid of work — image zooms on hover, category and year sit beside the title.",
  items = DEMO_PORTFOLIO_ITEMS,
  columns = 3,
  tone = "paper",
  className,
}: PortfolioProps) {
  const ink = tone === "ink"
  const cols = columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-5 sm:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1280), ["--shell-w" as string]: `${(1280)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
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
    
  </div>
</section>
  )
}
