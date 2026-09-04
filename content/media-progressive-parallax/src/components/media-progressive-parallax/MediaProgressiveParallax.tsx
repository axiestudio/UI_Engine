import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Progressive parallax — layered image stack with depth from a blur field.
// ═══ EMOTION     Depth with softness.
// ═══ SIGNATURE   A tall track where layered images translate + de-blur as you scroll.

export type ParallaxLayer = { id: string; src?: string; alt?: string; depth?: number }

export type MediaProgressiveParallaxProps = {
  eyebrow?: string
  title?: React.ReactNode
  layers: ParallaxLayer[]
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_LAYERS = [
  { id: "far", src: "/showcase/content/content-04-architecture.webp", alt: "Building, far layer", depth: 0.2 },
  { id: "mid", src: "/showcase/gallery-02.webp", alt: "Interior, mid layer", depth: 0.5 },
  { id: "near", src: "/showcase/gallery-05.webp", alt: "Bench, near layer", depth: 0.9 },
]
export function MediaProgressiveParallax({ eyebrow = "DEPTH", title = "Layers that breathe.", layers = DEFAULT_LAYERS, tone = "paper", className }: MediaProgressiveParallaxProps) {
  const ink = tone === "ink"
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], [80, -80])
  const blur = useTransform(scrollYProgress, [0, 0.5, 1], [10, 0, 10])
  const yAlt = useTransform(scrollYProgress, [0, 1], [-60, 60])
  const blurAlt = useTransform(scrollYProgress, [0, 0.5, 1], [6, 0, 6])
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-5 sm:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
      </InView>
      <div ref={ref} className="mt-10 grid gap-4 lg:grid-cols-3">
        {layers.map((l, i) => (
          <motion.div
            key={l.id}
            style={{ y: i % 2 ? yAlt : y, filter: i % 2 ? blurAlt : blur }}
            className={cn("img-hover-wash overflow-hidden rounded-xl border bg-muted", i === 1 && "lg:-mt-6")}
          >
            {l.src ? <img src={l.src} alt={l.alt ?? ""} className="aspect-[4/5] w-full object-cover" loading="lazy" /> : <div className="aspect-[4/5] w-full bg-gradient-to-br from-secondary to-muted" />}
          </motion.div>
        ))}
      </div>
    
  </div>
</section>
  )
}
