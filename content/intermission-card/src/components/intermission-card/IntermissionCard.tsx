import * as React from "react"
import { motion, useInView } from "motion/react"
import { useRef } from "react"
import { cn } from "@/lib/utils"

// ═══ JOB      a deliberate full-width breath between two acts of a page
// ═══ EMOTION  smiling recognition (silent-film grammar, modern craft)
// ═══ SIGNATURE spoked circle IRIS wipes in (closed→open), the intertitle
//               card settles with a light tilt, iris wipes out on exit-of-view
//   SITE  → act/chapter divider on long editorials and landings
//   APP   → step break in wizards/onboarding — labels the next act
//   A11Y  pure static text inside; iris is decoration (aria-hidden)

export type IntermissionCardProps = {
  /** e.g. "ACT II" */
  act?: string
  title?: React.ReactNode
  line?: React.ReactNode
  /** tone: silent-film near-black card, or paper title card */
  tone?: "ink" | "paper"
  className?: string
}

export function IntermissionCard({ act = "INTERMISSION", title, line = "Coffee, then the good part.", tone = "ink", className }: IntermissionCardProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const ref = useRef(null)
  const inView = useInView(ref, { once: false, margin: "-20% 0px" })
  const ink = tone === "ink"
  return (
    <section ref={ref} className={cn("relative isolate flex min-h-[52vh] w-full items-center justify-center overflow-hidden px-4 py-24", ink ? "bg-[hsl(var(--inter-shut))] text-white" : "border-y bg-[hsl(var(--inter-card))] text-[hsl(var(--inter-frame))]", className)}>
      <motion.div
        initial={reduce ? { opacity: 0 } : { clipPath: "circle(0% at 50% 50%)" }}
        animate={reduce ? { opacity: inView ? 1 : 0 } : { clipPath: inView ? "circle(75% at 50% 50%)" : "circle(0% at 50% 50%)" }}
        transition={{ duration: reduce ? 0.3 : 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[820px]"
      >
        <motion.div
          initial={reduce ? undefined : { rotate: -1.6, y: 10, opacity: 0 }}
          animate={{ rotate: -0.8, y: 0, opacity: inView ? 1 : 0 }}
          transition={{ duration: 0.7, delay: reduce ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
          className={cn("relative border-[6px] py-12 text-center sm:py-16", ink ? "border-white" : "border-[hsl(var(--inter-frame))]")}
        >
          {/* spoked double-frame corners */}
          {[["-top-2 -left-2", "border-t-2 border-l-2"], ["-top-2 -right-2", "border-t-2 border-r-2"], ["-bottom-2 -left-2", "border-b-2 border-l-2"], ["-bottom-2 -right-2", "border-b-2 border-r-2"]].map(([pos, side]) => (
            <span key={pos} aria-hidden className={cn("absolute size-4", pos, side, ink ? "border-white/70" : "border-[hsl(var(--inter-frame))]/70")} />
          ))}
          <p className="font-mono text-[11px] font-black uppercase tracking-[0.5em] opacity-70">— {act} —</p>
          {title && <p className="mx-auto mt-4 max-w-[560px] px-4 font-display text-[30px] font-black uppercase leading-[1.05] tracking-tight sm:text-[44px]">{title}</p>}
          <p className={cn("mx-auto mt-4 max-w-[440px] px-6 font-serif text-[15px] italic leading-relaxed", ink ? "opacity-75" : "opacity-70")}>{line}</p>
          <span aria-hidden className="mx-auto mt-6 flex w-fit items-center gap-2">
            {[10, 4, 10].map((w, i) => <span key={i} className={cn("h-[3px]", i === 1 ? "w-1.5 rounded-full" : "w-2.5")} style={{ background: "currentColor", opacity: i === 1 ? 0.5 : 1 }} />)}
          </span>
        </motion.div>
      </motion.div>
      {/* sprocket rails top/bottom */}
      <span aria-hidden className={cn("absolute inset-x-0 top-0 h-6", ink ? "bg-white/[0.06]" : "bg-black/[0.05]")} style={{ backgroundImage: "radial-gradient(circle at 6px 50%, transparent 3px, currentColor 3px)", backgroundSize: "24px 100%" }} />
      <span aria-hidden className={cn("absolute inset-x-0 bottom-0 h-6", ink ? "bg-white/[0.06]" : "bg-black/[0.05]")} style={{ backgroundImage: "radial-gradient(circle at 6px 50%, transparent 3px, currentColor 3px)", backgroundSize: "24px 100%" }} />
    </section>
  )
}
