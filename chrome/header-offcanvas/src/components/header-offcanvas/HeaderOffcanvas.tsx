import * as React from "react"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Offcanvas header — side panel with focus management
// ═══ EMOTION     calm, app-like
// ═══ SIGNATURE   hamburger → sheet from right, tokenized overlay, Esc + inert

export type HeaderOffcanvasProps = {
  brand?: string
  items?: { id: string; label: string; href?: string }[]
  cta?: string
  className?: string
}

export function HeaderOffcanvas({
  brand = "STUDIO",
  items = [
    { id: "a", label: "Work" },
    { id: "b", label: "Services" },
    { id: "c", label: "Journal" },
    { id: "d", label: "Contact" },
  ],
  cta = "Start",
  className,
}: HeaderOffcanvasProps) {
  const [open, setOpen] = React.useState(false)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  React.useEffect(() => {
    if (open) panelRef.current?.focus()
  }, [open])

  return (
    <div className={cn("relative isolate overflow-hidden min-h-[320px] w-full", className)}>
      <header className="relative isolate overflow-hidden flex items-center justify-between border-b bg-background px-5 py-4 sm:px-8">
        <a href="#" className="font-display text-lg font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {brand}
        </a>
        <div className="flex items-center gap-2">
          <Button size="sm" className="rounded-md">
            {cta}
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-expanded={open}
            aria-controls="offcanvas-panel"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" aria-hidden /> : <Menu className="h-4 w-4" aria-hidden />}
          </Button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              aria-hidden
              initial={reduce ? { opacity: 0 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-foreground/10 "
            />
            <motion.div
              id="offcanvas-panel"
              ref={panelRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={reduce ? { x: 0, opacity: 0 } : { x: 320 }}
              animate={{ x: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { x: 320 }}
              transition={reduce ? { duration: 0 } : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col border-l bg-card p-6 shadow-lg focus-visible:outline-none"
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">Menu</p>
                <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <nav aria-label="Offcanvas" className="mt-6 flex flex-col gap-1">
                {items.map((i) => (
                  <a
                    key={i.id}
                    href={i.href ?? "#"}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 font-display text-base font-semibold transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {i.label}
                  </a>
                ))}
              </nav>
              <div className="mt-auto border-t pt-4">
                <Button onClick={() => setOpen(false)} className="w-full">
                  {cta}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
