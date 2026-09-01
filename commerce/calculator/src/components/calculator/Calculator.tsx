import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

// ═══ JOB         Calculator — a purpose-built small calculator widget.
// ═══ EMOTION     Cart / quote calculator.
// ═══ SIGNATURE   A working cost estimator (units × rate, monthly/annual toggle).

export type CalculatorProps = {
  eyebrow?: string
  title?: React.ReactNode
  unit?: string
  rate?: number
  min?: number
  max?: number
  tone?: "paper" | "ink"
  className?: string
}

export function Calculator({ eyebrow = "QUOTE", title = "What will it cost?", unit = "sections", rate = 45, min = 1, max = 20, tone = "paper", className }: CalculatorProps) {
  const ink = tone === "ink"
  const [qty, setQty] = React.useState(6)
  const [annual, setAnnual] = React.useState(true)
  const total = qty * (annual ? rate * 0.8 : rate)
  return (
    <SectionShell tone={tone} width={760} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <p className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.3em]", ink ? "text-background/50" : "text-muted-foreground")}>{eyebrow}</p>
        <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">{title}</h2>
      </InView>
      <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
        <div className={cn("mt-8 rounded-2xl border p-6", ink ? "border-background/15 bg-background/5" : "border-border bg-card")}>
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em]">{unit}: {qty}</span>
            <span className="font-display text-2xl font-semibold tabular-nums">{(qty * rate).toFixed(0)} → {Math.round(total)} / {annual ? "yr" : "mo"}</span>
          </div>
          <Slider id="calculator-qty" value={[qty]} min={min} max={max} step={1} aria-label={unit} onValueChange={([v]) => setQty(v ?? min)} className="mt-6" />
          <div className="mt-5 flex gap-2" role="group" aria-label="Billing cadence">
            <button type="button" onClick={() => setAnnual(true)} aria-pressed={annual} className={cn("flex-1 rounded-lg px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] transition-colors", annual ? "bg-foreground text-background" : ink ? "hover:bg-background/10" : "hover:bg-accent")}>Annual −20%</button>
            <button type="button" onClick={() => setAnnual(false)} aria-pressed={!annual} className={cn("flex-1 rounded-lg px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] transition-colors", !annual ? "bg-foreground text-background" : ink ? "hover:bg-background/10" : "hover:bg-accent")}>Monthly</button>
          </div>
        </div>
      </InView>
    </SectionShell>
  )
}
