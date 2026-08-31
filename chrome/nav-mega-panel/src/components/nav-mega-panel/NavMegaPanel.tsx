import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { ChevronDown } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ═══ JOB         Mega panel — a header with an animated mega-menu dropdown.
// ═══ EMOTION     Navigation with room.
// ═══ SIGNATURE   Hover a trigger to open a full-width panel with columns.

export type MegaPanelColumn = { title: string; links?: string[] }

export type NavMegaItem = { id: string; label: string; columns?: MegaPanelColumn[] }

export type NavMegaPanelProps = {
  brand?: string
  items: NavMegaItem[]
  cta?: string
  className?: string
}

export function NavMegaPanel({ brand = "STUDIO", items, cta = "Start", className }: NavMegaPanelProps) {
  const [open, setOpen] = React.useState<string | null>(null)
  const activeItem = items.find((i) => i.id === open)
  return (
    <div className={cn("relative z-40", className)}>
      <header className="relative border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 sm:px-8">
          <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.6 }}>
            <span className="font-display text-lg font-black tracking-tight">{brand}</span>
          </InView>
          <nav className="flex items-center gap-6">
            {items.map((i) => (
              <button key={i.id} type="button"
                onMouseEnter={() => setOpen(i.id)}
                onClick={() => setOpen(i.id === open ? null : i.id)}
                className={cn("flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors", open === i.id ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
                {i.label} {i.columns && <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            ))}
          </nav>
          <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.6 }}>
            <span className="rounded-full bg-foreground px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-background">{cta}</span>
          </InView>
        </div>
        <AnimatePresence>
          {activeItem?.columns && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setOpen(activeItem.id)} onMouseLeave={() => setOpen(null)}
              className="absolute inset-x-0 top-full border-b bg-card/95 shadow-xl backdrop-blur"
            >
              <div className="mx-auto grid max-w-[1280px] grid-cols-3 gap-8 px-5 py-8 sm:px-8">
                {activeItem.columns.map((c) => (
                  <div key={c.title}>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{c.title}</p>
                    <ul className="mt-3 space-y-2">
                      {c.links?.map((l) => <li key={l}><a href="#" className="text-sm font-medium hover:underline">{l}</a></li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </div>
  )
}
