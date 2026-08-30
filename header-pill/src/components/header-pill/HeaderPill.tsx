import * as React from "react"
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react"
import { ArrowRight, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type HeaderLink = { label: string; href: string }

export type HeaderPillProps = {
  brand?: string
  logo?: React.ReactNode
  links: HeaderLink[]
  cta?: { label: string; href?: string; onClick?: () => void }
  /** Show a subtle dot on the active link. Default first link. */
  activeIndex?: number
  className?: string
}

// ── HeaderPill ───────────────────────────────────────────────────────────────
// Design decisions (hand-tuned):
// · The bar is a DETACHED pill floating 16px below the viewport top — it never
//   touches the edges, so page content reads "behind" it through the glass.
// · Signature move: on scroll the pill contracts — height 52→42px, width eases
//   from fit to slightly tighter, shadow deepens. The nav physically reacts.
// · Links are mono small-caps (13px, 0.12em) — the pill stays quiet so the
//   hero beneath carries the voice.
export function HeaderPill({
  brand = "Brand",
  logo,
  links,
  cta,
  activeIndex = -1,
  className,
}: HeaderPillProps) {
  const [open, setOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24))

  return (
    <header className={cn("fixed inset-x-0 top-4 z-50 flex justify-center px-4", className)}>
      <motion.div
        layout
        animate={{ paddingTop: scrolled ? 8 : 10, paddingBottom: scrolled ? 8 : 10 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "relative flex w-full max-w-fit items-center gap-2 rounded-full border pl-4 pr-2 backdrop-blur-xl",
          scrolled
            ? "border-foreground/15 bg-background/85 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
            : "border-foreground/10 bg-background/65",
        )}
      >
        {/* brand */}
        <a href="#" className="mr-1 flex items-center gap-2">
          {logo ?? (
            <span className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-[7px] bg-foreground font-display text-[11px] font-black text-background">
                {brand.slice(0, 1)}
              </span>
              <span className="hidden font-display text-sm font-extrabold tracking-tight sm:block">{brand}</span>
            </span>
          )}
        </a>

        {/* links — mono small-caps */}
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {links.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              className={cn(
                "group relative rounded-full px-3 py-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.12em] transition-colors",
                i === activeIndex ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
              {i === activeIndex && (
                <span aria-hidden className="absolute -bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-foreground" />
              )}
            </a>
          ))}
        </nav>

        {/* actions */}
        <div className="ml-1 flex items-center gap-1.5">
          {cta &&
            (cta.href ? (
              <Button asChild size="sm" className="group hidden rounded-full pl-4 pr-3 sm:inline-flex">
                <a href={cta.href} onClick={cta.onClick} className="font-mono text-[11px] font-bold uppercase tracking-[0.12em]">
                  {cta.label}
                  <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </a>
              </Button>
            ) : (
              <Button size="sm" onClick={cta.onClick} className="hidden rounded-full pl-4 pr-3 sm:inline-flex">
                {cta.label}
              </Button>
            ))}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex size-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary md:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>

        {/* mobile sheet — drops out of the pill, same glass */}
        <AnimatePresence>
          {open && (
            <motion.nav
              aria-label="Mobile"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 top-[calc(100%+8px)] rounded-2xl border border-foreground/10 bg-background/95 p-2 shadow-xl backdrop-blur-xl md:hidden"
            >
              {links.map((link, i) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3.5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.12em]",
                    i === activeIndex ? "text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {link.label}
                  <ArrowRight className="size-3.5 opacity-40" />
                </a>
              ))}
              {cta && (
                <Button size="sm" className="mt-2 w-full rounded-xl font-mono text-[11px] font-bold uppercase tracking-[0.12em]" onClick={cta.onClick} asChild={Boolean(cta.href)}>
                  {cta.href ? <a href={cta.href}>{cta.label}</a> : <span>{cta.label}</span>}
                </Button>
              )}
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.div>
    </header>
  )
}
