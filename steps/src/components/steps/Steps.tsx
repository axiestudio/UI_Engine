import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { TextEffect } from "@/components/primitives/text-effect"
import { BorderTrail } from "@/components/primitives/border-trail"
import { Badge } from "@/components/ui/badge"
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
  /** Show oversized outlined index numbers (01, 02, …). Default true. */
  numbered?: boolean
  className?: string
}

// ── Sub components ───────────────────────────────────────────────────────────

function StepCard({
  item,
  index,
  tone,
  numbered,
}: {
  item: StepItem
  index: number
  tone: "paper" | "ink"
  numbered: boolean
}) {
  const ink = tone === "ink"
  const Icon = item.icon
  const num = String(index + 1).padStart(2, "0")
  return (
    <div
      id={item.id}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[24px] p-8 transition-shadow duration-300",
        ink
          ? "border border-background/15 bg-transparent hover:bg-background/5"
          : "border bg-card shadow-sm hover:shadow-md",
      )}
    >
      {!ink && <BorderTrail size={36} className="bg-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100" />}
      {numbered && (
        <p
          aria-hidden
          className={cn(
            "font-display text-[64px] font-black leading-none tracking-[-0.04em] [-webkit-text-stroke:1.5px_currentColor] [color:transparent] sm:text-[80px]",
            ink ? "text-background" : "text-foreground",
          )}
        >
          {num}
        </p>
      )}
      {Icon && (
        <span
          className={cn(
            "mt-6 inline-flex size-11 items-center justify-center rounded-full border",
            ink ? "border-background/20 bg-background/10 text-background" : "border-border bg-secondary text-foreground",
          )}
        >
          <Icon className="size-5" strokeWidth={2.25} />
        </span>
      )}
      <h3
        className={cn(
          "font-display text-xl font-extrabold tracking-tight",
          numbered && "mt-4",
          !numbered && Icon && "mt-4",
          ink ? "text-background" : "text-foreground",
        )}
      >
        {item.title}
      </h3>
      {item.description && (
        <p className={cn("mt-2 text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>
          {item.description}
        </p>
      )}
    </div>
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
    <section className={cn(ink && "bg-foreground", "w-full", className)} aria-label={title ?? "Process"}>
      <div className={cn("mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8", ink && "sm:py-24")}>
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
              <TextEffect
                as="h2"
                preset="blur"
                per="char"
                delay={0.05}
                className={cn(
                  "font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl",
                  ink ? "text-background" : "text-foreground",
                )}
              >
                {title}
              </TextEffect>
            )}
            {subtitle && (
              <InView
                variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                viewOptions={{ once: true, margin: "-60px" }}
              >
                <p className={cn("mt-3 text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>
                  {subtitle}
                </p>
              </InView>
            )}
          </header>
        )}

        <div className="relative">
          <div
            aria-hidden
            className={cn(
              "absolute left-0 right-0 top-[72px] hidden h-px lg:block",
              ink ? "bg-background/15" : "bg-border",
            )}
          />
          <div
            className={cn(
              "relative grid gap-4 sm:gap-6",
              cols === 2 && "sm:grid-cols-2",
              cols === 3 && "sm:grid-cols-2 lg:grid-cols-3",
              cols === 4 && "sm:grid-cols-2 lg:grid-cols-4",
            )}
          >
            {items.map((item, i) => (
              <InView
                key={item.id ?? item.title}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.5, delay: Math.min(i * 0.08, 0.32), ease: [0.16, 1, 0.3, 1] }}
                viewOptions={{ once: true, margin: "-40px" }}
              >
                <StepCard item={item} index={i} tone={tone} numbered={numbered} />
              </InView>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
