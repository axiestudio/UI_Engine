import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { TextLoop } from "@/components/primitives/text-loop"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Quote rotator — a single testimonial slot that cycles quotes.
// ═══ EMOTION     A chorus, uninterrupted.
// ═══ SIGNATURE   TextLoop rotating between testimo nials on a timer.

export type RotatingQuote = { id: string; quote: string; name?: string; role?: string }

export type MiscQuoteRotatorProps = {
  eyebrow?: string
  title?: React.ReactNode
  quotes: RotatingQuote[]
  interval?: number
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_QUOTES = [
  { id: "q1", quote: "They argued with us about the drawer pulls. We were wrong.", name: "Elin H.", role: "Client since 2019" },
  { id: "q2", quote: "The bench arrived early and better than the drawing.", name: "Jonas R.", role: "Head chef" },
  { id: "q3", quote: "Five years in, it looks like it was made yesterday.", name: "Marta L.", role: "Studio owner" },
]
export function MiscQuoteRotator({ eyebrow = "WORDS", title = "What clients keep saying.", quotes = DEFAULT_QUOTES, interval = 3800, tone = "paper", className }: MiscQuoteRotatorProps) {
  const ink = tone === "ink"
  const [idx, setIdx] = React.useState(0)
  const q = quotes[Math.min(idx, quotes.length - 1)]
  return (
    <SectionShell tone={tone} width={920} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
      </InView>
      <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}>
        <div className="mt-10 min-h-[180px] text-center">
          <blockquote className="relative">
            <TextLoop
              interval={interval / 1000}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onIndexChange={setIdx}
              className="block"
            >
              {quotes.map((quote) => (
                <p key={quote.id} className={cn("font-display text-2xl font-bold leading-[1.2] tracking-[-0.02em] sm:text-3xl", ink ? "text-background" : "text-foreground")}>“{quote.quote}”</p>
              ))}
            </TextLoop>
          </blockquote>
          <p className={cn("mt-5 font-mono text-[11px] font-bold uppercase tracking-[0.25em]", ink ? "text-background/60" : "text-muted-foreground")}>
            {q.name}{q.role ? ` · ${q.role}` : ""}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            {quotes.map((quote, i) => (
              <span key={quote.id} className={cn("h-1.5 rounded-full transition-all", i === idx ? "w-6 bg-foreground" : "w-1.5 bg-muted-foreground/40")} />
            ))}
          </div>
        </div>
      </InView>
    </SectionShell>
  )
}
