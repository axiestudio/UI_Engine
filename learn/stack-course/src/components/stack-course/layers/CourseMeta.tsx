import * as React from "react"
import { cn } from "@/lib/utils"

// ── COURSE META — the honest-numbers band. ──────────────────────────────────

export type CourseMetaProps = {
  modules?: string
  lessons?: string
  duration?: string
  className?: string
}

export function CourseMeta({ modules = "6 modules", lessons = "24 lessons", duration = "4 h 20 m", className }: CourseMetaProps) {
  const cells = [modules, lessons, duration]
  return (
    <div className={cn("grid grid-cols-3 divide-x divide-border/60 border-b border-border/60", className)}>
      {cells.map((c) => (
        <span key={c} className="px-4 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          {c}
        </span>
      ))}
    </div>
  )
}
