import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { cn } from "@/lib/utils"


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
    <section className={cn("relative isolate w-full overflow-hidden", false && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", false ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-5 sm:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
      <div ref={ref} className="mt-10">
        <motion.div style={{ filter, opacity }} className="rounded-[28px] border bg-card p-10 text-center shadow-2xl">
          <h2 className="font-display text-4xl font-bold tracking-[-0.03em] sm:text-5xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-md text-base font-medium leading-relaxed text-muted-foreground">{body}</p>
        </motion.div>
      </div>
    
  </div>
</section>
  )
}
