import * as React from "react"
import { ArrowUpRight } from "lucide-react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Services section — carded list of offerings.
// ═══ EMOTION     Offers, clearly priced/described.
// ═══ SIGNATURE   A row of service cards with a number, description and a link.

export type ServiceItem = { id: string; title: string; body?: string; price?: string; link?: { label: string; href?: string } }

export type ServicesProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  items?: ServiceItem[]
  columns?: 2 | 3
  tone?: "paper" | "ink"
  className?: string
}


// Self-demo defaults: bare mount (= tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_SERVICES_ITEMS = [ { id: "s1", title: "Brand sites", body: "Launch-ready marketing sites.", price: "from €4k", link: { label: "Explore", href: "#" } }, { id: "s2", title: "Design systems", body: "Token-first component libraries.", price: "from €8k", link: { label: "Explore", href: "#" } }, { id: "s3", title: "Motion", body: "Scroll-driven and animated flows.", price: "from €3k", link: { label: "Explore", href: "#" } }, ]

export function Services({
  eyebrow = "SERVICES",
  title = "What we do.",
  subtitle = "A focused set of offers, each with a clear starting point.",
  items = DEMO_SERVICES_ITEMS,
  columns = 3,
  tone = "paper",
  className,
}: ServicesProps) {
  const ink = tone === "ink"
  const cols = columns === 2 ? "sm:grid-cols-2" : "lg:grid-cols-3"
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>
      <div className={cn("mt-10 grid grid-cols-1 gap-4", cols)}>
        {items.map((s, i) => (
          <InView key={s.id} once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}>
            <div className={cn("group flex h-full flex-col rounded-xl border p-6", ink ? "border-background/15 bg-background/5" : "border-border bg-card")}>
              <span className={cn("font-mono text-[11px] font-bold tracking-[0.2em]", ink ? "text-background/45" : "text-muted-foreground")}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-xl font-bold">{s.title}</h3>
              {s.body && <p className={cn("mt-2 flex-1 text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{s.body}</p>}
              <div className={cn("mt-6 flex items-center justify-between border-t pt-4", ink ? "border-background/15" : "border-border")}>
                {s.price && <span className="font-display text-lg font-bold">{s.price}</span>}
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
    
  </div>
</section>
  )
}
