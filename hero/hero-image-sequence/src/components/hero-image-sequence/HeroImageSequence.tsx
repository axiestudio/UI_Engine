import * as React from "react"
import { motion, useInView, useMotionValue, useSpring } from "motion/react"
import { MonoLabel } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Image-sequence hero — a frame-by-frame sequence scrubbed by scroll.
// ═══ EMOTION     Cinematic motion-graphics feel.
// ═══ SIGNATURE   An image crossfades through a sequence as you scroll the runway.

export type HeroImageSequenceProps = {
  eyebrow?: string
  title?: React.ReactNode
  srcs?: string[]
  runway?: string
  className?: string
}

export function HeroImageSequence({
  eyebrow = "SEQUENCE",
  title = "A hero that plays as you scroll.",
  srcs = [
    "/showcase/gallery-01.webp",
    "/showcase/gallery-02.webp",
    "/showcase/gallery-03.webp",
    "/showcase/gallery-04.webp",
    "/showcase/gallery-05.webp",
    "/showcase/gallery-06.webp",
  ],
  runway = "260vh",
  className,
}: HeroImageSequenceProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.1 })
  const progress = useMotionValue(0)
  const spring = useSpring(progress, { stiffness: 140, damping: 24 })
  const [frame, setFrame] = React.useState(0)
  const [fade, setFade] = React.useState(0)

  React.useEffect(() => {
    if (!inView) return
    let raf = 0
    const onScroll = () => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const p = Math.max(0, Math.min(1, -rect.top / total))
      progress.set(p)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    const unsub = spring.on("change", (v) => {
      const idx = Math.min(srcs.length - 1, Math.floor(v * srcs.length))
      setFrame(idx)
      setFade(Math.abs(v * srcs.length - idx - 0.5) * 2)
    })
    return () => { window.removeEventListener("scroll", onScroll); unsub(); cancelAnimationFrame(raf) }
  }, [inView, srcs.length, spring, progress])

  // No overflow-hidden on the runway: it would trap the sticky viewport
  // (hidden overflow = scroll container) and pinning would never engage.
  return (
    <section ref={ref} className="relative isolate w-full bg-foreground" style={{ height: runway }}>
      <div className="sticky top-0 flex h-screen items-end justify-center overflow-hidden">
        <div className="absolute inset-0">
          {srcs.map((s, i) => (
            <motion.img
              key={s}
              src={s}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              style={{ opacity: i === frame ? 1 - fade * 0.2 : i === frame - 1 ? fade * 0.2 : 0 }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
        </div>
        <div className="relative z-10 w-full bg-gradient-to-t from-black/60 to-transparent p-8 pb-14 text-background">
          <MonoLabel className="text-background/60">{eyebrow}</MonoLabel>
          <h2 className="mt-2 font-display text-3xl font-black tracking-[-0.03em] sm:text-5xl">{title}</h2>
          <p className="mt-2 font-mono text-[11px] font-bold uppercase tracking-widest text-background/50">frame {frame + 1} / {srcs.length}</p>
        </div>
      </div>
    </section>
  )
}
