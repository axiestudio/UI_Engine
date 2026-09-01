import * as React from "react"
import { motion, useScroll, useTransform, useSpring, type MotionValue } from "motion/react"
import { cn } from "@/lib/utils"

// ═══ JOB         Progress gauges — circular progress dials that fill as you scroll a track.
// ═══ EMOTION     Quantified momentum.
// ═══ SIGNATURE   A row of SVG circles whose arcs sweep up with a number.

export type Gauge = { id: string; label: string; target: number; suffix?: string }

export type ScrollProgressGaugesProps = {
  eyebrow?: string
  gauges: Gauge[]
  className?: string
}

const DEFAULT_GAUGES = [
  { id: "g1", label: "Drawings approved", target: 100, suffix: "%" },
  { id: "g2", label: "On-time delivery", target: 96, suffix: "%" },
  { id: "g3", label: "Repairs under warranty", target: 2, suffix: "yr" },
  { id: "g4", label: "Clients who return", target: 81, suffix: "%" },
]
export function ScrollProgressGauges({ eyebrow = "GAUGES", gauges = DEFAULT_GAUGES, className }: ScrollProgressGaugesProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const sp = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  return (
    <section className={cn("relative isolate w-full overflow-hidden", false && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", false ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
      <div ref={ref} className="mt-10 grid grid-cols-2 gap-8 lg:grid-cols-4">
        {gauges.map((g, i) => <GaugeDial key={g.id} gauge={g} progress={sp} index={i} />)}
      </div>
    
  </div>
</section>
  )
}

function GaugeDial({ gauge, progress, index }: { gauge: Gauge; progress: MotionValue<number>; index: number }) {
  const R = 42
  const C = 2 * Math.PI * R
  const [shown, setShown] = React.useState(0)
  const start = index / 4
  const end = (index + 1) / 4
  const local = useTransform(progress, [start, end], [0, 1])
  const dash = useTransform(local, (v) => C * (1 - Math.min(v, 1)))
  React.useEffect(() => local.on("change", (v) => setShown(Math.round(Math.min(v, 1) * gauge.target))), [local, gauge.target])
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={R} fill="none" strokeWidth="8" className="stroke-muted" />
          <motion.circle cx="50" cy="50" r={R} fill="none" strokeWidth="8" strokeLinecap="round"
            className="stroke-foreground"
            strokeDasharray={C} style={{ strokeDashoffset: dash }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-display text-xl font-bold tabular-nums">
          {shown}{gauge.suffix}
        </span>
      </div>
      <p className="mt-3 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{gauge.label}</p>
    </div>
  )
}
