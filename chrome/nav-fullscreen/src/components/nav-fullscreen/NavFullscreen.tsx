import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { Menu, X } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ═══ JOB         Fullscreen menu — a full-viewport animated nav overlay.
// ═══ EMOTION     A destination, not a dropdown.
// ═══ SIGNATURE   A morphing hamburger that expands into a full-screen link wall.

export type NavFullscreenItem = { id: string; label: string; href?: string; meta?: string }

export type NavFullscreenProps = {
  brand?: string
  items?: NavFullscreenItem[]
  cta?: string
  className?: string
}

export function NavFullscreen({ brand = "STUDIO", items = [
  { id: "work", label: "Work", meta: "01" },
  { id: "services", label: "Services", meta: "02" },
  { id: "journal", label: "Journal", meta: "03" },
  { id: "contact", label: "Contact", meta: "04" },
], cta = "Start a project", className }: NavFullscreenProps) {
  const [open, setOpen] = React.useState(false)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <div className={cn("relative isolate min-h-[360px] w-full", className)}>
      <header className="relative isolate overflow-hidden sticky top-0 z-50 mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 sm:px-8">
        <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.6 }}>
          <span className="font-display text-lg font-black tracking-tight">{brand}</span>
        </InView>
        <Button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="flex h-10 w-10 items-center justify-center rounded-full border bg-card transition-colors hover:bg-accent">
          <Menu className="h-5 w-5" />
        </Button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            initial={reduce ? { opacity: 0 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[60] flex flex-col bg-foreground text-background"
          >
            <div className="flex items-center justify-between px-5 py-4 sm:px-8">
              <span className="font-display text-lg font-black tracking-tight">{brand}</span>
              <Button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="flex h-10 w-10 items-center justify-center rounded-full border border-background/20 transition-colors hover:bg-background/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav aria-label="Fullscreen" className="flex flex-1 flex-col justify-center gap-2 px-5 sm:px-8">
              {items.map((item, i) => (
                <motion.a
                  key={item.id}
                  href={item.href ?? "#"}
                  onClick={() => setOpen(false)}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : 0.06 + i * 0.04 }}
                  className="group flex items-baseline gap-4 border-b border-background/10 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background"
                >
                  <span className="font-mono text-xs font-semibold text-background/50">{item.meta}</span>
                  <span className="font-display text-4xl font-bold tracking-tight transition-transform group-hover:translate-x-1 sm:text-5xl">{item.label}</span>
                </motion.a>
              ))}
            </nav>
            <div className="px-5 pb-8 sm:px-8">
              <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-background/50">
                <span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />
                {cta}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
