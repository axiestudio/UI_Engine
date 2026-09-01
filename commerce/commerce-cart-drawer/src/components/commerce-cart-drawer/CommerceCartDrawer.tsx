import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"

// ═══ JOB         Cart drawer — a slide-over cart with line items + totals.
// ═══ EMOTION     Commerce, unhidden.
// ═══ SIGNATURE   A right drawer with AnimatePresence slide, quantity steppers, totals.

export type CartLine = { id: string; name: string; price: number; qty: number }

export type CommerceCartDrawerProps = {
  eyebrow?: string
  title?: React.ReactNode
  lines: CartLine[]
  className?: string
}

const DEFAULT_LINES: CartLine[] = [
  { id: "line-1", name: "Linen apron", price: 640, qty: 1 },
  { id: "line-2", name: "Birch cutting board", price: 890, qty: 1 },
  { id: "line-3", name: "Stoneware mug", price: 240, qty: 2 },
]

export function CommerceCartDrawer({ eyebrow = "CART", title = "Your bag.", lines: initialLines = DEFAULT_LINES, className }: CommerceCartDrawerProps) {
  const [open, setOpen] = React.useState(false)
  const [lines, setLines] = React.useState(initialLines)
  const total = lines.reduce((t, l) => t + l.price * l.qty, 0)
  const count = lines.reduce((t, l) => t + l.qty, 0)
  const setQty = (id: string, q: number) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, qty: Math.max(0, q) } : l)).filter((l) => l.qty > 0))
  return (
    <SectionShell width={920} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.02em]">{title}</h2>
        <p className="mt-3 max-w-md text-sm font-medium leading-relaxed text-muted-foreground">A drawer-style cart — click to slide it over the page.</p>
        <div className="mt-6">
          <Button size="lg" onClick={() => setOpen(true)} className="h-11 rounded-full px-6 font-mono text-[11px] font-bold uppercase tracking-[0.12em]">
            <ShoppingBag className="mr-2 h-4 w-4" /> Open cart ({count})
          </Button>
        </div>
      </InView>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-[70] bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside
              className="fixed inset-y-0 right-0 z-[71] flex w-full max-w-md flex-col border-l bg-card"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-between border-b p-5">
                <p className="font-display text-lg font-semibold">{title}</p>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close cart" className="flex h-9 w-9 items-center justify-center rounded-full border hover:bg-accent"><X className="h-4 w-4" /></button>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-5">
                {lines.length === 0 && <p className="text-sm font-medium text-muted-foreground">Your bag is empty.</p>}
                {lines.map((l) => (
                  <div key={l.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                    <div className="min-w-0">
                      <p className="truncate font-display text-sm font-bold">{l.name}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">€{l.price}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => setQty(l.id, l.qty - 1)} aria-label="Decrease" className="flex h-7 w-7 items-center justify-center rounded-md border hover:bg-accent"><Minus className="h-3 w-3" /></button>
                      <span className="w-6 text-center font-mono text-sm tabular-nums">{l.qty}</span>
                      <button type="button" onClick={() => setQty(l.id, l.qty + 1)} aria-label="Increase" className="flex h-7 w-7 items-center justify-center rounded-md border hover:bg-accent"><Plus className="h-3 w-3" /></button>
                      <button type="button" onClick={() => setQty(l.id, 0)} aria-label="Remove" className="ml-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Total</span>
                  <span className="font-display text-2xl font-semibold tabular-nums">€{total}</span>
                </div>
                <Button className="mt-4 h-11 w-full rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.12em]">Checkout</Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </SectionShell>
  )
}
