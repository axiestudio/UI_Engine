import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ═══ JOB         Footer sitemap — a multi-column site map footer.
// ═══ EMOTION     Orderly, complete.
// ═══ SIGNATURE   A gridded sitemap with brand + contact column.

export type FooterColumn = { id: string; title: string; links?: string[] }

export type FooterSitemapProps = {
  brand?: string
  tagline?: string
  columns: FooterColumn[]
  bottom?: string
  tone?: "paper" | "ink"
  className?: string
}

export function FooterSitemap({ brand = "STUDIO", tagline = "Sections for the work that matters.", columns = [
  { id: "c1", title: "Product", links: ["Sections", "Tokens", "Motion", "Frames"] },
  { id: "c2", title: "Company", links: ["About", "Journal", "Contact"] },
  { id: "c3", title: "Legal", links: ["Privacy", "Terms", "Licenses"] },
], bottom = "© 2026 Studio. Built as sections.", tone = "paper", className }: FooterSitemapProps) {
  const ink = tone === "ink"
  return (
    <footer className={cn("relative isolate", ink && "bg-foreground text-background", className)}>
      <div className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
            <div>
              <p className="font-display text-xl font-black tracking-tight">{brand}</p>
              <p className={cn("mt-3 max-w-xs text-sm font-medium leading-relaxed", ink ? "text-background/65" : "text-muted-foreground")}>{tagline}</p>
            </div>
            {columns.map((c) => (
              <nav key={c.id}>
                <p className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.25em]", ink ? "text-background/50" : "text-muted-foreground")}>{c.title}</p>
                <ul className="mt-4 space-y-2">
                  {c.links?.map((l) => (
                    <li key={l}><a href="#" className={cn("text-sm font-medium transition-colors hover:underline", ink ? "text-background/80" : "text-foreground")}>{l}</a></li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
          <div className={cn("mt-14 flex flex-wrap items-center justify-between gap-2 border-t pt-6", ink ? "border-background/15" : "border-border")}>
            <p className={cn("font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "text-background/50" : "text-muted-foreground")}>{bottom}</p>
            <p className={cn("font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "text-background/50" : "text-muted-foreground")}>Made with sections</p>
          </div>
        </InView>
      </div>
    </footer>
  )
}
