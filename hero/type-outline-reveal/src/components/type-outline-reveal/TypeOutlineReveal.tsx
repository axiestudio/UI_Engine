import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { TextShimmerWave } from "@/components/primitives/text-shimmer-wave"
import { MonoLabel } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Outline reveal — a stroked word that fills from stroke to solid.
// ═══ EMOTION     Editorial drama.
// ═══ SIGNATURE   An outlined word whose glyph wave shimmers; a fill layer fades in behind.

export type TypeOutlineRevealProps = {
  eyebrow?: string
  word?: string
  subtitle?: string
  className?: string
}

export function TypeOutlineReveal({ eyebrow = "OUTLINE", word = "FOCUS", subtitle = "The word is drawn as an outline, then slowly fills.", className }: TypeOutlineRevealProps) {
  return (
    <section className={cn("relative isolate overflow-hidden py-24 sm:py-32", className)}>
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <MonoLabel className="justify-center text-muted-foreground">{eyebrow}</MonoLabel>
        </InView>
        <div className="relative mt-6">
          {/* solid fill fading in */}
          <motion.h1 aria-hidden className="absolute inset-0 font-display text-[19vw] font-black leading-[0.82] tracking-[-0.05em] text-foreground sm:text-[14vw]"
            initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} transition={{ duration: 1.4, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            {word}
          </motion.h1>
          {/* stroke wave on top */}
          <TextShimmerWave as="h1" duration={1.8} zDistance={26} xDistance={-1} yDistance={-4}
            className={cn("relative font-display text-[19vw] font-black leading-[0.82] tracking-[-0.05em] text-transparent", "[-webkit-text-stroke:2px_hsl(var(--foreground))]")}>
            {word}
          </TextShimmerWave>
        </div>
        <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}>
          <p className="mx-auto mt-8 max-w-xl text-base font-medium leading-relaxed text-muted-foreground">{subtitle}</p>
        </InView>
      </div>
    </section>
  )
}
