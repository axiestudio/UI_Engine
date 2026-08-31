import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
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

export function MediaSlideshowMask({ eyebrow = "ROTATE", title = "A masked rotation.", frames, interval = 4200, tone = "paper", className }: MediaSlideshowMaskProps) {
  const ink = tone === "ink"
  const [idx, setIdx] = React.useState(0)
  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % frames.length), interval)
    return () => clearInterval(t)
  }, [frames.length, interval])
  const active = frames[idx]
  return (
    <SectionShell tone={tone} width={920} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
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
    </SectionShell>
  )
}
