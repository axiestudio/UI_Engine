import * as React from "react"
import { Check } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
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
    <SectionShell tone={tone} width={1120} grain={!ink} rule="bottom" className={className}>
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
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
    </SectionShell>
  )
}
