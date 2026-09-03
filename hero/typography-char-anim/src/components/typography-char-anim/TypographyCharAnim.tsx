import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { TextScramble } from "@/components/primitives/text-scramble"
import { Grain, MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Character-animated headline — scrambles then resolves on view.
// ═══ EMOTION     A glitch-to-clarity brand moment.
// ═══ SIGNATURE   TextScramble triggered by InView.

export type TypographyCharAnimProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  tone?: "paper" | "ink"
  className?: string
}

export function TypographyCharAnim({
  eyebrow = "Glitch",
  title = "Scramble. Resolve. Arrive.",
  subtitle = "The headline starts as noise and settles into the message — a character-level reveal.",
  tone = "paper",
  className,
}: TypographyCharAnimProps) {
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={920} grain={!ink} rule={ink ? "top" : "none"} className={cn("text-center", className)}>
      <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <MonoLabel className={cn(ink ? "text-background/55" : "text-muted-foreground", "justify-center")}>{eyebrow}</MonoLabel>
        <h2 className="mt-4 font-display text-5xl font-black leading-[0.98] tracking-[-0.035em] sm:text-7xl">
          <TextScramble trigger className={ink ? "text-background" : "text-foreground"}>{title}</TextScramble>
        </h2>
        {subtitle && <p className={cn("mx-auto mt-5 max-w-xl text-base font-medium leading-relaxed", ink ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
      </InView>
    </SectionShell>
  )
}
