import * as React from "react"
import { Check, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

// ── PLAN PERK — the fillings. Render one row per perk; repeat freely. ───────

export type PlanPerkProps = {
  children: React.ReactNode
  included?: boolean
  className?: string
}

export function PlanPerk({ children, included = true, className }: PlanPerkProps) {
  return (
    <li
      className={cn(
        "flex items-start gap-2.5 border-t border-border/60 px-5 py-2.5 text-[13px] font-medium",
        included ? "text-foreground" : "text-muted-foreground/70",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
          included ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
        )}
      >
        {included ? <Check className="size-2.5" strokeWidth={3} /> : <Minus className="size-2.5" strokeWidth={3} />}
      </span>
      <span className={cn(!included && "line-through decoration-border")}>{children}</span>
    </li>
  )
}
