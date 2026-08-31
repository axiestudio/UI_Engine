import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { TextEffect, type PerType, type PresetType } from "@/components/primitives/text-effect"
import { Grain, MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Animated headline with per-word / per-char / per-line reveal.
// ═══ EMOTION     Signature typography moment.
// ═══ SIGNATURE   TextEffect with configurable granularity + preset.

export type AnimatedHeadlineProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  per?: PerType
  preset?: PresetType
  delay?: number
  tone?: "paper" | "ink"
  watermark?: string
  className?: string
}

export function AnimatedHeadline({
  eyebrow = "TYPED",
  title = "Words that arrive on cue.",
  subtitle = "A headline that reveals itself word by word — a signature moment for an opening statement.",
  per = "word",
  preset = "fade-in-blur",
  delay = 0.15,
  tone = "paper",
  watermark = "WELCOME",
  className,
}: AnimatedHeadlineProps) {
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={920} grain={!ink} rule={ink ? "top" : "none"} className={cn("text-center", className)}>
      {watermark && (
        <span aria-hidden className={cn("pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 select-none font-display text-[120px] font-black leading-none tracking-[-0.05em] opacity-[0.06] [-webkit-text-stroke:1.5px_currentColor] [color:transparent] sm:text-[180px]", ink ? "text-background" : "text-foreground")}>
          {watermark}
        </span>
      )}
      <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <div className="relative">
          <MonoLabel className={cn(ink ? "text-background/55" : "text-muted-foreground", "justify-center")}>{eyebrow}</MonoLabel>
          <TextEffect
            as="h2"
            per={per}
            preset={preset}
            delay={delay}
            className={cn("mt-4 font-display text-4xl font-black leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-7xl", ink ? "text-background" : "text-foreground")}
          >
            {title}
          </TextEffect>
          {subtitle && <p className={cn("mx-auto mt-5 max-w-xl text-base font-medium leading-relaxed", ink ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
        </div>
      </InView>
    </SectionShell>
  )
}
