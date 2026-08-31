import * as React from "react"
import { Star } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Proof quote — one strong testimonial anchored with stars.
// ═══ EMOTION     Single, memorable voice.
// ═══ SIGNATURE   A large centered quote + rating + attributed badge.

export type ProofQuoteProps = {
  quote?: React.ReactNode
  name?: string
  role?: string
  rating?: number
  tone?: "paper" | "ink"
  className?: string
}

export function ProofQuote({
  quote = "We rebuilt our entire marketing site in a weekend, and it looks like we hired a studio.",
  name = "Dana Reyes",
  role = "VP Marketing, Loopline",
  rating = 5,
  tone = "paper",
  className,
}: ProofQuoteProps) {
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={920} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <figure className="text-center">
          <div className="flex justify-center gap-1 text-amber-400">{Array.from({ length: rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
          <blockquote className="mt-5">
            <p className={cn("font-display text-2xl font-black leading-[1.15] tracking-[-0.02em] sm:text-4xl")}>“{quote}”</p>
          </blockquote>
          <figcaption className="mt-6">
            <span className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest", ink ? "border-background/25 text-background/75" : "border-border text-foreground")}>
              {name}
              <span className={cn("opacity-50", ink ? "text-background/45" : "text-muted-foreground")}>· {role}</span>
            </span>
          </figcaption>
        </figure>
      </InView>
    </SectionShell>
  )
}
