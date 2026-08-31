import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Lede hero — an oversized lede paragraph as the opening.
// ═══ EMOTION     Quietly confident.
// ═══ SIGNATURE   A drop-cap lede at display size with a mono kicker.

export type HeroLedeProps = {
  eyebrow?: string
  lede?: React.ReactNode
  sub?: string
  tone?: "paper" | "ink"
  className?: string
}

export function HeroLede({
  eyebrow = "THE INTRO",
  lede = "Most sections are rectangles. These are sentences — each one composed to read well and ship fast.",
  sub = "Scroll for the method.",
  tone = "paper",
  className,
}: HeroLedeProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate overflow-hidden py-20 sm:py-28", ink && "bg-foreground text-background", className)}>
      <Grain opacity={ink ? 0.07 : 0.04} />
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <MonoLabel className={ink ? "text-background/55" : "text-muted-foreground"}>{eyebrow}</MonoLabel>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
          <p className="mt-6 font-display text-3xl font-black leading-[1.1] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
            <span className={cn("float-left mr-4 font-display text-6xl font-black leading-[0.8] sm:text-8xl", ink ? "text-background" : "text-foreground")}>M</span>
            {lede}
          </p>
        </InView>
        {sub && (
          <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}>
            <p className={cn("mt-8 border-t pt-4 font-mono text-[11px] font-bold uppercase tracking-widest", ink ? "border-background/20 text-background/50" : "border-border text-muted-foreground")}>{sub}</p>
          </InView>
        )}
      </div>
    </section>
  )
}
