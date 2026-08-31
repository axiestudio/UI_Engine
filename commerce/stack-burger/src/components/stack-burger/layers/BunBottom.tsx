import * as React from "react"
import { cn } from "@/lib/utils"

// ── BUN BOTTOM — the base. Flat, slightly tapered, holds everything. ────────

export type BunBottomProps = {
  label?: string
  className?: string
}

export function BunBottom({ label = "Toasted base", className }: BunBottomProps) {
  return (
    <div className={cn("relative h-8 w-full", className)} title={label}>
      <div className="absolute inset-x-1.5 top-0 h-7 rounded-b-[20px] rounded-t-[6px] bg-[#e0a350] shadow-[inset_0_5px_0_0_#c9883a]" />
    </div>
  )
}
