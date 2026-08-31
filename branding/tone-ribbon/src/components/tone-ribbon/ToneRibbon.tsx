import * as React from "react"
import { useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { InfiniteSlider } from "@/components/primitives/infinite-slider"
import { TextShimmer } from "@/components/primitives/text-shimmer"

// ═══ JOB      let the brand voice run like a wire through the page
// ═══ EMOTION  a ticker of conviction — impossible to not read along
// ═══ SIGNATURE two counter-running ribbons of sayings; hovering slows the
//               top ribbon to a near-stop so a line can be read; every item
//               ends on a rotated diamond tick
//   SITE      → between sections, manifesto strips
//   APP       → announcement rails; items are strings
//   BUILD     vendored InfiniteSlider (reverse + speedOnHover) with the real
//             edge-dissolve mask now defined locally (was referenced as a
//             missing `mask-fade-x` utility); no emoji diamonds, no fake classes
//   A11Y      reduce-motion collapses to one static wrapped row; duplicate
//             ribbon is aria-hidden; MonoLabel kept but not duplicated to AT

export type ToneRibbonProps = {
  sayings?: string[]
  /** Heading label shown on the rail. Default "TONE · RUNNING RIBBON". */
  label?: string
  className?: string
}

const DEFAULTS = [
  "Say the true thing",
  "Ship the small thing",
  "Show the receipts",
  "Answer like a human",
  "Cut the adjectives",
  "Sign your work",
]

const FADE =
  "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"

export function ToneRibbon({ sayings = DEFAULTS, label = "TONE · RUNNING RIBBON", className }: ToneRibbonProps) {
  const reduced = useReducedMotion()
  const row = (items: string[], key: string, hidden = false) => (
    <div aria-hidden={hidden || undefined} className="flex items-center gap-10 py-4">
      {items.map((s, i) => (
        <span key={`${key}-${i}`} className="flex items-center gap-10 whitespace-nowrap">
          <span className="font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl">{s}</span>
          <span aria-hidden className="size-2 shrink-0 rotate-45 bg-foreground/60" />
        </span>
      ))}
    </div>
  )

  return (
    <section className={cn("relative isolate w-full overflow-hidden border-y bg-background py-6", className)}>
      <MonoLabel tick={false} className="absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded-full bg-background px-3 text-muted-foreground">
        {label}
      </MonoLabel>
      {reduced ? (
        <div className="mx-auto flex max-w-[1120px] flex-wrap justify-center px-6">{row(sayings, "s")}</div>
      ) : (
        <div className={cn("overflow-hidden", FADE)}>
          <InfiniteSlider speed={40} speedOnHover={6} reverse>
            {row(sayings, "a")}
          </InfiniteSlider>
          <InfiniteSlider speed={30} speedOnHover={5}>
            {row([...sayings].reverse(), "b", true)}
          </InfiniteSlider>
        </div>
      )}
      <div className="mx-auto mt-2 max-w-[1120px] px-6">
        <TextShimmer duration={3} className="text-center font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
          the voice runs even when the page stands still
        </TextShimmer>
      </div>
    </section>
  )
}
