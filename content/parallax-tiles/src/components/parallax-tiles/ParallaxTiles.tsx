import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Parallax tiles — a staggered grid of tiles that drift on scroll.
// ═══ EMOTION     Architectural depth.
// ═══ SIGNATURE   Tiles offset vertically; the whole field parallaxes on scroll.

export type ParallaxTile = { id: string; src?: string; alt?: string; offset?: number }

export type ParallaxTilesProps = {
  eyebrow?: string
  title?: React.ReactNode
  tiles: ParallaxTile[]
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_TILES = [
  { id: "t1", src: "/showcase/gallery-01.webp", alt: "Showroom", offset: 12 },
  { id: "t2", src: "/showcase/gallery-02.webp", alt: "Oak detail", offset: -18 },
  { id: "t3", src: "/showcase/gallery-04.webp", alt: "Studio corner", offset: 8 },
  { id: "t4", src: "/showcase/gallery-06.webp", alt: "Evening bench", offset: -10 },
]
export function ParallaxTiles({ eyebrow = "DRIFT", title = "A field that drifts.", tiles = DEFAULT_TILES, tone = "paper", className }: ParallaxTilesProps) {
  const ink = tone === "ink"
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], [30, -30])
  const yAlt = useTransform(scrollYProgress, [0, 1], [-20, 20])
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-5 sm:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1280), ["--shell-w" as string]: `${(1280)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
      </InView>
      <div ref={ref} className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t, i) => (
          <motion.div key={t.id} style={{ y: i % 2 ? yAlt : y }} className={cn("img-hover-wash overflow-hidden rounded-xl border bg-muted", t.offset ? t.offset > 0 ? "sm:-translate-y-6" : "sm:translate-y-6" : "")}>
            {t.src ? <img src={t.src} alt={t.alt ?? ""} className="aspect-[3/4] w-full object-cover" loading="lazy" /> : <div className="aspect-[3/4] w-full bg-gradient-to-br from-secondary to-muted" />}
          </motion.div>
        ))}
      </div>
    
  </div>
</section>
  )
}
