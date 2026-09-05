import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"

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

const DEFAULT_EPOCHS = [
  { id: "ep1", year: "1962", title: "Grandfather's bench", body: "Built from a barn's beams. Still perfectly flat." },
  { id: "ep2", year: "1988", title: "The craft standard", body: "One page of rules, written by the second generation." },
  { id: "ep3", year: "2014", title: "The workshop", body: "The third generation opens the north-light room." },
  { id: "ep4", year: "2026", title: "Still here", body: "Same rules. The espresso machine is now ours." },
]
export function StoryScrubTimeline({ eyebrow = "EPOCHS", epochs = DEFAULT_EPOCHS, className }: StoryScrubTimelineProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const runway = `${epochs.length * 80}vh`
  const [idx, setIdx] = React.useState(0)
  React.useEffect(() => scrollYProgress.on("change", (v) => setIdx(Math.min(epochs.length - 1, Math.floor(v * epochs.length)))), [scrollYProgress, epochs.length])
  const barScale = useTransform(scrollYProgress, [0, 1], [0, 1])
  const epoch = epochs[idx]
  // anchor the marker to the active epoch card so it actually tracks when
  // the user scrolls (the raw useTransform top→0%/100% offset the dot
  // outside the timeline rail; ref-based math keeps it glued to the row).
  const dotRef = React.useRef<HTMLSpanElement>(null)
  React.useLayoutEffect(() => {
    const el = dotRef.current
    if (!el) return
    const railEl = el.parentElement
    if (!railEl) return
    const active = railEl.querySelector<HTMLElement>(`[data-epoch-idx="${idx}"]`)
    if (!active) return
    const railTop = railEl.getBoundingClientRect().top
    const rowTop = active.getBoundingClientRect().top
    el.style.top = `${rowTop - railTop + 4}px`
  }, [idx])
  return (
    <section className={cn("relative isolate w-full", className)}>
      <div className="relative mx-auto w-full px-5 sm:px-8 py-20 sm:py-24" style={{ maxWidth: 1120 }}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
        <div ref={ref} style={{ height: runway }} className="relative mt-6">
          <div className="sticky top-6 flex flex-col gap-6">
            <div className="relative border-l border-border pl-6" style={{ minHeight: "60vh" }}>
              <motion.span
                ref={dotRef}
                aria-hidden
                className="absolute -left-[5px] h-2.5 w-2.5 rounded-full bg-foreground"
              />
              {epochs.map((e, i) => (
                <div
                  key={e.id}
                  data-epoch-idx={i}
                  className={cn("py-5 transition-opacity duration-500", i === idx ? "opacity-100" : "opacity-20")}
                >
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{e.year}</p>
                  <h3 className="mt-1 font-display text-2xl font-bold sm:text-3xl">{e.title}</h3>
                  {e.body && <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-muted-foreground">{e.body}</p>}
                </div>
              ))}
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <motion.div style={{ scaleX: barScale }} className="h-full origin-left bg-foreground" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
