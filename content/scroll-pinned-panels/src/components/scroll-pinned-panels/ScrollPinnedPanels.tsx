import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { cn } from "@/lib/utils"

// ═══ JOB         Pinned panels — full-viewport panels that slide vertically over each other.
// ═══ EMOTION     Slide-deck gravity.
// ═══ SIGNATURE   Panels stack in place; each next panel slides up over the previous.

export type PinnedPanel = { id: string; kicker: string; title: string; body?: string; tone?: "ink" | "paper" }

export type ScrollPinnedPanelsProps = {
  eyebrow?: string
  panels: PinnedPanel[]
  className?: string
}

const DEFAULT_PANELS: PinnedPanel[] = [
  { id: "pn1", kicker: "ACT I", title: "The room goes quiet", body: "Machines off, hand tools out. You can hear the chisel again.", tone: "paper" },
  { id: "pn2", kicker: "ACT II", title: "Glue takes its time", body: "Clamps set for an hour. Nobody rushes the chemistry.", tone: "ink" },
  { id: "pn3", kicker: "ACT III", title: "The last coat", body: "Oil applied, wiped, waited on. Then it rests a week.", tone: "paper" },
]
export function ScrollPinnedPanels({ eyebrow = "PANELS", panels = DEFAULT_PANELS, className }: ScrollPinnedPanelsProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const runway = `${panels.length * 90}vh`
  return (
    <section ref={ref} className={cn("relative w-full", className)} style={{ height: runway }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute left-0 top-6 w-full px-5 sm:px-8">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
        </div>
        {panels.map((p, i) => {
          const start = i / panels.length
          const end = (i + 1) / panels.length
          // y: previous panel slides up slightly as this one covers
          const y = useTransform(scrollYProgress, [start, end], ["100%", "0%"])
          return (
            <motion.div key={p.id} style={{ y }} className={cn("absolute inset-0 flex flex-col items-center justify-center px-6 text-center", p.tone === "ink" ? "bg-foreground text-background" : "bg-background")}>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{p.kicker}</p>
              <h2 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-[0.98] tracking-[-0.03em] sm:text-6xl">{p.title}</h2>
              {p.body && <p className="mt-4 max-w-md text-base font-medium leading-relaxed text-muted-foreground">{p.body}</p>}
              <span className="mt-8 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{i + 1} / {panels.length}</span>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
