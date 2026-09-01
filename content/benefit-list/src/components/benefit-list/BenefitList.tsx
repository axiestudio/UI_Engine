import * as React from "react"
import { Check } from "lucide-react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Benefit list — a simple two-column list of benefits.
// ═══ EMOTION     Plain-spoken value.
// ═══ SIGNATURE   A clean check-marked list split into two columns.

export type BenefitListProps = {
  eyebrow?: string
  title?: React.ReactNode
  items?: string[]
  footnote?: string
  tone?: "paper" | "ink"
  className?: string
}

export function BenefitList({ eyebrow = "BENEFITS", title = "What you get.", items = [
  "Token-first — re-theme from one surface",
  "Accessible and reduced-motion aware",
  "One signature interaction per section",
  "No fetch at runtime; fully vendored",
  "Ships in TypeScript with type declarations",
  "Playground to preview every block",
], footnote = "Every benefit, by construction, not by promise.", tone = "paper", className }: BenefitListProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
          {footnote && <p className={cn("mt-4 font-mono text-[11px] font-bold uppercase tracking-widest", ink ? "text-background/50" : "text-muted-foreground")}>{footnote}</p>}
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
          <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {items.map((it) => (
              <li key={it} className={cn("flex items-start gap-3 text-sm font-medium leading-relaxed", ink ? "text-background/80" : "text-foreground")}>
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {it}
              </li>
            ))}
          </ul>
        </InView>
      </div>
    
  </div>
</section>
  )
}
