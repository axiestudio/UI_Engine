import * as React from "react"
import { Check, Lock, PlayCircle } from "lucide-react"
import { cn } from "@/lib/utils"

// ── COURSE MODULE — one module row. The filling: repeat one per module. ─────

export type CourseModuleProps = {
  index: number
  title: string
  lessons?: number
  duration?: string
  state?: "done" | "active" | "locked"
  className?: string
}

export function CourseModule({ index, title, lessons = 4, duration = "42 min", state = "locked", className }: CourseModuleProps) {
  const mark =
    state === "done" ? (
      <Check className="size-3.5" strokeWidth={3} aria-hidden />
    ) : state === "active" ? (
      <PlayCircle className="size-3.5" aria-hidden />
    ) : (
      <Lock className="size-3" aria-hidden />
    )
  return (
    <div
      className={cn(
        "flex items-center gap-3.5 border-t border-border/50 px-5 py-3.5 first:border-t-0",
        state === "active" && "bg-primary/[0.05]",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-black tabular-nums",
          state === "done" && "border-primary bg-primary text-primary-foreground",
          state === "active" && "border-primary text-primary",
          state === "locked" && "border-border text-muted-foreground",
        )}
      >
        {mark}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-[13px] font-bold", state === "locked" && "text-muted-foreground")}>{title}</span>
        <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          module {String(index).padStart(2, "0")} · {lessons} lessons · {duration}
        </span>
      </span>
    </div>
  )
}
