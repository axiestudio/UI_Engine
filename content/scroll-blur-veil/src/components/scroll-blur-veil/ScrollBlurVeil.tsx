import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { SectionShell } from "@/components/primitives/handcraft"

// ═══ JOB         Blur veil — a section whose content sharpens as it crosses the center.
// ═══ EMOTION     A curtain of focus.
// ═══ SIGNATURE   Content blurred + desaturated at edges, crisp in the middle.

export type ScrollBlurVeilProps = {
  eyebrow?: string
  title?: string
  body?: string
  className?: string
}

export function ScrollBlurVeil({ eyebrow = "VEIL", title = "It sharpens when it matters.", body = "Scroll — the card comes into focus as it passes the middle of the viewport.", className }: ScrollBlurVeilProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const blur = useTransform(scrollYProgress, [0, 0.5, 1], [12, 0, 12])
  const filter = useTransform(blur, (b) => `blur(${b}px)`)
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1, 0.5])
  return (
    <SectionShell width={920} grain rule="bottom" className={className}>
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
      <div ref={ref} className="mt-10">
        <motion.div style={{ filter, opacity }} className="rounded-[28px] border bg-card p-10 text-center shadow-2xl">
          <h2 className="font-display text-4xl font-black tracking-[-0.03em] sm:text-5xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-md text-base font-medium leading-relaxed text-muted-foreground">{body}</p>
        </motion.div>
      </div>
    </SectionShell>
  )
}
