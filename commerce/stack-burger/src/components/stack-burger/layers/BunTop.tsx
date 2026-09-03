import * as React from "react"
import { cn } from "@/lib/utils"

// ── BUN TOP — the upper bun. Owns the dome silhouette. ─────────────────────
// Ingredient colors are CONTENT data (like product swatches), deliberately
// fixed — the lettuce is green in every theme; the layout stays token-driven.

export type BunTopProps = {
  label?: string
  className?: string
}

export function BunTop({ label = "Sesame brioche", className }: BunTopProps) {
  return (
    <div className={cn("relative h-11 w-full", className)} title={label}>
      <div className="absolute inset-x-1 top-0 h-[38px] rounded-t-[48px] rounded-b-[10px] bg-burger-bun-top shadow-[inset_0_-6px_0_0_hsl(var(--burger-bun-shade))]" />
      {/* sesame */}
      {[
        "left-[16%] top-[9px] -rotate-12", "left-[30%] top-[5px] rotate-6", "left-[45%] top-[8px] -rotate-3",
        "left-[60%] top-[5px] rotate-12", "left-[74%] top-[9px] -rotate-6", "left-[86%] top-[13px] rotate-3",
      ].map((pos) => (
        <span key={pos} className={cn("absolute h-[7px] w-[11px] rounded-[50%] bg-burger-bun-highlight", pos)} />
      ))}
    </div>
  )
}
