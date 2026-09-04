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
  links?: HeaderLink[]
  cta?: { label: string; href?: string; onClick?: () => void }
  /** Index of the active link, rendered as a filled segment. Default none. */
  activeIndex?: number
  className?: string
}

// ── HeaderPill ───────────────────────────────────────────────────────────────
// Design decisions (refactored):
// · Still a detached glass pill floating below the viewport top — page content
//   reads through it. The glass is finer now: lighter base, ring hairline,
//   and a shadow that deepens in steps as the pill contracts on scroll.
// · Signature kept: the pill physically reacts to scroll (height 52→42px,
//   shadow deepens). The active link is now a filled segment (bg-secondary
//   pill) instead of an underline dot — reads as a segmented control.
// · Mobile drops out of the pill as a matching glass card with divided rows
//   and a full-width CTA.

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_HEADER_PILL_LINKS = [{ label: "Services", href: "#" }, { label: "Pricing", href: "#" }, { label: "Journal", href: "#" }, { label: "About", href: "#" }]


export function HeaderPill({
  brand = "Brand",
  logo,
  links = DEMO_HEADER_PILL_LINKS,
  cta,
  activeIndex = -1,
  className,
}: HeaderPillProps) {
  const [open, setOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24))

  return (
    <div className={cn("relative isolate overflow-hidden min-h-[180px] w-full bg-background", className)}>
    <header className="absolute top-4 z-50 flex justify-center px-4 left-[var(--fixed-inset-left,0px)] right-[var(--fixed-inset-right,0px)]">
      <motion.div
        layout
        animate={{ paddingTop: scrolled ? 7 : 10, paddingBottom: scrolled ? 7 : 10 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "relative flex w-full max-w-fit items-center gap-1.5 rounded-full pl-3.5 pr-2 transition-[box-shadow,background-color,border-color] duration-500 motion-reduce:transition-none",
          scrolled
            ? "border border-foreground/15 bg-background/90 shadow-[0_16px_48px_-16px_hsl(var(--foreground)/0.25)]"
            : "border border-foreground/[0.08] bg-background/65 shadow-[0_4px_24px_-12px_hsl(var(--foreground)/0.12)]",
        )}
      >
        {/* brand */}
        <a href="#" className="relative isolate overflow-hidden mr-1.5 flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
          {logo ?? (
            <span className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-[7px] bg-primary font-display text-[11px] font-black text-primary-foreground shadow-sm">
                {brand.slice(0, 1)}
              </span>
              <span className="hidden font-display text-sm font-extrabold tracking-tight sm:block">{brand}</span>
            </span>
          )}
        </a>

        {/* links — mono small-caps segments */}
        <nav aria-label="Primary" className="hidden items-center gap-0.5 md:flex">
          {links.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              aria-current={i === activeIndex ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 motion-reduce:transition-none",
                i === activeIndex
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* actions */}
        <div className="ml-0.5 flex items-center gap-1.5">
          {cta &&
            (cta.href ? (
              <Button asChild size="sm" className="group hidden rounded-full pl-4 pr-3 font-semibold shadow-sm sm:inline-flex">
                <a href={cta.href} onClick={cta.onClick} className="font-mono text-[11px] font-bold uppercase tracking-[0.12em]">
                  {cta.label}
                  <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
                </a>
              </Button>
            ) : (
              <Button size="sm" onClick={cta.onClick} className="hidden rounded-full pl-4 pr-3 font-semibold shadow-sm sm:inline-flex">
                {cta.label}
              </Button>
            ))}
          <Button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex size-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 md:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
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
              className="absolute inset-x-0 top-[calc(100%+10px)] rounded-2xl border border-foreground/10 bg-background/95 p-2 shadow-[0_24px_64px_-24px_hsl(var(--foreground)/0.3)] md:hidden"
            >
              <div className="flex flex-col divide-y divide-border/60">
                {links.map((link, i) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={i === activeIndex ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3.5 py-3 font-mono text-xs font-bold uppercase tracking-[0.12em] transition-colors",
                      i === activeIndex ? "text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    {link.label}
                    <ArrowRight className="size-3.5 opacity-40" aria-hidden />
                  </a>
                ))}
              </div>
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
    </div>
  )
}
