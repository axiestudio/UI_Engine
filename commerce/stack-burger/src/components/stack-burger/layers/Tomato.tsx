import * as React from "react"
import { cn } from "@/lib/utils"

// ── TOMATO — the slice band. Round-edged red with seed dots. ────────────────

export type TomatoProps = {
  label?: string
  className?: string
}

export function Tomato({ label = "Heirloom tomato", className }: TomatoProps) {
  return (
    <div className={cn("relative h-4 w-full", className)} title={label}>
      <div className="absolute inset-x-1.5 inset-y-0 rounded-full bg-burger-tomato" />
      {["12%", "30%", "48%", "66%", "84%"].map((left) => (
        <span key={left} className="absolute top-1/2 h-[5px] w-[5px] -translate-y-1/2 rounded-full bg-burger-tomato-seed" style={{ left }} />
      ))}
    </div>
  )
}
