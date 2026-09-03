import * as React from "react"
import { ArrowUpRight, BookOpen, CalendarCheck, CreditCard, LifeBuoy, Rocket, Search, Settings, ShieldCheck, Users } from "lucide-react"

import { InView } from "@/components/primitives/in-view"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type HelpCategory = {
  title: string
  description?: string
  icon?: React.ElementType
  href: string
  count?: number
  id?: string
}

export type HelpCenterProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  categories?: HelpCategory[]
  /** Consumer-wired search field. */
  onSearch?: (query: string) => void
  searchPlaceholder?: string
  footerLink?: { label: string; href: string }
  columns?: 2 | 3 | 4
  tone?: "paper" | "ink"
  className?: string
}

// ── HelpCenter ───────────────────────────────────────────────────────────────
// Design decisions (hand-tuned):
// · JOB is ORIENTATION: the search line is the hero — oversized, centered,
//   signing-line style with a blinking caret feel. Categories are secondary.
// · Category cards are corner-ticked index cards: icon chip, title, count as
//   mono "12 articles". Hover: arrow slides in, card lifts 2px.
// · Dots field sits behind the header only, masked — depth without noise.
const FALLBACK_ICONS = [BookOpen, CreditCard, Users, LifeBuoy, Settings]

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_HELP_CENTER_CATEGORIES = [ { title: "Getting started", description: "Set up your first space in minutes.", icon: Rocket, href: "#", count: 12 }, { title: "Billing", description: "Invoices, plans and refunds.", icon: CreditCard, href: "#", count: 8 }, { title: "Account & security", description: "Logins, 2FA and data export.", icon: ShieldCheck, href: "#", count: 6 }, { title: "Bookings", description: "Slots, reminders and no-shows.", icon: CalendarCheck, href: "#", count: 15 }, { title: "Payments", description: "Stripe, payouts and disputes.", icon: CreditCard, href: "#", count: 9 }, { title: "Contact support", description: "Still stuck? We reply within a day.", icon: LifeBuoy, href: "#", count: 1 }, ]


export function HelpCenter({
  eyebrow = "Help center",
  title = "How can we help?",
  subtitle = "Search for a question, or browse the shelves below.",
  categories = DEMO_HELP_CENTER_CATEGORIES,
  onSearch,
  searchPlaceholder = "Search help articles…",
  footerLink,
  columns = 3,
  tone = "paper",
  className,
}: HelpCenterProps) {
  const ink = tone === "ink"
  const [query, setQuery] = React.useState("")
  if (!categories.length) return null

  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <header className="relative mx-auto max-w-2xl text-center">
        {/* masked dots behind the header only */}
        <span aria-hidden className={cn("pointer-events-none absolute inset-0 opacity-[0.13] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)]", cn(
            "-top-8 [mask-image:radial-gradient(ellipse_60%_70%_at_50%_30%,black_20%,transparent_75%)]",
            ink ? "text-background" : "text-foreground",
          ))} style={{ backgroundSize: `${24}px ${24}px` }} />
        <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", cn("justify-center", ink ? "text-background/50" : "text-muted-foreground"))}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>
        <h2 className={cn("mt-4 font-display text-[clamp(1.9rem,4.5vw,2.75rem)] font-bold leading-[1.02] tracking-[-0.035em]", ink ? "text-background" : "text-foreground")}>
          {title}
        </h2>
        <p className={cn("mt-3 text-[15px] font-medium leading-[1.7]", ink ? "text-background/60" : "text-muted-foreground")}>
          {subtitle}
        </p>
        {onSearch && (
          <div className="relative mx-auto mt-8 max-w-md">
            <Search className={cn("pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2", ink ? "text-background/40" : "text-muted-foreground")} />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) onSearch(query.trim())
              }}
              placeholder={searchPlaceholder}
              aria-label="Search help articles"
              className={cn(
                "w-full rounded-none border-x-0 border-b bg-transparent py-3 pl-8 pr-3 font-mono text-sm font-semibold",
                ink
                  ? "border-background/30 text-background focus-visible:border-background/70 focus-visible:ring-0"
                  : "border-border text-foreground focus-visible:border-foreground/70 focus-visible:ring-0",
              )}
            />
          </div>
        )}
      </header>

      <div className={cn("mt-12 grid gap-4 sm:gap-5", columns === 2 && "sm:grid-cols-2", columns === 3 && "sm:grid-cols-2 lg:grid-cols-3", columns === 4 && "sm:grid-cols-2 lg:grid-cols-4")}>
        {categories.map((cat, i) => {
          const Icon = cat.icon ?? FALLBACK_ICONS[i % FALLBACK_ICONS.length]
          return (
            <InView
              key={cat.id ?? cat.title}
              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.45, delay: Math.min(i * 0.06, 0.3), ease: [0.16, 1, 0.3, 1] }}
              viewOptions={{ once: true, margin: "-40px" }}
            >
              <a
                href={cat.href}
                className={cn(
                  "group relative flex h-full flex-col border p-6 transition-all duration-300 hover:-translate-y-0.5",
                  ink ? "border-background/15 hover:border-background/35 hover:bg-background/5" : "border-border bg-card hover:border-foreground/30 hover:shadow-[3px_4px_0_0_currentColor]",
                )}
              >
                <span aria-hidden className={cn("pointer-events-none absolute inset-0", cn("opacity-0 transition-opacity duration-300 group-hover:opacity-100", ink ? "text-background/40" : "text-foreground/30"))}>
    <span className="absolute border-current top-[6px] left-[6px] border-t border-l" style={{ width: 9, height: 9 }} />
    <span className="absolute border-current top-[6px] right-[6px] border-t border-r" style={{ width: 9, height: 9 }} />
    <span className="absolute border-current bottom-[6px] left-[6px] border-b border-l" style={{ width: 9, height: 9 }} />
    <span className="absolute border-current bottom-[6px] right-[6px] border-b border-r" style={{ width: 9, height: 9 }} />
  </span>
                <span className={cn("inline-flex size-10 items-center justify-center border transition-transform duration-300 group-hover:-rotate-6", ink ? "border-background/20 bg-background/10 text-background" : "border-border bg-secondary text-foreground")}>
                  <Icon className="size-5" strokeWidth={2.25} />
                </span>
                <span className={cn("mt-4 inline-flex items-center gap-1.5 font-display text-[15px] font-bold tracking-[-0.01em]", ink ? "text-background" : "text-foreground")}>
                  {cat.title}
                  <ArrowUpRight className={cn("size-3.5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100", ink ? "text-background" : "text-foreground")} />
                </span>
                <span className={cn("mt-1 text-[13px] font-medium leading-[1.6]", ink ? "text-background/55" : "text-muted-foreground")}>
                  {cat.description}
                </span>
                {typeof cat.count === "number" && (
                  <span className={cn("mt-auto pt-4 font-mono text-[9px] font-bold uppercase tracking-[0.2em]", ink ? "text-background/35" : "text-muted-foreground/60")}>
                    {cat.count} articles
                  </span>
                )}
              </a>
            </InView>
          )
        })}
      </div>

      {footerLink && (
        <p className="mt-10 text-center">
          <a
            href={footerLink.href}
            className={cn(
              "inline-flex items-center gap-2 border-b border-dashed pb-1 font-mono text-[11px] font-bold uppercase tracking-[0.2em] transition-colors",
              ink ? "border-background/40 text-background/70 hover:border-background hover:text-background" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
            )}
          >
            {footerLink.label}
            <ArrowUpRight className="size-3.5" />
          </a>
        </p>
      )}
    
  </div>
</section>
  )
}
