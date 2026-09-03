import * as React from "react"
import { cn } from "@/lib/utils"

// ── CHEESE — the melt. A band whose corners droop over the layer below. ─────

export type CheeseProps = {
  label?: string
  className?: string
}

export function Cheese({ label = "Melted cheddar", className }: CheeseProps) {
  return (
    <div className={cn("relative h-6 w-full", className)} title={label}>
      <div
        className="absolute inset-x-1 top-0 h-3 rounded-[4px] bg-burger-cheese"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 55%, 92% 100%, 84% 55%, 72% 100%, 60% 55%, 48% 100%, 36% 55%, 24% 100%, 12% 55%, 4% 100%, 0 55%)" }}
      />
    </div>
  )
}
