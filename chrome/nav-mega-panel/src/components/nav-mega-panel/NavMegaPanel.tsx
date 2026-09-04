import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type MegaPanelColumn = { title: string; links?: string[] }

export type NavMegaItem = { id: string; label: string; columns?: MegaPanelColumn[] }

export type NavMegaPanelProps = {
  brand?: string
  items: NavMegaItem[]
  cta?: string
  className?: string
}

const DEFAULT_ITEMS = [
  { id: "furniture", label: "Furniture", columns: [
    { title: "Pieces", links: ["Tables", "Seating", "Storage", "Beds"] },
    { title: "Collections", links: ["Atelier", "Northlight", "Archive"] },
  ]},
  { id: "services", label: "Services", columns: [
    { title: "Workshops", links: ["Commissions", "Restoration", "Site visits"] },
  ]},
  { id: "studio", label: "Studio" },
  { id: "journal", label: "Journal" },
]
export function NavMegaPanel({ brand = "STUDIO", items = DEFAULT_ITEMS, cta = "Start", className }: NavMegaPanelProps) {
  const [open, setOpen] = React.useState<string | null>(null)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const activeItem = items.find((i) => i.id === open)

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <div className={cn("relative isolate overflow-hidden min-h-[360px] w-full", className)}>
      <header className="relative border-b bg-background">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 sm:px-8">
          <a href="#" className="font-display text-lg font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {brand}
          </a>
          <nav aria-label="Primary" className="flex items-center gap-1">
            {items.map((i) => {
              const isOpen = open === i.id
              return (
                <Button
                  key={i.id}
                  type="button"
                  aria-expanded={isOpen}
                  aria-haspopup="menu"
                  aria-controls={i.columns ? `panel-${i.id}` : undefined}
                  onMouseEnter={() => i.columns && setOpen(i.id)}
                  onFocus={() => i.columns && setOpen(i.id)}
                  onClick={() => setOpen(isOpen ? null : i.id)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-3 py-2 font-mono text-xs font-semibold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isOpen ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {i.label} {i.columns && <ChevronDown className="h-3.5 w-3.5" aria-hidden />}
                </Button>
              )
            })}
          </nav>
          <a href="#" className="rounded-md bg-primary px-4 py-2 font-mono text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {cta}
          </a>
        </div>
        <AnimatePresence>
          {activeItem?.columns && (
            <motion.div
              id={`panel-${activeItem.id}`}
              role="region"
              aria-label={activeItem.label}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: reduce ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
              onMouseLeave={() => setOpen(null)}
              className="absolute inset-x-0 top-full border-b bg-card shadow-lg"
            >
              <div className="mx-auto grid max-w-[1280px] grid-cols-3 gap-8 px-5 py-8 sm:px-8">
                {activeItem.columns.map((c) => (
                  <div key={c.title}>
                    <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">{c.title}</h3>
                    <ul className="mt-3 space-y-1.5">
                      {c.links?.map((l) => (
                        <li key={l}>
                          <a href="#" className="rounded-sm text-sm font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            {l}
                          </a>
                        </li>
                      ))}
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
