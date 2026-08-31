import * as React from "react"
import { motion, useScroll, useTransform, type MotionValue } from "motion/react"
import { SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Lens focus — a mask that pushes focus through a line of text as you scroll.
// ═══ EMOTION     Reading under a lamp.
// ═══ SIGNATURE   A word-by-word scroll reveal where only the in-focus words are opaque.

export type ScrollLensFocusProps = {
  eyebrow?: string
  text?: string
  className?: string
}

export function ScrollLensFocus({ eyebrow = "LENS", text = "Scroll to move the lens. As each line passes the center, it sharpens — then lets the next one have the light.", className }: ScrollLensFocusProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.1"] })
  const words = text.split(" ")
  return (
    <SectionShell width={920} grain rule="bottom" className={className}>
      <div ref={ref} className="py-16">
        <p className="mb-6 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
        <p className="flex flex-wrap font-display text-2xl font-bold leading-[1.5] sm:text-4xl">
          {words.map((w, i) => (
            <LensWord key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>{w}</LensWord>
          ))}
        </p>
      </div>
    </SectionShell>
  )
}

function LensWord({ progress, range, children }: { progress: MotionValue<number>; range: [number, number]; children: string }) {
  const opacity = useTransform(progress, range, [0.16, 1, 0.16])
  const scale = useTransform(progress, range, [0.94, 1, 0.94])
  return <motion.span style={{ opacity, scale }} className="mr-[0.32em] inline-block">{children}</motion.span>
}
