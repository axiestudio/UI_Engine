import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
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
    <SectionShell tone={tone} width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
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
    </SectionShell>
  )
}
