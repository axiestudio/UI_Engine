import * as React from "react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Brand values — a principle list with big ordinals.
// ═══ EMOTION     A manifesto that reads fast.
// ═══ SIGNATURE   Numbered principles with a hairline rule between each.

export type ValueItem = { id: string; title: string; body?: string }

export type BrandValuesProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  values?: ValueItem[]
  tone?: "paper" | "ink"
  className?: string
}

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_BRAND_VALUES_VALUES = [ { id: "v1", title: "Intent over ornament", body: "Every flourish earns its place." }, { id: "v2", title: "Tokens before themes", body: "Change one surface, re-theme everything." }, { id: "v3", title: "Motion with purpose", body: "Never animate for its own sake." }, ]


export function BrandValues({ eyebrow = "VALUES", title = "What we hold the line on.", subtitle = "Three principles that shape every decision.", values = DEMO_BRAND_VALUES_VALUES, tone = "paper", className }: BrandValuesProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>
      <div className={cn("mt-10 divide-y", ink ? "divide-background/15" : "divide-border")}>
        {values.map((v, i) => (
          <InView key={v.id} once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}>
            <div className={cn("grid gap-4 py-6 sm:grid-cols-[auto_1fr] sm:gap-8", ink ? "border-background/15" : "border-border")}>
              <span className={cn("font-display text-5xl font-bold leading-none opacity-20", ink ? "text-background" : "text-foreground")}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-display text-xl font-bold">{v.title}</h3>
                {v.body && <p className={cn("mt-2 max-w-xl text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{v.body}</p>}
              </div>
            </div>
          </InView>
        ))}
      </div>
    
  </div>
</section>
  )
}
