import * as React from "react"
import { useInView, motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react"
import { Quote, Star } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNavigation, CarouselIndicator } from "@/components/primitives/carousel"
import { InfiniteSlider } from "@/components/primitives/infinite-slider"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type Testimonial = {
  id?: string | number
  author: string
  role?: string
  /** Remote avatar URL — falls back to `initials` if missing or broken. */
  avatarSrc?: string
  initials?: string
  rating?: number
  date?: string
  title?: string
  body: string
  source?: string
}

export type TestimonialSummary = {
  rating: number
  reviewCount: number
  label?: string
  ratingCountLabel?: string
}

export type TestimonialsProps = {
  eyebrow?: string
  title?: string
  intro?: string
  items: Testimonial[]
  summary?: TestimonialSummary
  /**
   * "slider"   — Motion-Primitives InfiniteSlider (seamless draggable-style loop, two counter-scrolling rows).
   * "marquee"  — CSS keyframe loop, pauses on hover, scroll-snap under reduced motion.
   * "carousel" — one card at a time with drag, arrows and dots (Motion-Primitives Carousel).
   */
  variant?: "slider" | "marquee" | "carousel"
  /** slider: px per second. Default 40. */
  sliderSpeed?: number
  /** marquee: seconds per full loop. Default 40. */
  marqueeDuration?: number
  sliderReverseSecondRow?: boolean
  showArrows?: boolean
  showIndicators?: boolean
  className?: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function Stars({ rating, className, size = "h-3.5 w-3.5" }: { rating: number; className?: string; size?: string }) {
  const r = Math.round(Math.min(5, Math.max(0, rating)))
  return (
    <span role="img" aria-label={`Rated ${r} out of 5`} className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn(size, "shrink-0", i <= r ? "fill-foreground text-foreground" : "text-border")} />
      ))}
    </span>
  )
}

