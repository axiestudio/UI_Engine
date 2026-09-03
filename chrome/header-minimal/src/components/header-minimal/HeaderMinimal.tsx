import * as React from "react"
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react"
import { ArrowUpRight, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ── Types ────────────────────────────────────────────────────────────────────
export type HeaderLink = { label: string; href: string }

export type HeaderMinimalProps = {
  brand?: string
  logo?: React.ReactNode
  links?: HeaderLink[]
  cta?: { label: string; href?: string; onClick?: () => void }
  className?: string
}

// ── HeaderMinimal ────────────────────────────────────────────────────────────
// Design decisions (refactored):
// · Chrome still disappears until you need it: transparent over the hero,
//   then a blurred glass sheet with a hairline and a soft shadow fades in
//   after 12px of scroll — now with a matched motion-reduce fallback.
// · Links stay deliberately quiet mono small-caps, but gain an underline
//   that draws in on hover — the bar's only ornament.
// · The CTA keeps its gesture: the arrow leaves the frame on hover, now from
//   inside a subtle pill so it reads as tappable, not decorative.

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_HEADER_MINIMAL_LINKS = [{ label: "Services", href: "#" }, { label: "Studio", href: "#" }, { label: "Journal", href: "#" }]


export function HeaderMinimal({
  brand = "Brand",
  logo,
  links = DEMO_HEADER_MINIMAL_LINKS,
  cta,
  className,
}: HeaderMinimalProps) {
  const [open, setOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 12))

  const linkCls =
    "group relative font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"

  return (
    <header className={cn("absolute top-0 z-50 left-[var(--fixed-inset-left,0px)] right-[var(--fixed-inset-right,0px)]", className)}>
      <motion.div
        animate={{
          backgroundColor: scrolled ? "hsl(var(--background) / 0.82)" : "hsl(var(--background) / 0)",
          borderColor: scrolled ? "hsl(var(--border))" : "hsl(var(--border) / 0)",
          boxShadow: scrolled ? "0 8px 30px -12px hsl(0 0% 0% / 0.12)" : "0 0 0 0 hsl(0 0% 0% / 0)",
        }}
        transition={{ duration: reduce ? 0 : 0.35, ease: "easeOut" }}
        className="relative isolate overflow-hidden border-b "
      >
        <div className="mx-auto flex h-14 w-full max-w-[1100px] items-center justify-between px-4 sm:px-6">
          <a href="#" className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2">
            {logo ?? (
              <span className="flex items-center gap-2.5">
                <span aria-hidden className="size-2 rotate-45 bg-foreground" />
                <span className="font-display text-sm font-extrabold tracking-[-0.01em] text-foreground">{brand}</span>
              </span>
            )}
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <a key={l.label} href={l.href} className={linkCls}>
                {l.label}
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-foreground transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:transition-none"
                />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            {cta && (
              <a
                href={cta.href ?? "#"}
                onClick={cta.onClick}
                className="group inline-flex items-center gap-2 rounded-full border border-foreground/10 py-1.5 pl-4 pr-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-foreground transition-colors hover:border-foreground/25 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2"
              >
                {cta.label}
                <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
              </a>
            )}
            <Button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              className="inline-flex size-8 items-center justify-center text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 md:hidden"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
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
              <div className="mx-auto max-w-[1100px] px-4 pb-4 sm:px-6">
                {links.map((l, i) => (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group flex items-center justify-between py-3.5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-foreground transition-colors hover:text-foreground",
                      i > 0 && "border-t border-border/50",
                    )}
                  >
                    {l.label}
                    <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
                  </a>
                ))}
                {cta && (
                  <a
                    href={cta.href ?? "#"}
                    onClick={cta.onClick}
                    className="mt-2 flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground"
                  >
                    {cta.label}
                    <ArrowUpRight className="size-3.5" aria-hidden />
                  </a>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.div>
    </header>
  )
}
