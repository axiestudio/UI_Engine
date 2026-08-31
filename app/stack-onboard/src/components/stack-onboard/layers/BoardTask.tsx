import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

// ── BOARD TASK — one filling. Render one row per step; repeat freely. ───────

export type BoardTaskProps = {
  label: string
  hint?: string
  done?: boolean
  onToggle?: () => void
  className?: string
}

export function BoardTask({ label, hint, done, onToggle, className }: BoardTaskProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={!!done}
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-3 border-b border-app-line/50 px-5 py-3.5 text-left transition-colors last:border-b-0 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-md border transition-all",
          done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background",
        )}
      >
        {done && <Check className="size-3" strokeWidth={3.5} />}
      </span>
      <span className="min-w-0">
        <span className={cn("block truncate text-[13px] font-bold", done && "text-muted-foreground line-through decoration-border")}>{label}</span>
        {hint && <span className="block truncate text-[11px] font-medium text-muted-foreground">{hint}</span>}
      </span>
    </button>
  )
}
