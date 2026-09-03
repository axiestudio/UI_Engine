import * as React from "react"
import { cn } from "@/lib/utils"

// ── LETTUCE — the ruffle. A wavy band that reads as one leaf. ───────────────

export type LettuceProps = {
  label?: string
  className?: string
}

export function Lettuce({ label = "Crisp lettuce", className }: LettuceProps) {
  return (
    <div className={cn("relative h-5 w-full", className)} title={label}>
      <svg viewBox="0 0 400 20" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
        <path
          d="M0 8 Q 12 2 25 8 T 50 8 T 75 8 T 100 8 T 125 8 T 150 8 T 175 8 T 200 8 T 225 8 T 250 8 T 275 8 T 300 8 T 325 8 T 350 8 T 375 8 T 400 8 L 400 14 Q 388 20 375 14 T 350 14 T 325 14 T 300 14 T 275 14 T 250 14 T 225 14 T 200 14 T 175 14 T 150 14 T 125 14 T 100 14 T 75 14 T 50 14 T 25 14 T 0 14 Z"
          fill="hsl(var(--burger-lettuce))"
        />
      </svg>
    </div>
  )
}
