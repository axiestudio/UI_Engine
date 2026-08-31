import * as React from "react"
import { cn } from "@/lib/utils"

// ── PROOF PERSON — the second filling. Who said it. ─────────────────────────

export type ProofPersonProps = {
  name: string
  role: string
  initials?: string
  className?: string
}

export function ProofPerson({ name, role, initials, className }: ProofPersonProps) {
  const mark = initials ?? name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("")
  return (
    <div className={cn("flex items-center gap-3 border-t border-border/60 px-6 py-4", className)}>
      <span aria-hidden className="flex size-10 items-center justify-center rounded-full bg-foreground font-mono text-[12px] font-black text-background">
        {mark}
      </span>
      <span>
        <span className="block text-[13px] font-bold">{name}</span>
        <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{role}</span>
      </span>
    </div>
  )
}
