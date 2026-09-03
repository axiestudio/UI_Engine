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
  nav?: HeaderNavItem[]
  cta?: { label: string; href?: string; onClick?: () => void }
  /** Featured tile inside the open mega panel. */
  featured?: { title: string; description: string; href: string; tag?: string }
  sticky?: boolean
  className?: string
}

// ── HeaderMega ───────────────────────────────────────────────────────────────
// Design decisions (refactored):
// · The mega panel still spans the full bar width and drops with a soft
//   spring, closing on mouse-leave with a grace delay so diagonal paths don't
//   flicker. NEW: Escape closes, click toggles, aria-expanded + keyboard
//   focus states — the enterprise menu finally behaves like a component.
// · Panel content upgraded: headings stay mono, but links become proper
//   rows — label + description + a hover arrow that slides in; the featured
//   tile gets a gradient wash, tag chip and reading CTA, split from the
//   columns by a dashed rule.
// · Trigger links carry an animated underline that grows on hover and
//   hardens when open. Square corners stay — the enterprise voice.

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_HEADER_MEGA_NAV = [ { label: "Product", href: "#", columns: [ { heading: "Platform", links: [{ label: "Booking", description: "Real-time slots", href: "#" }, { label: "Payments", description: "Stripe built-in", href: "#" }, { label: "Reminders", description: "SMS + email", href: "#" }] }, { heading: "Tools", links: [{ label: "Analytics", description: "Weekly digests", href: "#" }, { label: "Intake forms", description: "Fully branded", href: "#" }] }, ] }, { label: "Pricing", href: "#" }, { label: "Docs", href: "#" }, ]


