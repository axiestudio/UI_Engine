import * as React from "react"
import { cn } from "@/lib/utils"

// ── RECEIPT TOTAL — the double-ruled band. Nothing hides below it. ──────────

export type ReceiptTotalProps = {
  label?: string
  amount: string
  className?: string
}

export function ReceiptTotal({ label = "Total", amount, className }: ReceiptTotalProps) {
  return (
    <div className={cn("mx-6 mt-3 border-t-2 border-b-2 border-dashed border-border py-2.5", className)}>
      <div className="flex items-baseline justify-between font-mono">
        <span className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</span>
        <span className="text-[15px] font-black tabular-nums">{amount}</span>
      </div>
    </div>
  )
}
