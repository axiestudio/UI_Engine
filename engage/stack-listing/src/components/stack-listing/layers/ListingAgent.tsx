import * as React from "react"
import { cn } from "@/lib/utils"

// ── LISTING AGENT — the human layer. ────────────────────────────────────────

export type ListingAgentProps = {
  name: string
  firm?: string
  phone?: string
  className?: string
}

export function ListingAgent({ name, firm = "Mäklarhuset Väster", phone = "+46 709 93 48 93", className }: ListingAgentProps) {
  const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("")
  return (
    <div className={cn("flex items-center gap-3 border-t border-border/50 px-5 py-3.5", className)}>
      <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground font-mono text-[11px] font-black text-background">
        {initials}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-bold">{name}</span>
        <span className="block truncate font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{firm}</span>
      </span>
      <a href={`tel:${phone.replace(/\s/g, "")}`} className="ml-auto shrink-0 rounded-full border border-border px-3 py-1.5 font-mono text-[10px] font-bold tabular-nums transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {phone}
      </a>
    </div>
  )
}
