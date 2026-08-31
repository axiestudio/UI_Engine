import * as React from "react"
import { cn } from "@/lib/utils"

// ── BOARD TOP — the upper bun. Greets, and counts what's left. ──────────────

export type BoardTopProps = {
  title?: string
  subtitle?: string
  done?: number
  total?: number
  className?: string
}

export function BoardTop({ title = "Welcome in", subtitle = "Four steps and the studio is yours.", done = 0, total = 4, className }: BoardTopProps) {
  return (
    <div className={cn("flex items-center justify-between rounded-t-[14px] border-b border-app-line/70 bg-muted/40 px-5 py-4", className)}>
      <div>
        <p className="font-display text-[15px] font-black tracking-tight">{title}</p>
        <p className="mt-0.5 text-[12px] font-medium text-muted-foreground">{subtitle}</p>
      </div>
      <span className="rounded-full border bg-background px-2.5 py-1 font-mono text-[10px] font-black tabular-nums" aria-live="polite">
        {done}/{total}
      </span>
    </div>
  )
}
