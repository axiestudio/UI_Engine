import * as React from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

gsap.registerPlugin(ScrollTrigger)

// ═══ JOB         Explain what actually happens after "Book now" — draw it.
// ═══ EMOTION     A route plan for the booking, inked as you scroll.
// ═══ SIGNATURE   One winding SVG path whose stroke draws itself under a
//                 scrubbed ScrollTrigger (150vh of travel); milestone dots
//                 pop exactly where the ink reaches them.

const ROUTE = "M 40 236 C 120 236 120 84 212 84 C 288 84 268 196 348 196 C 420 196 430 92 500 88 C 534 86 552 118 560 148"

const MILESTONES = [
  { x: 40, y: 236, label: "BOOKED", meta: "MON · 14:02", at: 0.02 },
  { x: 348, y: 196, label: "REMINDER", meta: "TUE · 18:00", at: 0.63 },
  { x: 560, y: 148, label: "CHAIR 03", meta: "FRI · 10:30", at: 0.97 },
]

export type GsapScrollDrawProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  caption?: string
  className?: string
}

export function GsapScrollDraw({
  eyebrow = "GSAP · SCROLL DRAW",
  title = "The route of a booking.",
  subtitle = "Scroll, and the line draws itself: booked Monday afternoon, a reminder Tuesday at six, Chair 03 by Friday morning. The milestones pop as the ink reaches them.",
  caption = "SVG PATH · SCRUB DRAWN",
  className,
}: GsapScrollDrawProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const pathRef = React.useRef<SVGPathElement>(null)
  const dotsRef = React.useRef<(SVGGElement | null)[]>([])
  const reduce = React.useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  )

  React.useLayoutEffect(() => {
    if (reduce) return
    const ctx = gsap.context(() => {
      const path = pathRef.current
      if (!path) return
      const len = path.getTotalLength()
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
      dotsRef.current.forEach((dot) => {
        if (dot) gsap.set(dot, { scale: 0, transformOrigin: "50% 50%" })
      })
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 70%",
          end: "+=150vh",
          scrub: 0.5,
        },
      })
      tl.to(path, { strokeDashoffset: 0, duration: 1 }, 0)
      MILESTONES.forEach((m, i) => {
        const dot = dotsRef.current[i]
        if (!dot) return
        tl.to(dot, { scale: 1, duration: 0.07, ease: "back.out(2.4)" }, m.at)
      })
    }, rootRef)
    return () => ctx.revert()
  }, [reduce])

  return (
    <SectionShell width={920} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>

      <div ref={rootRef} className="mt-10">
        <div className="overflow-hidden rounded-2xl border bg-card p-4 sm:p-6">
          <div className="flex items-center justify-between border-b pb-3">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              <span aria-hidden className="inline-block size-1.5 rounded-full bg-primary/60" />
              The route of a booking
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Mon → Fri</span>
          </div>
          <svg viewBox="0 0 600 300" className="mt-2 h-auto w-full" role="img" aria-label="Winding path drawn from Booked, through Reminder, to Chair 03">
            <path d={ROUTE} fill="none" stroke="hsl(var(--border))" strokeWidth={2.5} strokeLinecap="round" />
            <path ref={pathRef} d={ROUTE} fill="none" stroke="hsl(var(--primary))" strokeWidth={2.5} strokeLinecap="round" />
            {MILESTONES.map((m, i) => (
              <g key={m.label} ref={(el) => { dotsRef.current[i] = el }}>
                <circle cx={m.x} cy={m.y} r={11} fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth={2.5} />
                <circle cx={m.x} cy={m.y} r={3.5} fill="hsl(var(--primary))" />
                <text x={m.x} y={m.y + 44} textAnchor="middle" className="font-mono" fontSize={11} fontWeight={700} letterSpacing={2} fill="hsl(var(--foreground))">
                  {m.label}
                </text>
                <text x={m.x} y={m.y + 58} textAnchor="middle" className="font-mono" fontSize={8.5} fontWeight={600} letterSpacing={1.5} fill="hsl(var(--muted-foreground))">
                  {m.meta}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <p className="mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          <span>{caption}</span>
          <span aria-hidden>●</span>
        </p>
      </div>
    </SectionShell>
  )
}
