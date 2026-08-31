import * as React from "react"
import { ArrowRight } from "lucide-react"
import { CornerTicks, Grain, Ordinal, SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type StepItem = {
  title: string
  description?: string
  icon?: React.ElementType
  id?: string
}

export type StepsProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  items: StepItem[]
  /** 2 / 3 / 4 columns on desktop. Default 3 (clamped to items length). */
  columns?: 2 | 3 | 4
  /** ink = dark band with light type; paper = bordered cards on light bg. */
  tone?: "paper" | "ink"
  /** Show oversized index numerals. Default true. */
  numbered?: boolean
  className?: string
}

// ── Sub components ───────────────────────────────────────────────────────────
// Design decisions (hand-tuned):
// · The numeral is CROPPED by the card's top-right corner (translate-x/y +)
//   — partial glyphs read as print crops, not a badge grid.
// · Cards carry a hard 4px offset shadow on hover (letterpress feel), lift
//   -translate-y-1, and corner ticks that fade in only on hover.
// · The connector is a dashed line with an arrowhead that draws itself
//   (scaleX + opacity) as the section enters — the process literally moves.
function StepCard({
  item,
  index,
  total,
  tone,
  numbered,
}: {
  item: StepItem
  index: number
  total: number
  tone: "paper" | "ink"
  numbered: boolean
}) {
  const ink = tone === "ink"
  const Icon = item.icon
  return (
    <InView
      variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.09, 0.36), ease: [0.16, 1, 0.3, 1] }}
      viewOptions={{ once: true, margin: "-60px" }}
    >
      <div
        id={item.id}
        className={cn(
          "group relative h-full overflow-visible transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5",
        )}
      >
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 translate-x-1 translate-y-1.5 border opacity-0 transition-opacity duration-500 group-hover:opacity-100",
            ink ? "border-background/30" : "border-foreground/25",
          )}
        />
        <div
          className={cn(
            "relative flex h-full flex-col overflow-hidden border p-7 sm:p-8",
            ink ? "border-background/15 bg-transparent" : "border-border bg-card",
            !ink && "shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-shadow duration-500 group-hover:shadow-[4px_5px_0_0_currentColor]",
            ink && "transition-colors duration-500 group-hover:bg-background/5",
          )}
        >
          {!ink && <CornerTicks size={11} offset={8} className="text-foreground/25 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />}
          {numbered && (
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute -right-2 -top-7 select-none font-display text-[104px] font-bold leading-none tracking-[-0.06em] [-webkit-text-stroke:1.5px_currentColor] [color:transparent] sm:-right-3 sm:-top-9 sm:text-[128px]",
                ink ? "text-background opacity-[0.16]" : "text-foreground opacity-[0.13]",
              )}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
          <div className={cn("relative", numbered && "mt-14 sm:mt-16")}>
            <Ordinal n={index + 1} total={total} className={cn(ink ? "text-background/70" : "text-foreground/70")} />
            {Icon && (
              <span
                className={cn(
                  "mt-5 inline-flex size-11 items-center justify-center rounded-full border transition-transform duration-500 group-hover:-rotate-6",
                  ink ? "border-background/20 bg-background/10 text-background" : "border-border bg-secondary text-foreground",
                )}
              >
                <Icon className="size-5" strokeWidth={2.25} />
              </span>
            )}
            <h3
              className={cn(
                "font-display text-[22px] font-bold leading-tight tracking-[-0.02em]",
                (numbered || Icon) && "mt-4",
                ink ? "text-background" : "text-foreground",
              )}
            >
              {item.title}
            </h3>
            {item.description && (
              <p className={cn("mt-2.5 text-sm font-medium leading-[1.7]", ink ? "text-background/60" : "text-muted-foreground")}>
                {item.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </InView>
  )
}

// ── Steps ────────────────────────────────────────────────────────────────────

export function Steps({
  eyebrow,
  title,
  subtitle,
  items,
  columns = 3,
  tone = "paper",
  numbered = true,
  className,
}: StepsProps) {
  if (!items.length) return null
  const cols = Math.min(columns, items.length)
  const ink = tone === "ink"

  return (
    <SectionShell tone={tone} width={1120} rails rule="bottom" padding="roomy" className={className} id="how">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHead
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          index="01"
          tone={tone}
        />
        <span aria-hidden className={cn("hidden pb-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] sm:block", ink ? "text-background/40" : "text-muted-foreground/70")}>
          {items.length} steps · no detours
        </span>
      </div>

      {/* self-drawing connector */}
      <div aria-hidden className="relative mt-12 hidden lg:block">
        <InView
          as="div"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          viewOptions={{ once: true, margin: "-80px" }}
        >
          <div className={cn("relative h-px w-full", ink ? "bg-background/20" : "bg-foreground/20")}>
            <span
              className={cn(
                "absolute -right-0.5 -top-[3.5px] h-2 w-2 rotate-45 border-r border-t",
                ink ? "border-background/60" : "border-foreground/60",
              )}
            />
            <span className={cn("absolute inset-x-0 top-0 h-px origin-left animate-pulse", ink ? "bg-background/50" : "bg-foreground/50")} style={{ width: "38%" }} />
          </div>
        </InView>
      </div>

      <div
        className={cn(
          "relative mt-8 grid gap-5 sm:gap-6 lg:mt-10",
          cols === 2 && "sm:grid-cols-2",
          cols === 3 && "sm:grid-cols-2 lg:grid-cols-3",
          cols === 4 && "sm:grid-cols-2 lg:grid-cols-4",
        )}
      >
        {items.map((item, i) => (
          <StepCard key={item.id ?? item.title} item={item} index={i} total={items.length} tone={tone} numbered={numbered} />
        ))}
      </div>

      {/* closing echo — mono sign-off, the editorial footer detail */}
      <div className={cn("mt-14 flex items-center gap-4", ink ? "text-background/45" : "text-muted-foreground/70")}>
        <span className="h-px flex-1 border-t border-dashed border-current opacity-40" />
        <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em]">
          from first click to done
          <ArrowRight className="size-3.5" />
        </span>
        <span className="h-px flex-1 border-t border-dashed border-current opacity-40" />
      </div>
    </SectionShell>
  )
}
