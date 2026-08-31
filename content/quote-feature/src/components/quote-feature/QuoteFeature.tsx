import * as React from "react"
import { TextLoop } from "@/components/primitives/text-loop"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ── Design language ──────────────────────────────────────────────────────────
// JOB: one real sentence of praise, given the whole room. The wall of
//   testimonials scrolls past; THIS one stops you.
// EMOTION: sincerity, and the pride of being able to show it.
// SIGNATURE MOVE: the quote mark as architecture — an oversized display
//   “ (~40vmin) sits behind the type like a stone slab; the sentence drifts
//   across its edge as if it doesn't need permission. Below: a slow mono
//   TextLoop cycling the voices the one quote was chosen from.
// ────────────────────────────────────────────────────────────────────────────

export type QuoteFeatureProps = {
  quote: string
  /** Primary attribution shown under the quote. */
  author: string
  role?: string
  /** Additional voices the quote was chosen from — slow roll, reduced-motion takes the first. */
  alsoFrom?: string[]
  /** Optional deep link into the full reviews wall. */
  moreLink?: { label: string; href: string }
  /** Seconds per rotation. Default 3.5. */
  interval?: number
  className?: string
}

export function QuoteFeature({ quote, author, role, alsoFrom = [], moreLink, interval = 3.5, className }: QuoteFeatureProps) {
  const voices = React.useMemo(() => [`${author}${role ? ` · ${role}` : ""}`, ...alsoFrom], [author, role, alsoFrom])
  return (
    <section className={cn("relative w-full overflow-hidden bg-background text-foreground", className)} aria-label="A word from a guest">
      <InView
        variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        viewOptions={{ once: true, margin: "-80px" }}
      >
        <div className="relative mx-auto w-full max-w-[900px] px-4 py-24 sm:px-6 lg:py-32">
          {/* architecture glyph */}
          <span aria-hidden className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 select-none font-display text-[34vw] font-bold leading-none text-foreground/[0.05] sm:text-[220px] lg:text-[300px]">
            “
          </span>

          <figure className="relative">
            <blockquote className="mx-auto max-w-[640px] text-center">
              <p className="font-display text-[26px] font-bold leading-[1.22] tracking-tight sm:text-[34px]">{quote}</p>
            </blockquote>
            <figcaption className="mt-8 text-center">
              {voices.length > 1 ? (
                <TextLoop interval={interval} className="justify-center font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                  {voices.map((v) => (
                    <span key={v}>{v}</span>
                  ))}
                </TextLoop>
              ) : (
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{voices[0]}</p>
              )}
              {moreLink && (
                <a href={moreLink.href} className="mt-3 inline-block text-xs font-bold underline-offset-4 hover:underline">
                  {moreLink.label}
                </a>
              )}
            </figcaption>
          </figure>
        </div>
      </InView>
    </section>
  )
}
