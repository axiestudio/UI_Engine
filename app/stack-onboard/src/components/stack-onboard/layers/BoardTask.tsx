import * as React from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
    <Button
      type="button"
      role="checkbox"
      aria-checked={!!done}
      onClick={onToggle}
      variant="ghost"
      className={cn(
        "flex w-full items-center gap-3 border-b border-app-line/50 py-3.5 text-left transition-colors last:border-b-0 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring rounded-none justify-start h-auto font-normal px-5",
        className,
      )}
    >
      <Checkbox checked={!!done} tabIndex={-1} className="pointer-events-none size-5 shrink-0 rounded-md border-border bg-background data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
      <span className="min-w-0">
        <span className={cn("block truncate text-[13px] font-bold", done && "text-muted-foreground line-through decoration-border")}>{label}</span>
        {hint && <span className="block truncate text-[11px] font-medium text-muted-foreground">{hint}</span>}
      </span>
    </Button>
  )
}
