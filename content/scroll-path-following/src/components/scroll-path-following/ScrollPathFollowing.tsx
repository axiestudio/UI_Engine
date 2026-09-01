import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { ScrollProgress } from "@/components/primitives/scroll-progress"

import { cn } from "@/lib/utils"

// ═══ JOB         Path-following — a fixed route-styled progress rail that fills as you scroll.
// ═══ EMOTION     A journey, drawn.
// ═══ SIGNATURE   A progress line + a step counter that tracks your place in the section.

export type PathStop = { id: string; label: string }

export type ScrollPathFollowingProps = {
  eyebrow?: string
  stops: PathStop[]
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_STOPS = [
  { id: "st1", label: "Drawing" },
  { id: "st2", label: "Timber" },
  { id: "st3", label: "Joinery" },
  { id: "st4", label: "Finish" },
  { id: "st5", label: "Delivery" },
]
export function ScrollPathFollowing({ eyebrow = "ROUTE", stops = DEFAULT_STOPS, tone = "paper", className }: ScrollPathFollowingProps) {
  const ink = tone === "ink"
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const runway = `${Math.max(stops.length, 3) * 90}vh`
  const [active, setActive] = React.useState(0)
  React.useEffect(() => scrollYProgress.on("change", (v) => setActive(Math.min(stops.length - 1, Math.floor(v * stops.length)))), [scrollYProgress, stops.length])
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", cn("relative", className))}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <ScrollProgress className="absolute left-0 top-0 z-10 h-1 w-full bg-[hsl(var(--primary)/0.7)]" />
      <div ref={ref} style={{ height: runway }} className="relative">
        <div className="sticky top-10 flex h-[70vh] items-center">
          <ol className="relative ml-4 w-full space-y-10 border-l pl-8">
            {stops.map((s, i) => (
              <li key={s.id} className="relative">
                <span className={cn("absolute -left-[41px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2", i <= active ? "border-foreground bg-foreground" : "border-border bg-background")} />
                <p className={cn("font-mono text-[11px] font-bold uppercase tracking-widest", i <= active ? "text-foreground" : ink ? "text-background/40" : "text-muted-foreground")}>
                  {String(i + 1).padStart(2, "0")} · {s.label}
                </p>
                {i === active && <p className={cn("mt-1 text-sm font-medium", ink ? "text-background/70" : "text-muted-foreground")}>You are here.</p>}
              </li>
            ))}
          </ol>
        </div>
      </div>
    
  </div>
</section>
  )
}
