import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { cn } from "@/lib/utils"


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

export function ScrollParallaxStickyQuote({ eyebrow = "BELIEF", quote = "A site is a promise you keep in the first three seconds.", attribution = "Studio principle 01", image = "/showcase/content/content-01-office.webp", className }: ScrollParallaxStickyQuoteProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"])
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 1.02])
  return (
    <section className={cn("relative isolate w-full overflow-hidden", false && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", false ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-5 sm:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <div ref={ref} className="relative overflow-hidden rounded-[28px] border bg-foreground">
        <motion.img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" style={{ y, scale }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />
        <div className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center px-6 py-20 text-center text-background">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-background/60">{eyebrow}</p>
          <blockquote className="mt-6 max-w-3xl">
            <p className="font-display text-3xl font-bold leading-[1.08] tracking-[-0.03em] sm:text-5xl lg:text-6xl">“{quote}”</p>
          </blockquote>
          <p className="mt-6 font-mono text-[11px] font-bold uppercase tracking-widest text-background/60">{attribution}</p>
        </div>
      </div>
    
  </div>
</section>
  )
}
