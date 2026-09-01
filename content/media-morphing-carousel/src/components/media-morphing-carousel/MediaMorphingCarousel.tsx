import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"
import Autoplay from "embla-carousel-autoplay"
import useEmblaCarousel from "embla-carousel-react"

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
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: interval, stopOnInteraction: false, playOnInit: !reduce })],
  )
  const [idx, setIdx] = React.useState(0)
  React.useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setIdx(emblaApi.selectedScrollSnap())
    onSelect()
    emblaApi.on("select", onSelect)
    return () => { emblaApi.off("select", onSelect) }
  }, [emblaApi])
  const active = frames[idx]
  return (
    <section className={cn("relative isolate w-full overflow-hidden", false && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", false ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", false ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", false ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
      </InView>
      <InView once variants={{ hidden: { opacity: 0, scale: 0.98 }, visible: { opacity: 1, scale: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
        <div ref={emblaRef} className="relative mt-10 overflow-hidden rounded-xl border bg-foreground">
          <div className="flex aspect-[21/9]">
            {frames.map((f, i) => (
              <div key={f.id} className="relative min-w-0 flex-[0_0_100%]">
                <motion.img
                  src={f.src}
                  alt={f.alt ?? ""}
                  className="h-full w-full object-cover"
                  initial={false}
                  animate={{ opacity: i === idx ? 1 : 0, scale: i === idx ? 1 : 1.06, clipPath: i === idx ? "inset(0 0 0 0)" : "inset(45% 0 45% 0)" }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {f.caption && <span className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white">{f.caption}</span>}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2 py-3">
            {frames.map((f, i) => <button key={f.id} type="button" onClick={() => setIdx(i)} aria-label={`Frame ${i + 1}`} className={cn("h-1.5 rounded-full transition-all", i === idx ? "w-6 bg-foreground" : "w-1.5 bg-muted-foreground/40")} />)}
          </div>
        </div>
      </InView>
    
  </div>
</section>
  )
}
