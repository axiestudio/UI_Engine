import * as React from "react"
import {
  ArrowRight,
  Banknote,
  CreditCard,
  MessageSquare,
  Package,
  Star,
  TriangleAlert,
  User,
  Zap,
} from "lucide-react"

import { InView } from "@/components/primitives/in-view"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type ActivityKind = "signup" | "review" | "milestone" | "payment" | "comment" | "refund" | "alert" | "shipment"

export type ActivityItem = {
  kind?: ActivityKind
  title: string
  /** Supporting line, e.g. "Stockholm · 2 min ago". */
  meta?: string
  /** Relative timestamp, mono-rendered, e.g. "2m". */
  time?: string
  /** The latest event gets the breathing node when true. */
  live?: boolean
}

export type ActivityFeedProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  items?: ActivityItem[]
  /** How many rows to render (rest are dropped). Default 6. */
  maxVisible?: number
  cta?: { label: string; href?: string; onClick?: () => void }
  tone?: "paper" | "ink"
  className?: string
}

// ── ActivityFeed ─────────────────────────────────────────────────────────────
// Design decisions (hand-tuned):
// · JOB: show the product is alive · EMOTION: momentum.
// · SIGNATURE: a true rail with TYPED nodes — every event kind has its own
//   glyph punched into the rail, so the feed reads like a transit map of what
//   just happened. The newest node breathes; the rail itself is a solid hair
//   line, not dashes.
// · Rows are ledger rows: glyph, title, meta, then a tabular mono timestamp
//   hugging the right edge. One choreography: rows cascade in top-down.
export function ActivityFeed({
  eyebrow = "Live",
  title = "Happening now",
  subtitle,
  items,
  maxVisible = 6,
  cta,
  tone = "paper",
  className,
}: ActivityFeedProps) {
  const ink = tone === "ink"
  const rows = (items ?? [
    { kind: "signup", title: "Luma Studio joined", meta: "Stockholm", time: "2m", live: true },
    { kind: "payment", title: "Invoice #A-1024 settled", meta: "Stripe · card", time: "9m" },
    { kind: "review", title: "New 5-star review", meta: "“Booking took 30 seconds”", time: "24m" },
    { kind: "milestone", title: "10,000th booking processed", meta: "Platform-wide", time: "1h" },
    { kind: "shipment", title: "Card reader shipped", meta: "Gothenburg", time: "2h" },
    { kind: "comment", title: "Note added to intake form", meta: "Front desk", time: "3h" },
  ] as ActivityItem[]).slice(0, maxVisible)

  const glyphFor = (kind: ActivityKind = "milestone"): React.ReactNode => {
    const map: Record<ActivityKind, React.ReactNode> = {
      signup: <User aria-hidden className="h-3 w-3 stroke-[2]" />,
      review: <Star aria-hidden className="h-3 w-3 stroke-[2]" />,
      milestone: <Zap aria-hidden className="h-3 w-3 stroke-[2]" />,
      payment: <CreditCard aria-hidden className="h-3 w-3 stroke-[2]" />,
      comment: <MessageSquare aria-hidden className="h-3 w-3 stroke-[2]" />,
      refund: <Banknote aria-hidden className="h-3 w-3 stroke-[2]" />,
      alert: <TriangleAlert aria-hidden className="h-3 w-3 stroke-[2]" />,
      shipment: <Package aria-hidden className="h-3 w-3 stroke-[2]" />,
    }
    return map[kind]
  }

  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          {/* copy */}
          <div>
            {eyebrow && (
              <InView
                variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                viewOptions={{ once: true, margin: "-60px" }}
              >
                <span
                  className={cn(
                    "inline-flex items-center gap-2.5 rounded-full border px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em]",
                    ink ? "border-background/15 text-background/60" : "border-border text-muted-foreground",
                  )}
                >
                  <span aria-hidden className="relative flex size-1.5">
                    <span className={cn("absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:hidden", ink ? "bg-background" : "bg-foreground")} />
                    <span className={cn("relative inline-flex size-1.5 rounded-full", ink ? "bg-background" : "bg-foreground")} />
                  </span>
                  {eyebrow}
                </span>
              </InView>
            )}
            <h2 className={cn("mt-6 max-w-[14ch] font-display text-[clamp(1.9rem,4vw,2.8rem)] font-bold leading-[1.02] tracking-[-0.03em]", ink ? "text-background" : "text-foreground")}>
              {title}
            </h2>
            {subtitle && (
              <p className={cn("mt-5 max-w-[40ch] text-[15px] leading-[1.75]", ink ? "text-background/55" : "text-muted-foreground")}>
                {subtitle}
              </p>
            )}
            {cta && (
              <InView
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                viewOptions={{ once: true, margin: "-60px" }}
              >
                <Button
                  size="lg"
                  variant="ghost"
                  asChild={Boolean(cta.href)}
                  onClick={cta.onClick}
                  className={cn(
                    "group mt-8 h-11 rounded-full px-6 text-sm font-semibold",
                    ink
                      ? "border border-background/15 text-background/80 hover:bg-background/10 hover:text-background"
                      : "border border-border text-foreground hover:bg-secondary",
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    {cta.label}
                    <ArrowRight aria-hidden className="h-4 w-4 stroke-[2] transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
                  </span>
                </Button>
              </InView>
            )}
          </div>

          {/* the rail */}
          <div className="relative">
            <span aria-hidden className={cn("absolute bottom-2 left-[15px] top-2 w-px", ink ? "bg-background/15" : "bg-border")} />
            <ul className="flex flex-col">
              {rows.map((item, i) => (
                <InView
                  key={i}
                  variants={{ hidden: { opacity: 0, x: -14 }, visible: { opacity: 1, x: 0 } }}
                  transition={{ duration: 0.5, delay: 0.08 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
                  viewOptions={{ once: true, margin: "-40px" }}
                >
                  <li className="relative flex items-start gap-4 py-3">
                    {/* typed node — punched into the rail */}
                    <span
                      className={cn(
                        "relative z-10 mt-0.5 inline-flex size-[31px] shrink-0 items-center justify-center rounded-full border",
                        item.live
                          ? "border-destructive/40 bg-destructive/10 text-destructive"
                          : ink
                            ? "border-background/20 bg-foreground text-background"
                            : "border-border bg-background text-foreground",
                      )}
                    >
                      {item.live && <span aria-hidden className="absolute inline-flex size-full animate-ping rounded-full bg-destructive/30 motion-reduce:hidden" />}
                      {glyphFor(item.kind)}
                    </span>

                    <div className="flex min-w-0 flex-1 items-baseline justify-between gap-4">
                      <div className="min-w-0">
                        <p className={cn("truncate text-sm font-bold", ink ? "text-background" : "text-foreground")}>{item.title}</p>
                        {item.meta && (
                          <p className={cn("mt-0.5 truncate font-mono text-[10px] font-bold uppercase tracking-[0.16em]", ink ? "text-background/40" : "text-muted-foreground/80")}>
                            {item.meta}
                          </p>
                        )}
                      </div>
                      {item.time && (
                        <span className={cn("shrink-0 font-mono text-[11px] font-bold tabular-nums", ink ? "text-background/45" : "text-muted-foreground")}>
                          {item.time}
                        </span>
                      )}
                    </div>
                  </li>
                </InView>
              ))}
            </ul>

            <p className={cn("mt-4 pl-[47px] font-mono text-[9px] font-bold uppercase tracking-[0.24em]", ink ? "text-background/30" : "text-muted-foreground/50")}>
              end of feed
            </p>
          </div>
        </div>
    
  </div>
</section>
  )
}
