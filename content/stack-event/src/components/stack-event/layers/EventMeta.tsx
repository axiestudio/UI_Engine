import * as React from "react"
import { Clock, MapPin, Users } from "lucide-react"
import { cn } from "@/lib/utils"

// ── EVENT META — the where/when band under the head. ────────────────────────

export type EventMetaProps = {
  venue?: string
  time?: string
  seats?: string
  className?: string
}

export function EventMeta({ venue = "South House, Studio Floor", time = "18:00 – 21:00", seats = "40 seats", className }: EventMetaProps) {
  const rows = [
    { icon: MapPin, text: venue },
    { icon: Clock, text: time },
    { icon: Users, text: seats },
  ]
  return (
    <div className={cn("grid grid-cols-1 divide-y divide-border/60 border-b border-border/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0", className)}>
      {rows.map(({ icon: Icon, text }) => (
        <span key={text} className="flex items-center gap-2 px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          <Icon className="size-3.5 shrink-0 text-primary" aria-hidden />
          <span className="truncate">{text}</span>
        </span>
      ))}
    </div>
  )
}
