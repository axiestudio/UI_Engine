import * as React from "react"
import { ArrowRight } from "lucide-react"
import { BorderTrail } from "@/components/primitives/border-trail"
import { InView } from "@/components/primitives/in-view"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type EventItem = {
  /** Short day shown in the date block, e.g. "12". */
  day: string
  /** Short month, e.g. "SEP". */
  month: string
  /** Optional year or weekday line under the date block. */
  dateNote?: string
  title: string
  description?: string
  meta?: { label: string; value?: string }[]
  href?: string
  registerLabel?: string
  /** Marks the event card with a live border trail. */
  featured?: boolean
  id?: string
}

export type EventsProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  events: EventItem[]
  columns?: 2 | 3
  tone?: "paper" | "ink"
  className?: string
}

// ── Events ───────────────────────────────────────────────────────────────────

export function Events({
  eyebrow,
  title = "Events & webinars",
  subtitle = "Learn live, ask questions, leave with something you can use.",
  events,
  columns = 3,
  tone = "paper",
  className,
}: EventsProps) {
  if (!events.length) return null
  const ink = tone === "ink"

  return (
    <section className={cn(ink && "bg-foreground", "w-full", className)} aria-label={title}>
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {(eyebrow || title || subtitle) && (
          <header className="mb-10 max-w-2xl sm:mb-14">
            {eyebrow && (
              <Badge
                variant="outline"
                className={cn(
                  "mb-4 rounded-full border px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest",
                  ink ? "border-background/25 bg-transparent text-background/80" : "bg-secondary text-muted-foreground",
                )}
              >
                {eyebrow}
              </Badge>
            )}
            {title && (
              <h2 className={cn("font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl", ink ? "text-background" : "text-foreground")}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={cn("mt-3 text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>
                {subtitle}
              </p>
            )}
          </header>
        )}

        <div className={cn("grid gap-4 sm:gap-6", columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2")}>
          {events.map((event, i) => (
            <InView
              key={event.id ?? event.title}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5, delay: Math.min(i * 0.07, 0.28), ease: [0.16, 1, 0.3, 1] }}
              viewOptions={{ once: true, margin: "-40px" }}
            >
              <article
                className={cn(
                  "group relative flex h-full flex-col overflow-hidden rounded-[24px] border p-6 sm:p-7",
                  ink ? "border-background/15 bg-transparent hover:bg-background/5" : "border-border bg-card shadow-sm hover:shadow-md",
                )}
              >
                {event.featured && <BorderTrail size={36} className={cn(ink ? "bg-background" : "bg-foreground")} />}
                <div className="flex items-start justify-between gap-4">
                  <div className={cn("flex size-16 flex-col items-center justify-center rounded-2xl border text-center", ink ? "border-background/20 bg-background/10" : "border-border bg-secondary")}>
                    <span className={cn("font-display text-2xl font-black leading-none", ink ? "text-background" : "text-foreground")}>{event.day}</span>
                    <span className={cn("mt-1 font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "text-background/60" : "text-muted-foreground")}>{event.month}</span>
                  </div>
                  {event.dateNote && (
                    <span className={cn("pt-1 font-mono text-[11px] font-bold uppercase tracking-widest", ink ? "text-background/50" : "text-muted-foreground")}>
                      {event.dateNote}
                    </span>
                  )}
                </div>

                <h3 className={cn("mt-5 font-display text-xl font-extrabold tracking-tight", ink ? "text-background" : "text-foreground")}>
                  {event.title}
                </h3>
                {event.description && (
                  <p className={cn("mt-2 text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>
                    {event.description}
                  </p>
                )}

                {event.meta && event.meta.length > 0 && (
                  <dl className={cn("mt-5 flex flex-wrap gap-x-5 gap-y-1.5 border-t pt-4 text-xs font-semibold", ink ? "border-background/10 text-background/60" : "border-border text-muted-foreground")}>
                    {event.meta.map((m) => (
                      <div key={m.label} className="flex items-center gap-1.5">
                        <dt className={cn("font-mono uppercase tracking-widest", ink ? "text-background/40" : "text-muted-foreground/70")}>{m.label}</dt>
                        {m.value && <dd>{m.value}</dd>}
                      </div>
                    ))}
                  </dl>
                )}

                <div className="mt-auto pt-6">
                  {event.href ? (
                    <Button
                      size="sm"
                      variant={event.featured ? "default" : "outline"}
                      asChild
                      className={cn(ink && (event.featured ? "bg-background text-foreground hover:bg-background/90" : "border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background"))}
                    >
                      <a href={event.href}>
                        {event.registerLabel ?? "Register"}
                        <ArrowRight className="size-4" />
                      </a>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(ink && "border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background")}
                    >
                      {event.registerLabel ?? "Register"}
                      <ArrowRight className="size-4" />
                    </Button>
                  )}
                </div>
              </article>
            </InView>
          ))}
        </div>
      </div>
    </section>
  )
}
