import * as React from "react"
import { cn } from "@/lib/utils"

// ── EVENT HEAD — the upper bun. Date block + title band. ────────────────────

export type EventHeadProps = {
  day?: string
  month?: string
  title: string
  kind?: string
  className?: string
}

export function EventHead({ day = "24", month = "SEP", title, kind = "Evening talk", className }: EventHeadProps) {
  return (
    <div className={cn("flex items-center gap-4 rounded-t-[16px] bg-foreground px-5 py-4 text-background", className)}>
      <span aria-hidden className="flex w-14 shrink-0 flex-col items-center rounded-lg border border-background/25 px-2 py-1.5">
        <span className="font-display text-[20px] font-black leading-none">{day}</span>
        <span className="mt-0.5 font-mono text-[9px] font-bold tracking-[0.2em] opacity-70">{month}</span>
      </span>
      <span className="min-w-0">
        <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.22em] opacity-60">{kind}</span>
        <span className="mt-0.5 block truncate font-display text-[17px] font-extrabold tracking-tight">{title}</span>
      </span>
    </div>
  )
}
