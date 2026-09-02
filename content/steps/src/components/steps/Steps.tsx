import * as React from "react"
import { ArrowRight } from "lucide-react"

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
          "group relative h-full overflow-visible transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5",
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
          {!ink && <span aria-hidden className={cn("pointer-events-none absolute inset-0", "text-foreground/25 opacity-0 transition-opacity duration-500 group-hover:opacity-100")}>
    <span className="absolute border-current top-[8px] left-[8px] border-t border-l" style={{ width: 11, height: 11 }} />
    <span className="absolute border-current top-[8px] right-[8px] border-t border-r" style={{ width: 11, height: 11 }} />
    <span className="absolute border-current bottom-[8px] left-[8px] border-b border-l" style={{ width: 11, height: 11 }} />
    <span className="absolute border-current bottom-[8px] right-[8px] border-b border-r" style={{ width: 11, height: 11 }} />
  </span>}
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
            <span className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.2em] opacity-60 tabular-nums", cn(ink ? "text-background/70" : "text-foreground/70"))}>{String(index + 1).padStart(2, "0")}{total != null && <span className="opacity-50"> / {String(total).padStart(2, "0")}</span>}</span>
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
    <section id="how" className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-[var(--shell-w)] -translate-x-1/2 border-x lg:block", tone === 'ink' ? "border-background/10" : "border-border")} />
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <div className="flex flex-wrap items-end justify-between gap-6">
          <header className={cn("relative")}>
  <span aria-hidden className={cn("pointer-events-none absolute -top-10 right-0 select-none font-display text-[120px] font-black leading-none tracking-[-0.05em] [-webkit-text-stroke:1.5px_currentColor] [color:transparent] opacity-[0.07] sm:text-[160px]", tone === 'ink' ? "text-background" : "text-foreground")}>01</span>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
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
    
  </div>
</section>
  )
}
