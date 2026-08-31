import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══ JOB         Mega cascade — staggered mega menu with accessible triggers
// ═══ EMOTION     composed, not dumped

export type CascadeGroup = { title: string; links: string[] }
export type NavCascadeItem = { id: string; label: string; groups?: CascadeGroup[] }

export type NavMegaCascadeProps = {
  brand?: string
  items: NavCascadeItem[]
  className?: string
}

export function NavMegaCascade({ brand = "STUDIO", items, className }: NavMegaCascadeProps) {
  const [open, setOpen] = React.useState<string | null>(null)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const active = items.find((i) => i.id === open)

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <div className={cn("relative", className)}>
      <header className="relative z-40 border-b bg-background">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 sm:px-8">
          <a href="#" className="font-display text-lg font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {brand}
          </a>
          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {items.map((i) => {
              const isOpen = open === i.id
              return (
                <button
                  key={i.id}
                  type="button"
                  aria-expanded={isOpen}
                  aria-haspopup="menu"
                  aria-controls={i.groups ? `cascade-${i.id}` : undefined}
                  onMouseEnter={() => i.groups && setOpen(i.id)}
                  onFocus={() => i.groups && setOpen(i.id)}
                  onClick={() => setOpen(isOpen ? null : i.id)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-3 py-2 font-mono text-xs font-semibold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isOpen ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {i.label} {i.groups && <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")} aria-hidden />}
                </button>
              )
            })}
          </nav>
          <a href="#" className="hidden rounded-md bg-primary px-4 py-2 font-mono text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex">
            Start
          </a>
        </div>
        <AnimatePresence>
          {active?.groups && (
            <motion.div
              id={`cascade-${active.id}`}
              role="region"
              aria-label={active.label}
              className="absolute inset-x-0 top-full border-b bg-card shadow-lg"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: reduce ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
              onMouseLeave={() => setOpen(null)}
            >
              <div className="mx-auto grid max-w-[1280px] grid-cols-3 gap-8 px-5 py-8 sm:px-8">
                {active.groups.map((g, gi) => (
                  <motion.div
                    key={g.title}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reduce ? 0 : 0.32, delay: gi * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">{g.title}</h3>
                    <ul className="mt-3 space-y-1.5">
                      {g.links.map((l) => (
                        <li key={l}>
                          <a href="#" className="text-sm font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
                            {l}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Navigation that cascades in.</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Columns stagger with a subtle delay so the menu feels composed.</p>
      </div>
    </div>
  )
}
