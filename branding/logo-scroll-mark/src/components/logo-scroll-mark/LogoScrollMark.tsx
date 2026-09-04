import * as React from "react"
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollProgress } from "@/components/primitives/scroll-progress"
import { Badge } from "@/components/ui/badge"

// ═══ JOB      make the logomark an event, not a decoration
// ═══ EMOTION  the mark assembles itself — craft you watched happen
// ═══ SIGNATURE scrub-drawn SVG: strokes pull along a spring-smoothed scroll
//               value; the side hairline runs on the same number; a state
//               badge flips in-progress → drawn; and at full draw a sign-off
//               tick stamps in once, rotated and pressed
//   SITE      → about-page openers, investor decks
//   APP       → onboarding splash: pass `progress` (0..1) from any route or
//               form state and the same choreography runs under control
//   BUILD     motion scrubbing via useScroll + useSpring + a MotionValue
//             mirror for controlled mode (one source, two feeders)
//   A11Y      svg is aria-hidden; the h2 carries the meaning; reduced
//             motion renders the finished drawing (tick included) statically

export type LogoScrollMarkProps = {
  title?: string
  eyebrow?: string
  /** Controlled draw progress 0..1. Omit to scrub from scroll. */
  progress?: number
  className?: string
}

export function LogoScrollMark({
  title = "Built, stroke by stroke.",
  eyebrow = "THE MARK · DRAWN ON SCROLL",
  progress,
  className,
}: LogoScrollMarkProps) {
  const reduced = useReducedMotion() ?? false
  const controlled = progress != null
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "center 0.45"] })
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 })
  const rail = useTransform(smooth, [0, 1], ["0%", "100%"])

  const controlledMV = useMotionValue(reduced ? 1 : controlled ? progress : 0)
  React.useEffect(() => {
    if (reduced) controlledMV.set(1)
    else if (controlled) controlledMV.set(Math.max(0, Math.min(1, progress)))
  }, [reduced, controlled, progress, controlledMV])

  const draw: MotionValue<number> = reduced || controlled ? controlledMV : smooth
  const pct = reduced ? 1 : controlled ? Math.max(0, Math.min(1, progress)) : 0
  const complete = reduced || (controlled ? pct >= 0.995 : false)

  // scroll mode: mirror the spring into state for the stamp + badge
  const [scrollDone, setScrollDone] = React.useState(false)
  React.useEffect(() => {
    if (reduced || controlled) return
    const un = smooth.on("change", (v) => { if (v >= 0.995) setScrollDone(true) })
    return () => un()
  }, [reduced, controlled, smooth])

  const isComplete = reduced ? true : controlled ? pct >= 0.995 : scrollDone

  return (
    <div ref={ref} className={cn("relative isolate overflow-hidden w-full bg-background text-foreground", className)}>
      <section className="relative w-full">
        <div className="mx-auto w-full max-w-[760px] px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {/* side progress rail, synced to the same spring as the strokes */}
        <span aria-hidden className="pointer-events-none absolute inset-y-16 right-6 hidden w-px bg-border sm:block">
          {reduced || controlled ? (
            <span className="absolute inset-x-0 top-0 bg-foreground transition-[height] duration-300" style={{ height: `${pct * 100}%` }} />
          ) : (
            <motion.span style={{ height: rail }} className="absolute inset-x-0 top-0 bg-foreground" />
          )}
        </span>

        <div className="flex flex-col items-center py-8 text-center">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</span>
            <DrawBadge complete={isComplete} />
          </div>

          <div className="relative mt-10">
            <svg width="160" height="160" viewBox="0 0 48 48" fill="none" aria-hidden className="text-foreground">
              <motion.rect x="4" y="4" width="40" height="40" rx="10" stroke="currentColor" strokeWidth="2.4" style={{ pathLength: draw }} />
              <motion.path d="M14 32 L24 14 L34 32" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: draw }} />
              <motion.circle cx="24" cy="27" r="3.5" fill="currentColor" style={{ scale: draw, transformOrigin: "24px 27px", opacity: draw }} />
            </svg>
            {/* sign-off tick — one-time stamp once the mark is finished */}
            {isComplete && (
              <motion.span
                aria-hidden
                initial={reduced ? false : { scale: 1.6, opacity: 0, rotate: 10 }}
                animate={{ scale: 1, opacity: 1, rotate: -6 }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
                className="absolute -right-2 -top-2 grid size-9 place-items-center rounded-full border-2 border-foreground bg-background text-foreground shadow-[3px_3px_0_0_hsl(var(--border))]"
              >
                <Check className="size-5" strokeWidth={3} />
              </motion.span>
            )}
          </div>

          <motion.h2
            initial={reduced ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-10 font-display text-[40px] font-black leading-[0.98] tracking-[-0.035em] text-foreground sm:text-[56px]"
          >
            {title}
          </motion.h2>

          {reduced || controlled ? (
            <div aria-hidden className="mt-8 h-[3px] w-40 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-foreground transition-[width] duration-300" style={{ width: `${pct * 100}%` }} />
            </div>
          ) : (
            <ScrollProgress className="mt-8 w-40" />
          )}
        </div>
      </div>
      </section>
    </div>
  )
}

function DrawBadge({ complete }: { complete: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-full font-mono text-[9px] font-black uppercase tracking-[0.16em] transition-colors duration-300",
        complete ? "text-foreground" : "text-muted-foreground/60",
      )}
    >
      <span aria-hidden className={cn("inline-block size-[5px] rounded-full transition-colors", complete ? "bg-foreground" : "bg-muted-foreground/60")} />
      {complete ? "drawn" : "in progress"}
    </Badge>
  )
}
