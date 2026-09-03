import * as React from "react"
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ── Design language ──────────────────────────────────────────────────────────
// JOB: kill first-visit anxiety by showing the arc of the appointment —
//   minutes, order, no surprises. Predictability is the product.
// EMOTION: reassurance through clarity. A held hand, narrated.
// SIGNATURE MOVE: the rail DRAWS itself — a 1px line scales down as you
//   scroll, and each step's dot lights from ghost to ink exactly when the
//   line reaches it. The path is literally being made for you.
// TYPE: step numbers as ghost glyphs (mono 64px @ 8%) behind titles;
//   duration as a right-aligned mono column (tabular, ledger-quiet).
// ─────────────────────────────────────────────────────────────────────────────

export type RitualStep = {
  id?: string
  title: string
  body?: string
  /** e.g. "10 min" — rendered in the mono column. */
  duration?: string
}

export type RitualProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  /** "Arrive 10 minutes early…" */
  beforeNote?: string
  /** "Water. Skip the gym after." */
  afterNote?: string
  steps?: RitualStep[]
  className?: string
}

function StepDot({ lit }: { lit: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative z-10 mt-1.5 block h-3 w-3 shrink-0 rounded-full border-2 transition-colors duration-300",
        lit ? "border-foreground bg-foreground" : "border-border bg-background"
      )}
    />
  )
}


// Self-demo defaults: bare mount (= tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_RITUAL_STEPS = [ { id: "arrive", title: "Tea, shoes off", duration: "5 min", body: "The corner chair, not a clipboard." }, { id: "talk", title: "We talk", duration: "10 min", body: "Where it hurts, what you want from the hour, what you'd rather not." }, { id: "table", title: "The table", duration: "60 min", body: "Lights low, blanket to the shoulders, the clock faced away." }, { id: "quiet", title: "Water & the quiet corner", duration: "10 min", body: "No reception small-talk required." }, ]

export function Ritual({ eyebrow = "The visit", title = "What actually happens", subtitle, beforeNote, afterNote, steps = DEMO_RITUAL_STEPS, className }: RitualProps) {
  const reduce = useReducedMotion()
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start 75%", "end 55%"] })
  const draw = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 })

  return (
    <section className={cn("relative isolate overflow-hidden w-full bg-background text-foreground", className)} aria-label={title}>
      <div className="mx-auto w-full max-w-[820px] px-4 py-16 sm:px-6 lg:py-24">
        <InView variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-60px" }}>
          <header className="mb-12 max-w-xl">
            {eyebrow && <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</p>}
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
            {subtitle && <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">{subtitle}</p>}
          </header>
        </InView>

        <div ref={wrapRef} className="relative">
          {/* the drawn rail */}
          <div aria-hidden className="absolute bottom-3 left-[5px] top-3 w-px bg-border" />
          <motion.div
            aria-hidden
            className="absolute left-[5px] top-3 w-px origin-top bg-foreground"
            style={reduce ? { height: "auto", top: 12, bottom: 12 } : { scaleY: draw, height: "calc(100% - 24px)" }}
          />

          <ol className="flex flex-col gap-10">
            {steps.map((s, i) => (
              <Step key={s.id ?? s.title} s={s} index={i} />
            ))}
          </ol>
        </div>

        {(beforeNote || afterNote) && (
          <div className="mt-10 border-t pt-6">
            {beforeNote && (
              <p className="text-sm font-medium text-muted-foreground">
                <span className="font-mono text-[10px] font-black uppercase tracking-widest text-foreground">Before</span>{" "}
                {beforeNote}
              </p>
            )}
            {afterNote && (
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                <span className="font-mono text-[10px] font-black uppercase tracking-widest text-foreground">After</span>{" "}
                {afterNote}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function Step({ s, index }: { s: RitualStep; index: number }) {
  const ref = React.useRef<HTMLLIElement>(null)
  const inView = useInViewOnce(ref)
  return (
    <li id={s.id} ref={ref} className={cn("relative flex scroll-mt-24 gap-5", "pl-7")}>
      <span className="absolute left-0 top-0" aria-hidden={undefined}>
        <StepDot lit={inView} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <h3 className="relative font-display text-[17px] font-extrabold tracking-tight sm:text-lg">
            <span aria-hidden className={cn("absolute -left-1 -top-8 hidden font-mono text-6xl font-black tracking-tighter text-foreground/[0.07] sm:block", inView && "text-foreground/[0.07]")}>
              {String(index + 1).padStart(2, "0")}
            </span>
            {s.title}
          </h3>
          {s.duration && <span className="mt-0.5 shrink-0 font-mono text-[11px] font-bold uppercase tracking-widest tabular-nums text-muted-foreground">{s.duration}</span>}
        </div>
        {s.body && <p className="mt-1.5 max-w-prose text-sm font-medium leading-relaxed text-muted-foreground">{s.body}</p>}
      </div>
    </li>
  )
}

import { useInView } from "motion/react"
function useInViewOnce(ref: React.RefObject<HTMLElement | null>) {
  return useInView(ref, { once: true, margin: "-25% 0px -45% 0px" })
}
