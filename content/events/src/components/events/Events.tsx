import * as React from "react"
import { ArrowRight } from "lucide-react"

import { BorderTrail } from "@/components/primitives/border-trail"
import { InView } from "@/components/primitives/in-view"
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
// Design decisions (hand-tuned):
// · Each card is a PRINTED TICKET: the date block sits on the perforation —
//   a dashed vertical rule with two punched notches (top/bottom) — and the
//   whole card tilts -0.5deg until hovered (settle to 0 like picking it up).
// · The featured event gets a "LIVE" tag rotated -6deg, like a stamp.
// · Meta rows are mono ledger lines. The register arrow slides on hover.
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
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-[var(--shell-w)] -translate-x-1/2 border-x lg:block", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

        <header className={cn("relative")}>
  <span aria-hidden className={cn("pointer-events-none absolute -top-10 right-0 select-none font-display text-[120px] font-black leading-none tracking-[-0.05em] [-webkit-text-stroke:1.5px_currentColor] [color:transparent] opacity-[0.07] sm:text-[160px]", tone === 'ink' ? "text-background" : "text-foreground")}>04</span>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>

      <div className={cn("mt-12 grid gap-5 sm:gap-6", columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2")}>
        {events.map((event, i) => (
          <InView
            key={event.id ?? event.title}
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5, delay: Math.min(i * 0.07, 0.28), ease: [0.16, 1, 0.3, 1] }}
            viewOptions={{ once: true, margin: "-40px" }}
          >
            <article
              className={cn(
                "group relative flex h-full rotate-[-0.5deg] border transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:rotate-0 hover:-translate-y-1",
                ink
                  ? "border-background/15 bg-transparent hover:border-background/30"
                  : "border-border bg-card hover:shadow-[4px_5px_0_0_currentColor]",
              )}
            >
              {event.featured && <BorderTrail size={36} className={cn(ink ? "bg-background" : "bg-foreground")} />}
              {!ink && <span aria-hidden className={cn("pointer-events-none absolute inset-0"('lit', ', text-foreground/20'))}>
    <span className="absolute border-current top-[7px] left-[7px] border-t border-l" style={{ width: 10, height: 10 }} />
    <span className="absolute border-current top-[7px] right-[7px] border-t border-r" style={{ width: 10, height: 10 }} />
    <span className="absolute border-current bottom-[7px] left-[7px] border-b border-l" style={{ width: 10, height: 10 }} />
    <span className="absolute border-current bottom-[7px] right-[7px] border-b border-r" style={{ width: 10, height: 10 }} />
  </span>}

              <div
                className={cn(
                  "relative flex w-[86px] shrink-0 flex-col items-center justify-center gap-1 border-r border-dashed px-2 py-6 text-center",
                  ink ? "border-background/20 bg-background/[0.06]" : "border-border bg-secondary/60",
                )}
              >
                {/* punched notches — ticket perforation */}
                <span aria-hidden className={cn("absolute -left-[7px] top-1/2 size-3 -translate-y-1/2 rounded-full border", ink ? "border-background/20 bg-background" : "border-border bg-background")} />
                <span className={cn("font-display text-[28px] font-bold leading-none tracking-[-0.04em]", ink ? "text-background" : "text-foreground")}>
                  {event.day}
                </span>
                <span className={cn("font-mono text-[10px] font-bold uppercase tracking-[0.22em]", ink ? "text-background/55" : "text-muted-foreground")}>
                  {event.month}
                </span>
                {event.dateNote && (
                  <span className={cn("mt-1 font-mono text-[9px] font-medium leading-tight opacity-60", ink ? "text-background/60" : "text-muted-foreground")}>
                    {event.dateNote}
                  </span>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className={cn("font-display text-lg font-bold leading-snug tracking-[-0.02em]", ink ? "text-background" : "text-foreground")}>
                    {event.title}
                  </h3>
                  {event.featured && (
                    <span className={cn("-rotate-6 select-none border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em]", ink ? "border-background/40 text-background/80" : "border-foreground/40 text-foreground/80")}>
                      Live
                    </span>
                  )}
                </div>
                {event.description && (
                  <p className={cn("mt-1.5 text-[13px] font-medium leading-[1.65]", ink ? "text-background/60" : "text-muted-foreground")}>
                    {event.description}
                  </p>
                )}
                {event.meta && event.meta.length > 0 && (
                  <dl className={cn("mt-4 flex flex-col gap-1 border-t pt-3", ink ? "border-background/10" : "border-border")}>
                    {event.meta.map((m) => (
                      <div key={m.label} className="flex items-baseline justify-between gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em]">
                        <dt className={cn(ink ? "text-background/40" : "text-muted-foreground/60")}>{m.label}</dt>
                        {m.value && <dd className={cn(ink ? "text-background/75" : "text-foreground/80")}>{m.value}</dd>}
                      </div>
                    ))}
                  </dl>
                )}
                <div className="mt-auto pt-5">
                  <a
                    href={event.href ?? "#"}
                    className={cn(
                      "inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em]",
                      ink ? "text-background" : "text-foreground",
                    )}
                  >
                    {event.registerLabel ?? "Register"}
                    <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </a>
                </div>
              </div>
            </article>
          </InView>
        ))}
      </div>

      <div className={cn("mt-14 flex items-center gap-4", ink ? "text-background/40" : "text-muted-foreground/60")}>
        <span className="h-px flex-1 border-t border-dashed border-current opacity-50" />
        <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", cn("opacity-80", ink ? "text-background/55" : "text-muted-foreground"))}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />recordings sent to registrants</span>
        <span className="h-px flex-1 border-t border-dashed border-current opacity-50" />
      </div>
    
  </div>
</section>
  )
}
