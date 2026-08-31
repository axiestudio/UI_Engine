import * as React from "react"
import { cn } from "@/lib/utils"

// ── RECEIPT HEAD — the upper bun. Shop band + mono meta. ────────────────────

export type ReceiptHeadProps = {
  shop: string
  meta?: string
  className?: string
}

export function ReceiptHead({ shop, meta = "ORDER 4812", className }: ReceiptHeadProps) {
  return (
    <div className={cn("px-6 pb-4 pt-5 text-center", className)}>
      <p className="font-display text-[16px] font-black uppercase tracking-[0.12em]">{shop}</p>
      <p className="mt-1 font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-muted-foreground">{meta}</p>
    </div>
  )
}
