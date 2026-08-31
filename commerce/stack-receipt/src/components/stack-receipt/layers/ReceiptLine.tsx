import * as React from "react"
import { cn } from "@/lib/utils"

// ── RECEIPT LINE — one filling. Render one row per item; repeat freely. ─────

export type ReceiptLineProps = {
  qty?: string | number
  item: string
  price: string
  note?: string
  className?: string
}

export function ReceiptLine({ qty = 1, item, price, note, className }: ReceiptLineProps) {
  return (
    <div className={cn("flex items-baseline gap-2 px-6 py-1.5 font-mono text-[12px] font-medium", className)}>
      <span className="w-6 shrink-0 text-right tabular-nums text-muted-foreground">{qty}×</span>
      <span className="min-w-0">
        <span className="font-sans text-[13px] font-bold">{item}</span>
        {note && <span className="block text-[10px] font-medium text-muted-foreground">{note}</span>}
      </span>
      <span aria-hidden className="mx-1 min-w-4 flex-1 border-b border-dashed border-border/80" />
      <span className="shrink-0 tabular-nums">{price}</span>
    </div>
  )
}
