import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
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

export function ParallaxTiles({ eyebrow = "DRIFT", title = "A field that drifts.", tiles, tone = "paper", className }: ParallaxTilesProps) {
  const ink = tone === "ink"
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], [30, -30])
  const yAlt = useTransform(scrollYProgress, [0, 1], [-20, 20])
  return (
    <SectionShell tone={tone} width={1280} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
      </InView>
      <div ref={ref} className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t, i) => (
          <motion.div key={t.id} style={{ y: i % 2 ? yAlt : y }} className={cn("img-hover-wash overflow-hidden rounded-xl border bg-muted", t.offset ? t.offset > 0 ? "sm:-translate-y-6" : "sm:translate-y-6" : "")}>
            {t.src ? <img src={t.src} alt={t.alt ?? ""} className="aspect-[3/4] w-full object-cover" loading="lazy" /> : <div className="aspect-[3/4] w-full bg-gradient-to-br from-secondary to-muted" />}
          </motion.div>
        ))}
      </div>
    </SectionShell>
  )
}
