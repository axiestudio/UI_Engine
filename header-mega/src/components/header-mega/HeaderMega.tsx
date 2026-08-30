import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type MegaColumn = { heading: string; links: { label: string; description?: string; href: string }[] }

export type HeaderNavItem = {
  label: string
  href: string
  /** Presence of columns turns this item into a mega-menu trigger. */
  columns?: MegaColumn[]
}

export type HeaderMegaProps = {
  brand?: string
  logo?: React.ReactNode
  nav: HeaderNavItem[]
  cta?: { label: string; href?: string; onClick?: () => void }
  /** Featured tile inside the open mega panel. */
  featured?: { title: string; description: string; href: string; tag?: string }
  sticky?: boolean
  className?: string
}

// ── HeaderMega ───────────────────────────────────────────────────────────────
// Design decisions (hand-tuned):
// · The mega panel spans the FULL content width (edge-to-edge of the bar) and
//   drops with a spring — columns on the left, featured tile on the right
//   separated by a dashed rule. Panels close on mouse-leave with a short
//   grace delay so diagonal mouse paths don't flicker.
// · Trigger links with children carry a chevron that rotates 180° when open.
// · Everything is square-cornered — the enterprise voice.
export function HeaderMega({
  brand = "Brand",
  logo,
  nav,
  cta,
  featured,
  sticky = true,
  className,
}: HeaderMegaProps) {
  const [open, setOpen] = React.useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const closeTimer = React.useRef<ReturnType<typeof setTimeout>>(null)
  const active = nav.find((n) => n.label === open)

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(null), 120)
  }
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  return (
    <header className={cn(sticky && "sticky top-0 z-50", "relative", className)}
      onMouseLeave={scheduleClose}
      onMouseEnter={cancelClose}
    >
      <div className={cn("border-b bg-background/95 backdrop-blur", open && "border-foreground/20")}>
        <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center justify-between gap-6 px-4 sm:px-6">
          <a href="#" className="flex shrink-0 items-center gap-2">
            {logo ?? (
              <span className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center bg-foreground font-display text-[11px] font-black text-background">{brand.slice(0, 1)}</span>
                <span className="font-display text-sm font-extrabold tracking-tight">{brand}</span>
              </span>
            )}
          </a>

          <nav aria-label="Primary" className="hidden h-full items-stretch gap-1 lg:flex">
            {nav.map((item) => {
              const isOpen = open === item.label
              return (
                <div key={item.label} className="flex items-stretch">
                  <a
                    href={item.href}
                    onMouseEnter={() => setOpen(item.columns ? item.label : null)}
                    onClick={(e) => {
                      if (item.columns) {
                        e.preventDefault()
                        setOpen(isOpen ? null : item.label)
                      }
                    }}
                    aria-expanded={item.columns ? isOpen : undefined}
                    className={cn(
                      "relative flex items-center gap-1.5 px-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] transition-colors",
                      isOpen ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                    {item.columns && (
                      <ChevronDown className={cn("size-3 transition-transform duration-300", isOpen && "rotate-180")} />
                    )}
                    {isOpen && <span aria-hidden className="absolute inset-x-2 bottom-0 h-[2px] bg-foreground" />}
                  </a>
                </div>
              )
            })}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {cta &&
              (cta.href ? (
                <Button asChild size="sm" className="rounded-none font-mono text-[11px] font-bold uppercase tracking-[0.14em]">
                  <a href={cta.href} onClick={cta.onClick}>
                    {cta.label}
                    <ArrowRight className="size-3.5" />
                  </a>
                </Button>
              ) : (
                <Button size="sm" onClick={cta.onClick} className="rounded-none font-mono text-[11px] font-bold uppercase tracking-[0.14em]">
                  {cta.label}
                </Button>
              ))}
          </div>

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
            className="inline-flex size-9 items-center justify-center border border-border lg:hidden"
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* the mega panel */}
      <AnimatePresence>
        {active?.columns && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={cn("absolute inset-x-0 top-full hidden border-b bg-background shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)] lg:block")}
            onMouseEnter={cancelClose}
          >
            <div className="mx-auto grid w-full max-w-[1200px] grid-cols-[1fr_280px] gap-10 px-4 py-8 sm:px-6">
              <div className={cn("grid gap-8", active.columns.length >= 3 ? "grid-cols-3" : active.columns.length === 2 ? "grid-cols-2" : "grid-cols-1")}>
                {active.columns.map((col) => (
                  <div key={col.heading}>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{col.heading}</p>
                    <ul className="mt-3 flex flex-col">
                      {col.links.map((l) => (
                        <li key={l.label}>
                          <a href={l.href} className="group flex items-baseline justify-between gap-3 border-b border-transparent py-2 transition-colors hover:border-border">
                            <span className="text-sm font-bold text-foreground">{l.label}</span>
                            {l.description && <span className="text-right text-[11px] font-medium leading-tight text-muted-foreground">{l.description}</span>}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {featured && (
                <a
                  href={featured.href}
                  className={cn(
                    "group relative flex flex-col justify-between border p-5 transition-colors",
                    "border-border bg-secondary/50 hover:border-foreground/30",
                  )}
                >
                  {featured.tag && (
                    <span className="inline-block w-fit border border-foreground/25 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      {featured.tag}
                    </span>
                  )}
                  <div className="mt-4">
                    <p className="font-display text-base font-extrabold leading-snug tracking-[-0.01em] text-foreground">{featured.title}</p>
                    <p className="mt-1.5 text-xs font-medium leading-relaxed text-muted-foreground">{featured.description}</p>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-foreground">
                    Read
                    <ArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* mobile disclosure */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-b bg-background lg:hidden"
          >
            <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
              {nav.map((item) => (
                <div key={item.label} className="border-b border-border/70 py-1">
                  <a href={item.href} className="block py-2.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-foreground">
                    {item.label}
                  </a>
                  {item.columns?.map((col) => (
                    <div key={col.heading} className="pb-2 pl-3">
                      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{col.heading}</p>
                      {col.links.map((l) => (
                        <a key={l.label} href={l.href} className="block py-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
                          {l.label}
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
              {cta && (
                <Button size="sm" className="my-3 w-full rounded-none font-mono text-[11px] font-bold uppercase tracking-[0.14em]" onClick={cta.onClick} asChild={Boolean(cta.href)}>
                  {cta.href ? <a href={cta.href}>{cta.label}</a> : <span>{cta.label}</span>}
                </Button>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
