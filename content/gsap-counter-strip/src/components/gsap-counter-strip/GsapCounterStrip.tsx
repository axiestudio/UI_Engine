import * as React from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

gsap.registerPlugin(ScrollTrigger)

// ═══ JOB         Put the studio's proof on one line and let the numbers earn
//                 themselves while you watch.
// ═══ EMOTION     A ledger that counts out loud.
// ═══ SIGNATURE   Four big tabular numerals count 0 → target under a single
//                 once-only ScrollTrigger (proxy objects, snapped to whole
//                 numbers) while hairline rules draw in on a 0.12 stagger.

type Stat = { to: number; suffix: string; label: string; note: string }

const STATS: Stat[] = [
  { to: 18, suffix: "%", label: "more chair-hours", note: "Same team, tighter turns" },
  { to: 3, suffix: " wk", label: "to full adoption", note: "Front desk trained in an afternoon" },
  { to: 0, suffix: "", label: "double-bookings", note: "The board refuses the overlap" },
  { to: 24, suffix: "/7", label: "the board watches", note: "The ledger never sleeps in Jönköping" },
]

export type GsapCounterStripProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  caption?: string
  className?: string
}

export function GsapCounterStrip({
  eyebrow = "GSAP · COUNTER STRIP",
  title = "The ledger, in four numbers.",
  subtitle = "Scroll the strip into view and each numeral counts up to its honest value while a hairline rule draws itself underneath.",
  caption = "SCROLLTRIGGER · COUNT-UP · ONCE",
  className,
}: GsapCounterStripProps) {
  const stripRef = React.useRef<HTMLDivElement>(null)
  const numRefs = React.useRef<(HTMLSpanElement | null)[]>([])
  const ruleRefs = React.useRef<(HTMLSpanElement | null)[]>([])
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  React.useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const rules = ruleRefs.current.filter((el): el is HTMLSpanElement => Boolean(el))
      if (reduce) {
        STATS.forEach((s, i) => {
          const el = numRefs.current[i]
          if (el) el.textContent = String(s.to)
        })
        gsap.set(rules, { scaleX: 1 })
        return
      }
      gsap.set(rules, { scaleX: 0, transformOrigin: "left center" })
      const tl = gsap.timeline({
        scrollTrigger: { trigger: stripRef.current, start: "top 78%", once: true },
      })
      tl.to(rules, { scaleX: 1, duration: 0.9, ease: "power3.out", stagger: 0.12 }, 0.1)
      STATS.forEach((s, i) => {
        const proxy = { v: 0 }
        tl.to(
          proxy,
          {
            v: s.to,
            duration: 1.6,
            ease: "power2.out",
            snap: { v: 1 },
            onUpdate: () => {
              const el = numRefs.current[i]
              if (el) el.textContent = String(Math.round(proxy.v))
            },
          },
          0.15 + i * 0.08,
        )
      })
    }, stripRef)
    return () => ctx.revert()
  }, [reduce])

  return (
    <section className={cn("relative isolate w-full overflow-hidden", false && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", false ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", false ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", false ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", false ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>

      <div ref={stripRef} className="mt-10 grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <div key={stat.label}>
            <p className="flex items-baseline font-display text-5xl font-bold tabular-nums tracking-tight text-foreground sm:text-6xl">
              <span
                ref={(el) => {
                  numRefs.current[i] = el
                }}
              >
                {reduce ? stat.to : 0}
              </span>
              {stat.suffix && <span className="ml-1 text-xl font-bold text-muted-foreground">{stat.suffix}</span>}
            </p>
            <span
              ref={(el) => {
                ruleRefs.current[i] = el
              }}
              aria-hidden
              className="mt-4 block h-px w-full origin-left bg-border"
            />
            <p className="mt-4 text-sm font-semibold text-foreground">{stat.label}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{stat.note}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
        <span>{caption}</span>
        <span aria-hidden>●</span>
      </p>
    
  </div>
</section>
  )
}
