import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ── EVENT BASE — the bottom bun. RSVP with a real confirmed state. ──────────

export type EventBaseProps = {
  cta?: string
  confirmedCta?: string
  onRsvp?: () => void
  confirmed?: boolean
  note?: string
  className?: string
}

export function EventBase({ cta = "Save my seat", confirmedCta = "You're on the list", onRsvp, confirmed, note = "Free · members first", className }: EventBaseProps) {
  return (
    <div className={cn("flex items-center gap-3 rounded-b-[16px] border-t border-border/60 bg-muted/40 px-5 py-4", className)}>
      <Button type='button' onClick={onRsvp} aria-disabled={confirmed} className={cn(
          "flex h-11 items-center gap-2 rounded-full px-5 text-[11px] font-black uppercase tracking-[0.14em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          confirmed ? "cursor-default bg-primary/15 text-primary" : "bg-foreground text-background hover:-translate-y-0.5",
        )} variant="default">
        {confirmed && <Check className="size-3.5" strokeWidth={3} aria-hidden />}
        {confirmed ? confirmedCta : cta}
      </Button>
      <span className="ml-auto font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{note}</span>
    </div>
  )
}
