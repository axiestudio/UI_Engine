import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// ═══ JOB         Quickview — a card that opens a product modal inline.
// ═══ EMOTION     Inspect without leaving the page.
// ═══ SIGNATURE   A grid card whose click opens a spring-physics modal with
//                 details — portal, focus trap and dismissal belong to the
//                 vendored shadcn/Watermelon Dialog (Radix Dialog), the
//                 layout and copy are ours.

export type QuickItem = { id: string; name: string; price: string; desc?: string; src?: string }

export type CommerceQuickviewProps = {
  eyebrow?: string
  items: QuickItem[]
  className?: string
}

const DEFAULT_ITEMS: QuickItem[] = [
  { id: "qv-1", name: "Oak desk lamp", price: "1 240 kr", desc: "Turned oak, brass fitting, warm 2700K. Wired by hand in the workshop." },
  { id: "qv-2", name: "Wool throw", price: "890 kr", desc: "Undyed Swedish wool, woven in Jönköping. 130 × 180 cm." },
  { id: "qv-3", name: "Stoneware vase", price: "640 kr", desc: "Thrown on the wheel, glazed in oat. Each one slightly different." },
  { id: "qv-4", name: "Linen runner", price: "420 kr", desc: "Washed linen in natural. 45 × 140 cm, mitered corners." },
]

export function CommerceQuickview({ eyebrow = "SHOP", items = DEFAULT_ITEMS, className }: CommerceQuickviewProps) {
  return (
    <SectionShell width={1120} grain rule="bottom" className={cn("min-h-[400px]", className)}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
      </InView>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {items.map((it, i) => (
          <InView key={it.id} once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}>
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="ghost" size="lg" className="block h-auto w-full overflow-hidden rounded-2xl border bg-card p-0 text-left hover:bg-card">
                  <div className="img-hover-wash aspect-[4/3] bg-muted">
                    {it.src ? <img src={it.src} alt={it.name} className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <p className="font-display text-base font-bold">{it.name}</p>
                    <span className="font-display font-semibold">{it.price}</span>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader className="sr-only">
                  <DialogTitle>{it.name}</DialogTitle>
                  <DialogDescription>{it.desc ?? `Product details for ${it.name}.`}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 pt-6 sm:grid-cols-2">
                  <div className="img-hover-wash aspect-square overflow-hidden rounded-xl bg-muted">
                    {it.src ? <img src={it.src} alt={it.name} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-semibold">{it.name}</h3>
                    <p className="mt-1 font-display text-xl font-semibold">{it.price}</p>
                    {it.desc && <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">{it.desc}</p>}
                    <Button className="mt-6 h-11 w-full rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.12em]">Add to bag</Button>
                    <DialogClose asChild>
                      <Button variant="ghost" className="mt-2 h-9 w-full rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Back to grid</Button>
                    </DialogClose>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </InView>
        ))}
      </div>
    </SectionShell>
  )
}
