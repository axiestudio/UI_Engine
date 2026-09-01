import * as React from "react"
import { motion, useScroll, useTransform, useMotionValue } from "motion/react"
import type { MotionValue } from "motion/react"
import { cn } from "@/lib/utils"


// ═══ JOB      carry a story frame by frame (history, case study, tour)
// ═══ EMOTION  the click-whirr of a projector — time you can feel
// ═══ SIGNATURE the strip slides horizontally as you scroll vertically;
//               sprocket rail = progress, active frame brightens + steps up
//   SITE  → "how we got here" / project recap section
//   APP   → guided-tour player / changelog playback (host owns its own scroll)
//   A11Y  strip aria-hidden; every frame's copy is in a list below the fold
//         (sr-only optional); reduced-motion → plain snap row (no scrub)

export type FilmFrame = { img?: string; kicker?: string; title: React.ReactNode; copy?: React.ReactNode }

export type FilmStripProps = {
  frames: FilmFrame[]
  eyebrow?: string
  title?: React.ReactNode
  /** Scroll length the strip is given in overlay-page mode. Ignored when inside
   *  an app route with its own scroller — pass `container` for that. */
  height?: string
  className?: string
}

export function FilmStrip({ frames, eyebrow = "THE REEL", title, height = "320vh", className }: FilmStripProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] })

  const x = useTransform(scrollYProgress, [0, 1], ["2%", `-${Math.max(0, (frames.length - 1) * 0.62) * 100 / frames.length}%`])
  const idx = useTransform(scrollYProgress, (p) => Math.min(frames.length - 1, Math.floor(p * frames.length + 0.001)))

  if (reduce) {
    return (
      <section className={cn("w-full px-4 py-16 sm:px-6", className)}>
        <div className="mx-auto mb-8 flex w-full max-w-[1120px] items-end justify-between px-6">
          <div>
            <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>
            {title && <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>}
          </div>
        </div>
        <div className="flex snap-x gap-4 overflow-x-auto pb-4">
          {frames.map((f, i) => <div key={i} className="w-[min(78vw,420px)] shrink-0"><FrameInner frame={f} /></div>)}
        </div>
      </section>
    )
  }

  return (
    <div ref={wrapRef} className={cn("relative isolate", className)} style={{ height }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden bg-background">
        <HeadLine eyebrow={eyebrow} title={title} idx={idx} total={frames.length} />
        <motion.div style={{ x }} className="mt-8 flex w-max gap-6 pl-[8vw] will-change-transform">
          {frames.map((f, i) => (
            <ActiveFrame key={i} f={i} idx={idx} frames={frames} />
          ))}
        </motion.div>
        <Sprockets progress={scrollYProgress} />
      </div>
    </div>
  )
}

function HeadLine({ eyebrow, title, idx, total }: { eyebrow: string; title?: React.ReactNode; idx: MotionValue<number>; total: number }) {
  const label = useTransform(idx, (i) => String(i + 1).padStart(2, "0"))
  return (
    <div className="mx-auto flex w-full max-w-[1120px] items-end justify-between px-6">
      <div>
        <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>
        {title && <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>}
      </div>
      <p className="font-mono text-[12px] font-bold tracking-[0.18em] text-muted-foreground">
        <motion.span>{label}</motion.span> / {String(total).padStart(2, "0")}
      </p>
    </div>
  )
}

function ActiveFrame({ f, idx, frames }: { f: number; idx: MotionValue<number>; frames: FilmFrame[] }) {
  const scale = useTransform(idx, [f - 0.5, f, f + 0.5], [0.92, 1, 0.92])
  const y = useTransform(idx, [f - 0.5, f, f + 0.5], [10, 0, 10])
  const dim = useTransform(idx, [f - 0.6, f, f + 0.6], [0.55, 0, 0.55])
  return (
    <motion.div style={{ scale, y }} className="relative w-[min(78vw,460px)] shrink-0">
      <FrameInner frame={frames[f]} />
      <motion.div style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-background/80" aria-hidden />
    </motion.div>
  )
}

function FrameInner({ frame }: { frame: FilmFrame }) {
  return (
    <figure className="relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
      {frame.img ? (
        <img src={frame.img} alt="" className="aspect-[16/10] w-full object-cover" loading="lazy" />
      ) : (
        <div className="aspect-[16/10] w-full bg-muted" />
      )}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-[repeating-linear-gradient(90deg,hsl(var(--film-ink)/0.9)_0_10px,transparent_10px_22px)] opacity-[0.06]" aria-hidden />
      <figcaption className="px-4 py-3.5">
        {frame.kicker && <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{frame.kicker}</p>}
        <h3 className="mt-1 font-display text-lg font-bold tracking-tight">{frame.title}</h3>
        {frame.copy && <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-muted-foreground">{frame.copy}</p>}
      </figcaption>
    </figure>
  )
}

function Sprockets({ progress }: { progress: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  const w = useTransform(progress, [0, 1], ["0%", "100%"])
  return (
    <div className="mx-auto mt-8 w-full max-w-[1120px] px-6" aria-hidden>
      <div className="relative h-4 bg-[repeating-linear-gradient(90deg,hsl(var(--film-sprocket)/0.35)_0_12px,transparent_12px_28px)] [mask-image:linear-gradient(transparent_40%,black_40%,black_60%,transparent_60%)]" />
      <motion.div style={{ width: w }} className="mt-1 h-[2px] bg-[hsl(var(--film-ink))] transition-none" />
    </div>
  )
}


