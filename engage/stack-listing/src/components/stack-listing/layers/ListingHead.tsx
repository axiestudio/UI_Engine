import * as React from "react"
import { cn } from "@/lib/utils"

// ── LISTING HEAD — the price + address band. The meat. ──────────────────────

export type ListingHeadProps = {
  price: string
  address: string
  area?: string
  className?: string
}

export function ListingHead({ price, address, area = "Väster", className }: ListingHeadProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4 px-5 pb-3.5 pt-4", className)}>
      <span>
        <span className="block font-display text-[26px] font-black leading-none tracking-tight tabular-nums">{price}</span>
        <span className="mt-1 block truncate text-[13px] font-bold">{address}</span>
      </span>
      <span className="shrink-0 rounded-full border border-border px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {area}
      </span>
    </div>
  )
}
