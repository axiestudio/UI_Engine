import * as React from "react"
import { cn } from "@/lib/utils"

// ── JOB BASE — the bottom bun. Apply CTA + applies-by note. ─────────────────

export type JobBaseProps = {
  cta?: string
  onApply?: () => void
  deadline?: string
  className?: string
}

export function JobBase({ cta = "Apply for this role", onApply, deadline = "Applies by Oct 12", className }: JobBaseProps) {
  return (
    <div className={cn("flex items-center gap-3 rounded-b-[16px] border-t border-border/60 bg-muted/40 px-5 py-4", className)}>
      <button
        type="button"
        onClick={onApply}
        className="h-10 rounded-full bg-foreground px-5 text-[11px] font-black uppercase tracking-[0.14em] text-background transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {cta}
      </button>
      <span className="ml-auto font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{deadline}</span>
    </div>
  )
}
