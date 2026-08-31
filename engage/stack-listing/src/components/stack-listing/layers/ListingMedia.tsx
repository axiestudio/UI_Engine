import * as React from "react"
import { cn } from "@/lib/utils"

// ── LISTING MEDIA — the upper bun. Photo band + status badge. ───────────────

export type ListingMediaProps = {
  src?: string
  alt?: string
  badge?: string
  className?: string
}

export function ListingMedia({ src = "/showcase/content/content-04-architecture.webp", alt = "The property", badge = "Open house Sun 12–14", className }: ListingMediaProps) {
  return (
    <div className={cn("relative aspect-[16/9] w-full overflow-hidden", className)}>
      <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
      {badge && (
        <span className="absolute left-4 top-4 rounded-full bg-background px-3 py-1 font-mono text-[9px] font-black uppercase tracking-[0.16em] text-foreground shadow-md">
          {badge}
        </span>
      )}
    </div>
  )
}