function SpringValue({ value, decimals, className }: { value: number; decimals: number; className?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const mv = useMotionValue(0)
  const spring = useSpring(mv, { stiffness: 60, damping: 18 })
  const text = useTransform(spring, (v) => (decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString()))
  const reduce = useReducedMotion()
  React.useEffect(() => {
    if (inView) mv.set(value)
  }, [inView, mv, value])
  return (
    <span ref={ref} className={className}>
      {reduce ? (decimals ? value.toFixed(decimals) : value.toLocaleString()) : <motion.span>{text}</motion.span>}
    </span>
  )
}

function Avatar({ t }: { t: Testimonial }) {
  const [failed, setFailed] = React.useState(false)
  const initials = t.initials ?? initialsOf(t.author)
  if (t.avatarSrc && !failed) {
    return <img src={t.avatarSrc} alt="" onError={() => setFailed(true)} className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-border" />
  }
  return (
    <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground font-mono text-xs font-bold text-background">
      {initials}
    </span>
  )
}

export function ReviewCard({ t, className }: { t: Testimonial; className?: string }) {
  return (
    <figure className={cn("relative flex h-full flex-col overflow-hidden rounded-[20px] border bg-card p-5 shadow-sm", className)}>
      <Quote className="pointer-events-none absolute -right-2 -top-2 h-16 w-16 text-foreground/[0.04]" />
      <div className="flex items-start justify-between gap-3">
        <div>
          {t.rating !== undefined && <Stars rating={t.rating} />}
          {t.title && <p className="mt-3 font-display text-[15px] font-bold leading-snug tracking-tight">“{t.title}”</p>}
        </div>
        {t.source && <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] font-bold tracking-wide text-muted-foreground">{t.source}</span>}
      </div>
      <blockquote className={cn("mt-3 flex-1 text-sm font-medium leading-relaxed text-muted-foreground", !t.title && "mt-1")}>
        {t.body}
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t pt-4">
        <Avatar t={t} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-tight">{t.author}</p>
          <p className="mt-0.5 truncate font-mono text-[11px] font-medium text-muted-foreground">
            {[t.role, t.date].filter(Boolean).join(" · ")}
          </p>
        </div>
      </figcaption>
    </figure>
  )
}

function SliderRow({ items, speed, reverse, className }: { items: Testimonial[]; speed: number; reverse?: boolean; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <InfiniteSlider gap={20} speed={speed} speedOnHover={12} reverse={reverse}>
        {items.map((t, i) => (
          <div key={t.id ?? `s-${i}`} className="w-[320px] shrink-0 sm:w-[380px]">
            <ReviewCard t={t} />
          </div>
        ))}
      </InfiniteSlider>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent" />
    </div>
  )
}

function MarqueeRow({ items, duration, reverse, id }: { items: Testimonial[]; duration: number; reverse?: boolean; id: string }) {
  const doubled = React.useMemo(() => [...items, ...items], [items])
  return (
    <div className="group/row flex overflow-hidden">
      <div
        className="flex w-max shrink-0 gap-4 group-hover/row:[animation-play-state:paused]"
        style={{ animation: `ui-marquee_x ${duration}s linear infinite${reverse ? " reverse" : ""}` }}
        id={id}
      >
        {doubled.map((t, i) => (
          <div key={i} className="w-[320px] shrink-0 sm:w-[380px]">
            <ReviewCard t={t} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Testimonials ─────────────────────────────────────────────────────────────

// Self-demo defaults.
const DEMO_TESTIMONIALS_ITEMS: Testimonial[] = [
  { author: "Maya Lin", role: "Studio member", initials: "ML", rating: 5, title: "Same chair, every week", body: "I keep the same Tuesday slot. The team knows my name and what I need before I sit down." },
  { author: "Daniel Park", role: "Drop-in", initials: "DP", rating: 5, title: "Showed up at 19:40", body: "Late openings saved my deadline. Real availability, real staff — no 'we'll call you back'." },
  { author: "Yara Hassan", role: "Charter client", initials: "YH", rating: 5, title: "Quiet room, every time", body: "For executive sessions, the floor stays silent. Twenty-five years of training shows in the details." },
  { author: "Tomás Vela", role: "Studio member", initials: "TV", rating: 5, title: "Calendar matches reality", body: "Book online and the chair is yours. No re-confirming, no last-minute 'we moved you' emails." },
  { author: "Renée Okafor", role: "Touring pro", initials: "RO", rating: 5, title: "Traveled well", body: "I bring a routine. They remember it. Same supplies, same prep, same outcome on the road." },
]

export function Testimonials({
  eyebrow = "Social proof",
  title = "What people say",
  intro,
  items = DEMO_TESTIMONIALS_ITEMS,
  summary,
  variant = "slider",
  sliderSpeed = 40,
  marqueeDuration = 40,
  sliderReverseSecondRow = true,
  showArrows = true,
  showIndicators = true,
  className,
}: TestimonialsProps) {
  const reduce = useReducedMotion()
  if (!items.length) return null

  const secondRow = items.length > 2 ? (sliderReverseSecondRow ? [...items].reverse() : items) : null

  return (
    <section className={cn("w-full overflow-hidden bg-background text-foreground", className)} aria-label={title}>
      <InView variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-80px" }}>
        <div className="mx-auto w-full max-w-[1280px] px-4 pt-16 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              {eyebrow && <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>}
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
              {intro && <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">{intro}</p>}
            </div>
            {summary && (
              <div className="rounded-[20px] border bg-card px-6 py-4 shadow-sm">
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{summary.label ?? "Rated by our guests"}</p>
                <div className="mt-2 flex items-center gap-3">
                  <SpringValue value={summary.rating} decimals={1} className="font-display text-4xl font-bold leading-none tracking-tight tabular-nums" />
                  <div>
                    <Stars rating={summary.rating} size="h-4 w-4" />
                    <p className="mt-1 font-mono text-[11px] font-semibold text-muted-foreground">
                      <SpringValue value={summary.reviewCount} decimals={0} /> {summary.ratingCountLabel ?? "reviews"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {variant === "carousel" && (
          <div className="mx-auto w-full max-w-[860px] px-4 pb-16 sm:px-6 lg:px-8">
            <div className="relative px-8 lg:px-12">
              <Carousel disableDrag={!!reduce}>
                <CarouselContent>
                  {items.map((t) => (
                    <CarouselItem key={t.id ?? t.author}>
                      <div className="pb-14">
                        <ReviewCard t={t} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {showArrows && <CarouselNavigation alwaysShow />}
                {showIndicators && <CarouselIndicator />}
              </Carousel>
            </div>
          </div>
        )}

        {variant === "slider" &&
          (reduce ? (
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-16 pt-2 sm:px-6 lg:px-8">
              {items.map((t, i) => (
                <div key={t.id ?? i} className="w-[320px] shrink-0 snap-start sm:w-[380px]">
                  <ReviewCard t={t} />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 pb-16 pt-2">
              <SliderRow items={items} speed={sliderSpeed} />
              {secondRow && <SliderRow items={secondRow} speed={sliderSpeed * 0.8} reverse />}
              <p className="sr-only">{items.map((t) => `${t.author}: ${t.body}`).join(" ")}</p>
            </div>
          ))}

        {variant === "marquee" &&
          (reduce ? (
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-16 pt-2 sm:px-6 lg:px-8">
              {items.map((t, i) => (
                <div key={t.id ?? i} className="w-[320px] shrink-0 snap-start sm:w-[380px]">
                  <ReviewCard t={t} />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 pb-16 pt-2">
              <MarqueeRow items={items} duration={marqueeDuration} id="tm-marquee-a" />
              {secondRow && <MarqueeRow items={secondRow} duration={marqueeDuration * 1.15} reverse id="tm-marquee-b" />}
              <p className="sr-only">{items.map((t) => `${t.author}: ${t.body}`).join(" ")}</p>
            </div>
          ))}
      </InView>
    </section>
  )
}
