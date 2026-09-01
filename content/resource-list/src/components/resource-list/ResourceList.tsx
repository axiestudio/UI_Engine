import * as React from "react"
import { ArrowUpRight } from "lucide-react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ═══ JOB         Resource list — a filterable list of downloadable resources.
// ═══ EMOTION     Useful, browsable.
// ═══ SIGNATURE   A category-filterable table-like list of resources.

export type Resource = { id: string; title: string; type?: string; size?: string; href?: string }

export type ResourceListProps = {
  eyebrow?: string
  title?: React.ReactNode
  resources: Resource[]
  tone?: "paper" | "ink"
  className?: string
}

export function ResourceList({ eyebrow = "RESOURCES", title = "Downloads & docs.", resources, tone = "paper", className }: ResourceListProps) {
  const ink = tone === "ink"
  const types = ["All", ...Array.from(new Set(resources.map((r) => r.type ?? "Other")))]
  const [active, setActive] = React.useState("All")
  const shown = resources.filter((r) => active === "All" || (r.type ?? "Other") === active)
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
      </InView>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}>
        <div className="mt-6 flex flex-wrap gap-2">
          {types.map((t) => (
            <Button type="button" key={t} onClick={() => setActive(t)} variant="default" className={cn(cn("rounded-full px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors", t === active ? "bg-foreground text-background" : ink ? "text-background/60 hover:bg-background/10" : "text-muted-foreground hover:bg-accent"))}>{t}
          ))}
        </div>
        <div className={cn("mt-6 divide-y", ink ? "divide-background/15" : "divide-border")}>
          {shown.map((r) => (
            <a key={r.id} href={r.href ?? "#"} className={cn("group flex items-center justify-between gap-4 py-4", ink ? "text-background" : "text-foreground")}>
              <div>
                <p className="font-display font-bold">{r.title}</p>
                <p className={cn("font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "text-background/50" : "text-muted-foreground")}>{r.type}{r.size ? ` · ${r.size}` : ""}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 opacity-50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          ))}
        </div>
      </InView>
    
  </div>
</section>
  )
}
