import * as React from "react"
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react"
import { ArrowUpRight, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type HeaderLink = { label: string; href: string }

export type HeaderMinimalProps = {
  brand?: string
  logo?: React.ReactNode
  links: HeaderLink[]
  cta?: { label: string; href?: string; onClick?: () => void }
  className?: string
}

// ── HeaderMinimal ────────────────────────────────────────────────────────────
// Design decisions (hand-tuned):
// · Chrome disappears until you need it: transparent over the hero, then a
//   hairline + blurred background fades in after 12px of scroll. The page art
//   is never interrupted.
// · Links are MONO SMALL-CAPS at 11px — deliberately quiet; the wordmark is
//   the only display type in the bar.
// · CTA is a text link with an arrow that leaves the frame on hover — the
//   bar's one gesture.
export function HeaderMinimal({
  brand = "Brand",
  logo,
  links,
  cta,
  className,
}: HeaderMinimalProps) {
  const [open, setOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 12))

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50", className)}>
      <motion.div
        animate={{
          backgroundColor: scrolled ? "hsl(var(--background) / 0.85)" : "hsl(var(--background) / 0)",
          borderColor: scrolled ? "hsl(var(--border))" : "hsl(var(--border) / 0)",
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="border-b backdrop-blur-md"
      >
        <div className="mx-auto flex h-14 w-full max-w-[1100px] items-center justify-between px-4 sm:px-6">
          <a href="#" className="flex items-center gap-2">
            {logo ?? (
              <span className="flex items-center gap-2">
                <span aria-hidden className="size-2 rotate-45 bg-foreground" />
                <span className="font-display text-sm font-extrabold tracking-[-0.01em] text-foreground">{brand}</span>
              </span>
            )}
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {cta && (
              <a
                href={cta.href ?? "#"}
                onClick={cta.onClick}
                className="group inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-foreground"
              >
                {cta.label}
                <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            )}
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              className="inline-flex size-8 items-center justify-center text-foreground md:hidden"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              aria-label="Mobile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-border/60 md:hidden"
            >
              <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
                {links.map((l, i) => (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between py-3.5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-foreground",
                      i > 0 && "border-t border-border/50",
                    )}
                  >
                    {l.label}
                    <ArrowUpRight className="size-3.5 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.div>
    </header>
  )
}
