import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Scrub timeline — a scroll-scrubbed horizontal timeline of epochs.
// ═══ EMOTION     A sense of time moving.
// ═══ SIGNATURE   A pinned stage where an epoch marker shifts; a progress bar tracks.

export type ScrubEpoch = { id: string; year: string; title: string; body?: string }

export type StoryScrubTimelineProps = {
  eyebrow?: string
  epochs: ScrubEpoch[]
  className?: string
}

export function StoryScrubTimeline({ eyebrow = "EPOCHS", epochs, className }: StoryScrubTimelineProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const runway = `${epochs.length * 80}vh`
  const [idx, setIdx] = React.useState(0)
  React.useEffect(() => scrollYProgress.on("change", (v) => setIdx(Math.min(epochs.length - 1, Math.floor(v * epochs.length)))), [scrollYProgress, epochs.length])
  const barScale = useTransform(scrollYProgress, [0, 1], [0, 1])
  const epoch = epochs[idx]
  return (
    <SectionShell width={1120} grain rule="bottom" className={cn("relative", className)}>
      <div ref={ref} style={{ height: runway }} className="relative">
        <div className="sticky top-8 ml-4 flex h-[72vh] flex-col justify-center">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
          <div className="relative mt-6 border-l pl-6 [border-color:border]">
            <motion.span className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full bg-foreground"
              style={{ top: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]), position: "absolute" }} />
            {epochs.map((e, i) => (
              <div key={e.id} className={cn("py-4 transition-opacity", i === idx ? "opacity-100" : "opacity-20")}>
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{e.year}</p>
                <h3 className="font-display text-2xl font-black sm:text-3xl">{e.title}</h3>
                {i === idx && e.body && <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-muted-foreground">{e.body}</p>}
              </div>
            ))}
          </div>
          <div className="mt-8 h-1 w-full overflow-hidden rounded-full bg-muted">
            <motion.div style={{ scaleX: barScale }} className="h-full origin-left bg-foreground" />
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
