import * as React from "react"
import { cn } from "@/lib/utils"

// ── FUND BACKERS — the human proof band between tiers and base. ─────────────

export type FundBackersProps = {
  names?: string[]
  more?: number
  className?: string
}

export function FundBackers({ names = ["Klara L.", "Oskar B.", "Elin S.", "Vera O.", "Mika A."], more = 207, className }: FundBackersProps) {
  return (
    <div className={cn("flex items-center gap-3 border-t border-border/50 bg-muted/30 px-5 py-3", className)}>
      <span aria-hidden className="flex -space-x-2">
        {names.map((n, i) => (
          <span
            key={n}
            className="flex size-7 items-center justify-center rounded-full border-2 border-card bg-foreground font-mono text-[8px] font-black text-background"
            style={{ zIndex: names.length - i }}
          >
            {n.split(/\s+/).map((w) => w[0]).join("")}
          </span>
        ))}
      </span>
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {names[0]} & {more} others backed this
      </span>
    </div>
  )
}
