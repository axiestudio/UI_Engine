import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Slideshow mask — an auto-advancing set of crossfading slides.
// ═══ EMOTION     A clean rotation of imagery.
// ═══ SIGNATURE   Crossfade slides + a masked motion wipe + dot controls.

export type SlideshowMaskFrame = { id: string; src?: string; alt?: string; caption?: string }

export type MediaSlideshowMaskProps = {
  eyebrow?: string
  title?: React.ReactNode
  frames: SlideshowMaskFrame[]
  interval?: number
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_FRAMES = [
  { id: "f1", src: "/showcase/content/content-01-office.webp", alt: "The workshop floor", caption: "Made, not manufactured" },
  { id: "f2", src: "/showcase/content/content-02-team.webp", alt: "The crew", caption: "Made, not manufactured" },
  { id: "f3", src: "/showcase/content/content-03-product.webp", alt: "Finished piece", caption: "Made, not manufactured" },
  { id: "f4", src: "/showcase/content/content-04-architecture.webp", alt: "Building exterior", caption: "Made, not manufactured" },
  { id: "f5", src: "/showcase/content/content-05-workshop.webp", alt: "Bench time", caption: "Made, not manufactured" },
  { id: "f6", src: "/showcase/content/content-06-nature.webp", alt: "Material study", caption: "Made, not manufactured" },
]
export function MediaSlideshowMask({ eyebrow = "ROTATE", title = "A masked rotation.", frames = DEFAULT_FRAMES, interval = 4200, tone = "paper", className }: MediaSlideshowMaskProps) {
  const ink = tone === "ink"
  const [idx, setIdx] = React.useState(0)
  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % frames.length), interval)
    return () => clearInterval(t)
  }, [frames.length, interval])
  const active = frames[idx]
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>
      <InView once variants={{ hidden: { opacity: 0, scale: 0.97 }, visible: { opacity: 1, scale: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
        <div className="relative mt-10 overflow-hidden rounded-xl border bg-muted">
          <div className="relative aspect-[16/9]">
            <AnimatePresence mode="sync">
              <motion.img
                key={active.id}
                src={active.src}
                alt={active.alt ?? ""}
                className="absolute inset-0 h-full w-full object-cover"
                initial={{ opacity: 0, clipPath: "inset(50% 0 50% 0)" }}
                animate={{ opacity: 1, clipPath: "inset(0 0 0 0)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              />
            </AnimatePresence>
            {active.caption && <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/50 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white">{active.caption}</span>}
          </div>
          <div className="flex justify-center gap-2 py-3">
            {frames.map((f, i) => (
              <button key={f.id} type="button" onClick={() => setIdx(i)} className={cn("h-1.5 rounded-full transition-all", i === idx ? "w-6 bg-foreground" : "w-1.5 bg-muted-foreground/40")} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
        </div>
      </InView>
    
  </div>
</section>
  )
}
