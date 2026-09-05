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
    <div className={cn("relative isolate flex min-h-screen w-full flex-col overflow-hidden bg-background", className)}>
      <header className="relative z-20 flex items-center justify-between border-b bg-background px-5 py-4 sm:px-8">
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

      {/* page underlay pushes content below the header so the panel
          has somewhere to slide in from; min-h-screen keeps the
          1:1 mobile fill so no white gap shows at the bottom. */}
      <main className="flex-1 px-5 py-10 sm:px-8">
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          Press the menu button to open the side navigation. The panel slides
          in from the right and stays inside the device viewport.
        </p>
      </main>

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
              className="absolute inset-0 z-30 bg-foreground/15"
            />
            <motion.div
              id="offcanvas-panel"
              ref={panelRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={reduce ? { x: 0, opacity: 0 } : { x: "100%" }}
              animate={{ x: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { x: "100%" }}
              transition={reduce ? { duration: 0 } : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-0 right-0 z-40 flex w-72 max-w-[85%] flex-col border-l bg-card p-6 shadow-lg focus-visible:outline-none"
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
