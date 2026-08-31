import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Mask-reveal hero — a headline that wipes in through a clip mask.
// ═══ EMOTION     Reveal, not fade.
// ═══ SIGNATURE   A clip-path wipe rises through the headline on load.

export type HeroMaskRevealProps = {
  eyebrow?: string
  title?: string
  highlight?: string
  subtitle?: React.ReactNode
  cta?: { label: string; href?: string }
  tone?: "paper" | "ink"
  className?: string
}

export function HeroMaskReveal({
  eyebrow = "REVEAL",
  title = "The headline arrives through a mask.",
  highlight = "through a mask",
  subtitle = "A clip-path wipe sweeps up the headline instead of a simple fade.",
  cta = { label: "Enter", href: "#" },
  tone = "paper",
  className,
}: HeroMaskRevealProps) {
  const ink = tone === "ink"
  const parts = title.split(highlight)
  return (
    <section className={cn("relative isolate overflow-hidden py-20 sm:py-28", ink && "bg-foreground text-background", className)}>
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <MonoLabel className={ink ? "text-background/55" : "text-muted-foreground"}>{eyebrow}</MonoLabel>
        </InView>
        <div className="mt-5 overflow-hidden">
          <motion.h1
            className="font-display text-5xl font-black leading-[0.98] tracking-[-0.035em] sm:text-7xl"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            {parts[0]}
            <span className="gradient-text">{highlight}</span>
            {parts[1]}
          </motion.h1>
        </div>
        <InView once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}>
          <p className={cn("mt-6 max-w-xl text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{subtitle}</p>
          <div className="mt-8">
            <Button size="lg" onClick={() => { if (cta.href) window.location.href = cta.href }} className="h-12 rounded-full px-7 font-mono text-[11px] font-bold uppercase tracking-widest">
              {cta.label}
            </Button>
          </div>
        </InView>
      </div>
    </section>
  )
}
