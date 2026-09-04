import * as React from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"

gsap.registerPlugin(ScrollTrigger)

// ═══ JOB         Say the one sentence the room must remember.
// ═══ EMOTION     A shop sign in a storm — alive, leaning into the wind.
// ═══ SIGNATURE   Two ribbon rows run opposite directions and answer your
//                 scroll: velocity drives their speed, skews the type and,
//                 past a threshold, flips the whole parade's direction.

export type GsapKineticMarqueeProps = {
  /** Row A — fills the ribbon on repeat. */
  lineA?: string
  /** Row B — runs against row A. */
  lineB?: string
  label?: string
  tone?: "ink" | "paper"
  className?: string
}

export function GsapKineticMarquee({
  lineA = "BOOK THE BOARD · TRUST THE CHAIR ·",
  lineB = "quiet hands · loud work · sharp scissors ·",
  label = "Kinetic ribbon — answers your scroll",
  tone = "ink",
  className,
}: GsapKineticMarqueeProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const rowA = React.useRef<HTMLDivElement>(null)
  const rowB = React.useRef<HTMLDivElement>(null)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  React.useLayoutEffect(() => {
    if (reduce) return
    const ctx = gsap.context(() => {
      const proxy = { skew: 0, dir: 1 }
      const skewSetter = gsap.quickSetter(rowA.current, "skewY", "deg")
      const clampSkew = gsap.utils.clamp(-8, 8)

      const xToA = gsap.to(rowA.current, { xPercent: -25, ease: "none", duration: 24, repeat: -1 })
      const xToB = gsap.to(rowB.current, { xPercent: 25, ease: "none", duration: 30, repeat: -1 })

      ScrollTrigger.create({
        onUpdate: (self) => {
          const v = self.getVelocity() / 260
          const skew = clampSkew(v)
          // lean into direction of travel
          proxy.skew = gsap.utils.interpolate(proxy.skew, skew, 0.18)
          skewSetter(-proxy.skew)
          // fast scroll flips the parade
          if (Math.abs(v) > 2.4) proxy.dir = v > 0 ? 1 : -1
          xToA.timeScale(gsap.utils.interpolate(xToA.timeScale(), (0.6 + Math.min(Math.abs(v), 2.4)) * proxy.dir, 0.12))
          xToB.timeScale(gsap.utils.interpolate(xToB.timeScale(), (0.6 + Math.min(Math.abs(v), 2.4)) * -proxy.dir, 0.12))
        },
      })
    }, rootRef)
    return () => ctx.revert()
  }, [reduce])

  const Row = ({ text, outline, refEl, ariaHidden }: { text: string; outline?: boolean; refEl: React.RefObject<HTMLDivElement | null>; ariaHidden?: boolean }) => (
    <div className="flex overflow-hidden py-1" aria-hidden={ariaHidden}>
      <div ref={refEl} className="flex w-max shrink-0 items-center whitespace-nowrap will-change-transform">
        {[0, 1, 2, 3].map((rep) => (
          <span
            key={rep}
            className={cn(
              "px-4 font-display text-[44px] font-black uppercase leading-none tracking-tight sm:text-[58px]",
              outline
                ? "text-transparent [-webkit-text-stroke:1.5px_hsl(var(--background)/0.55)]"
                : "text-background",
            )}
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  )

  return (
    <section ref={rootRef} className={cn("relative isolate overflow-hidden w-full bg-foreground py-12 sm:py-16", className)} aria-label={label}>
      <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.6 }}>
        <Row text={lineA} refEl={rowA} />
        <Row text={lineB} outline refEl={rowB} ariaHidden />
        <p className="mt-4 text-center font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-background/40">
          {label}
        </p>
      </InView>
    </section>
  )
}
