import * as React from "react"
import { motion, useScroll, useSpring, useTransform } from "motion/react"
import { ScrollProgress } from "@/components/primitives/scroll-progress"

import { cn } from "@/lib/utils"

// ═══ JOB         Scroll video — a pinned section with a scroll-progress rail.
// ═══ EMOTION     You drive the reveal by scrolling.
// ═══ SIGNATURE   Sticky video that scales as you scroll + a top progress bar.

export type ScrollVideoProps = {
  eyebrow?: string
  title?: string
  description?: string
  src?: string
  poster?: string
  /** Height of the scroll runway (in vh). */
  runway?: string
  className?: string
}

export function ScrollVideo({
  eyebrow = "SCROLL",
  title = "A scene that follows you.",
  description = "Scroll to move the stage — the video scales and the progress rail fills as you go.",
  src = "/showcase/content/video/editorial-drift.mp4",
  poster,
  runway = "340vh",
  className,
}: ScrollVideoProps) {
  const targetRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end end"] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  const scale = useTransform(progress, [0, 1], [0.92, 1.06])
  const radius = useTransform(progress, [0, 0.5, 1], ["32px", "8px", "32px"])

  return (
    <section ref={targetRef} className={cn("relative isolate w-full bg-background", className)} style={{ height: runway }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <ScrollProgress className="absolute left-0 top-0 z-20 h-1 w-full" />
        <motion.div style={{ scale, borderRadius: radius }} className="absolute inset-0 overflow-hidden bg-foreground">
          <video autoPlay loop muted playsInline poster={poster} className="h-full w-full object-cover" src={src} />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-foreground/30" />
        </motion.div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center justify-end bg-gradient-to-t from-foreground/60 to-transparent p-8 pb-12 text-center text-background">
          <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "text-background/60")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>
          <h2 className="mt-2 font-display text-4xl font-bold tracking-[-0.035em] sm:text-5xl">{title}</h2>
          <p className="mt-3 max-w-md text-sm font-medium leading-relaxed text-background/70">{description}</p>
        </div>
      </div>
    </section>
  )
}
