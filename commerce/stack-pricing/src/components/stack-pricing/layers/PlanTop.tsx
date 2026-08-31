import * as React from "react"
import { cn } from "@/lib/utils"

// ── PLAN TOP — the upper bun. Names the plan; carries the stamp. ────────────

export type PlanTopProps = {
  name: string
  tag?: string
  popular?: boolean
  className?: string
}

export function PlanTop({ name, tag, popular, className }: PlanTopProps) {
  return (
    <div className={cn("relative flex items-center justify-between rounded-t-[14px] bg-foreground px-5 py-3.5 text-background", className)}>
      <div className="flex items-baseline gap-2.5">
        <h3 className="font-display text-[15px] font-extrabold tracking-tight">{name}</h3>
        {tag && <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] opacity-60">{tag}</span>}
      </div>
      {popular && (
        <span className="rotate-3 rounded-sm border border-background/40 px-1.5 py-0.5 font-mono text-[8px] font-black uppercase tracking-[0.2em]">
          Popular
        </span>
      )}
    </div>
  )
}
