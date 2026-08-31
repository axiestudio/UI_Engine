import * as React from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"
import { Dots, Grain, SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

gsap.registerPlugin(ScrollTrigger)

// ═══ JOB         A day at the studio told as a pinned, three-chapter scene.
// ═══ EMOTION     The room changes temperature with every chapter of the day.
// ═══ SIGNATURE   The stage pins for two screens: three tint layers
//                 crossfade per chapter, the copy slides through an overflow
//                 mask, and the chapter rail on the right keeps your place.

const CHAPTERS: { kicker: string; line1: string; line2: string; rail: string }[] = [
  { kicker: "Chapter 01 · 07:45, Jönköping", line1: "The book opens", line2: "before the first cut.", rail: "01 · The book" },
  { kicker: "Chapter 02 · mid-morning", line1: "The floor breathes", line2: "between back-to-backs.", rail: "02 · The floor" },
  { kicker: "Chapter 03 · after close", line1: "The ledger closes", line2: "on a full day of kr.", rail: "03 · The ledger" },
]

export type GsapSceneTintProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  caption?: string
  className?: string
}

export function GsapSceneTint({
  eyebrow = "GSAP · SCENE TINT",
  title = "Three chapters, one scroll.",
  subtitle = "The scene pins for two screens: the tint of the room crossfades with each chapter while the copy slides through a mask and the rail keeps your place.",
  caption = "PINNED SCENE · 3 CHAPTERS · TINT CROSSFADE",
  className,
}: GsapSceneTintProps) {
  const [chapter, setChapter] = React.useState(0)
  const stageRef = React.useRef<HTMLDivElement>(null)
  const tintsRef = React.useRef<(HTMLDivElement | null)[]>([])
  const slidesRef = React.useRef<(HTMLDivElement | null)[]>([])
  const reduce = React.useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  )

  React.useLayoutEffect(() => {
    if (reduce) return
    const ctx = gsap.context(() => {
      const tints = tintsRef.current.filter(Boolean) as HTMLDivElement[]
      const slides = slidesRef.current.filter(Boolean) as HTMLDivElement[]
      if (!tints.length || !slides.length) return
      gsap.set(tints.slice(1), { opacity: 0 })
      gsap.set(slides.slice(1), { yPercent: 100 })
      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        scrollTrigger: {
          trigger: stageRef.current,
          start: "top top",
          end: "+=200%",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          onUpdate: (self) => setChapter(Math.min(CHAPTERS.length - 1, Math.floor(self.progress * CHAPTERS.length))),
        },
      })
      // chapter 1 → 2
      tl.to(slides[0], { yPercent: -100, duration: 0.45 }, 0.55)
      tl.to(slides[1], { yPercent: 0, duration: 0.45 }, 0.55)
      tl.to(tints[0], { opacity: 0, duration: 0.45, ease: "power1.inOut" }, 0.55)
      tl.to(tints[1], { opacity: 1, duration: 0.45, ease: "power1.inOut" }, 0.55)
      // chapter 2 → 3
      tl.to(slides[1], { yPercent: -100, duration: 0.45 }, 1.55)
      tl.to(slides[2], { yPercent: 0, duration: 0.45 }, 1.55)
      tl.to(tints[1], { opacity: 0, duration: 0.45, ease: "power1.inOut" }, 1.55)
      tl.to(tints[2], { opacity: 1, duration: 0.45, ease: "power1.inOut" }, 1.55)
      // hold: one timeline unit per chapter (3 units total)
      tl.to({}, { duration: 1, ease: "none" }, 2)
    }, stageRef)
    return () => ctx.revert()
  }, [reduce])

  return (
    <SectionShell width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>

      <div ref={stageRef} className="relative mt-10 h-screen overflow-hidden rounded-2xl border bg-background">
        <div aria-hidden className="absolute inset-0">
          <div ref={(el) => { tintsRef.current[0] = el }} className="absolute inset-0 bg-primary/10" />
          <div ref={(el) => { tintsRef.current[1] = el }} className="absolute inset-0 bg-[hsl(var(--foreground)/0.06)] opacity-0" />
          <div ref={(el) => { tintsRef.current[2] = el }} className="absolute inset-0 bg-transparent opacity-0" />
          <Dots className="z-[2]" />
          <Grain className="z-[3]" />
        </div>

        <div className="relative z-10 h-full">
          {CHAPTERS.map((c, i) =>
            reduce && i > 0 ? null : (
              <div
                key={c.rail}
                aria-hidden={i !== chapter}
                className={cn("absolute inset-0 flex flex-col justify-center px-6 sm:px-10", i !== 0 && "pointer-events-none")}
              >
                <div className="overflow-hidden">
                  <div ref={(el) => { slidesRef.current[i] = el }} className="max-w-2xl py-2">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-muted-foreground">{c.kicker}</span>
                    <h3 className="mt-4 font-display text-4xl font-bold leading-[1.02] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                      <span className="block">{c.line1}</span>
                      <span className="block text-muted-foreground">{c.line2}</span>
                    </h3>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>

        <div className="absolute right-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-5 sm:flex" role="group" aria-label="Chapters">
          {CHAPTERS.map((c, i) => (
            <div key={c.rail} className="flex items-center justify-end gap-3" aria-current={chapter === i ? "step" : undefined}>
              <span className={cn("font-mono text-[9px] font-bold uppercase tracking-[0.22em] transition-colors", chapter === i ? "text-foreground" : "text-muted-foreground/60")}>
                {c.rail}
              </span>
              <span className={cn("size-2 rounded-full border transition-colors", chapter === i ? "border-foreground bg-foreground" : "border-border bg-transparent")} />
            </div>
          ))}
        </div>

        <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Scroll · 3 chapters</span>
        </div>
      </div>

      <p className="mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
        <span>{caption}</span>
        <span aria-hidden>●</span>
      </p>
    </SectionShell>
  )
}
