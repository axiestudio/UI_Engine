import * as React from "react"
import { Check } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Pricing toggle — billed-monthly/annual with a live price swap.
// ═══ EMOTION     Fair, flexible.
// ═══ SIGNATURE   A monthly/annual toggle that recomputes each tier's price.

export type PricingTier = { id: string; name: string; monthly: number; annual: number; note?: string; perks?: string[]; highlight?: boolean }

export type CommercePricingToggleProps = {
  eyebrow?: string
  title?: React.ReactNode
  tiers: PricingTier[]
  className?: string
}

const DEFAULT_TIERS = [
  { id: "bench", name: "Bench", monthly: 29, annual: 290, note: "One maker, one room.", perks: ["Booking page", "Card payments", "Email reminders"] },
  { id: "studio", name: "Studio", monthly: 79, annual: 790, note: "For small teams that ship.", perks: ["Everything in Bench", "Four staff seats", "Inventory sync"], highlight: true },
  { id: "house", name: "House", monthly: 190, annual: 1900, note: "Multi-location, one ledger.", perks: ["Everything in Studio", "Unlimited seats", "Priority support"] },
]
export function CommercePricingToggle({ eyebrow = "PRICING", title = "Flexible billing — switch anytime", tiers = DEFAULT_TIERS, className }: CommercePricingToggleProps) {
  const [annual, setAnnual] = React.useState(true)
  return (
    <SectionShell width={1120} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">{title}</h2>
        <div className="mt-6 inline-flex rounded-full border p-1">
          {["monthly", "annual"].map((m) => {
            const isAnnual = m === "annual"
            return <Button key={m} type="button" variant={annual === isAnnual ? "default" : "ghost"} size="sm" onClick={() => setAnnual(isAnnual)} className={cn("h-auto rounded-full px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em]", annual !== isAnnual && "text-muted-foreground hover:text-foreground")}>{m}</Button>
          })}
        </div>
      </InView>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {tiers.map((t, i) => (
          <InView key={t.id} once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}>
            <div className={cn("flex h-full flex-col rounded-2xl border p-6", t.highlight ? "border-2 border-foreground bg-card" : "border-border bg-card")}>
              {t.highlight && <span className="mb-3 inline-block w-fit rounded-full bg-success/10 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-success">Popular</span>}
              <p className="font-display text-lg font-bold">{t.name}</p>
              <p className="mt-3 font-display text-4xl font-semibold">
                <span key={String(annual)} className="inline-block tabular-nums">€{annual ? t.annual : t.monthly}</span>
                <span className="text-sm font-medium text-muted-foreground"> / mo</span>
              </p>
              {annual && <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-success">billed annually</p>}
              <ul className="mt-5 flex-1 space-y-2">
                {t.perks?.map((p) => <li key={p} className="flex items-center gap-2 text-sm font-medium"><Check className="h-3.5 w-3.5 text-success" /> {p}</li>)}
              </ul>
              <Button variant={t.highlight ? "default" : "outline"} className="mt-6 h-10 rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.12em]">Choose</Button>
            </div>
          </InView>
        ))}
      </div>
    </SectionShell>
  )
}
