import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { SectionShell } from "@/components/primitives/handcraft"

// ═══ JOB         Sticky quote parallax — a huge quote pinned while a photo drifts behind.
// ═══ EMOTION     An anchored belief.
// ═══ SIGNATURE   A pinned quote over a slowly parallaxing image.

export type ScrollParallaxStickyQuoteProps = {
  eyebrow?: string
  quote?: string
  attribution?: string
  image?: string
  className?: string
}

export function ScrollParallaxStickyQuote({ eyebrow = "BELIEF", quote = "A site is a promise you keep in the first three seconds.", attribution = "Studio principle 01", image = "/frames/frame_0008.webp", className }: ScrollParallaxStickyQuoteProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"])
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 1.02])
  return (
    <SectionShell width={1120} grain rule="bottom" className={className}>
      <div ref={ref} className="relative overflow-hidden rounded-[28px] border bg-foreground">
        <motion.img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" style={{ y, scale }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />
        <div className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center px-6 py-20 text-center text-background">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-background/60">{eyebrow}</p>
          <blockquote className="mt-6 max-w-3xl">
            <p className="font-display text-3xl font-black leading-[1.08] tracking-[-0.03em] sm:text-5xl lg:text-6xl">“{quote}”</p>
          </blockquote>
          <p className="mt-6 font-mono text-[11px] font-bold uppercase tracking-widest text-background/60">{attribution}</p>
        </div>
      </div>
    </SectionShell>
  )
}
