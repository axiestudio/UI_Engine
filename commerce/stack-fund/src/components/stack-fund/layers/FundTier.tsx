import * as React from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── FUND TIER — one backer tier. The filling: repeat one per reward. ────────

export type FundTierProps = {
  amount: string
  name: string
  perks: string
  left?: string
  selected?: boolean
  onSelect?: () => void
  soldOut?: boolean
  className?: string
}

export function FundTier({ amount, name, perks, left, selected, onSelect, soldOut, className }: FundTierProps) {
  return (
    <Button
      type="button"
      role="radio"
      variant="ghost"
      size="lg"
      aria-checked={!!selected}
      disabled={soldOut}
      onClick={onSelect}
      className={cn(
        "relative h-auto w-full justify-start border-t border-border/50 px-5 py-3.5 text-left first:border-t-0",
        soldOut && "cursor-not-allowed opacity-45",
        !soldOut && "hover:bg-muted/50",
        selected && "bg-primary/[0.06]",
        className,
      )}
    >
      <span className="flex items-center gap-3">
        <span
          aria-hidden
          className={cn(
            "flex size-4.5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            selected ? "border-primary bg-primary" : "border-border",
          )}
          style={{ width: 18, height: 18 }}
        >
          {selected && <Check className="size-2.5 text-primary-foreground" strokeWidth={4} />}
        </span>
        <span className="font-display text-[16px] font-black tabular-nums">{amount}</span>
        <span className="text-[13px] font-bold">{name}</span>
        {left && (
          <span className={cn("ml-auto font-mono text-[9px] font-bold uppercase tracking-[0.14em]", soldOut ? "text-muted-foreground" : "text-primary")}>
            {soldOut ? "gone" : `${left} left`}
          </span>
        )}
      </span>
      <span className="mt-1 block pl-[30px] text-[12px] font-medium leading-relaxed text-muted-foreground">{perks}</span>
    </Button>
  )
}
