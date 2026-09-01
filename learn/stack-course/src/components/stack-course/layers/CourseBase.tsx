import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ── COURSE BASE — the bottom bun. Enroll CTA + price. ───────────────────────

export type CourseBaseProps = {
  cta?: string
  price?: string
  onEnroll?: () => void
  note?: string
  className?: string
}

export function CourseBase({ cta = "Enroll now", price = "1 490 kr", onEnroll, note = "Lifetime access · 14-day guarantee", className }: CourseBaseProps) {
  return (
    <div className={cn("flex items-center gap-3 rounded-b-[16px] border-t border-border/60 bg-muted/40 px-5 py-4", className)}>
      <span className="font-display text-[19px] font-black tabular-nums">{price}</span>
      <Button type='button' onClick={onEnroll} className="ml-auto h-10 rounded-full bg-foreground px-5 text-[11px] font-black uppercase tracking-[0.14em] text-background transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" variant="default">
        {cta}
      </Button>
      <span className="sr-only">{note}</span>
      <span aria-hidden className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{note}</span>
    </div>
  )
}
