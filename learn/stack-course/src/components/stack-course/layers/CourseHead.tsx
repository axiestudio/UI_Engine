import * as React from "react"
import { cn } from "@/lib/utils"

// ── COURSE HEAD — the upper bun. Course + instructor band. ──────────────────

export type CourseHeadProps = {
  title: string
  instructor?: string
  level?: string
  className?: string
}

export function CourseHead({ title, instructor = "Klara Lindqvist", level = "Beginner friendly", className }: CourseHeadProps) {
  return (
    <div className={cn("rounded-t-[16px] bg-foreground px-5 py-4 text-background", className)}>
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] opacity-60">{level} · taught by {instructor}</p>
      <h3 className="mt-1 font-display text-[19px] font-extrabold leading-snug tracking-tight">{title}</h3>
    </div>
  )
}
