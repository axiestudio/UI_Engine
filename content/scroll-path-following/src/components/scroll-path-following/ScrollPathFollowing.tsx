import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { ScrollProgress } from "@/components/primitives/scroll-progress"
import { SectionShell } from "@/components/primitives/handcraft"
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

export function ScrollPathFollowing({ eyebrow = "ROUTE", stops, tone = "paper", className }: ScrollPathFollowingProps) {
  const ink = tone === "ink"
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const runway = `${Math.max(stops.length, 3) * 90}vh`
  const [active, setActive] = React.useState(0)
  React.useEffect(() => scrollYProgress.on("change", (v) => setActive(Math.min(stops.length - 1, Math.floor(v * stops.length)))), [scrollYProgress, stops.length])
  return (
    <SectionShell tone={tone} width={920} grain={!ink} rule="bottom" className={cn("relative", className)}>
      <ScrollProgress className="absolute left-0 top-0 z-10 h-1 w-full bg-[hsl(var(--site-accent)/0.7)]" />
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
    </SectionShell>
  )
}
