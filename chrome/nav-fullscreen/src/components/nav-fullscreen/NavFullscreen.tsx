import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { Menu, X } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { MonoLabel } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

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
  return (
    <div className={cn("relative z-50", className)}>
      <header className="sticky top-0 z-50 mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 sm:px-8">
        <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.6 }}>
          <span className="font-display text-lg font-black tracking-tight">{brand}</span>
        </InView>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="flex h-10 w-10 items-center justify-center rounded-full border bg-card transition-colors hover:bg-accent">
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[60] flex flex-col bg-foreground text-background"
          >
            <div className="flex items-center justify-between px-5 py-4 sm:px-8">
              <span className="font-display text-lg font-black tracking-tight">{brand}</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="flex h-10 w-10 items-center justify-center rounded-full border border-background/20 transition-colors hover:bg-background/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col justify-center gap-2 px-5 sm:px-8">
              {items.map((item, i) => (
                <motion.a
                  key={item.id}
                  href={item.href ?? "#"}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.08 + i * 0.06 }}
                  className="group flex items-baseline gap-4 border-b border-background/10 py-4"
                >
                  <span className="font-mono text-[11px] font-bold text-background/50">{item.meta}</span>
                  <span className="font-display text-4xl font-black tracking-[-0.02em] transition-transform group-hover:translate-x-2 sm:text-6xl">{item.label}</span>
                </motion.a>
              ))}
            </nav>
            <div className="px-5 pb-8 sm:px-8">
              <MonoLabel className="text-background/50">{cta}</MonoLabel>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
