import * as React from "react"
import { cn } from "@/lib/utils"

// ── JOB HEAD — the upper bun. Title + salary band. ──────────────────────────

export type JobHeadProps = {
  title: string
  salary?: string
  team?: string
  className?: string
}

export function JobHead({ title, salary = "42 000 – 51 000 kr / month", team = "The Floor Team", className }: JobHeadProps) {
  return (
    <div className={cn("rounded-t-[16px] bg-foreground px-5 py-4 text-background", className)}>
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] opacity-60">{team}</p>
      <h3 className="mt-1 font-display text-[19px] font-extrabold tracking-tight">{title}</h3>
      <p className="mt-1.5 inline-block rounded-full border border-background/25 px-2.5 py-0.5 font-mono text-[10px] font-bold tabular-nums">
        {salary}
      </p>
    </div>
  )
}
