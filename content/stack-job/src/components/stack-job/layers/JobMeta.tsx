import * as React from "react"
import { cn } from "@/lib/utils"

// ── JOB META — the chips band. Location / shape / pace. ─────────────────────

export type JobMetaProps = {
  chips?: string[]
  className?: string
}

export function JobMeta({ chips = ["Jönköping", "Hybrid · 2 days remote", "Full time"], className }: JobMetaProps) {
  return (
    <div className={cn("flex flex-wrap gap-2 border-b border-border/60 px-5 py-3.5", className)}>
      {chips.map((c) => (
        <span key={c} className="rounded-full border border-border bg-muted/50 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {c}
        </span>
      ))}
    </div>
  )
}
