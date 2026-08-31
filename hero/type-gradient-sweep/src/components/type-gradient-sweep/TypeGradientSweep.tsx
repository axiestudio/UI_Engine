import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { TextShimmer } from "@/components/primitives/text-shimmer"
import { MonoLabel } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Gradient sweep — shimmering mask text where a highlight sweeps across.
// ═══ EMOTION     Irresistible, premium.
// ═══ SIGNATURE   TextShimmer in a frozen gradient mask.

export type TypeGradientSweepProps = {
  eyebrow?: string
  word?: string
  subtitle?: string
  tone?: "paper" | "ink"
  className?: string
}

export function TypeGradientSweep({ eyebrow = "SWEEP", word = "Effortless.", subtitle = "A highlight sweeps across the word — a shimmer you can set on any brand color.", tone = "paper", className }: TypeGradientSweepProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate overflow-hidden py-20 sm:py-28", ink && "bg-foreground text-background", className)}>
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <MonoLabel className={cn(ink ? "text-background/55" : "text-muted-foreground", "justify-center")}>{eyebrow}</MonoLabel>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
          <h1 className={cn("gradient-text mt-6 font-display text-6xl font-black tracking-tight sm:text-8xl", ink ? "bg-clip-text text-transparent" : "")}>
            <TextShimmer as="span" duration={2.2} spread={0.6} className={cn("bg-clip-text text-transparent", ink ? "bg-gradient-to-r from-background via-[hsl(var(--site-accent))] to-background" : "bg-gradient-to-r from-foreground via-[hsl(var(--site-accent))] to-foreground")}>
              {word}
            </TextShimmer>
          </h1>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}>
          <p className={cn("mx-auto mt-6 max-w-xl text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{subtitle}</p>
        </InView>
      </div>
    </section>
  )
}
