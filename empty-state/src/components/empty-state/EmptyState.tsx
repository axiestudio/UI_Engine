import * as React from "react"
import { Button } from "@/components/ui/button"
import { Grain, Ordinal } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type EmptyStateAction = {
  label: string
  href?: string
  onClick?: () => void
}

export type EmptyStateProps = {
  icon?: React.ElementType
  title: string
  description?: string
  primaryAction?: EmptyStateAction
  secondaryAction?: EmptyStateAction
  /** Extra guidance rows, e.g. next-step tips. */
  tips?: string[]
  tone?: "paper" | "ink"
  /** Bordered card (default) or bare centered content. */
  bordered?: boolean
  className?: string
}

// ── EmptyState ───────────────────────────────────────────────────────────────
// Design decisions (hand-tuned):
// · An empty state is a DOOR, not a dead end: the icon chip sits on a dashed
//   ring that rotates slowly (60s, imperceptible but alive), and the numbered
//   tips below read like a checklist you're about to complete.
// · Buttons are square-cornered with hard-offset hover — same tactile family
//   as newsletter/waitlist.
export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  tips,
  tone = "paper",
  bordered = true,
  className,
}: EmptyStateProps) {
  const ink = tone === "ink"

  return (
    <div
      className={cn(
        "relative isolate flex w-full flex-col items-center justify-center overflow-hidden px-6 py-14 text-center",
        bordered && (ink ? "border border-background/15 bg-background/5" : "border bg-card"),
        className,
      )}
      role="status"
    >
      {bordered && <Grain opacity={ink ? 0.06 : 0.035} />}
      {Icon && (
        <span className={cn("relative mb-6 inline-flex size-16 items-center justify-center", ink ? "text-background/70" : "text-muted-foreground")}>
          <span
            aria-hidden
            className={cn("absolute inset-0 rotate-45 border border-dashed", ink ? "border-background/30" : "border-border")}
            style={{ animation: "spin 60s linear infinite" }}
          />
          <span className={cn("relative inline-flex size-10 items-center justify-center rounded-full border", ink ? "border-background/25 bg-background/10" : "border-border bg-secondary")}>
            <Icon className="size-5" strokeWidth={2} />
          </span>
        </span>
      )}
      <h3 className={cn("font-display text-lg font-extrabold tracking-[-0.02em] sm:text-xl", ink ? "text-background" : "text-foreground")}>
        {title}
      </h3>
      {description && (
        <p className={cn("mt-2 max-w-sm text-sm font-medium leading-[1.7]", ink ? "text-background/55" : "text-muted-foreground")}>
          {description}
        </p>
      )}
      {(primaryAction || secondaryAction) && (
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          {primaryAction &&
            (primaryAction.href ? (
              <Button size="sm" asChild className={cn("rounded-none font-mono text-[11px] font-bold uppercase tracking-[0.16em] transition-shadow duration-300 hover:shadow-[2px_3px_0_0_currentColor]", ink && "bg-background text-foreground hover:bg-background/90")}>
                <a href={primaryAction.href} onClick={primaryAction.onClick}>
                  {primaryAction.label}
                </a>
              </Button>
            ) : (
              <Button size="sm" onClick={primaryAction.onClick} className={cn("rounded-none font-mono text-[11px] font-bold uppercase tracking-[0.16em] transition-shadow duration-300 hover:shadow-[2px_3px_0_0_currentColor]", ink && "bg-background text-foreground hover:bg-background/90")}>
                {primaryAction.label}
              </Button>
            ))}
          {secondaryAction &&
            (secondaryAction.href ? (
              <Button
                size="sm"
                variant="outline"
                asChild
                className={cn("rounded-none font-mono text-[11px] font-bold uppercase tracking-[0.16em]", ink && "border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background")}
              >
                <a href={secondaryAction.href} onClick={secondaryAction.onClick}>
                  {secondaryAction.label}
                </a>
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={secondaryAction.onClick}
                className={cn("rounded-none font-mono text-[11px] font-bold uppercase tracking-[0.16em]", ink && "border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background")}
              >
                {secondaryAction.label}
              </Button>
            ))}
        </div>
      )}
      {tips && tips.length > 0 && (
        <ul className={cn("mt-8 w-full max-w-xs border-t pt-4 text-left", ink ? "border-background/10" : "border-border")}>
          {tips.map((tip, i) => (
            <li key={i} className={cn("flex items-center gap-3 border-b py-2 text-xs font-medium last:border-b-0", ink ? "border-background/10 text-background/65" : "border-border/70 text-muted-foreground")}>
              <Ordinal n={i + 1} className={cn("shrink-0", ink ? "text-background/40" : "text-muted-foreground/60")} />
              {tip}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
