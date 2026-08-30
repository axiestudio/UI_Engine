import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type HeaderLink = { label: string; href: string }

export type HeaderEditorialProps = {
  brand?: string
  logo?: React.ReactNode
  /** Split links: half left of the wordmark, half right. */
  links: HeaderLink[]
  /** Top utility strip content, e.g. date or tagline. */
  meta?: string
  /** Right side of the utility strip, e.g. social links. */
  metaRight?: React.ReactNode
  sticky?: boolean
  className?: string
}

// ── HeaderEditorial ──────────────────────────────────────────────────────────
// Design decisions (hand-tuned):
// · A newspaper masthead, not a navbar: thin utility strip (mono, tracking
//   0.2em) above a three-column main row — links LEFT, WORDMARK CENTER in
//   display caps with letterspacing, links RIGHT.
// · Signature: the DOUBLE RULE under the masthead (1px + 3px gap + 1px) —
//   pure print DNA, impossible to mistake for a SaaS bar.
// · No CTA button in the bar — this header trusts typography.
export function HeaderEditorial({
  brand = "The Journal",
  logo,
  links,
  meta,
  metaRight,
  sticky = false,
  className,
}: HeaderEditorialProps) {
  const [open, setOpen] = React.useState(false)
  const half = Math.ceil(links.length / 2)
  const left = links.slice(0, half)
  const right = links.slice(half)

  const linkCls = "font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"

  return (
    <header className={cn(sticky && "sticky top-0 z-50 bg-background/95 backdrop-blur", "relative", className)}>
      {/* utility strip */}
      {(meta || metaRight) && (
        <div className="border-b border-border/70">
          <div className="mx-auto flex h-8 w-full max-w-[1200px] items-center justify-between px-4 sm:px-6">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{meta}</span>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{metaRight}</span>
          </div>
        </div>
      )}

      {/* masthead */}
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        {/* desktop row */}
        <div className="hidden h-16 items-center justify-between md:flex">
          <nav aria-label="Primary left" className="flex flex-1 items-center gap-6">
            {left.map((l) => (
              <a key={l.label} href={l.href} className={linkCls}>
                {l.label}
              </a>
            ))}
          </nav>
          <a href="#" aria-label={brand} className="shrink-0 px-6">
            {logo ?? (
              <span className="font-display text-xl font-black uppercase tracking-[0.08em] text-foreground">
                {brand}
              </span>
            )}
          </a>
          <nav aria-label="Primary right" className="flex flex-1 items-center justify-end gap-6">
            {right.map((l) => (
              <a key={l.label} href={l.href} className={linkCls}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        {/* mobile row */}
        <div className="flex h-16 items-center justify-between md:hidden">
          <a href="#" aria-label={brand}>
            {logo ?? <span className="font-display text-lg font-black uppercase tracking-[0.08em]">{brand}</span>}
          </a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex size-9 items-center justify-center rounded-none border border-border text-foreground transition-colors hover:bg-secondary"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* the double rule — signature */}
      <div aria-hidden className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <div className="border-t-2 border-foreground" />
        <div className="mt-[3px] border-t border-foreground/40" />
      </div>

      {/* mobile sheet */}
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
            <div className="mx-auto flex max-w-[1200px] flex-col px-4 sm:px-6">
              {links.map((l, i) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center justify-between border-b border-border/70 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.2em]",
                    i === 0 && "border-t",
                  )}
                >
                  {l.label}
                  <span aria-hidden className="text-muted-foreground/40">→</span>
                </a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
