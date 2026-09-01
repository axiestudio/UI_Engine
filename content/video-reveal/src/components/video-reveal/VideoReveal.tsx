import * as React from "react"
import { motion, useMotionValue, useInView, useSpring } from "motion/react"
import { Play } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ═══ JOB         Video reveal — a video that clips open on scroll into view.
// ═══ EMOTION     The curtain lifts onto the film.
// ═══ SIGNATURE   An inset-clip video that opens from the center as it enters view.

export type VideoRevealProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  src?: string
  poster?: string
  /** Centre slit width at start, as a % inset. */
  slit?: number
  caption?: string
  className?: string
}

export function VideoReveal({
  eyebrow = "REVEAL",
  title = "A film that opens.",
  subtitle = "The video splits open from a hairline as it enters view.",
  src = "/showcase/content/video/editorial-drift.mp4",
  poster,
  slit = 50,
  caption = "SCROLL — THE SLIT OPENS",
  className,
}: VideoRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const open = useMotionValue(0)
  const openSpring = useSpring(open, { stiffness: 160, damping: 26 })
  const [clip, setClip] = React.useState({ inset: `${slit}% 0% ${slit}% 0%` })
  const [play, setPlay] = React.useState(false)

  React.useEffect(() => { if (inView) open.set(1) }, [inView, open])
  React.useEffect(() => openSpring.on("change", (v) => {
    setClip({ inset: `${slit - slit * v}% 0% ${slit - slit * v}% 0%` })
    if (v > 0.85) setPlay(true)
  }), [openSpring, slit])

  return (
    <section className={cn("relative isolate w-full overflow-hidden", false && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", false ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

        <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", false ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", false ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", false ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      <div ref={ref} className="relative mt-10 overflow-hidden rounded-xl bg-foreground">
        <video
          autoPlay={play}
          loop
          muted
          playsInline
          poster={poster}
          style={{ clipPath: clip.inset }}
          className="aspect-video w-full object-cover will-change-[clip-path]"
          src={src}
        />
        <Button type='button' aria-label="Play" className="absolute inset-0 flex items-center justify-center text-white opacity-0" variant="default">
          <Play className="h-10 w-10" />
        </Button>
        {caption && <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/80">{caption}</p>}
      </div>
    
  </div>
</section>
  )
}
