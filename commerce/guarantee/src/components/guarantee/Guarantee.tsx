import * as React from "react"
import { ShieldCheck } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Guarantee — a bold money-back promise.
// ═══ EMOTION     Remove the risk.
// ═══ SIGNATURE   A center-piece guarantee with a large shield and terms row.

export type GuaranteeProps = {
  eyebrow?: string
  title?: React.ReactNode
  body?: React.ReactNode
  terms?: string[]
  tone?: "paper" | "ink"
  className?: string
}

export function Guarantee({ eyebrow = "Guaranteed", title = "30-day guarantee", body = "If a section doesn't fit your build, we'll refund you — no forms, no fuss.", terms = ["30 days", "No questions", "Full refund"], tone = "paper", className }: GuaranteeProps) {
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={920} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <div className="rounded-2xl border p-10 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
            <ShieldCheck className="h-8 w-8 text-success" />
          </span>
          <p className={cn("mt-5 font-mono text-[11px] font-bold uppercase tracking-[0.3em]", ink ? "text-background/50" : "text-muted-foreground")}>{eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">{title}</h2>
          <p className={cn("mx-auto mt-4 max-w-md text-base font-medium leading-relaxed", ink ? "text-background/75" : "text-muted-foreground")}>{body}</p>
          <ul className="mt-8 flex flex-wrap justify-center gap-3">
            {terms.map((t) => (
              <li key={t} className="rounded-full border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em]">{t}</li>
            ))}
          </ul>
        </div>
      </InView>
    </SectionShell>
  )
}
