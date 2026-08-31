import * as React from "react"
import { cn } from "@/lib/utils"

// ── PLAN BASE — the bottom bun. CTA + fine print, anchors the card. ─────────

export type PlanBaseProps = {
  cta: string
  href?: string
  onCta?: () => void
  fine?: string
  className?: string
}

export function PlanBase({ cta, href = "#", onCta, fine, className }: PlanBaseProps) {
  return (
    <div className={cn("mt-auto px-5 pb-5 pt-4", className)}>
      <a
        href={href}
        onClick={onCta}
        className="flex h-11 items-center justify-center rounded-full bg-foreground text-[12px] font-bold uppercase tracking-[0.12em] text-background transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {cta}
      </a>
      {fine && <p className="mt-2.5 text-center font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{fine}</p>}
    </div>
  )
}