export function HeaderMega({
  brand = "Brand",
  logo,
  nav = DEMO_HEADER_MEGA_NAV,
  cta,
  featured,
  sticky = true,
  className,
}: HeaderMegaProps) {
  const [open, setOpen] = React.useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [mobileSection, setMobileSection] = React.useState<string | null>(null)
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const active = nav.find((n) => n.label === open)

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(null), 120)
  }
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <header
      className={cn(sticky && "sticky top-0 z-50", "relative", className)}
      onMouseLeave={scheduleClose}
      onMouseEnter={cancelClose}
    >
      <div className={cn("border-b bg-background/95 transition-colors duration-300", open ? "border-foreground/20" : "border-border")}>
        <div className="relative isolate overflow-hidden mx-auto flex h-14 w-full max-w-[1200px] items-center justify-between gap-6 px-4 sm:px-6">
          <a href="#" className="flex shrink-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            {logo ?? (
              <span className="flex items-center gap-2.5">
                <span className="flex size-7 items-center justify-center bg-primary font-display text-[12px] font-black text-primary-foreground">{brand.slice(0, 1)}</span>
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
                    onFocus={() => item.columns && setOpen(item.label)}
                    onClick={(e) => {
                      if (item.columns) {
                        e.preventDefault()
                        setOpen(isOpen ? null : item.label)
                      }
                    }}
                    aria-expanded={item.columns ? isOpen : undefined}
                    aria-haspopup={item.columns ? "true" : undefined}
                    className={cn(
                      "group relative flex items-center gap-1.5 px-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50",
                      isOpen ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                    {item.columns && (
                      <ChevronDown className={cn("size-3 transition-transform duration-300 motion-reduce:transition-none", isOpen && "rotate-180")} aria-hidden />
                    )}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-3 bottom-0 h-[2px] origin-left bg-foreground transition-transform duration-300 ease-out motion-reduce:transition-none",
                        isOpen ? "scale-x-100" : "scale-x-0 group-hover:scale-x-75",
                      )}
                    />
                  </a>
                </div>
              )
            })}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {cta &&
              (cta.href ? (
                <Button asChild size="sm" className="rounded-none font-mono text-[11px] font-bold uppercase tracking-[0.14em] shadow-sm transition-shadow hover:shadow-md">
                  <a href={cta.href} onClick={cta.onClick} className="group">
                    {cta.label}
                    <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none" />
                  </a>
                </Button>
              ) : (
                <Button size="sm" onClick={cta.onClick} className="rounded-none font-mono text-[11px] font-bold uppercase tracking-[0.14em] shadow-sm transition-shadow hover:shadow-md">
                  {cta.label}
                </Button>
              ))}
          </div>

          <Button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
            className="inline-flex size-9 items-center justify-center border border-border transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 lg:hidden"
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {/* the mega panel */}
      <AnimatePresence>
        {active?.columns && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-full hidden border-b border-border bg-background shadow-[0_32px_64px_-32px_hsl(0_0%_0%/0.3)] lg:block"
            onMouseEnter={cancelClose}
          >
            <div className="mx-auto grid w-full max-w-[1200px] grid-cols-[1fr_300px] gap-10 px-4 py-9 sm:px-6">
              <div className={cn("grid gap-10", active.columns.length >= 3 ? "grid-cols-3" : active.columns.length === 2 ? "grid-cols-2" : "grid-cols-1")}>
                {active.columns.map((col) => (
                  <div key={col.heading}>
                    <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      <span aria-hidden className="h-px w-4 bg-foreground/30" />
                      {col.heading}
                    </p>
                    <ul className="mt-4 flex flex-col">
                      {col.links.map((l) => (
                        <li key={l.label}>
                          <a
                            href={l.href}
                            className="group/row -mx-2 flex items-baseline justify-between gap-3 rounded-none border-b border-transparent px-2 py-2.5 transition-colors hover:border-border hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                          >
                            <span className="text-sm font-bold text-foreground">{l.label}</span>
                            {l.description && <span className="text-right text-[11px] font-medium leading-tight text-muted-foreground">{l.description}</span>}
                            <ArrowRight
                              className="size-3.5 -translate-x-1 self-center text-foreground opacity-0 transition-all duration-300 group-hover/row:translate-x-0 group-hover/row:opacity-100 motion-reduce:transition-none"
                              aria-hidden
                            />
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
                  className="group relative flex flex-col justify-between border border-border bg-gradient-to-br from-secondary/70 to-background p-5 outline-none transition-colors hover:border-foreground/25 focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {featured.tag && (
                    <span className="inline-flex w-fit items-center gap-1.5 bg-primary px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-primary-foreground">
                      <span aria-hidden className="size-1 rounded-full bg-current" />
                      {featured.tag}
                    </span>
                  )}
                  <div className="mt-4">
                    <p className="font-display text-base font-extrabold leading-snug tracking-[-0.01em] text-foreground">{featured.title}</p>
                    <p className="mt-2 text-xs font-medium leading-relaxed text-muted-foreground">{featured.description}</p>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-foreground">
                    Read
                    <ArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
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
              {nav.map((item) => {
                const sectionOpen = mobileSection === item.label
                return (
                  <div key={item.label} className="border-b border-border/70">
                    <div className="flex items-center justify-between">
                      <a href={item.href} onClick={() => setMobileOpen(false)} className="py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-foreground">
                        {item.label}
                      </a>
                      {item.columns && (
                        <Button
                          type="button"
                          aria-label={sectionOpen ? `Collapse ${item.label}` : `Expand ${item.label}`}
                          aria-expanded={sectionOpen}
                          onClick={() => setMobileSection(sectionOpen ? null : item.label)}
                          className="inline-flex size-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <ChevronDown className={cn("size-3.5 transition-transform duration-300", sectionOpen && "rotate-180")} aria-hidden />
                        </Button>
                      )}
                    </div>
                    <AnimatePresence initial={false}>
                      {item.columns && sectionOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="pb-3 pl-3">
                            {item.columns.map((col) => (
                              <div key={col.heading} className="mb-2">
                                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{col.heading}</p>
                                {col.links.map((l) => (
                                  <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)} className="block py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
                                    {l.label}
                                  </a>
                                ))}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
              {cta && (
                <Button size="sm" className="my-4 w-full rounded-none font-mono text-[11px] font-bold uppercase tracking-[0.14em]" onClick={cta.onClick} asChild={Boolean(cta.href)}>
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
