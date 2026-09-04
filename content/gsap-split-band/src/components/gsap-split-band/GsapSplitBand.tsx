import * as React from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"

gsap.registerPlugin(ScrollTrigger, SplitText)

// ═══ JOB         The one sentence the page exists to say.
// ═══ EMOTION     A held breath, then the line lands word by word.
// ═══ SIGNATURE   SplitText carves the statement into masked lines; scroll
//                 peels each line up out of its mask on a slow expo ease,
//                 and the rule under it draws itself left to right as the
//                 last word settles. Ink band; type does all the talking.

export type GsapSplitBandProps = {
  /** The statement. One sentence — the band will give it the room it needs. */
  statement?: string
  kicker?: string
  signOff?: string
  className?: string
}

export function GsapSplitBand({
  statement = "We do not sell time. We make the hours you already have behave.",
  kicker = "The manifesto",
  signOff = "— Quiet Times, since 2017",
  className,
}: GsapSplitBandProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const lineRef = React.useRef<HTMLDivElement>(null)
  const textRef = React.useRef<HTMLParagraphElement>(null)

  React.useLayoutEffect(() => {
    if (!textRef.current) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const ctx = gsap.context(() => {
      if (reduce) return
      const split = new SplitText(textRef.current, { type: "lines", linesClass: "split-line" })
      gsap.set(split.lines, { overflow: "hidden", paddingBottom: "0.08em" })
      const inners = split.lines.map((line) => {
        const inner = document.createElement("span")
        inner.style.display = "block"
        while (line.firstChild) inner.appendChild(line.firstChild)
        line.appendChild(inner)
        return inner
      })
      gsap.from(inners, {
        yPercent: 112,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.16,
        scrollTrigger: { trigger: rootRef.current, start: "top 62%" },
      })
      gsap.from(lineRef.current, {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1,
        ease: "power3.inOut",
        scrollTrigger: { trigger: rootRef.current, start: "top 40%" },
      })
      return () => split.revert()
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className={cn("relative isolate overflow-hidden w-full bg-foreground text-background", className)} aria-label="Statement band">
      <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.5 }}>
        <div className="mx-auto w-full max-w-[920px] px-5 py-20 sm:px-8 sm:py-28">
          <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-background/50">
            <span aria-hidden className="size-1.5 rounded-full bg-primary" />
            {kicker}
          </p>
          <p
            ref={textRef}
            className="mt-5 font-display text-[30px] font-black leading-[1.14] tracking-[-0.02em] sm:text-[44px] lg:text-[52px]"
          >
            {statement}
          </p>
          <div ref={lineRef} aria-hidden className="mt-8 h-px w-40 bg-background/40" />
          <p className="mt-3 font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-background/50">{signOff}</p>
        </div>
      </InView>
    </section>
  )
}
