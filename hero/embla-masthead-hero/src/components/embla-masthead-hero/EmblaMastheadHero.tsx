import * as React from "react"
// embla-carousel-react v8 documents the default import — portable across builds
import useEmblaCarousel from "embla-carousel-react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

// ═══ JOB         Own the first five seconds of the visit.
// ═══ EMOTION     The moment the door chime rings and the room smells of tea tree.
// ═══ SIGNATURE   A 5s metronome under a full-bleed scrim: a hairline progress
//                 bar burns across the bottom of every slide, autoplay rests
//                 while the pointer hovers or drags, and reduced motion gets
//                 a still, arrow-driven hero.

export type MastheadSlide = {
  src: string
  kicker: string
  title: React.ReactNode
  cta: string
}

export type EmblaMastheadHeroProps = {
  slides?: MastheadSlide[]
  /** Min-height utility applied to the section and every slide. */
  height?: string
  /** Seconds per slide. Set 0 to disable autoplay. */
  interval?: number
  className?: string
}

export function EmblaMastheadHero({
  slides = [
    { src: "/showcase/hero-poster.webp", kicker: "QUIET TIMES STUDIO · JÖNKÖPING", title: "Good hair doesn't shout.", cta: "Book a chair" },
    { src: "/showcase/gallery-01.webp", kicker: "THE ROOM", title: "Four chairs, north light, no hurry.", cta: "Look around" },
    { src: "/showcase/gallery-04.webp", kicker: "CUT · COLOUR · RINSE", title: "Walk out quieter than you walked in.", cta: "See the rates" },
  ],
  height = "min-h-[520px]",
  interval = 5,
  className,
}: EmblaMastheadHeroProps) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: "center", axis: "x" })
  const [active, setActive] = React.useState(0)
  const [hovering, setHovering] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)
  const paused = hovering || dragging
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  React.useEffect(() => {
    if (!embla) return
    const onSelect = () => setActive(embla.selectedScrollSnap())
    onSelect()
    embla.on("select", onSelect)
    embla.on("reInit", onSelect)
    return () => {
      embla.off("select", onSelect)
      embla.off("reInit", onSelect)
    }
  }, [embla])

  React.useEffect(() => {
    if (!embla || reduce || paused || interval <= 0) return
    const id = window.setInterval(() => embla.scrollNext(), interval * 1000)
    return () => window.clearInterval(id)
  }, [embla, reduce, paused, interval])

  return (
    <section
      aria-label="Studio highlights"
      className={cn("relative isolate w-full overflow-hidden bg-foreground", height, className)}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => {
        setHovering(false)
        setDragging(false)
      }}
      onPointerDown={() => setDragging(true)}
      onPointerUp={() => setDragging(false)}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {slides.map((slide, i) => (
            <div key={`${slide.src}-${i}`} className="relative min-w-0 shrink-0 grow-0 basis-[100%]">
              <img src={slide.src} alt="" draggable={false} className={cn("block w-full object-cover", height)} />
              <span aria-hidden className="absolute inset-0 bg-black/45" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-background">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-background/70">{slide.kicker}</p>
                <h1 className="mt-4 max-w-3xl font-display text-4xl font-black leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">{slide.title}</h1>
                <button
                  type="button"
                  className="mt-8 rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-background/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {slide.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* arrows + dots, over the scrim */}
      <div className="absolute inset-x-0 bottom-8 z-10 flex items-center justify-center gap-5 text-background">
        <button
          type="button"
          onClick={() => embla?.scrollPrev()}
          aria-label="Previous slide"
          className="flex size-10 items-center justify-center rounded-full border border-background/40 transition-colors hover:bg-background/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M10 3 5 8l5 5" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={`dot-${slide.src}-${i}`}
              type="button"
              onClick={() => embla?.scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "size-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                i === active ? "scale-125 bg-background" : "bg-background/40 hover:bg-background/70",
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => embla?.scrollNext()}
          aria-label="Next slide"
          className="flex size-10 items-center justify-center rounded-full border border-background/40 transition-colors hover:bg-background/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="m6 3 5 5-5 5" />
          </svg>
        </button>
      </div>

      {/* progress hairline */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 z-10 h-px">
        {reduce ? null : paused ? (
          <div className="h-full w-full bg-background/40" />
        ) : (
          <motion.div
            key={active}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: interval, ease: "linear" }}
            className="h-full bg-background"
          />
        )}
      </div>
    </section>
  )
}
