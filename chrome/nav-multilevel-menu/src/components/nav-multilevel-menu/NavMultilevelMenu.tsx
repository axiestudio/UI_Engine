import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ═══ JOB         Multilevel menu — accessible drill-down with keyboard support
// ═══ EMOTION     organized depth
// ═══ SIGNATURE   Button triggers reveal card panels; no nested interactive, Esc + focus

export type MenuNode = { id: string; label: string; children?: MenuNode[]; href?: string }

export type NavMultilevelMenuProps = {
  brand?: string
  menu: MenuNode[]
  className?: string
}

const DEFAULT_MENU = [
  { id: "work", label: "Work", children: [
    { id: "tables", label: "Tables", href: "#tables" },
    { id: "seating", label: "Seating", href: "#seating", children: [
      { id: "stools", label: "Stools", href: "#stools" },
      { id: "benches", label: "Benches", href: "#benches" },
    ]},
  ]},
  { id: "studio", label: "Studio", href: "#studio" },
  { id: "journal", label: "Journal", href: "#journal" },
]
export function NavMultilevelMenu({ brand = "STUDIO", menu = DEFAULT_MENU, className }: NavMultilevelMenuProps) {
  const [open, setOpen] = React.useState<string | null>(null)
  const [openSub, setOpenSub] = React.useState<string | null>(null)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const navRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null)
        setOpenSub(null)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <div className={cn("relative isolate overflow-hidden min-h-[360px] w-full", className)}>
      <header className="relative isolate overflow-hidden flex items-center justify-between border-b bg-background px-5 py-4 sm:px-8">
        <a href="#" className="font-display text-lg font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {brand}
        </a>
        <nav ref={navRef} aria-label="Primary" className="flex items-center gap-1">
          {menu.map((n) => {
            const isOpen = open === n.id
            return (
              <div key={n.id} className="relative">
                {n.children ? (
                  <Button
                    type="button"
                    aria-expanded={isOpen}
                    aria-haspopup="menu"
                    aria-controls={`panel-${n.id}`}
                    onMouseEnter={() => setOpen(n.id)}
                    onFocus={() => setOpen(n.id)}
                    onClick={() => setOpen(isOpen ? null : n.id)}
                    onMouseLeave={() => {
                      setOpen(null)
                      setOpenSub(null)
                    }}
                    className="rounded-md px-3 py-2 font-mono text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {n.label}
                  </Button>
                ) : (
                  <a
                    href={n.href ?? "#"}
                    className="rounded-md px-3 py-2 font-mono text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {n.label}
                  </a>
                )}
                <AnimatePresence>
                  {isOpen && n.children && (
                    <motion.div
                      id={`panel-${n.id}`}
                      role="menu"
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: reduce ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
                      onMouseLeave={() => {
                        setOpen(null)
                        setOpenSub(null)
                      }}
                      className="absolute left-1/2 top-full mt-2 w-64 -translate-x-1/2 rounded-xl border bg-card p-2 shadow-lg"
                    >
                      {n.children.map((c) => (
                        <div key={c.id} className="relative" onMouseEnter={() => c.children && setOpenSub(c.id)} onMouseLeave={() => setOpenSub(null)}>
                          <a
                            href={c.href ?? "#"}
                            role="menuitem"
                            className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {c.label} {c.children && <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />}
                          </a>
                          <AnimatePresence>
                            {openSub === c.id && c.children && (
                              <motion.div
                                role="menu"
                                initial={reduce ? { opacity: 0 } : { opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -6 }}
                                transition={{ duration: reduce ? 0 : 0.2 }}
                                className="absolute left-full top-0 ml-2 w-56 rounded-xl border bg-card p-2 shadow-lg"
                              >
                                {c.children.map((cc) => (
                                  <a
                                    key={cc.id}
                                    href={cc.href ?? "#"}
                                    role="menuitem"
                                    className="block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  >
                                    {cc.label}
                                  </a>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </nav>
      </header>
    </div>
  )
}
