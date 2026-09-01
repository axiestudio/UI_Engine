import * as React from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

gsap.registerPlugin(ScrollTrigger)

// ═══ JOB         Put the quarter's single most-watched number in one ring.
// ═══ EMOTION     A dial on the studio wall — you scroll, it fills.
// ═══ SIGNATURE   The ring's strokeDashoffset scrubs from full to 72% over
//                 80vh while the counter in the centre writes itself in
//                 sync; ledger rows surface as their thresholds pass.

const R = 70
const CIRC = 2 * Math.PI * R
const TARGET = 0.72

const STATS: { label: string; value: string; meta: string }[] = [
  { label: "Revenue booked", value: "184 200 kr", meta: "Q2 · +8%" },
  { label: "No-shows", value: "3", meta: "1.9% of slots" },
  { label: "Rebooks", value: "47", meta: "34% of clients" },
]

export type GsapScrollRingProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  caption?: string
  className?: string
}

export function GsapScrollRing({
  eyebrow = "GSAP · SCROLL RING",
  title = "One ring, 72 percent.",
  subtitle = "Scroll — the ring fills with the quarter's utilisation.",
  caption = "RING · SCRUB 0→72% · 80VH",
  className,
}: GsapScrollRingProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const ringRef = React.useRef<SVGCircleElement>(null)
  const numRef = React.useRef<HTMLSpanElement>(null)
  const rowsRef = React.useRef<(HTMLDivElement | null)[]>([])
  const reduce = React.useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  )

  React.useLayoutEffect(() => {
    if (reduce) return
    const ctx = gsap.context(() => {
      const ring = ringRef.current
      if (!ring) return
      if (numRef.current) numRef.current.textContent = "0"
      gsap.fromTo(ring, { strokeDashoffset: CIRC }, {
        strokeDashoffset: CIRC * (1 - TARGET),
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 78%",
          end: "+=80vh",
          scrub: 0.5,
          onUpdate: (self) => {
            if (numRef.current) numRef.current.textContent = String(Math.round(TARGET * 100 * self.progress))
          },
        },
      })
      rowsRef.current.forEach((row) => {
        if (!row) return
        gsap.fromTo(row, { opacity: 0, y: 14 }, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: row, start: "top 85%" },
        })
      })
    }, rootRef)
    return () => ctx.revert()
  }, [reduce])

  return (
    <section className={cn("relative isolate w-full overflow-hidden", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", false ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", false ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", false ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", false ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>

      <div ref={rootRef} className="mt-10">
        <div className="grid items-center gap-8 rounded-2xl border bg-card p-6 sm:grid-cols-[auto_1fr] sm:gap-10 sm:p-8">
          <div className="relative mx-auto size-[200px] sm:size-[224px]">
            <svg viewBox="0 0 180 180" className="size-full" role="img" aria-label={`Chair utilisation ${Math.round(TARGET * 100)}% this quarter`}>
              <circle cx={90} cy={90} r={R} fill="none" stroke="hsl(var(--border))" strokeWidth={10} />
              <circle
                ref={ringRef}
                cx={90}
                cy={90}
                r={R}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC * (1 - TARGET)}
                transform="rotate(-90 90 90)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-4xl font-bold tabular-nums text-foreground sm:text-5xl">
                <span ref={numRef}>72</span>
                <span className="text-xl text-muted-foreground">%</span>
              </span>
              <span className="mt-1 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Utilisation</span>
            </div>
          </div>

          <div>
            <div className="divide-y divide-border">
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  ref={(el) => { rowsRef.current[i] = el }}
                  className="flex items-baseline justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                >
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                  <span className="flex items-baseline gap-3">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{s.meta}</span>
                    <span className="font-mono text-sm font-bold tabular-nums text-foreground">{s.value}</span>
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Chair utilisation · this quarter
            </p>
          </div>
        </div>

        <p className="mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          <span>{caption}</span>
          <span aria-hidden>●</span>
        </p>
      </div>
    
  </div>
</section>
  )
}
