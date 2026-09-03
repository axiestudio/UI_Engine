import * as React from "react"
import { cn } from "@/lib/utils"

// ── PATTY — the meat. Thick, charred, grill-marked. ─────────────────────────

export type PattyProps = {
  label?: string
  className?: string
}

export function Patty({ label = "Flame-grilled patty", className }: PattyProps) {
  return (
    <div className={cn("relative h-7 w-full", className)} title={label}>
      <div className="absolute inset-x-0.5 inset-y-0 rounded-[12px] bg-burger-patty shadow-[inset_0_-4px_0_0_hsl(var(--burger-patty-shade))]" />
      <div
        aria-hidden
        className="absolute inset-x-2 top-1/2 h-[3px] -translate-y-1/2 opacity-50 [background-image:repeating-linear-gradient(90deg,hsl(var(--burger-patty-shade))_0,hsl(var(--burger-patty-shade))_5px,transparent_5px,transparent_14px)]"
      />
    </div>
  )
}
