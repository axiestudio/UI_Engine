import * as React from "react"
import { Check, Minus, Plus } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Bundle builder — pick a set of parts, see the live total.
// ═══ EMOTION     Compose your own.
// ═══ SIGNATURE   A multi-select item tray that recalculates a running total.

export type BundlePart = { id: string; label: string; price: number; desc?: string }

export type CommerceBundleBuilderProps = {
  eyebrow?: string
  title?: React.ReactNode
  parts: BundlePart[]
  className?: string
}

const DEFAULT_PARTS = [
  { id: "desk", label: "Oak worktop", price: 2400, desc: "Solid stave-glued oak, oiled by hand." },
  { id: "frame", label: "Steel frame", price: 1100, desc: "Powder-coated, levelling feet included." },
  { id: "drawers", label: "Drawer pair", price: 780, desc: "Full extension, felt-lined bottoms." },
  { id: "light", label: "Task lamp", price: 320, desc: "Warm 2700K, clamp-mounted." },
]
export function CommerceBundleBuilder({ eyebrow = "BUILD", title = "Build your bundle", parts = DEFAULT_PARTS, className }: CommerceBundleBuilderProps) {
  const [counts, setCounts] = React.useState<Record<string, number>>({})
  const total = React.useMemo(() => parts.reduce((t, p) => t + (counts[p.id] ?? 0) * p.price, 0), [parts, counts])
  const ordered = parts.filter((p) => (counts[p.id] ?? 0) > 0)
  const add = (id: string) => setCounts((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }))
  const sub = (id: string) => setCounts((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) - 1) }))
  return (
    <SectionShell width={1120} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">{title}</h2>
      </InView>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-3 sm:grid-cols-2">
          {parts.map((p) => (
            <div key={p.id} className={cn("rounded-2xl border p-5 transition-colors", (counts[p.id] ?? 0) > 0 ? "border-foreground bg-card" : "border-border bg-card")}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold">{p.label}</h3>
                  {p.desc && <p className="mt-1 text-sm font-medium text-muted-foreground">{p.desc}</p>}
                </div>
                <span className="font-display text-xl font-semibold">€{p.price}</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => sub(p.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-accent" aria-label="Decrease"><Minus className="h-4 w-4" /></button>
                  <span className="w-8 text-center font-mono text-sm font-bold tabular-nums">{counts[p.id] ?? 0}</span>
                  <button type="button" onClick={() => add(p.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-accent" aria-label="Increase"><Plus className="h-4 w-4" /></button>
                </div>
                {(counts[p.id] ?? 0) > 0 && <Check className="h-4 w-4 text-success" />}
              </div>
            </div>
          ))}
        </div>
        <div className="h-fit rounded-2xl border bg-card p-6">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Your bundle</p>
          <ul className="mt-4 space-y-2">
            {ordered.length === 0 && <li className="text-sm font-medium text-muted-foreground">Nothing selected yet.</li>}
            {ordered.map((p) => <li key={p.id} className="flex justify-between text-sm font-medium"><span>{p.label} × {counts[p.id]}</span><span>€{counts[p.id] * p.price}</span></li>)}
          </ul>
          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Total</span>
            <span className="font-display text-3xl font-semibold tabular-nums">€{total}</span>
          </div>
          <Button size="lg" className="mt-6 h-11 w-full rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.12em]">Checkout</Button>
        </div>
      </div>
    </SectionShell>
  )
}
