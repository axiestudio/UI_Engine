import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── LISTING BASE — the bottom bun. Book a viewing. ──────────────────────────

export type ListingBaseProps = {
  cta?: string
  onBook?: () => void
  secondary?: string
  className?: string
}

export function ListingBase({ cta = "Book a viewing", onBook, secondary = "Save", className }: ListingBaseProps) {
  return (
    <div className={cn("flex items-center gap-3 rounded-b-[16px] border-t border-border/60 bg-muted/40 px-5 py-4", className)}>
      <Button
        type="button"
        onClick={onBook}
        className="h-10 flex-1 rounded-full font-black uppercase tracking-[0.14em] transition-transform hover:-translate-y-0.5"
      >
        {cta}
      </button>
      <Button
        type="button"
        variant="outline"
        className="h-10 shrink-0 rounded-full px-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
      >
        {secondary}
      </button>
    </div>
  )
}
