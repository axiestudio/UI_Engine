import * as React from "react"
import { cn } from "@/lib/utils"

// ── PROOF HEAD — the upper bun. Brand band above the quote. ─────────────────

export type ProofHeadProps = {
  brand: string
  label?: string
  className?: string
}

export function ProofHead({ brand, label = "Case proof", className }: ProofHeadProps) {
  return (
    <div className={cn("flex items-center justify-between rounded-t-[16px] border-b border-border/60 bg-muted/60 px-6 py-3.5", className)}>
      <span className="font-display text-[13px] font-extrabold uppercase tracking-[0.14em]">{brand}</span>
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{label}</span>
    </div>
  )
}
