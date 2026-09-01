import * as React from "react"
import gsap from "gsap"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"

// ═══ JOB         Drill the five numbers the floor is expected to know cold.
// ═══ EMOTION     A study deck on the counter — flip, read, next.
// ═══ SIGNATURE   Click or Enter flips the card (rotateY 0→180, preserve-3d,
//                 backface-hidden faces); Prev/Next flip back first, then
//                 swap the content with a 0.25s fade while the deck cycles.

const CARDS: { q: string; a: string }[] = [
  {
    q: "What does the board owe the floor?",
    a: "Six chairs kept booked, stocked and staffed. Utilisation sat at 72% this quarter — the floor owes the board quiet, not overtime.",
  },
  {
    q: "When is a no-show not a loss?",
    a: "When the waitlist fills the chair inside 20 minutes. Late-cancel fees covered 61% of the gaps in March.",
  },
  {
    q: "Who owns the reminder?",
    a: "The book, not the receptionist. SMS leaves at 18:00 the day before — every booking, no exceptions.",
  },
  {
    q: "What counts as a quiet time?",
    a: "Tuesday to Thursday, 10:00–14:00. Those slots run 15% under and the regulars claim them first.",
  },
  {
    q: "Why does the ledger close at 18:00?",
    a: "The card terminal settles at 18:00 sharp. Every kr after that belongs to tomorrow's till.",
  },
]

export type GsapFlashCardsProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  caption?: string
  className?: string
}

export function GsapFlashCards({
  eyebrow = "GSAP · FLASH CARDS",
  title = "Five cards the floor memorises.",
  subtitle = "Click or press Enter to flip. Prev / Next cycles the deck.",
  caption = "ROTATEY FLIP · DECK OF 05 · PERSPECTIVE 1200",
  className,
}: GsapFlashCardsProps) {
  const [index, setIndex] = React.useState(0)
  const [face, setFace] = React.useState<"q" | "a">("q")
  const cardRef = React.useRef<HTMLDivElement>(null)
  const rotRef = React.useRef(0)
  const busyRef = React.useRef(false)
  const pendingRef = React.useRef(false)
  const reduce = React.useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  )

  React.useEffect(() => {
    const card = cardRef.current
    return () => {
      if (card) gsap.killTweensOf(card)
    }
  }, [])

  React.useLayoutEffect(() => {
    if (!pendingRef.current) return
    pendingRef.current = false
    const card = cardRef.current
    if (!card) {
      busyRef.current = false
      return
    }
    if (reduce) {
      gsap.set(card, { opacity: 1 })
      busyRef.current = false
      return
    }
    gsap.to(card, { opacity: 1, duration: 0.25, ease: "power1.out", onComplete: () => { busyRef.current = false } })
  }, [index, reduce])

  const flip = () => {
    if (busyRef.current) return
    const card = cardRef.current
    if (!card) return
    rotRef.current = rotRef.current === 0 ? 180 : 0
    setFace((f) => (f === "q" ? "a" : "q"))
    if (reduce) {
      gsap.set(card, { rotateY: rotRef.current })
      return
    }
    busyRef.current = true
    gsap.to(card, { rotateY: rotRef.current, duration: 0.55, ease: "power3.inOut", onComplete: () => { busyRef.current = false } })
  }

  const goTo = (nextRaw: number) => {
    const next = (nextRaw + CARDS.length) % CARDS.length
    const card = cardRef.current
    if (busyRef.current || next === index || !card) return
    busyRef.current = true
    const wasFlipped = rotRef.current === 180
    rotRef.current = 0
    setFace("q")
    const swap = () => {
      if (reduce) {
        gsap.set(card, { rotateY: 0 })
        pendingRef.current = true
        setIndex(next)
        return
      }
      gsap.to(card, {
        opacity: 0,
        duration: 0.25,
        ease: "power1.in",
        onComplete: () => {
          gsap.set(card, { rotateY: 0 })
          pendingRef.current = true
          setIndex(next)
        },
      })
    }
    if (reduce) {
      gsap.set(card, { rotateY: 0 })
      pendingRef.current = true
      setIndex(next)
    } else if (wasFlipped) {
      gsap.to(card, { rotateY: 0, duration: 0.3, ease: "power2.in", onComplete: swap })
    } else {
      swap()
    }
  }

  const card = CARDS[index]

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

      <div className="mt-10">
        <div className="relative mx-auto max-w-md [perspective:1200px]">
          <span aria-hidden className="pointer-events-none absolute inset-x-3 -bottom-3 h-full rounded-[20px] border bg-muted" />
          <span aria-hidden className="pointer-events-none absolute inset-x-1.5 -bottom-1.5 h-full rounded-[20px] border bg-background" />
          <div
            ref={cardRef}
            role="button"
            tabIndex={0}
            aria-label={`Card ${index + 1} of ${CARDS.length} — ${face === "q" ? "question, activate to reveal the answer" : "answer, activate to show the question"}`}
            onClick={flip}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                flip()
              }
            }}
            className="relative min-h-[220px] w-full cursor-pointer select-none rounded-[20px] border bg-card p-6 outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [transform-style:preserve-3d]"
          >
            <div aria-hidden={face === "a"} className="[backface-visibility:hidden]">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Question · {String(index + 1).padStart(2, "0")}</span>
              <p className="mt-5 font-display text-lg font-bold leading-snug tracking-tight text-foreground">{card.q}</p>
              <p className="mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Tap to reveal</p>
            </div>
            <div
              aria-hidden={face === "q"}
              className="absolute inset-0 rounded-[20px] border bg-card p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]"
            >
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Answer · {String(index + 1).padStart(2, "0")}</span>
              <p className="mt-5 text-sm leading-6 text-muted-foreground">{card.a}</p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-md items-center justify-between gap-4 border-t pt-4">
          <Button type='button' onClick={() => goTo(index - 1)} aria-label="Previous card" className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" variant="default">
            <ChevronLeft className="size-4" aria-hidden /> Prev
          </Button>
          <span className="font-mono text-[11px] font-semibold tabular-nums tracking-[0.2em] text-muted-foreground" aria-live="polite">
            {String(index + 1).padStart(2, "0")} / {String(CARDS.length).padStart(2, "0")}
          </span>
          <Button type='button' onClick={() => goTo(index + 1)} aria-label="Next card" className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" variant="default">
            Next <ChevronRight className="size-4" aria-hidden />
          </Button>
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
