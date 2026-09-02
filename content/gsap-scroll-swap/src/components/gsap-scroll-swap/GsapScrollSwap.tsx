import * as React from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

import { InView } from "@/components/primitives/in-view"

gsap.registerPlugin(ScrollTrigger)

// ═══ JOB         Give three long chapters one resting place: a plate on the
//                 left that swaps itself while the reader scrolls.
// ═══ EMOTION     The studio rulebook, kept on a podium.
// ═══ SIGNATURE   A sticky chapter plate — numeral, heading and one-liner
//                 crossfade in sequence as each min-h block crosses mid-port.

type Chapter = {
  numeral: string
  kicker: string
  title: string
  oneLiner: string
  stat: string
  body: string
}

const CHAPTERS: Chapter[] = [
  {
    numeral: "01",
    kicker: "Governance",
    title: "The board is the boss",
    oneLiner: "One surface answers for every chair and every hour — no side spreadsheets, no heroics.",
    stat: "6 chairs · 1 grid",
    body: "Every chair at Quiet Times Studio reports to a single board. Walk the floor in Jönköping and you will find the same grid the front desk sees: who is in the chair, who is next, who is running late. The board is not a view of the truth — it is the truth, and everyone works from it.",
  },
  {
    numeral: "02",
    kicker: "Honesty",
    title: "Chairs tell the truth",
    oneLiner: "A chair either has a client in it or it doesn't. The numbers are never decorated.",
    stat: "0 embellished figures",
    body: "The studio keeps six chairs and refuses to round the story around them. When a chair sits empty for twenty minutes, the board says so out loud and the afternoon gets rebuilt on the spot. Quiet Times would rather have an ugly hour on record than a pretty one that never happened.",
  },
  {
    numeral: "03",
    kicker: "Memory",
    title: "The ledger remembers",
    oneLiner: "Bookings move and prices drift — every version of the week is kept, priced in kr.",
    stat: "52 weeks, all kept",
    body: "Regulars come back, keratin turns into silver blend, 620 kr becomes 680 kr. The ledger keeps every version of the week so the December review argues from evidence instead of memory. Nothing in the studio is remembered twice, and nothing is forgotten on purpose.",
  },
]

export type GsapScrollSwapProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  caption?: string
  className?: string
}

export function GsapScrollSwap({
  eyebrow = "GSAP · CHAPTER SWAP",
  title = "Three rules the studio runs on.",
  subtitle = "The left plate holds still while the chapters scroll past — ScrollTrigger swaps the numeral, the heading and the one-liner each time a new rule takes the floor.",
  caption = "SCROLLTRIGGER · PER-BLOCK SWAP · STICKY PLATE",
  className,
}: GsapScrollSwapProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const layersRef = React.useRef<(HTMLDivElement | null)[]>([])
  const blocksRef = React.useRef<(HTMLDivElement | null)[]>([])
  const [active, setActive] = React.useState(0)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  // one ScrollTrigger per chapter block — onEnter / onEnterBack drive the plate
  React.useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      blocksRef.current.forEach((el, i) => {
        if (!el) return
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onEnter: () => setActive(i),
          onEnterBack: () => setActive(i),
        })
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // plate swap — fade/slide out old, in new (instant when reduced motion)
  React.useLayoutEffect(() => {
    const dur = reduce ? 0 : 0.55
    layersRef.current.forEach((el, i) => {
      if (!el) return
      gsap.to(el, {
        opacity: i === active ? 1 : 0,
        y: i === active ? 0 : i < active ? -18 : 18,
        duration: dur,
        ease: "power3.out",
        overwrite: "auto",
      })
    })
  }, [active, reduce])

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

      <div ref={rootRef} className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* the chapter plate — sticky on lg+ */}
        <div className="h-fit lg:sticky lg:top-24 lg:self-start">
          <div className="relative grid">
            {CHAPTERS.map((chapter, i) => (
              <div
                key={chapter.numeral}
                ref={(el) => {
                  layersRef.current[i] = el
                }}
                aria-hidden={i !== active}
                className="pointer-events-none col-start-1 row-start-1"
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />
                  Chapter {chapter.numeral} — {chapter.kicker}
                </span>
                <p aria-hidden className="mt-4 select-none font-display text-7xl font-bold leading-[0.9] tracking-tight text-foreground sm:text-8xl">
                  {chapter.numeral}
                </p>
                <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{chapter.title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">{chapter.oneLiner}</p>
              </div>
            ))}
          </div>
          <div aria-hidden className="mt-8 flex gap-1.5">
            {CHAPTERS.map((chapter, i) => (
              <span key={chapter.numeral} className={cn("h-0.5 w-10 rounded-full transition-colors duration-300", i === active ? "bg-foreground" : "bg-border")} />
            ))}
          </div>
        </div>

        {/* the scrolling chapters */}
        <div className="flex flex-col">
          {CHAPTERS.map((chapter, i) => (
            <div
              key={chapter.numeral}
              ref={(el) => {
                blocksRef.current[i] = el
              }}
              className="flex min-h-[60vh] flex-col justify-center border-t border-border/60 py-12"
            >
              <div className="flex items-center justify-between">
                <span className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.2em] opacity-60 tabular-nums")}>{String(i + 1).padStart(2, "0")}<span className="opacity-50"> / {String(CHAPTERS.length).padStart(2, "0")}</span></span>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{chapter.kicker}</span>
              </div>
              <p className="mt-6 max-w-md text-[15px] leading-7 text-muted-foreground">{chapter.body}</p>
              <p className="mt-6 font-display text-2xl font-bold tracking-tight text-primary">{chapter.stat}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
        <span>{caption}</span>
        <span aria-hidden>●</span>
      </p>
    
  </div>
</section>
  )
}
