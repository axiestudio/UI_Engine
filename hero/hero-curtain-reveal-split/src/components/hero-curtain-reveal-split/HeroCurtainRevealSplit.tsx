import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { MonoLabel } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Curtain reveal split — a scroll-driven split that parts diagonally.
// ═══ EMOTION     Cinematic entry.
// ═══ SIGNATURE   A cover that splits along a diagonal as you scroll, revealing the hero.

export type HeroCurtainRevealSplitProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  className?: string
}

export function HeroCurtainRevealSplit({ eyebrow = "OPENING", title = "Part to reveal.", subtitle = "A diagonal split curtain opens as you scroll.", className }: HeroCurtainRevealSplitProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const runway = "260vh"
  const clipA = useTransform(scrollYProgress, [0, 0.7], ["polygon(0 0, 100% 0, 100% 60%, 0 100%)", "polygon(0 0, 0 0, 0 0, 0 0)"])
  const clipB = useTransform(scrollYProgress, [0, 0.7], ["polygon(0 100%, 100% 60%, 100% 100%, 0 100%)", "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)"])
  const textOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const textY = useTransform(scrollYProgress, [0, 0.3], [0, -40])
  return (
    <section ref={ref} className={cn("relative isolate w-full bg-background", className)} style={{ height: runway }}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* revealed content */}
        <motion.div style={{ opacity: textOpacity, y: textY }} className="relative z-10 mx-auto max-w-2xl px-5 text-center sm:px-8">
          <MonoLabel className="justify-center text-muted-foreground">{eyebrow}</MonoLabel>
          <h1 className="mt-4 font-display text-5xl font-black leading-[0.96] tracking-[-0.035em] sm:text-7xl">{title}</h1>
          <p className="mx-auto mt-5 max-w-md text-base font-medium leading-relaxed text-muted-foreground">{subtitle}</p>
        </motion.div>

        {/* two diagonal curtain halves */}
        <motion.div style={{ clipPath: clipA }} className="absolute inset-0 z-20 bg-foreground" />
        <motion.div style={{ clipPath: clipB }} className="absolute inset-0 z-20 bg-foreground" />
        {/* diagonal seam light */}
        <motion.div aria-hidden style={{ opacity: useTransform(scrollYProgress, [0.2, 0.5], [1, 0]) }} className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
          <div className="h-full w-full" style={{ background: "linear-gradient(120deg, transparent 49.5%, hsl(var(--primary)/0.7) 50%, transparent 50.5%)" }} />
        </motion.div>
      </div>
    </section>
  )
}
