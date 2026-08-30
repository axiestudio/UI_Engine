import * as React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNavigation,
  CarouselIndicator,
} from "@/components/primitives/carousel"
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
        {slide.title && <h3 className={cn("mt-2 font-display font-extrabold tracking-tight", perView > 1 ? "text-lg" : "text-2xl lg:text-3xl")}>{slide.title}</h3>}
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
  eyebrow,
  title,
  slides,
  showArrows = true,
  showIndicator = true,
  perViewLg = 1,
  autoplay = 0,
  className,
}: ContentCarouselProps) {
  const timer = React.useRef<number | undefined>(undefined)
  const [seed, setSeed] = React.useState(0)
  React.useEffect(() => {
    if (autoplay > 0 && slides.length > 1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timer.current = window.setInterval(() => setSeed((s) => s + 1), autoplay * 1000)
      return () => window.clearInterval(timer.current)
    }
  }, [autoplay, slides.length])

  if (!slides.length) return null

  return (
    <section className={cn("w-full bg-background text-foreground", className)} aria-roledescription="carousel" aria-label={title ?? "Highlights"}>
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
        {(eyebrow || title) && (
          <InView variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-60px" }}>
            <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                {eyebrow && <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>}
                {title && <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>}
              </div>
              {showArrows && (
                <div className="flex gap-2">
                  <CarouselNavigation className="!static !w-auto translate-y-0" alwaysShow />
                </div>
              )}
            </header>
          </InView>
        )}
        <div className="relative">
          <Carousel key={seed} className="overflow-hidden">
            <CarouselContent className={cn(perViewLg === 2 && "lg:hidden", perViewLg === 3 && "lg:hidden")}>
              {slides.map((s, i) => (
                <CarouselItem key={s.id ?? i} className="pb-4">
                  <SlideCard slide={s} perView={1} />
                </CarouselItem>
              ))}
            </CarouselContent>
            {perViewLg === 1 && showArrows && <CarouselNavigation alwaysShow />}
            {perViewLg === 1 && showIndicator && <CarouselIndicator />}
          </Carousel>

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
