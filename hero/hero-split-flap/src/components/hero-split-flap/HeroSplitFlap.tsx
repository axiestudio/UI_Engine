import * as React from "react"
import { motion, useInView } from "motion/react"
import { MonoLabel } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Split-flap hero — a headline that flips in like a departure board.
// ═══ EMOTION     Mechanical delight.
// ═══ SIGNATURE   Each character section does a split reveal (top/bottom halves).

export type HeroSplitFlapProps = {
  eyebrow?: string
  word?: string
  subtitle?: React.ReactNode
  tone?: "paper" | "ink"
  className?: string
}

export function HeroSplitFlap({
  eyebrow = "FLAPS",
  word = "ARRIVE",
  subtitle = "The headline lands like a split-flap board — each tile catches up to the message.",
  tone = "paper",
  className,
}: HeroSplitFlapProps) {
  const ink = tone === "ink"
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  return (
    <section className={cn("relative isolate overflow-hidden py-20 sm:py-28", ink && "bg-foreground text-background", className)}>
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8" ref={ref}>
        <MonoLabel className={cn(ink ? "text-background/55" : "text-muted-foreground", "justify-center")}>{eyebrow}</MonoLabel>
        <h1 className="mt-6 flex flex-wrap items-center justify-center gap-1.5" aria-label={word}>
          {word.split("").map((ch, i) => (
            <FlapTile key={i} ch={ch} fall={inView} delay={0.1 + i * 0.12} ink={ink} />
          ))}
        </h1>
        <p className={cn("mx-auto mt-8 max-w-xl text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{subtitle}</p>
      </div>
    </section>
  )
}

function FlapTile({ ch, fall, delay, ink }: { ch: string; fall: boolean; delay: number; ink: boolean }) {
  return (
    <span
      className={cn("relative inline-block h-[1em] font-display text-5xl font-black leading-none sm:text-7xl", ink ? "text-background" : "text-foreground")}
      style={{ perspective: 300 }}
      aria-hidden
    >
      <motion.span
        className="block h-[54%] overflow-hidden"
        style={{ transformOrigin: "center bottom" }}
        initial={false}
        animate={fall ? { rotateX: 0 } : { rotateX: -70 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      >
        {ch}
      </motion.span>
      <motion.span
        className="absolute inset-x-0 top-[54%] block h-[46%] overflow-hidden"
        style={{ transformOrigin: "center top" }}
        initial={false}
        animate={fall ? { rotateX: 0 } : { rotateX: 70 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      >
        <span className="block -translate-y-[54%]" aria-hidden>{ch}</span>
      </motion.span>
    </span>
  )
}
