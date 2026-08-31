import * as React from "react"
import { cn } from "@/lib/utils"

// ── EVENT TALK — one agenda row. The filling: repeat one per talk. ──────────

export type EventTalkProps = {
  at?: string
  title: string
  speaker?: string
  className?: string
}

export function EventTalk({ at = "18:30", title, speaker, className }: EventTalkProps) {
  return (
    <div className={cn("flex items-baseline gap-4 border-t border-border/50 px-5 py-3 first:border-t-0", className)}>
      <span className="w-11 shrink-0 font-mono text-[11px] font-bold tabular-nums text-primary">{at}</span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-bold">{title}</span>
        {speaker && <span className="block truncate font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{speaker}</span>}
      </span>
    </div>
  )
}
