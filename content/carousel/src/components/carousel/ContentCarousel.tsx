import * as React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { Button } from "@/components/ui/button"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type Slide = {
  id?: string | number
  image?: string
  imageAlt?: string
  eyebrow?: string
  title?: string
  body?: string
  action?: { label: string; href: string }
  /** Provide fully custom card content instead of the image+copy layout. */
  content?: React.ReactNode
}

export type ContentCarouselProps = {
  eyebrow?: string
  title?: string
  slides: Slide[]
  /** Drag + arrows are on by default (set false to disable drag, arrows toggle). */
  showArrows?: boolean
  showIndicator?: boolean
  /** Show N slides side-by-side from lg up (peek carousel). Default 1. */
  perViewLg?: 1 | 2 | 3
  /** Auto-advance every N seconds. 0 disables. Default 0. Respects reduced motion (stays off). */
  autoplay?: number
  className?: string
}

// ── ContentCarousel ──────────────────────────────────────────────────────────

const DEFAULT_SLIDES: Slide[] = [
  {
    id: "s1",
    image: "/frames/frame_0001.webp",
    imageAlt: "Morning light across the studio floor",
    eyebrow: "The studio",
    title: "A calm floor in Jönköping",
    body: "Six chairs, one board and a kettle that never rests. Östergatan 12, Tuesday to Saturday.",
    action: { label: "Book a chair", href: "#book" },
  },
  {
    id: "s2",
    image: "/frames/frame_0003.webp",
    imageAlt: "The colour bar mid-mix",
    eyebrow: "Services",
    title: "Cut & finish — 640 kr",
    body: "One chair, one stylist, all afternoon. The price on the board is the price on the receipt.",
  },
  {
    id: "s3",
    image: "/frames/frame_0005.webp",
    imageAlt: "Prints drying in the back room",
    eyebrow: "The journal",
    title: "Notes from the floor",
    body: "Cuts, care and calm — written between clients, never instead of them.",
    action: { label: "Read the journal", href: "#journal" },
  },
  {
    id: "s4",
    image: "/frames/frame_0007.webp",
    imageAlt: "The front desk and the ledger",
    eyebrow: "Visit us",
    title: "Walk-ins before lunch",
    body: "Two chair hours held back every weekday, 11:30–12:30. First come, first seated.",
    action: { label: "Find us", href: "#visit" },
  },
]

function SlideCard({ slide, perView }: { slide: Slide; perView: number }) {
  if (slide.content) return <>{slide.content}</>
  return (
    <div className="relative flex flex-col overflow-hidden rounded-[24px] border bg-card shadow-sm">
      {slide.image && (
        <div className={cn("relative overflow-hidden", perView > 1 ? "aspect-[4/3]" : "aspect-[16/10] lg:aspect-[21/10]")}>
          <img src={slide.image} alt={slide.imageAlt ?? slide.title ?? ""} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        {slide.eyebrow && <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{slide.eyebrow}</p>}
        {slide.title && <h3 className={cn("mt-2 font-display font-bold tracking-tight", perView > 1 ? "text-lg" : "text-2xl lg:text-3xl")}>{slide.title}</h3>}
        {slide.body && <p className="mt-2 max-w-prose text-sm font-medium leading-relaxed text-muted-foreground">{slide.body}</p>}
        {slide.action && (
          <a href={slide.action.href} className="mt-4 inline-flex items-center gap-1 text-sm font-bold underline-offset-4 hover:underline" >
            {slide.action.label} <span aria-hidden>→</span>
          </a>
        )}
      </div>
    </div>
  )
}

export function ContentCarousel({
  eyebrow = "Quiet Times Studio",
  title = "Frames from the floor.",
  slides = DEFAULT_SLIDES,
  showArrows = true,
  showIndicator = true,
  perViewLg = 1,
  autoplay = 0,
  className,
}: ContentCarouselProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const play = autoplay > 0 && slides.length > 1
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: play, align: "start" },
    play ? [Autoplay({ delay: autoplay * 1000, stopOnInteraction: true, playOnInit: !reduce })] : [],
  )
  const [idx, setIdx] = React.useState(0)
  React.useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setIdx(emblaApi.selectedScrollSnap())
    onSelect()
    emblaApi.on("select", onSelect)
    return () => { emblaApi.off("select", onSelect) }
  }, [emblaApi])

  if (!slides.length) return null

  return (
    <section className={cn("w-full bg-background text-foreground", className)} aria-roledescription="carousel" aria-label={title ?? "Highlights"}>
        <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
          {(eyebrow || title) && (
            <InView variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-60px" }}>
              <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-2xl">
                  {eyebrow && <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>}
                  {title && <h2 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>}
                </div>
                {showArrows && (
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => emblaApi?.scrollPrev()}
                      aria-label="Previous slide"
                      className="rounded-full"
                    >
                      <ArrowLeft />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => emblaApi?.scrollNext()}
                      aria-label="Next slide"
                      className="rounded-full"
                    >
                      <ArrowRight />
                    </Button>
                  </div>
                )}
              </header>
            </InView>
          )}
          <div className="relative">
            <div className="group/hover relative overflow-hidden">
              <div ref={emblaRef} className="overflow-hidden">
                <div className="flex">
                  {slides.map((s, i) => (
                    <div key={s.id ?? i} className="min-w-0 flex-[0_0_100%] pb-4 pr-4">
                      <SlideCard slide={s} perView={1} />
                    </div>
                  ))}
                </div>
              </div>
              {perViewLg === 1 && showIndicator && (
                <div className="flex justify-center gap-2">
                  {slides.map((s, i) => (
                    <Button
                      key={s.id ?? i}
                      size="icon"
                      variant="ghost"
                      onClick={() => emblaApi?.scrollTo(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      aria-current={i === idx}
                      className={cn("h-2 rounded-full p-0", i === idx ? "w-6 bg-foreground" : "w-2 bg-muted-foreground/40")}
                    />
                  ))}
                </div>
              )}
            </div>

            {perViewLg > 1 && (
              <div className="hidden lg:grid" style={{ gridTemplateColumns: `repeat(${perViewLg}, minmax(0,1fr))`, gap: 16 }}>
                {slides.map((s, i) => (
                  <div key={s.id ?? i}>
                    <SlideCard slide={s} perView={perViewLg} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
  )
}
