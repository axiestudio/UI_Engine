import * as React from "react"
import { ArrowUpRight } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

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
    <SectionShell tone={tone} width={920} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
      </InView>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}>
        <div className="mt-6 flex flex-wrap gap-2">
          {types.map((t) => (
            <button key={t} type="button" onClick={() => setActive(t)} className={cn("rounded-full px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors", t === active ? "bg-foreground text-background" : ink ? "text-background/60 hover:bg-background/10" : "text-muted-foreground hover:bg-accent")}>{t}</button>
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
    </SectionShell>
  )
}
