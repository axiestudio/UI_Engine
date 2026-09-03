import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { TextEffect } from "@/components/primitives/text-effect"
import { MonoLabel } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Stagger headline — a per-char staggered reveal, configured for impact.
// ═══ EMOTION     Typographic precision.
// ═══ SIGNATURE   TextEffect with per-character stagger + scale preset.

export type TypeStaggerHeadlineProps = {
  eyebrow?: string
  word?: string
  per?: "word" | "char" | "line"
  preset?: "blur" | "fade-in-blur" | "scale" | "fade" | "slide"
  subtitle?: string
  tone?: "paper" | "ink"
  className?: string
}

export function TypeStaggerHeadline({ eyebrow = "Stagger", word = "Meticulous.", per = "char", preset = "blur", subtitle = "Each unit arrives in sequence — a typographic reveal tuned for a hero.", tone = "paper", className }: TypeStaggerHeadlineProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate overflow-hidden py-20 sm:py-28", ink && "bg-foreground text-background", className)}>
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <MonoLabel className={cn(ink ? "text-background/55" : "text-muted-foreground", "justify-center")}>{eyebrow}</MonoLabel>
        </InView>
        <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <TextEffect
            as="h1"
            per={per}
            preset={preset}
            speedSegment={0.06}
            className={cn("mt-6 font-display text-6xl font-black tracking-tight sm:text-8xl", ink ? "text-background" : "text-foreground")}
          >
            {word}
          </TextEffect>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}>
          <p className={cn("mx-auto mt-6 max-w-xl text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{subtitle}</p>
        </InView>
      </div>
    </section>
  )
}
