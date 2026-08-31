import * as React from "react"
import { cn } from "@/lib/utils"

// ── PROOF BASE — the bottom bun. Sign-off rule + source stamp. ──────────────

export type ProofBaseProps = {
  source?: string
  className?: string
}

export function ProofBase({ source = "Verified engagement", className }: ProofBaseProps) {
  return (
    <div className={cn("flex items-center justify-between rounded-b-[16px] border-t border-border/60 bg-muted/40 px-6 py-3", className)}>
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{source}</span>
      <span aria-hidden className="text-[10px] text-muted-foreground">◆</span>
    </div>
  )
}
