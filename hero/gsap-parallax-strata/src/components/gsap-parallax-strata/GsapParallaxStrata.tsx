import * as React from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dots, MonoLabel } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

gsap.registerPlugin(ScrollTrigger)

// ═══ JOB         Open the studio's site like a landscape: four strata of the
//                 business, drifting apart as the visitor scrolls in.
// ═══ EMOTION     Morning fog rolling off the chairs in Jönköping.
// ═══ SIGNATURE   Four full-width bands with rounded crowns scrub upward at
//                 different yPercent speeds (ease none) while the title block
//                 floats on its own, slowest layer. Pure ScrollTrigger.

type Stratum = { height: string; bg: string; speed: number; label: string }

const STRATA: Stratum[] = [
  { height: "72%", bg: "bg-foreground/5", speed: -10, label: "Stratum 01 · The floor" },
  { height: "56%", bg: "bg-muted", speed: -20, label: "Stratum 02 · Front desk" },
  { height: "42%", bg: "bg-card", speed: -32, label: "Stratum 03 · The ledger" },
  { height: "30%", bg: "bg-background", speed: -45, label: "Stratum 04 · Quiet Times" },
]

export type GsapParallaxStrataProps = {
  kicker?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  primaryLabel?: string
  primaryHref?: string
  secondaryLabel?: string
  secondaryHref?: string
  className?: string
}

export function GsapParallaxStrata({
  kicker = "Quiet Times Studio — Jönköping",
  title = "The board sees everything.",
  subtitle = "Chairs, clients and the ledger on one quiet surface. Scroll — the strata drift apart as you go.",
  primaryLabel = "Book a chair",
  primaryHref = "#book",
  secondaryLabel = "Read the ledger",
  secondaryHref = "#ledger",
  className,
}: GsapParallaxStrataProps) {
  const sectionRef = React.useRef<HTMLElement>(null)
  const strataRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const titleRef = React.useRef<HTMLDivElement>(null)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  React.useLayoutEffect(() => {
    if (reduce) return
    const ctx = gsap.context(() => {
      const speeds = [...STRATA.map((s) => s.speed), -15]
      const layers = [...strataRefs.current, titleRef.current]
      layers.forEach((el, i) => {
        if (!el) return
        gsap.to(el, {
          yPercent: speeds[i],
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        })
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [reduce])

  return (
    <section ref={sectionRef} className={cn("relative isolate h-[130vh] w-full overflow-hidden bg-background", className)}>
      {STRATA.map((stratum, i) => (
        <div
          key={stratum.label}
          ref={(el) => {
            strataRefs.current[i] = el
          }}
          aria-hidden
          className={cn("absolute inset-x-0 bottom-0 rounded-[40px_40px_0_0] border border-border", stratum.bg)}
          style={{ height: stratum.height, zIndex: i + 1 }}
        >
          <span className="absolute left-6 top-5 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground sm:left-8">
            {stratum.label}
          </span>
        </div>
      ))}
      <Dots size={28} className="z-[6]" />

      {/* title block — its own, slowest stratum */}
      <div ref={titleRef} className="absolute inset-0 z-10 flex items-center justify-center px-5 pb-[18vh] sm:px-8 lg:px-12">
        <InView once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          <div className="flex flex-col items-center text-center">
            <MonoLabel className="justify-center">{kicker}</MonoLabel>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[0.95] tracking-tight text-foreground sm:text-6xl lg:text-7xl">{title}</h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">{subtitle}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href={primaryHref}
                className="rounded-full bg-foreground px-6 py-3 text-sm font-bold text-background transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {primaryLabel}
              </a>
              <a
                href={secondaryHref}
                className="rounded-full border border-border bg-card px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {secondaryLabel}
              </a>
            </div>
          </div>
        </InView>
      </div>

      <div aria-hidden className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
        <MonoLabel>
          Scroll
          <ArrowDown className="size-3.5" />
        </MonoLabel>
      </div>
    </section>
  )
}
