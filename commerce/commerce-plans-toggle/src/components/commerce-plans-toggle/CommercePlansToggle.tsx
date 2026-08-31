import * as React from "react"
import { Check } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { AnimatedNumber } from "@/components/primitives/animated-number"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Plans toggle — a monthly/annual toggle with animated per-tier prices.
// ═══ EMOTION     Flexible, considered.
// ═══ SIGNATURE   A segmented toggle that animates each tier's price with AnimatedNumber.

export type Plan = { id: string; name: string; monthly: number; annual: number; note?: string; perks?: string[]; highlight?: boolean }

export type CommercePlansToggleProps = {
  eyebrow?: string
  title?: React.ReactNode
  plans: Plan[]
  className?: string
}

export function CommercePlansToggle({ eyebrow = "PLANS", title = "Choose your billing cycle", plans, className }: CommercePlansToggleProps) {
  const [annual, setAnnual] = React.useState(true)
  return (
    <SectionShell width={1120} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">{title}</h2>
        <div className="mt-6 inline-flex rounded-full border bg-card p-1">
          {["monthly", "annual"].map((m) => {
            const isA = m === "annual"
            return <button key={m} type="button" onClick={() => setAnnual(isA)} className={cn("rounded-full px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] transition-colors", annual === isA ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>{m}</button>
          })}
        </div>
      </InView>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {plans.map((p, i) => (
          <InView key={p.id} once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}>
            <div className={cn("flex h-full flex-col rounded-2xl border p-6", p.highlight ? "border-2 border-foreground" : "border-border", "bg-card")}>
              {p.highlight && <span className="mb-2 w-fit rounded-full bg-success/10 px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-success">Most picked</span>}
              <p className="font-display text-lg font-bold">{p.name}</p>
              <p className="mt-3 flex items-baseline gap-1 font-display text-4xl font-semibold tabular-nums">
                €<AnimatedNumber value={annual ? p.annual : p.monthly} />
                <span className="text-sm font-medium text-muted-foreground">/mo</span>
              </p>
              {p.note && <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{annual ? p.note : "billed monthly"}</p>}
              <ul className="mt-5 flex-1 space-y-2">
                {p.perks?.map((k) => <li key={k} className="flex items-center gap-2 text-sm font-medium"><Check className="h-3.5 w-3.5 text-success" /> {k}</li>)}
              </ul>
              <Button variant={p.highlight ? "default" : "outline"} className="mt-6 h-10 rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.12em]">Choose {p.name}</Button>
            </div>
          </InView>
        ))}
      </div>
    </SectionShell>
  )
}
