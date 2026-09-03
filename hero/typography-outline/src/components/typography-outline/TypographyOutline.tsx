import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Outline typography — giant stroked display type.
// ═══ EMOTION     Editorial impact without a wall of ink.
// ═══ SIGNATURE   A huge outlined headline over a slim copy rail.

export type TypographyOutlineProps = {
  eyebrow?: string
  text?: string
  subtitle?: string
  tone?: "paper" | "ink"
  className?: string
}

export function TypographyOutline({
  eyebrow = "Statement",
  text = "Maximum impact",
  subtitle = "Stroked type reads loud but stays light — a statement you can set over any imagery.",
  tone = "paper",
  className,
}: TypographyOutlineProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate overflow-hidden", ink && "bg-foreground text-background", className)}>
      <Grain opacity={ink ? 0.07 : 0.04} />
      <div className="mx-auto max-w-[1280px] px-5 pb-20 pt-16 sm:px-8 lg:pb-28 lg:pt-24">
        <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <MonoLabel className={ink ? "text-background/55" : "text-muted-foreground"}>{eyebrow}</MonoLabel>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
          <h1
            className="mt-6 font-display text-[64px] font-black uppercase leading-[0.9] tracking-[-0.03em] sm:text-[120px] lg:text-[170px]"
            style={{ WebkitTextStroke: `2px hsl(var(${ink ? "--background" : "--foreground"}) / 0.9)`, color: "transparent" }}
          >
            {text}
          </h1>
        </InView>
        {subtitle && (
          <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}>
            <p className={cn("mt-6 max-w-xl text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{subtitle}</p>
          </InView>
        )}
      </div>
    </section>
  )
}
