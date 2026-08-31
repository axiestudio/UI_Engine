import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Cinematic pull-quote — a full-bleed quote that scales with parallax.
// ═══ EMOTION     Magnified, editorial.
// ═══ SIGNATURE   A huge quote that parallaxes (fades/scales) as you scroll.

export type HeroPullQuoteCinematicProps = {
  eyebrow?: string
  quote?: React.ReactNode
  attribution?: string
  className?: string
}

export function HeroPullQuoteCinematic({
  eyebrow = "FROM THE PROCESS",
  quote = "Sections should read like they were written by someone who cared.",
  attribution = "Studio manifesto",
  className,
}: HeroPullQuoteCinematicProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.85, 1.06])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1, 0.6])
  return (
    <section ref={ref} className={cn("relative isolate flex min-h-[90vh] items-center overflow-hidden bg-foreground text-background", className)}>
      <Grain opacity={0.07} />
      <motion.div style={{ scale, opacity }} className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <MonoLabel className="justify-center text-background/55">{eyebrow}</MonoLabel>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
          <blockquote>
            <p className="mt-6 font-display text-3xl font-black leading-[1.08] tracking-[-0.03em] sm:text-5xl lg:text-6xl">“{quote}”</p>
          </blockquote>
        </InView>
        <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}>
          <p className="mt-8 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-background/50">{attribution}</p>
        </InView>
      </motion.div>
    </section>
  )
}
