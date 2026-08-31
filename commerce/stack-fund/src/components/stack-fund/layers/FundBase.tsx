import * as React from "react"
import { cn } from "@/lib/utils"

// ── FUND BASE — the bottom bun. The CTA reads your selected tier. ───────────

export type FundBaseProps = {
  cta?: string
  amount?: string | null
  onBack?: () => void
  note?: string
  className?: string
}

export function FundBase({ cta = "Back this project", amount, onBack, note = "Charged only if funded", className }: FundBaseProps) {
  return (
    <div className={cn("flex items-center gap-3 rounded-b-[16px] border-t border-border/60 bg-muted/40 px-5 py-4", className)}>
      <button
        type="button"
        onClick={onBack}
        className="flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-[11px] font-black uppercase tracking-[0.14em] text-background transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {cta}
        {amount && <span aria-hidden className="rounded-full bg-background/20 px-2 py-0.5 font-mono text-[10px]">{amount}</span>}
      </button>
      <span className="ml-auto font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{note}</span>
    </div>
  )
}
