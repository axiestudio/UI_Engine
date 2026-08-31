import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Financing — a monthly-installment estimator.
// ═══ EMOTION     Make the price approachable.
// ═══ SIGNATURE   A price + term slider that recomputes the monthly payment.

export type CommerceFinancingProps = {
  eyebrow?: string
  title?: React.ReactNode
  price?: number
  minTerm?: number
  maxTerm?: number
  apr?: number
  className?: string
}

export function CommerceFinancing({ eyebrow = "PAY", title = "Own it monthly.", price = 1200, minTerm = 3, maxTerm = 36, apr = 0.15, className }: CommerceFinancingProps) {
  const [term, setTerm] = React.useState(12)
  const monthly = React.useMemo(() => {
    const r = apr / 12
    const p = price
    if (r === 0) return p / term
    return (p * r * Math.pow(1 + r, term)) / (Math.pow(1 + r, term) - 1)
  }, [price, term, apr])
  return (
    <SectionShell width={760} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl font-black tracking-[-0.02em]">{title}</h2>
      </InView>
      <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}>
        <div className="mt-8 space-y-8 rounded-2xl border p-6 sm:p-8">
          <div className="grid sm:grid-cols-2 sm:gap-8">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total</p>
              <p className="font-display text-4xl font-black tabular-nums">€{price.toLocaleString()}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Monthly</p>
              <p className="font-display text-4xl font-black tabular-nums text-emerald-600">€{monthly.toFixed(2)}</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              <span>Term: {term} months</span>
              <span>{term} mo × €{monthly.toFixed(0)}</span>
            </div>
            <input type="range" min={minTerm} max={maxTerm} value={term} onChange={(e) => setTerm(Number(e.target.value))} className="mt-4 w-full accent-foreground" aria-label="Term" />
          </div>
          <Button size="lg" className="h-11 w-full rounded-full font-mono text-[11px] font-bold uppercase tracking-widest">Select a plan</Button>
        </div>
      </InView>
    </SectionShell>
  )
}
