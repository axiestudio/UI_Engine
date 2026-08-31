import * as React from "react"
import { Bath, BedDouble, Ruler } from "lucide-react"
import { cn } from "@/lib/utils"

// ── LISTING FACTS — the beds/baths/size band. ───────────────────────────────

export type ListingFactsProps = {
  beds?: string
  baths?: string
  size?: string
  className?: string
}

export function ListingFacts({ beds = "4 rooms", baths = "2 baths", size = "118 m²", className }: ListingFactsProps) {
  const facts = [
    { icon: BedDouble, text: beds },
    { icon: Bath, text: baths },
    { icon: Ruler, text: size },
  ]
  return (
    <div className={cn("grid grid-cols-3 divide-x divide-border/60 border-y border-border/60", className)}>
      {facts.map(({ icon: Icon, text }) => (
        <span key={text} className="flex items-center justify-center gap-2 px-3 py-2.5 text-[12px] font-bold">
          <Icon className="size-3.5 text-primary" aria-hidden />
          {text}
        </span>
      ))}
    </div>
  )
}
