import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { ArrowUpRight, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ── Types ────────────────────────────────────────────────────────────────────
export type HeaderLink = { label: string; href: string }

export type HeaderEditorialProps = {
  brand?: string
  logo?: React.ReactNode
  /** Split links: half left of the wordmark, half right. */
  links?: HeaderLink[]
  /** Top utility strip content, e.g. date or tagline. */
  meta?: string
  /** Right side of the utility strip, e.g. social links. */
  metaRight?: React.ReactNode
  sticky?: boolean
  className?: string
}

// ── HeaderEditorial ──────────────────────────────────────────────────────────
// Design decisions (refactored):
// · Still a newspaper masthead, not a navbar: utility strip up top, then the
//   three-column main row — links LEFT, WORDMARK CENTER in display caps,
//   links RIGHT — closed by the double rule (2px + gap + 1px), pure print DNA.
// · Links earn a print hover: the underline draws itself in from the left
//   (scale-x origin-left), the way headlines get ruled in print.
// · Mobile rows carry ordinals (01, 02 …) and an up-right arrow — a table of
//   contents, not a dropdown.

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_HEADER_EDITORIAL_LINKS = [{ label: "Stories", href: "#" }, { label: "Craft", href: "#" }, { label: "Studio", href: "#" }, { label: "Archive", href: "#" }, { label: "Contact", href: "#" }]


export function HeaderEditorial({
  brand = "The Journal",
  logo,
  links = DEMO_HEADER_EDITORIAL_LINKS,
  meta,
  metaRight,
  sticky = false,
  className,
}: HeaderEditorialProps) {
  const [open, setOpen] = React.useState(false)
  const half = Math.ceil(links.length / 2)
  const left = links.slice(0, half)
  const right = links.slice(half)

  const linkCls =
    "group relative font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"

  return (
    <header className={cn(sticky && "sticky top-0 z-50 bg-background/90 ", "relative isolate w-full overflow-hidden", className)}>
      {/* utility strip */}
      {(meta || metaRight) && (
        <div className="relative isolate overflow-hidden border-b border-border/60 bg-secondary/40">
          <div className="mx-auto flex h-9 w-full max-w-[1280px] items-center justify-between px-4 sm:px-6">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{meta}</span>
            <span className="hidden items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:flex">
              <span aria-hidden className="size-[4px] rotate-45 bg-current opacity-60" />
              {metaRight}
            </span>
          </div>
        </div>
      )}

      {/* masthead */}
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6">
        {/* desktop row */}
        <div className="hidden h-[72px] items-center justify-between md:flex">
          <nav aria-label="Primary left" className="flex flex-1 items-center gap-7">
            {left.map((l) => (
              <a key={l.label} href={l.href} className={linkCls}>
                {l.label}
                <span
                  aria-hidden
                  className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-foreground transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:transition-none"
                />
              </a>
            ))}
          </nav>
          <a href="#" aria-label={brand} className="shrink-0 rounded-sm px-8 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            {logo ?? (
              <span className="font-display text-[22px] font-black uppercase leading-none tracking-[0.1em] text-foreground">{brand}</span>
            )}
          </a>
          <nav aria-label="Primary right" className="flex flex-1 items-center justify-end gap-7">
            {right.map((l) => (
              <a key={l.label} href={l.href} className={linkCls}>
                {l.label}
                <span
                  aria-hidden
                  className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-foreground transition-transform duration-300 ease-out hover:scale-x-100 motion-reduce:transition-none"
                />
              </a>
            ))}
          </nav>
        </div>

        {/* mobile row */}
        <div className="flex h-16 items-center justify-between md:hidden">
          <a href="#" aria-label={brand} className="outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
            {logo ?? <span className="font-display text-lg font-black uppercase tracking-[0.08em]">{brand}</span>}
          </a>
          <Button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex size-9 items-center justify-center border border-border text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {/* the double rule — signature */}
      <div aria-hidden className="mx-auto w-full max-w-[1280px] px-4 sm:px-6">
        <div className="border-t-2 border-foreground" />
        <div className="mt-[3px] border-t border-foreground/40" />
      </div>

      {/* mobile sheet — table of contents */}
      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden md:hidden"
          >
            <div className="mx-auto flex max-w-[1280px] flex-col px-4 sm:px-6">
              {links.map((l, i) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group flex items-baseline justify-between gap-4 border-b border-border/60 py-4",
                    i === 0 && "border-t-0",
                  )}
                >
                  <span className="flex items-baseline gap-3">
                    <span aria-hidden className="font-mono text-[10px] font-bold tabular-nums text-muted-foreground/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-foreground">{l.label}</span>
                  </span>
                  <ArrowUpRight className="size-3.5 text-muted-foreground/50 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
                </a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
