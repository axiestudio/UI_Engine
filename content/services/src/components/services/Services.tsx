import * as React from "react"
import { ArrowUpRight } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Services section — carded list of offerings.
// ═══ EMOTION     Offers, clearly priced/described.
// ═══ SIGNATURE   A row of service cards with a number, description and a link.

export type ServiceItem = { id: string; title: string; body?: string; price?: string; link?: { label: string; href?: string } }

export type ServicesProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  items: ServiceItem[]
  columns?: 2 | 3
  tone?: "paper" | "ink"
  className?: string
}

export function Services({
  eyebrow = "SERVICES",
  title = "What we do.",
  subtitle = "A focused set of offers, each with a clear starting point.",
  items,
  columns = 3,
  tone = "paper",
  className,
}: ServicesProps) {
  const ink = tone === "ink"
  const cols = columns === 2 ? "sm:grid-cols-2" : "lg:grid-cols-3"
  return (
    <SectionShell tone={tone} width={1120} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>
      <div className={cn("mt-10 grid grid-cols-1 gap-4", cols)}>
        {items.map((s, i) => (
          <InView key={s.id} once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}>
            <div className={cn("group flex h-full flex-col rounded-2xl border p-6", ink ? "border-background/15 bg-background/5" : "border-border bg-card")}>
              <span className={cn("font-mono text-[11px] font-bold tracking-[0.2em]", ink ? "text-background/45" : "text-muted-foreground")}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-xl font-bold">{s.title}</h3>
              {s.body && <p className={cn("mt-2 flex-1 text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{s.body}</p>}
              <div className={cn("mt-6 flex items-center justify-between border-t pt-4", ink ? "border-background/15" : "border-border")}>
                {s.price && <span className="font-display text-lg font-black">{s.price}</span>}
                {s.link && (
                  <a href={s.link.href} className={cn("inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-widest transition-transform group-hover:translate-x-0.5", ink ? "text-background" : "text-foreground")}>
                    {s.link.label}
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </InView>
        ))}
      </div>
    </SectionShell>
  )
}
