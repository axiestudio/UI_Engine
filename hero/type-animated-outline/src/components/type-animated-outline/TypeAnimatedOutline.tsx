import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { TextShimmerWave } from "@/components/primitives/text-shimmer-wave"
import { MonoLabel } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Animated outline — a word rendered as waves of shimmering stroke.
// ═══ EMOTION     Kinetic, liquid type.
// ═══ SIGNATURE   TextShimmerWave drawing an outlined word that undulates.

export type TypeAnimatedOutlineProps = {
  eyebrow?: string
  word?: string
  subtitle?: string
  tone?: "paper" | "ink"
  className?: string
}

export function TypeAnimatedOutline({ eyebrow = "LIQUID", word = "UNDULATE", subtitle = "A word drawn as a wave — each glyph shimmers as it passes.", tone = "paper", className }: TypeAnimatedOutlineProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate overflow-hidden py-20 sm:py-28", ink && "bg-foreground text-background", className)}>
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <MonoLabel className={cn(ink ? "text-background/55" : "text-muted-foreground", "justify-center")}>{eyebrow}</MonoLabel>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
          <TextShimmerWave
            as="h1"
            duration={1.6}
            zDistance={50}
            xDistance={-2}
            yDistance={-6}
            className={cn("mt-6 font-display text-6xl font-black uppercase tracking-tight sm:text-8xl", "text-transparent", ink ? "[-webkit-text-stroke:2px_hsl(var(--background)/0.9)]" : "[-webkit-text-stroke:2px_hsl(var(--foreground)/0.9)]")}
          >
            {word}
          </TextShimmerWave>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}>
          <p className={cn("mx-auto mt-6 max-w-xl text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{subtitle}</p>
        </InView>
      </div>
    </section>
  )
}
