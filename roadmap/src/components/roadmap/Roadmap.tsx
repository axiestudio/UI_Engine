import * as React from "react"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
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
  columns: RoadmapColumnDef[]
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
      <h3 className={cn("font-display text-[15px] font-extrabold leading-snug tracking-[-0.01em]", ink ? "text-background" : "text-foreground")}>
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

export function Roadmap({
  eyebrow = "Roadmap",
  title = "Where we're headed",
  subtitle = "Public and honest — what's in motion, what's queued, what's a maybe. Shipped work lives in the changelog.",
  columns,
  tone = "paper",
  className,
}: RoadmapProps) {
  if (!columns.length) return null
  const ink = tone === "ink"

  return (
    <SectionShell tone={tone} width={1120} rails grain padding="roomy" className={className}>
      <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} index="05" tone={tone} />

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
                <h3 className={cn("font-display text-lg font-extrabold tracking-[-0.02em]", ink ? "text-background" : "text-foreground")}>
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
    </SectionShell>
  )
}
