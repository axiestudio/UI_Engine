import * as React from "react"
import { cn } from "@/lib/utils"

// ── PROOF QUOTE — the meat. The words that carry the whole stack. ───────────

export type ProofQuoteProps = {
  children: React.ReactNode
  className?: string
}

export function ProofQuote({ children, className }: ProofQuoteProps) {
  return (
    <blockquote className={cn("relative px-6 pb-2 pt-6", className)}>
      <span aria-hidden className="pointer-events-none absolute -top-1 left-3 select-none font-serif text-[88px] leading-none text-primary/15">
        “
      </span>
      <p className="relative font-serif text-[19px] italic leading-relaxed sm:text-[21px]">{children}</p>
    </blockquote>
  )
}
