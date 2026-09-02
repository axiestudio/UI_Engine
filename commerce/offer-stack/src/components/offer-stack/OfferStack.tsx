import * as React from "react"
import { Check } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Offer stack — a stacked highlight of current offers.
// ═══ EMOTION     Sell the bundle, not the line item.
// ═══ SIGNATURE   A tall emphasized offer beside the rest.

export type OfferStackItem = { id: string; name: string; price: string; period?: string; feature?: boolean; perks?: string[] }

export type OfferStackProps = {
  eyebrow?: string
  title?: React.ReactNode
  offers?: OfferStackItem[]
  cta?: string
  tone?: "paper" | "ink"
  className?: string
}

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_OFFER_STACK_OFFERS = [{id:"o1",name:"Basic",price:"€90"},{id:"o2",name:"Pro",price:"€180",feature:true,perks:["All sections","Motion"]}]


export function OfferStack({ eyebrow = "OFFERS", title = "Choose a package", offers = DEMO_OFFER_STACK_OFFERS, cta = "Choose", tone = "paper", className }: OfferStackProps) {
  const ink = tone === "ink"
  const featured = offers.find((o) => o.feature) ?? offers[0]
  const rest = offers.filter((o) => o !== featured)
  return (
    <SectionShell tone={tone} width={1120} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <p className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.3em]", ink ? "text-background/50" : "text-muted-foreground")}>{eyebrow}</p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{title}</h2>
      </InView>
      <div className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-stretch">
        {featured && (
          <div className={cn("flex flex-col rounded-2xl border-2 p-8", ink ? "border-background/30 bg-background/5" : "border-foreground bg-card")}>
            <div className="flex items-center justify-between">
              <span className="font-display text-xl font-bold">{featured.name}</span>
              <span className="rounded-full bg-success/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-success">Most popular</span>
            </div>
            <p className="mt-4 font-display text-5xl font-semibold">{featured.price}<span className="text-lg text-muted-foreground">{featured.period}</span></p>
            <ul className="mt-6 flex-1 space-y-2">
              {featured.perks?.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm font-medium"><Check className="h-4 w-4 text-success" /> {p}</li>
              ))}
            </ul>
            <Button size="lg" className="mt-6 h-11 rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.12em]">{cta}</Button>
          </div>
        )}
        <div className="flex flex-col gap-4">
          {rest.map((o) => (
            <div key={o.id} className={cn("flex flex-1 items-center justify-between gap-4 rounded-2xl border p-6", ink ? "border-background/15 bg-background/5" : "border-border bg-card")}>
              <div>
                <p className="font-display text-lg font-bold">{o.name}</p>
                <ul className="mt-1 flex flex-wrap gap-x-4">
                  {o.perks?.slice(0, 2).map((p) => <li key={p} className="text-xs font-medium text-muted-foreground">{p}</li>)}
                </ul>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl font-semibold">{o.price}</p>
                <Button variant="outline" size="sm" className="mt-2 rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.12em]">{cta}</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  )
}
