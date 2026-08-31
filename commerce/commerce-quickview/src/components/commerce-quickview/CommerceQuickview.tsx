import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { X } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Quickview — a card that opens a product modal inline.
// ═══ EMOTION     Inspect without leaving the page.
// ═══ SIGNATURE   A grid card whose click opens an AnimatePresence modal with details.

export type QuickItem = { id: string; name: string; price: string; desc?: string; src?: string }

export type CommerceQuickviewProps = {
  eyebrow?: string
  items: QuickItem[]
  className?: string
}

export function CommerceQuickview({ eyebrow = "SHOP", items, className }: CommerceQuickviewProps) {
  const [open, setOpen] = React.useState<QuickItem | null>(null)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null) }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])
  return (
    <SectionShell width={1120} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
      </InView>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {items.map((it, i) => (
          <InView key={it.id} once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}>
            <button type="button" onClick={() => setOpen(it)} className="group block w-full overflow-hidden rounded-2xl border bg-card text-left">
              <div className="img-hover-wash aspect-[4/3] bg-muted">
                {it.src ? <img src={it.src} alt={it.name} className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
              </div>
              <div className="flex items-center justify-between p-4">
                <p className="font-display text-base font-bold">{it.name}</p>
                <span className="font-display font-semibold">{it.price}</span>
              </div>
            </button>
          </InView>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <motion.div className="relative grid w-full max-w-2xl gap-6 overflow-hidden rounded-2xl border bg-card p-6 sm:grid-cols-2"
              initial={{ scale: 0.94, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 8 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => setOpen(null)} aria-label="Close" className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-background hover:bg-accent"><X className="h-4 w-4" /></button>
              <div className="img-hover-wash aspect-square overflow-hidden rounded-xl bg-muted">
                {open.src ? <img src={open.src} alt={open.name} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
              </div>
              <div>
                <h3 className="font-display text-2xl font-semibold">{open.name}</h3>
                <p className="mt-1 font-display text-xl font-semibold">{open.price}</p>
                {open.desc && <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">{open.desc}</p>}
                <Button className="mt-6 h-11 w-full rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.12em]">Add to bag</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionShell>
  )
}
