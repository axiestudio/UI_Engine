import * as React from "react"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/watermelon/drawer"

// ═══ JOB         Cart drawer — a slide-over cart with line items + totals.
// ═══ EMOTION     Commerce, unhidden.
// ═══ SIGNATURE   A right-side drawer that drags out like a native sheet —
//                 mechanics belong to Vaul (Radix Dialog semantics), the
//                 rails and totals are ours.

export type CartLine = { id: string; name: string; price: number; qty: number }

export type CommerceCartDrawerProps = {
  eyebrow?: string
  title?: React.ReactNode
  lines: CartLine[]
  checkoutLabel?: string
  className?: string
}

const DEFAULT_LINES: CartLine[] = [
  { id: "line-1", name: "Linen apron", price: 640, qty: 1 },
  { id: "line-2", name: "Birch cutting board", price: 890, qty: 1 },
  { id: "line-3", name: "Stoneware mug", price: 240, qty: 2 },
]

export function CommerceCartDrawer({ eyebrow = "CART", title = "Your bag.", lines: initialLines = DEFAULT_LINES, checkoutLabel = "Checkout", className }: CommerceCartDrawerProps) {
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
        <p className="mt-3 max-w-md text-sm font-medium leading-relaxed text-muted-foreground">A drawer-style cart — click to slide it over the page, drag it back to dismiss.</p>
        <div className="mt-6">
          <Drawer open={open} onOpenChange={setOpen} direction="right">
            <DrawerTrigger asChild>
              <Button size="lg" className="h-11 rounded-full px-6 font-mono text-[11px] font-bold uppercase tracking-[0.12em]">
                <ShoppingBag className="mr-2 h-4 w-4" /> Open cart ({count})
              </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-card">
              <DrawerHeader className="border-b text-left">
                <DrawerTitle className="font-display text-lg font-semibold">{title}</DrawerTitle>
                <DrawerDescription className="sr-only">Review the items in your bag, adjust quantities, or remove lines.</DrawerDescription>
              </DrawerHeader>
              <div className="flex-1 space-y-3 overflow-y-auto p-5">
                {lines.length === 0 && <p className="text-sm font-medium text-muted-foreground">Your bag is empty.</p>}
                {lines.map((l) => (
                  <div key={l.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                    <div className="min-w-0">
                      <p className="truncate font-display text-sm font-bold">{l.name}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">€{l.price}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => setQty(l.id, l.qty - 1)} aria-label={`Decrease ${l.name} quantity`} className="flex h-7 w-7 items-center justify-center rounded-md border hover:bg-accent"><Minus className="h-3 w-3" aria-hidden /></button>
                      <span className="w-6 text-center font-mono text-sm tabular-nums" aria-live="polite">{l.qty}</span>
                      <button type="button" onClick={() => setQty(l.id, l.qty + 1)} aria-label={`Increase ${l.name} quantity`} className="flex h-7 w-7 items-center justify-center rounded-md border hover:bg-accent"><Plus className="h-3 w-3" aria-hidden /></button>
                      <button type="button" onClick={() => setQty(l.id, 0)} aria-label={`Remove ${l.name} from the bag`} className="ml-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" aria-hidden /></button>
                    </div>
                  </div>
                ))}
              </div>
              <DrawerFooter>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Total</span>
                  <span className="font-display text-2xl font-semibold tabular-nums">€{total.toLocaleString()}</span>
                </div>
                <Button className="h-11 w-full rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.12em]">{checkoutLabel}</Button>
                <DrawerClose asChild>
                  <Button variant="outline" className="h-10 w-full rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.12em]">Keep shopping</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </InView>
    </SectionShell>
  )
}
