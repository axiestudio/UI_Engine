import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"

import { cn } from "@/lib/utils"

// ═══ JOB         Deck master — a fully scroll-controlled horizontal story with a HUD.
// ═══ EMOTION     A guided, presentational tour.
// ═══ SIGNATURE   A pinned stage where chapters advance and a progress HUD fills.

export type DeckStep = { id: string; title: string; body?: string; stat?: string }

export type ScrollDeckMasterProps = {
  eyebrow?: string
  steps: DeckStep[]
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_STEPS = [
  { id: "d1", title: "Pick the timber", body: "Grain matched across every visible face.", stat: "01" },
  { id: "d2", title: "Cut the joinery", body: "Hand-fitted, tested dry, then glued.", stat: "02" },
  { id: "d3", title: "Finish and rest", body: "Three coats, seven days of cure.", stat: "03" },
  { id: "d4", title: "Deliver and sign", body: "Initials inside the back panel.", stat: "04" },
]
export function ScrollDeckMaster({ eyebrow = "DECK MASTER", steps = DEFAULT_STEPS, tone = "paper", className }: ScrollDeckMasterProps) {
  const ink = tone === "ink"
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const runway = `${steps.length * 110}vh`
  const [idx, setIdx] = React.useState(0)
  React.useEffect(() => scrollYProgress.on("change", (v) => setIdx(Math.min(steps.length - 1, Math.floor(v * steps.length)))), [scrollYProgress, steps.length])
  const barScale = useTransform(scrollYProgress, [0, 1], [0, 1])
  const x = useTransform(scrollYProgress, [0, 1], ["2%", `-${(steps.length - 1) * 34}%`])
  const step = steps[idx]
  return (
    <section ref={ref} className={cn("relative w-full bg-foreground text-background", className)} style={{ height: runway }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-5 py-4 sm:px-8">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-background/60">{eyebrow}</p>
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-background/50">{idx + 1} / {steps.length}</span>
        </div>
        <div className="relative flex-1 overflow-hidden">
          <motion.div style={{ x }} className="absolute inset-0 flex grow-0">
            {steps.map((s) => (
              <div key={s.id} className="flex h-full w-full shrink-0 flex-col items-center justify-center px-5 text-center sm:px-8">
                {s.stat && <p className="font-display text-8xl font-bold text-background/20 sm:text-9xl">{s.stat}</p>}
                <h2 className="mt-4 font-display text-4xl font-bold tracking-[-0.03em] sm:text-6xl">{s.title}</h2>
                {s.body && <p className="mt-4 max-w-md text-base font-medium leading-relaxed text-background/70">{s.body}</p>}
              </div>
            ))}
          </motion.div>
        </div>
        <div className="mx-auto w-full max-w-[1280px] px-5 pb-8 sm:px-8">
          <div className="h-1 w-full overflow-hidden rounded-full bg-background/15">
            <motion.div style={{ scaleX: barScale }} className="h-full origin-left bg-background" />
          </div>
        </div>
      </div>
    </section>
  )
}
