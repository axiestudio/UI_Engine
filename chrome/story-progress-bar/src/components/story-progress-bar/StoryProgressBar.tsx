import * as React from "react"
import { motion } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type StorySlide = { src: string; caption: string }

export type StoryProgressBarProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  caption?: string
  slides?: StorySlide[]
  duration?: number
  className?: string
}

const DEFAULT_SLIDES: StorySlide[] = [
  { src: "/showcase/gallery-01.webp", caption: "Chair one · morning cut" },
  { src: "/showcase/gallery-02.webp", caption: "The colour bar · mid-mix" },
  { src: "/showcase/gallery-03.webp", caption: "Last chair · ledger closes" },
]

const TICK = 50

export function StoryProgressBar({
  eyebrow = "Quiet Times Studio",
  title = "Studio story",
  subtitle = "Three frames from a working day. Hold to pause, tap the edges to move.",
  caption = "A day at the studio",
  slides = DEFAULT_SLIDES,
  duration = 3500,
  className,
}: StoryProgressBarProps) {
  const [idx, setIdx] = React.useState(0)
  const [elapsed, setElapsed] = React.useState(0)
  const [paused, setPaused] = React.useState(false)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  React.useEffect(() => {
    if (reduce || paused || slides.length < 2) return
    const id = window.setInterval(() => {
      setElapsed((e) => {
        if (e + TICK >= duration) {
          setIdx((i) => (i + 1) % slides.length)
          return 0
        }
        return e + TICK
      })
    }, TICK)
    return () => window.clearInterval(id)
  }, [reduce, paused, duration, slides.length])

  const go = (dir: 1 | -1) => {
    setIdx((i) => (i + dir + slides.length) % slides.length)
    setElapsed(0)
  }

  const hold = () => setPaused(true)
  const release = () => setPaused(false)

  return (
    <section role="region" aria-label={title} className={cn("flex justify-center bg-background py-14 sm:py-20", className)}>
      <h2 className="sr-only">{title}</h2>
      <p className="sr-only">{subtitle}</p>
      <div
        onPointerDown={hold}
        onPointerUp={release}
        onPointerLeave={release}
        onPointerCancel={release}
        className="relative aspect-[9/16] w-full max-w-[360px] select-none overflow-hidden rounded-[24px] border bg-muted shadow-sm"
      >
        <div aria-hidden className="absolute inset-0">
          {slides.map((s, i) => (
            <div
              key={s.src}
              className={cn("absolute inset-0 bg-cover bg-center transition-opacity", reduce ? "duration-0" : "duration-500", i === idx ? "opacity-100" : "opacity-0")}
              style={{ backgroundImage: `url(${s.src})` }}
            />
          ))}
        </div>

        <button
          type="button"
          aria-label="Previous story"
          onClick={() => go(-1)}
          className="group absolute inset-y-0 left-0 z-10 w-1/2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          <ChevronLeft
            aria-hidden
            className="absolute left-3 top-1/2 size-7 -translate-y-1/2 rounded-full bg-foreground/85 p-1.5 text-background opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          />
        </button>
        <button
          type="button"
          aria-label="Next story"
          onClick={() => go(1)}
          className="group absolute inset-y-0 right-0 z-10 w-1/2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          <ChevronRight
            aria-hidden
            className="absolute right-3 top-1/2 size-7 -translate-y-1/2 rounded-full bg-foreground/85 p-1.5 text-background opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          />
        </button>

        <div aria-hidden className="absolute inset-x-3 top-3 z-20 flex gap-1.5">
          {slides.map((_, i) => {
            const done = i < idx
            const activeSeg = i === idx
            return (
              <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-background/40">
                {done ? (
                  <div className="h-full w-full bg-background" />
                ) : activeSeg ? (
                  <motion.div
                    key={idx}
                    className="h-full rounded-full bg-background"
                    initial={{ width: "0%" }}
                    animate={{ width: `${Math.min(100, (elapsed / duration) * 100)}%` }}
                    transition={reduce ? { duration: 0 } : { duration: TICK / 1000, ease: "linear" }}
                  />
                ) : null}
              </div>
            )
          })}
        </div>

        <span className="absolute left-3 top-7 z-20 rounded-full bg-foreground/85 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-background">
          {eyebrow}
        </span>

        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/85 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-background transition-opacity duration-200",
            paused ? "opacity-100" : "opacity-0",
          )}
        >
          Paused
        </span>

        <p aria-live="polite" className="absolute inset-x-3 bottom-3 z-20 flex items-end justify-between gap-2">
          <span className="max-w-[75%] truncate rounded-full bg-foreground/85 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-background">
            {slides[idx]?.caption ?? caption}
          </span>
          <span className="rounded-full bg-foreground/85 px-2.5 py-1.5 font-mono text-[10px] font-bold tabular-nums text-background">
            {String(idx + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
        </p>
      </div>
    </section>
  )
}
