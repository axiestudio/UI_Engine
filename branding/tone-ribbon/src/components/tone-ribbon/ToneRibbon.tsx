import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { InfiniteSlider } from "@/components/primitives/infinite-slider"
import { TextShimmer } from "@/components/primitives/text-shimmer"

// ═══ JOB      let the brand voice run like a wire through the page
// ═══ EMOTION  a ticker of conviction — impossible to not read along
// ═══ SIGNATURE two counter-running ribbons of sayings; hover slows time;
//               every item ends with a rotated diamond tick
//   SITE      → between sections, manifesto strips
//   APP       → motivational/announce rails; items are strings
//   A11Y      reduce-motion = static wrapped row; duplicate rail aria-hidden

export type ToneRibbonProps = {
  sayings?: string[]
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

export function ToneRibbon({ sayings = DEFAULTS, className }: ToneRibbonProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const row = (items: string[], key: string, hidden = false) => (
    <div aria-hidden={hidden || undefined} className="flex items-center gap-10 py-4">
      {items.map((s, i) => (
        <span key={`${key}-${i}`} className="flex items-center gap-10 whitespace-nowrap">
          <span className="font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl">{s}</span>
          <span aria-hidden className="size-2 rotate-45 bg-foreground/60" />
        </span>
      ))}
    </div>
  )

  return (
    <section className={cn("relative isolate w-full overflow-hidden border-y bg-background py-6", className)}>
      <MonoLabel className="absolute left-1/2 top-2 z-10 -translate-x-1/2 bg-background px-3 text-muted-foreground" tick={false}>
        TONE · RUNNING RIBBON
      </MonoLabel>
      {reduce ? (
        <div className="mx-auto max-w-[1120px] flex-wrap justify-center px-6 [display:flex]">{row(sayings, "s")}</div>
      ) : (
        <>
          <InfiniteSlider duration={40} reverse className="mask-fade-x">
            {row(sayings, "a")}
          </InfiniteSlider>
          <InfiniteSlider duration={52} className="mask-fade-x">
            {row([...sayings].reverse(), "b", true)}
          </InfiniteSlider>
        </>
      )}
      <div className="mx-auto mt-2 max-w-[1120px] px-6">
        <TextShimmer className="text-center font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground" duration={3}>
          the voice runs even when the page stands still
        </TextShimmer>
      </div>
    </section>
  )
}
