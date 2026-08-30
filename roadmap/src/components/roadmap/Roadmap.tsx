import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { BorderTrail } from "@/components/primitives/border-trail"
import { Badge } from "@/components/ui/badge"
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

// ── Sub components ───────────────────────────────────────────────────────────

const STATUS_META: Record<RoadmapStatus, { label: string; dot: string }> = {
  now: { label: "Now", dot: "" },
  next: { label: "Next", dot: "" },
  later: { label: "Later", dot: "" },
  shipped: { label: "Shipped", dot: "" },
}

function RoadmapCard({ item, ink, index }: { item: RoadmapItem; ink: boolean; index: number }) {
  return (
    <InView
      variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.3), ease: [0.16, 1, 0.3, 1] }}
      viewOptions={{ once: true, margin: "-40px" }}
    >
      <div className={cn("group relative overflow-hidden rounded-2xl border p-5", ink ? "border-background/15 bg-transparent hover:bg-background/5" : "border-border bg-card shadow-sm hover:shadow-md")}>
        {item.tag && (
          <Badge
            variant="outline"
            className={cn("mb-3 rounded-full px-2.5 font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "border-background/25 text-background/70" : "bg-secondary text-muted-foreground")}
          >
            {item.tag}
          </Badge>
        )}
        <h3 className={cn("font-display text-base font-extrabold tracking-tight", ink ? "text-background" : "text-foreground")}>
          {item.title}
        </h3>
        {item.description && (
          <p className={cn("mt-1.5 text-sm font-medium leading-relaxed", ink ? "text-background/60" : "text-muted-foreground")}>
            {item.description}
          </p>
        )}
        {typeof item.votes === "number" && (
          <p className={cn("mt-3 font-mono text-xs font-bold", ink ? "text-background/50" : "text-muted-foreground")}>
            ▲ {item.votes.toLocaleString()}
          </p>
        )}
      </div>
    </InView>
  )
}

// ── Roadmap ──────────────────────────────────────────────────────────────────

export function Roadmap({
  eyebrow,
  title = "Roadmap",
  subtitle = "What we're building next — shipped items are at the top of the changelog.",
  columns,
  tone = "paper",
  className,
}: RoadmapProps) {
  if (!columns.length) return null
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

        <div className={cn("grid gap-6", columns.length >= 3 ? "lg:grid-cols-3" : columns.length === 2 ? "sm:grid-cols-2" : "")}>
          {columns.map((col) => {
            const meta = STATUS_META[col.status]
            const first = col.status === "now"
            return (
              <div key={col.status} className={cn("flex flex-col gap-4 rounded-[24px] border p-5", ink ? "border-background/10 bg-background/5" : "border-border bg-muted/40")}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        col.status === "now" ? "animate-pulse" : "",
                        col.status === "shipped" ? "opacity-40" : "",
                        ink ? "bg-background" : "bg-foreground",
                      )}
                      aria-hidden
                    />
                    <h3 className={cn("font-display text-lg font-extrabold tracking-tight", ink ? "text-background" : "text-foreground")}>
                      {col.label ?? meta.label}
                    </h3>
                  </div>
                  <span className={cn("font-mono text-xs font-bold", ink ? "text-background/50" : "text-muted-foreground")}>
                    {col.items.length}
                  </span>
                </div>
                {col.description && (
                  <p className={cn("-mt-1 text-sm font-medium", ink ? "text-background/60" : "text-muted-foreground")}>
                    {col.description}
                  </p>
                )}
                {first && col.items[0] && (
                  <div className="relative -mx-1 -mt-1 hidden" aria-hidden>
                    <BorderTrail size={32} className={ink ? "bg-background" : "bg-foreground"} />
                  </div>
                )}
                <div className="flex flex-col gap-3">
                  {col.items.map((item, i) => (
                    <RoadmapCard key={item.id ?? item.title} item={item} ink={ink} index={i} />
                  ))}
                  {!col.items.length && (
                    <p className={cn("rounded-2xl border border-dashed p-5 text-center text-sm font-medium", ink ? "border-background/15 text-background/40" : "border-border text-muted-foreground/70")}>
                      Nothing planned yet.
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
