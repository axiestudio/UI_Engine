import * as React from "react"

import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type RoadmapStatus = "now" | "next" | "later" | "shipped"

export type RoadmapItem = {
  title: string
  description?: string
  tag?: string
  votes?: number
  id?: string
}

export type RoadmapColumnDef = {
  status: RoadmapStatus
  label?: string
  description?: string
  items: RoadmapItem[]
}

export type RoadmapProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  columns?: RoadmapColumnDef[]
  tone?: "paper" | "ink"
  className?: string
}

// ── Roadmap ──────────────────────────────────────────────────────────────────
// Design decisions (hand-tuned):
// · Three vertical RAILS (not floating cards): each column is a track with a
//   top status node — filled+pulsing for NOW, hollow for NEXT/LATER, filled
//   dim for SHIPPED. The plan reads like a transit map.
// · Items sit on the rail as quiet bordered slips; vote counts are odometer
//   mono. No colorful badges — hierarchy comes from the node states.
// · Column proportions are equal (plan is a promise, not a ranking), with a
//   mono count under each header.
const STATUS_NODE: Record<RoadmapStatus, { fill: string; pulse: boolean }> = {
  now: { fill: "", pulse: true },
  next: { fill: "hollow", pulse: false },
  later: { fill: "hollow", pulse: false },
  shipped: { fill: "", pulse: false },
}

const STATUS_LABEL: Record<RoadmapStatus, string> = {
  now: "Now",
  next: "Next",
  later: "Later",
  shipped: "Shipped",
}

function RoadmapCard({ item, ink }: { item: RoadmapItem; ink: boolean }) {
  return (
    <div
      className={cn(
        "group relative border p-4 transition-all duration-300 hover:-translate-y-0.5 sm:p-5",
        ink ? "border-background/12 bg-transparent hover:border-background/30" : "border-border bg-card hover:border-foreground/30 hover:shadow-[2px_3px_0_0_currentColor]",
      )}
    >
      {item.tag && (
        <span className={cn("mb-2.5 inline-block border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em]", ink ? "border-background/25 text-background/60" : "border-border text-muted-foreground")}>
          {item.tag}
        </span>
      )}
      <h3 className={cn("font-display text-[15px] font-bold leading-snug tracking-[-0.01em]", ink ? "text-background" : "text-foreground")}>
        {item.title}
      </h3>
      {item.description && (
        <p className={cn("mt-1 text-xs font-medium leading-[1.6]", ink ? "text-background/55" : "text-muted-foreground")}>
          {item.description}
        </p>
      )}
      {typeof item.votes === "number" && (
        <p className={cn("mt-3 font-mono text-[10px] font-bold tabular-nums tracking-[0.14em]", ink ? "text-background/45" : "text-muted-foreground")}>
          ▲ {item.votes.toLocaleString()}
        </p>
      )}
    </div>
  )
}


// Self-demo defaults: bare mount (= tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_ROADMAP_COLUMNS: RoadmapColumnDef[] = [ { status: "now", description: "In active development.", items: [{ title: "Recurring bookings", tag: "Booking", votes: 312, description: "Weekly, bi-weekly and monthly series." }, { title: "SMS reminders", tag: "Notifications", votes: 141 }] }, { status: "next", items: [{ title: "Native mobile app", votes: 188 }, { title: "Multi-location support", votes: 96 }] }, { status: "later", items: [{ title: "AI intake summaries", votes: 64 }] }, ]

export function Roadmap({
  eyebrow = "Roadmap",
  title = "Where we're headed",
  subtitle = "Public and honest — what's in motion, what's queued, what's a maybe. Shipped work lives in the changelog.",
  columns = DEMO_ROADMAP_COLUMNS,
  tone = "paper",
  className,
}: RoadmapProps) {
  if (!columns.length) return null
  const ink = tone === "ink"

  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-[var(--shell-w)] -translate-x-1/2 border-x lg:block", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

        <header className={cn("relative")}>
  <span aria-hidden className={cn("pointer-events-none absolute -top-10 right-0 select-none font-display text-[120px] font-black leading-none tracking-[-0.05em] [-webkit-text-stroke:1.5px_currentColor] [color:transparent] opacity-[0.07] sm:text-[160px]", tone === 'ink' ? "text-background" : "text-foreground")}>05</span>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>

      <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-6">
        {columns.map((col) => {
          const node = STATUS_NODE[col.status]
          return (
            <div key={col.status} className="relative">
              {/* status node + header on the rail */}
              <div className="flex items-center gap-3">
                <span className="relative flex size-3 shrink-0">
                  {node.pulse && (
                    <span
                      aria-hidden
                      className={cn("absolute inline-flex size-full animate-ping opacity-50", ink ? "bg-background" : "bg-foreground")}
                    />
                  )}
                  <span
                    className={cn(
                      "relative inline-flex size-3 rotate-45 border",
                      node.fill === "hollow"
                        ? ink
                          ? "border-background/50 bg-transparent"
                          : "border-foreground/50 bg-background"
                        : ink
                          ? "border-background bg-background"
                          : "border-foreground bg-foreground",
                    )}
                  />
                </span>
                <h3 className={cn("font-display text-lg font-bold tracking-[-0.02em]", ink ? "text-background" : "text-foreground")}>
                  {col.label ?? STATUS_LABEL[col.status]}
                </h3>
                <span className={cn("ml-auto font-mono text-[10px] font-bold uppercase tracking-[0.18em]", ink ? "text-background/40" : "text-muted-foreground/70")}>
                  {col.items.length}
                </span>
              </div>
              {col.description && (
                <p className={cn("mt-1.5 text-xs font-medium leading-relaxed", ink ? "text-background/50" : "text-muted-foreground")}>
                  {col.description}
                </p>
              )}
              {/* the rail itself */}
              <span aria-hidden className={cn("mt-4 h-px w-full border-t border-dashed", ink ? "border-background/15" : "border-border")} />

              <div className="mt-4 flex flex-col gap-3">
                {col.items.map((item, i) => (
                  <InView
                    key={item.id ?? item.title}
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.45, delay: Math.min(i * 0.06, 0.3), ease: [0.16, 1, 0.3, 1] }}
                    viewOptions={{ once: true, margin: "-40px" }}
                  >
                    <RoadmapCard item={item} ink={ink} />
                  </InView>
                ))}
                {!col.items.length && (
                  <p className={cn("border border-dashed p-5 text-center font-mono text-[10px] font-bold uppercase tracking-[0.18em]", ink ? "border-background/15 text-background/35" : "border-border text-muted-foreground/60")}>
                    nothing yet
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className={cn("mt-16 flex items-center gap-4", ink ? "text-background/40" : "text-muted-foreground/60")}>
        <span className="h-px flex-1 border-t border-dashed border-current opacity-50" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em]">plans change — this page won't lie to you</span>
        <span className="h-px flex-1 border-t border-dashed border-current opacity-50" />
      </div>
    
  </div>
</section>
  )
}
