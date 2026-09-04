import * as React from "react"
import { Marquee } from "@/components/watermelon/marquee"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ── Design language ──────────────────────────────────────────────────────────
// JOB: give an address meaning — "we are OF this street", rooted not located.
// EMOTION: local pride; a corner-shop confidence, zero corporate gloss.
// SIGNATURE MOVE: the street name itself is the landmark — a single oversized
//   display line on an infinite slow ribbon, reading like a hand-painted
//   fascia. Below it, a hairline ledger of neighbourhood facts.
// TYPE: 16vw-ish marquee display caps + tracking-tight; mono facts ledger.
// RHYTHM: ribbon (loud) → 1px rule → whisper facts (quiet). Texture: paper.
// MOVEMENT: only the ribbon moves, 55s per loop, pause on hover/focus.
// ─────────────────────────────────────────────────────────────────────────────

export type PlaceFact = { label: string; value: string }

export type PlaceProps = {
  /** The landmark line — goes on the marquee as-is (e.g. "TRÄDGÅRDSGATAN 12"). */
  landmark?: string
  /** Word(s) between repeats on the ribbon. Default "·". */
  separator?: string
  story?: string
  facts?: PlaceFact[]
  /** Ribbon tempo. Default "gentle". */
  speed?: "gentle" | "walking" | "brisk"
  reverse?: boolean
  className?: string
}


// Self-demo defaults: bare mount (= tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_PLACE_LANDMARK = "TR\u00c4DG\u00c5RDSGATAN 12"

export function Place({ landmark = DEMO_PLACE_LANDMARK, separator = "·", story, facts = [], speed = "gentle", reverse = false, className }: PlaceProps) {
  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-background text-foreground", className)} aria-label={`${landmark} — our address`}>
      {/* ribbon landmark */}
      <InView variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-60px" }}>
        <div aria-hidden className="border-y border-border py-3 sm:py-4">
          <Marquee reverse={reverse} pauseOnHover speed={speed === "gentle" ? "slow" : speed === "walking" ? "normal" : "fast"}>
            {Array.from({ length: 4 }, (_, i) => (
              <span
                key={i}
                className="font-display text-[13vw] font-black leading-[0.85] tracking-[-0.05em] whitespace-nowrap text-foreground/90 sm:text-[9vw] lg:text-[120px]"
              >
                {landmark} <span className="mx-6 text-foreground/25 sm:mx-10">{separator}</span>
              </span>
            ))}
          </Marquee>
        </div>

        <div className="mx-auto w-full max-w-[980px] px-4 py-14 sm:px-6 lg:px-8">
          {story && (
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">The corner we keep</p>
              <p className="mt-4 font-display text-lg font-medium leading-relaxed tracking-tight text-foreground/90 sm:text-xl">{story}</p>
            </div>
          )}

          {facts.length > 0 && (
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-8 lg:grid-cols-4">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{f.label}</dt>
                  <dd className="mt-1.5 font-display text-[17px] font-extrabold leading-snug tracking-tight">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </InView>
    </section>
  )
}
