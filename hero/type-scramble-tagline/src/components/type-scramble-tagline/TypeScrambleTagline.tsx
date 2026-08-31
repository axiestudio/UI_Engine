import * as React from "react"
import { motion } from "motion/react"
import { TextScramble } from "@/components/primitives/text-scramble"
import { InView } from "@/components/primitives/in-view"
import { MonoLabel } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Scramble tagline — a tagline that types in as scrambled characters.
// ═══ EMOTION     Decoding a message.
// ═══ SIGNATURE   Scramble-to-resolve tagline under a bold kicker.

export type TypeScrambleTaglineProps = {
  eyebrow?: string
  kicker?: string
  tagline?: string
  className?: string
}

export function TypeScrambleTagline({ eyebrow = "DECODE", kicker = "SHIP FASTER", tagline = "Sections composed as sentences, shipped as tokens.", className }: TypeScrambleTaglineProps) {
  return (
    <section className={cn("relative isolate overflow-hidden bg-foreground py-24 text-background sm:py-32", className)}>
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <MonoLabel className="text-background/55">{eyebrow}</MonoLabel>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
          <h1 className="mt-5 font-display text-5xl font-black tracking-[-0.035em] sm:text-7xl">{kicker}</h1>
        </InView>
        <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
          <p className="mt-4 font-mono text-base font-bold text-background/80 sm:text-lg">
            <TextScramble trigger duration={1.4}>{`> ${tagline}`}</TextScramble>
          </p>
        </InView>
        <motion.div aria-hidden className="mt-8 h-px w-40 bg-[hsl(var(--primary))]" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }} />
      </div>
    </section>
  )
}
