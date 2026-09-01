import * as React from "react"
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

// ═══ JOB      make the mission statement felt, not skimmed
// ═══ EMOTION  engraved conviction — words carved, not printed
// ═══ SIGNATURE outlined mission type fills clause-by-clause on scroll: each
//               line is stroked glass until the ink sweeps in from the left;
//               a fill meter and clause ordinals keep score, and the sign-off
//               rule closes the cut
//   SITE      → mission/about chapters, annual letters
//   APP       → company splash, values onboarding
//   BUILD     per-line clip-path bound to the SAME scroll fraction (one
//             source, staggered windows); meter reads the live value — no
//             fake percentages
//   A11Y      every clause exists once for AT (sr-only), stroke/fill spans
//             are aria-hidden; reduced motion = fully filled, meter static

export type MissionEtchProps = {
  lines?: string[]
  eyebrow?: string
  title?: React.ReactNode
  className?: string
}

const DEFAULT_LINES = [
  "We believe good work compounds quietly.",
  "We build tools that respect the hand that uses them.",
  "We finish. That is the whole trick.",
]

function EtchedLine({ line, i, total, fill, reduced }: { line: string; i: number; total: number; fill: MotionValue<number>; reduced: boolean }) {
  const clip = useTransform(fill, [i / total, (i + 0.92) / total], ["inset(0 100% 0 0)", "inset(0 0% 0 0)"])
  const done = useTransform(fill, [i / total, (i + 0.92) / total], [0, 1])
  const [filled, setFilled] = React.useState(false)
  useMotionValueEvent(done, "change", (v) => setFilled(v >= 1))

  return (
    <p className="relative font-display text-[26px] font-black leading-[1.14] tracking-[-0.02em] sm:text-[38px]">
      <span className="flex items-start justify-between gap-4">
        <span className="relative min-w-0">
          {/* ghost engraving */}
          <span aria-hidden className="block text-foreground/[0.25] [-webkit-text-stroke:1.2px_currentColor]">
            {line}
          </span>
          {/* ink fill — same rectangle, clipped by the shared scroll value */}
          <motion.span aria-hidden style={reduced ? { clipPath: "inset(0 0% 0 0)" } : { clipPath: clip }} className="absolute inset-0 block text-foreground">
            {line}
          </motion.span>
          <span className="sr-only">{line}</span>
        </span>
        <span className="flex shrink-0 items-center gap-3 pt-2">
          <span className={cn("font-mono text-[11px] font-semibold tabular-nums text-muted-foreground", cn("transition-opacity duration-500", filled ? "opacity-100 text-foreground" : "opacity-40"))}>{String(i + 1).padStart(2, "0")}<span className="opacity-50"> / {String(total).padStart(2, "0")}</span></span>
          <span
            aria-hidden
            className={cn("inline-block size-[7px] rotate-45 border border-foreground transition-colors duration-500", filled && "bg-foreground")}
          />
        </span>
      </span>
    </p>
  )
}

export function MissionEtch({
  lines = DEFAULT_LINES,
  eyebrow = "MISSION · ENGRAVED",
  title = "Cut once. Read slowly.",
  className,
}: MissionEtchProps) {
  const reduced = useReducedMotion() ?? false
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.55"] })

  return (
    <div ref={ref}>
      <section className="bg-background text-foreground">
        <div className="mx-auto w-full max-w-[920px] px-4 sm:px-6 lg:px-8 py-24 sm:py-28">
        <div className="flex items-end justify-between gap-x-8 gap-y-4">
                    <header className="">
            {eyebrow != null && (              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</span>            )}
            <h2 className="mt-2 tracking-tight text-4xl font-bold tracking-tight sm:text-5xl text-foreground">{title}</h2>
          </header>
          <Badge variant="outline" className="mb-1 hidden rounded-full font-mono text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground sm:inline-flex">
            {reduced ? "all cut" : "scrub to engrave"}
          </Badge>
        </div>
        <div className="mt-10 space-y-10">
          {lines.map((line, i) => (
            <EtchedLine key={line} line={line} i={i} total={lines.length} fill={scrollYProgress} reduced={reduced} />
          ))}
        </div>
        <div className="mt-14 flex flex-wrap items-center gap-4 pt-6">
          <Separator className="w-16" />
          <span className="flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <span aria-hidden className="size-[7px] rotate-45 bg-foreground" />
            signed in ink · the partners · {lines.length} clauses
          </span>
        </div>
      </div>
      </section>
    </div>
  )
}
