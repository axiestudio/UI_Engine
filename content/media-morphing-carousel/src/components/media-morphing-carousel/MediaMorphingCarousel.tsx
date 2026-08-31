import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Morphing carousel — a crossfading slideshow that you move through.
// ═══ EMOTION     A smooth, dimming rotation.
// ═══ SIGNATURE   Auto/clickable frame switch with a morphing wipe + caption.

export type MorphFrame = { id: string; src?: string; alt?: string; caption?: string }

export type MediaMorphingCarouselProps = {
  eyebrow?: string
  title?: React.ReactNode
  frames: MorphFrame[]
  interval?: number
  className?: string
}

const DEFAULT_FRAMES = [
  { id: "f1", src: "/showcase/gallery-01.webp", alt: "Showroom long shot", caption: "From the spring shoot" },
  { id: "f2", src: "/showcase/gallery-02.webp", alt: "Oak detail", caption: "From the spring shoot" },
  { id: "f3", src: "/showcase/gallery-03.webp", alt: "Brass hardware", caption: "From the spring shoot" },
  { id: "f4", src: "/showcase/gallery-04.webp", alt: "Studio corner", caption: "From the spring shoot" },
  { id: "f5", src: "/showcase/gallery-05.webp", alt: "Freshly oiled top", caption: "From the spring shoot" },
  { id: "f6", src: "/showcase/gallery-06.webp", alt: "Evening bench", caption: "From the spring shoot" },
]
export function MediaMorphingCarousel({ eyebrow = "MORPH", title = "One frame melts to the next.", frames = DEFAULT_FRAMES, interval = 5000, className }: MediaMorphingCarouselProps) {
  const [idx, setIdx] = React.useState(0)
  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % frames.length), interval)
    return () => clearInterval(t)
  }, [frames.length, interval])
  const active = frames[idx]
  return (
    <SectionShell width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} />
      </InView>
      <InView once variants={{ hidden: { opacity: 0, scale: 0.98 }, visible: { opacity: 1, scale: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
        <div className="relative mt-10 overflow-hidden rounded-xl border bg-foreground">
          <div className="relative aspect-[21/9]">
            {frames.map((f, i) => (
              <motion.img
                key={f.id}
                src={f.src}
                alt={f.alt ?? ""}
                className="absolute inset-0 h-full w-full object-cover"
                initial={false}
                animate={{ opacity: i === idx ? 1 : 0, scale: i === idx ? 1 : 1.06, clipPath: i === idx ? "inset(0 0 0 0)" : "inset(45% 0 45% 0)" }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            {active.caption && <span className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white">{active.caption}</span>}
          </div>
          <div className="flex justify-center gap-2 py-3">
            {frames.map((f, i) => <button key={f.id} type="button" onClick={() => setIdx(i)} aria-label={`Frame ${i + 1}`} className={cn("h-1.5 rounded-full transition-all", i === idx ? "w-6 bg-foreground" : "w-1.5 bg-muted-foreground/40")} />)}
          </div>
        </div>
      </InView>
    </SectionShell>
  )
}
