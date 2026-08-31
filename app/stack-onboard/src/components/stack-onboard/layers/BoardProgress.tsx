import * as React from "react"
import { cn } from "@/lib/utils"

// ── BOARD PROGRESS — the rail between the fillings and the base. ────────────

export type BoardProgressProps = {
  done?: number
  total?: number
  className?: string
}

export function BoardProgress({ done = 0, total = 4, className }: BoardProgressProps) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div className={cn("border-t border-app-line/70 px-5 py-3", className)}>
      <div className="flex items-center justify-between font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        <span>Progress</span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Onboarding progress">
        <div className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
