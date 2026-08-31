import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══ JOB         Multilevel menu — a drill-down menu with nested submenus.
// ═══ EMOTION     Organized depth.
// ═══ SIGNATURE   A menu where hovering a parent reveals a nested submenu panel.

export type MenuNode = { id: string; label: string; children?: MenuNode[]; href?: string }

export type NavMultilevelMenuProps = {
  brand?: string
  menu: MenuNode[]
  className?: string
}

export function NavMultilevelMenu({ brand = "STUDIO", menu, className }: NavMultilevelMenuProps) {
  const [open, setOpen] = React.useState<string | null>(null)
  const [openSub, setOpenSub] = React.useState<string | null>(null)
  return (
    <div className={cn("relative z-40", className)}>
      <header className="flex items-center justify-between border-b bg-background/80 px-5 py-4 backdrop-blur sm:px-8">
        <span className="font-display text-lg font-black tracking-tight">{brand}</span>
        <nav className="flex items-center gap-1">
          {menu.map((n) => (
            <button key={n.id} type="button"
              onMouseEnter={() => setOpen(n.id)}
              onMouseLeave={() => { setOpen(null); setOpenSub(null) }}
              className="rounded-lg px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors hover:bg-accent">
              {n.label}
              <AnimatePresence>
                {open === n.id && n.children && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-1/2 top-full mt-1 w-64 -translate-x-1/2 rounded-2xl border bg-card p-2 shadow-xl"
                  >
                    {n.children.map((c) => (
                      <div key={c.id} onMouseEnter={() => setOpenSub(c.id)} className="relative">
                        <a href={c.href ?? "#"} className="flex items-center justify-between rounded-lg px-3 py-2 font-display text-sm font-bold hover:bg-accent">
                          {c.label} {c.children && <ChevronRight className="h-4 w-4 opacity-50" />}
                        </a>
                        <AnimatePresence>
                          {openSub === c.id && c.children && (
                            <motion.div
                              initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -4 }}
                              className="absolute left-full top-0 ml-1 w-56 rounded-2xl border bg-card p-2 shadow-xl"
                            >
                              {c.children.map((cc) => <a key={cc.id} href={cc.href ?? "#"} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent">{cc.label}</a>)}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          ))}
        </nav>
      </header>
    </div>
  )
}
