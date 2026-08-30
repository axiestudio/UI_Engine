import * as React from "react"
import { ArrowUpRight, BookOpen, CreditCard, LifeBuoy, Search, Settings, Users } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { Badge } from "@/components/ui/badge"
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
  categories: HelpCategory[]
  /** Placeholder for a consumer-wired search field. */
  onSearch?: (query: string) => void
  searchPlaceholder?: string
  footerLink?: { label: string; href: string }
  columns?: 2 | 3 | 4
  tone?: "paper" | "ink"
  className?: string
}

// ── HelpCenter ───────────────────────────────────────────────────────────────

const FALLBACK_ICONS = [BookOpen, CreditCard, Users, LifeBuoy, Settings]

export function HelpCenter({
  eyebrow,
  title = "How can we help?",
  subtitle = "Browse by topic, or search for a specific question.",
  categories,
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
    <section className={cn(ink && "bg-foreground", "w-full", className)} aria-label={title}>
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <header className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          {eyebrow && (
            <p className={cn("font-mono text-[11px] font-bold uppercase tracking-widest", ink ? "text-background/50" : "text-muted-foreground")}>
              {eyebrow}
            </p>
          )}
          <h2 className={cn("mt-2 font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl", ink ? "text-background" : "text-foreground")}>
            {title}
          </h2>
          {subtitle && (
            <p className={cn("mt-3 text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>
              {subtitle}
            </p>
          )}
          {onSearch && (
            <div className="relative mx-auto mt-7 max-w-md">
              <Search className={cn("pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2", ink ? "text-background/40" : "text-muted-foreground")} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && query.trim()) onSearch(query.trim())
                }}
                placeholder={searchPlaceholder}
                aria-label="Search help articles"
                className={cn(
                  "h-12 w-full rounded-full border pl-11 pr-4 text-sm font-medium outline-none transition-colors",
                  ink
                    ? "border-background/25 bg-background/5 text-background placeholder:text-background/40 focus-visible:border-background/40"
                    : "border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:border-foreground/40",
                )}
              />
            </div>
          )}
        </header>

        <div className={cn("grid gap-4 sm:gap-5", columns === 2 && "sm:grid-cols-2", columns === 3 && "sm:grid-cols-2 lg:grid-cols-3", columns === 4 && "sm:grid-cols-2 lg:grid-cols-4")}>
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
                    "group flex h-full flex-col rounded-[20px] border p-6 transition-all",
                    ink ? "border-background/15 bg-transparent hover:border-background/35 hover:bg-background/5" : "border-border bg-card hover:border-foreground/25 hover:shadow-md",
                  )}
                >
                  <span className={cn("inline-flex size-11 items-center justify-center rounded-full border", ink ? "border-background/20 bg-background/10 text-background" : "border-border bg-secondary text-foreground")}>
                    <Icon className="size-5" strokeWidth={2.25} />
                  </span>
                  <span className={cn("mt-4 flex items-center gap-1.5 font-display text-base font-extrabold tracking-tight", ink ? "text-background" : "text-foreground")}>
                    {cat.title}
                    <ArrowUpRight className={cn("size-4 opacity-0 transition-all duration-200 group-hover:opacity-100", ink ? "text-background" : "text-foreground")} />
                  </span>
                  <span className={cn("mt-1 text-sm font-medium leading-relaxed", ink ? "text-background/60" : "text-muted-foreground")}>
                    {cat.description}
                  </span>
                  {typeof cat.count === "number" && (
                    <span className={cn("mt-auto pt-4 font-mono text-[11px] font-bold uppercase tracking-widest", ink ? "text-background/40" : "text-muted-foreground/70")}>
                      {cat.count} articles
                    </span>
                  )}
                </a>
              </InView>
            )
          })}
        </div>

        {footerLink && (
          <p className="mt-8 text-center">
            <Badge variant="outline" asChild className={cn("rounded-full border px-4 py-2 text-sm font-bold", ink ? "border-background/25 bg-transparent text-background/80" : "bg-secondary text-foreground")}>
              <a href={footerLink.href} className="inline-flex items-center gap-1.5">
                {footerLink.label}
                <ArrowUpRight className="size-3.5" />
              </a>
            </Badge>
          </p>
        )}
      </div>
    </section>
  )
}
