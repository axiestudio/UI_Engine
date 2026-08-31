import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Scroll gallery — a tall gallery where images parallax at different rates.
// ═══ EMOTION     Depth as you scroll.
// ═══ SIGNATURE   Three image columns that scroll at opposing speeds.

export type ScrollGalleryProps = {
  eyebrow?: string
  title?: React.ReactNode
  frames?: { src?: string; alt?: string }[]
  tone?: "paper" | "ink"
  className?: string
}

export function ScrollGallery({ eyebrow = "PARALLAX", title = "A gallery that moves.", frames = [
  { src: "/frames/frame_0008.webp", alt: "1" }, { src: "/frames/frame_0020.webp", alt: "2" },
  { src: "/frames/frame_0032.webp", alt: "3" }, { src: "/frames/frame_0044.webp", alt: "4" },
  { src: "/frames/frame_0056.webp", alt: "5" }, { src: "/frames/frame_0068.webp", alt: "6" },
], tone = "paper", className }: ScrollGalleryProps) {
  const ink = tone === "ink"
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y1 = useTransform(scrollYProgress, [0, 1], ["-6%", "10%"])
  const y2 = useTransform(scrollYProgress, [0, 1], ["10%", "-6%"])
  const y3 = useTransform(scrollYProgress, [0, 1], ["-3%", "6%"])
  const cols = [frames.slice(0, 2), frames.slice(2, 4), frames.slice(4, 6)]
  const ys = [y1, y2, y3]
  return (
    <SectionShell tone={tone} width={1280} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
      </InView>
      <div ref={ref} className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cols.map((col, ci) => (
          <motion.div key={ci} style={{ y: ys[ci] }} className="space-y-4">
            {col.map((f, i) => (
              <div key={i} className="img-hover-wash overflow-hidden rounded-xl border bg-muted">
                {f.src ? <img src={f.src} alt={f.alt ?? ""} className={cn("w-full object-cover", i % 2 === 0 ? "aspect-[3/4]" : "aspect-[4/3]")} loading="lazy" /> : <div className="aspect-[3/4] w-full bg-gradient-to-br from-secondary to-muted" />}
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </SectionShell>
  )
}
