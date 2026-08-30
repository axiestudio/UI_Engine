import * as React from "react"
import { Button } from "@/components/ui/button"
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
        "flex w-full flex-col items-center justify-center px-6 py-14 text-center",
        bordered && (ink ? "rounded-[24px] border border-background/15 bg-background/5" : "rounded-[24px] border bg-card"),
        className,
      )}
      role="status"
    >
      {Icon && (
        <span
          className={cn(
            "mb-5 inline-flex size-14 items-center justify-center rounded-full border",
            ink ? "border-background/20 bg-background/10 text-background/70" : "border-border bg-secondary text-muted-foreground",
          )}
        >
          <Icon className="size-6" strokeWidth={2} />
        </span>
      )}
      <h3 className={cn("font-display text-lg font-extrabold tracking-tight sm:text-xl", ink ? "text-background" : "text-foreground")}>
        {title}
      </h3>
      {description && (
        <p className={cn("mt-2 max-w-sm text-sm font-medium leading-relaxed", ink ? "text-background/60" : "text-muted-foreground")}>
          {description}
        </p>
      )}
      {(primaryAction || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {primaryAction &&
            (primaryAction.href ? (
              <Button size="sm" asChild className={cn(ink && "bg-background text-foreground hover:bg-background/90")}>
                <a href={primaryAction.href} onClick={primaryAction.onClick}>
                  {primaryAction.label}
                </a>
              </Button>
            ) : (
              <Button size="sm" onClick={primaryAction.onClick} className={cn(ink && "bg-background text-foreground hover:bg-background/90")}>
                {primaryAction.label}
              </Button>
            ))}
          {secondaryAction &&
            (secondaryAction.href ? (
              <Button
                size="sm"
                variant="outline"
                asChild
                className={cn(ink && "border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background")}
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
                className={cn(ink && "border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background")}
              >
                {secondaryAction.label}
              </Button>
            ))}
        </div>
      )}
      {tips && tips.length > 0 && (
        <ul className={cn("mt-7 flex flex-col gap-1.5 text-xs font-medium", ink ? "text-background/50" : "text-muted-foreground")}>
          {tips.map((tip, i) => (
            <li key={i} className="flex items-center gap-2">
              <span aria-hidden className={cn("font-mono font-bold", ink ? "text-background/30" : "text-muted-foreground/50")}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {tip}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
