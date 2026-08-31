import * as React from "react"
import { motion, useMotionValue, useInView, useSpring } from "motion/react"
import { Play } from "lucide-react"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

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
  src = "/videos/hero.mp4",
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
    <SectionShell width={1120} grain rule="bottom" className={className}>
      <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <div ref={ref} className="relative mt-10 overflow-hidden rounded-2xl bg-foreground">
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
        <button type="button" aria-label="Play" className="absolute inset-0 flex items-center justify-center text-white opacity-0">
          <Play className="h-10 w-10" />
        </button>
        {caption && <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/80">{caption}</p>}
      </div>
    </SectionShell>
  )
}
