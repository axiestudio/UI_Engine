import * as React from "react"
import { cn } from "@/lib/utils"

// ── PLAN PRICE — the meat. One honest number, big. ──────────────────────────

export type PlanPriceProps = {
  amount: string
  period?: string
  note?: string
  className?: string
}

export function PlanPrice({ amount, period = "/ month", note, className }: PlanPriceProps) {
  return (
    <div className={cn("px-5 pb-1 pt-4", className)}>
      <p className="flex items-baseline gap-1.5">
        <span className="font-display text-[40px] font-black leading-none tracking-[-0.03em]">{amount}</span>
        <span className="font-mono text-[11px] font-semibold text-muted-foreground">{period}</span>
      </p>
      {note && <p className="mt-1.5 text-[12px] font-medium text-muted-foreground">{note}</p>}
    </div>
  )
}
