import * as React from "react"
import { ShoppingBag } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Checkout recap — a sticky order summary beside the payment form.
// ═══ EMOTION     Confident, transparent checkout.
// ═══ SIGNATURE   A two-pane checkout with a sticky line-item recap + trust row.

export type RecapLine = { id: string; label: string; price: string; qty?: number }

export type CommerceCheckoutRecapProps = {
  eyebrow?: string
  title?: React.ReactNode
  lines: RecapLine[]
  shipping?: string
  tax?: string
  cta?: string
  className?: string
}

const DEFAULT_LINES = [
  { id: "l1", label: "Workshop weekend, two seats", price: "€240", qty: 1 },
  { id: "l2", label: "Tool kit — take home", price: "€38", qty: 2 },
  { id: "l3", label: "Bench time, Saturday afternoon", price: "€60", qty: 1 },
]
export function CommerceCheckoutRecap({ eyebrow = "CHECKOUT", title = "Almost there.", lines = DEFAULT_LINES, shipping = "Free", tax = "€12", cta = "Pay now", className }: CommerceCheckoutRecapProps) {
  return (
    <SectionShell width={1120} grain rule="bottom" className={className}>
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.02em]">{title}</h2>
            <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid gap-3 sm:grid-cols-2">
                <input placeholder="Card number" className="col-span-2 rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                <input placeholder="MM / YY" className="rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                <input placeholder="CVC" className="rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
              <Button type="submit" className="h-11 w-full rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.12em]">{cta}</Button>
            </form>
          </div>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
          <div className="sticky top-8 rounded-2xl border bg-card p-6">
            <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground"><ShoppingBag className="h-4 w-4" /> Order recap</p>
            <ul className="mt-4 space-y-2">
              {lines.map((l) => <li key={l.id} className="flex justify-between text-sm font-medium"><span>{l.label}{l.qty ? ` × ${l.qty}` : ""}</span><span>{l.price}</span></li>)}
            </ul>
            <dl className={cn("mt-5 space-y-1 border-t pt-4 text-sm", "border-border")}>
              <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{shipping}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Tax</dt><dd>{tax}</dd></div>
              <div className="flex justify-between border-t pt-3 text-base font-bold"><dt>Total</dt><dd className="tabular-nums">€{lines.reduce((t, l) => t + Number(l.price.replace("€", "")), Number(tax.replace("€", "")))}</dd></div>
            </dl>
          </div>
        </InView>
      </div>
    </SectionShell>
  )
}
