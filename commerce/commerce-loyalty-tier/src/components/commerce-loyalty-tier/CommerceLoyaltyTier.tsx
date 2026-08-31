import * as React from "react"
import { Check } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Loyalty tiers — a member-level ladder with benefits per tier.
// ═══ EMOTION     Reward progress.
// ═══ SIGNATURE   A tiered ladder (member → patron → atelier) with unlock markers.

export type LoyaltyTierDef = { id: string; name: string; spend: string; perks?: string[]; current?: boolean }

export type CommerceLoyaltyTierProps = {
  eyebrow?: string
  title?: React.ReactNode
  tiers: LoyaltyTierDef[]
  className?: string
}

export function CommerceLoyaltyTier({ eyebrow = "MEMBERSHIP", title = "Loyalty tiers", tiers, className }: CommerceLoyaltyTierProps) {
  return (
    <SectionShell width={1120} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">{title}</h2>
      </InView>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {tiers.map((t, i) => (
          <InView key={t.id} once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}>
            <div className={cn("flex h-full flex-col rounded-2xl border p-6", t.current ? "border-2 border-foreground bg-card" : "border-border bg-card")}>
              <div className="flex items-center justify-between">
                <p className="font-display text-lg font-semibold">{t.name}</p>
                {t.current && <span className="rounded-full bg-success/10 px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-success">You</span>}
              </div>
              <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{t.spend}</p>
              <ul className="mt-4 flex-1 space-y-2">
                {t.perks?.map((p) => <li key={p} className="flex items-center gap-2 text-sm font-medium"><Check className="h-3.5 w-3.5 text-success" /> {p}</li>)}
              </ul>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className={cn("h-full rounded-full", t.current ? "w-2/3 bg-foreground" : i === 0 ? "w-1/3 bg-muted-foreground/40" : "w-full bg-muted-foreground/40")} />
              </div>
            </div>
          </InView>
        ))}
      </div>
    </SectionShell>
  )
}
