import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronRight, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"

export type QuizCard = { q: string; a: string }
export type QuizFlipDeckProps = {
  cards?: QuizCard[]
  className?: string
  onAnswer?: (i: number, correct: boolean) => void
}

const DEFAULT_CARDS: QuizCard[] = [
  { q: "What does “done” mean before code is written?", a: "A written definition of done — testable, demoable, small." },
  { q: "When should you cut scope?", a: "Before you start, not halfway through." },
  { q: "What makes momentum durable?", a: "A daily unit you can actually close." },
  { q: "Best time to demo?", a: "Friday. Even when it's rough. Especially then." },
]

export function QuizFlipDeck({ cards = DEFAULT_CARDS, className, onAnswer }: QuizFlipDeckProps) {
  const [idx, setIdx] = React.useState(0)
  const [revealed, setRevealed] = React.useState(false)
  const [streak, setStreak] = React.useState(0)
  const [answers, setAnswers] = React.useState<("good" | "again" | null)[]>(() => Array(cards.length).fill(null))
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const card = cards[idx % cards.length]!

  const answer = (correct: boolean) => {
    setAnswers((a) => {
      const n = [...a]
      n[idx % cards.length] = correct ? "good" : "again"
      return n
    })
    if (correct) setStreak((s) => s + 1)
    else setStreak(0)
    onAnswer?.(idx, correct)
  }

  const next = () => {
    setRevealed(false)
    setIdx((i) => (i + 1) % cards.length)
  }
  const reset = () => {
    setIdx(0)
    setRevealed(false)
    setStreak(0)
    setAnswers(Array(cards.length).fill(null))
  }

  return (
    <section className={cn("relative isolate w-full overflow-hidden", false && "bg-foreground", cn(className))}>
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (760), ["--shell-w" as string]: `${(760)}px` }}>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />DECK · RECALL</span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] font-medium text-muted-foreground">{idx + 1} / {cards.length}</span>
          <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
          <span className="inline-flex items-center gap-2" aria-label={`Streak ${streak}`}>
            <span aria-hidden className="flex items-end gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={cn("w-1 rounded-full transition-colors", i < streak ? "h-4 bg-foreground" : "h-2.5 bg-border")} />
              ))}
            </span>
            <span className="font-mono text-[11px] font-semibold text-muted-foreground">streak {streak}</span>
          </span>
          <Button type='button' onClick={reset} className="inline-flex items-center gap-1 rounded-md border bg-background px-3 py-1.5 font-mono text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" variant="default">
            <RotateCcw className="size-3.5" aria-hidden /> Reset
          </Button>
        </div>
      </div>

      <InView once className="mt-6">
        <div className="relative min-h-[260px] overflow-hidden rounded-xl border bg-card shadow-sm">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${idx}-${revealed ? "a" : "q"}`}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="p-6 sm:p-7"
            >
              <div className="flex items-center justify-between">
                <span className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.2em] opacity-60")}>idx + 1<span className="opacity-50"> / cards.length</span></span>
                <span className={cn("rounded-md border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em]", revealed ? "bg-muted text-muted-foreground" : "bg-background text-muted-foreground")}>
                  {revealed ? "Answer" : "Question"}
                </span>
              </div>

              <h3 className="mt-5 font-display text-[22px] font-bold leading-snug tracking-tight text-foreground">{card.q}</h3>

              {revealed ? (
                <div className="mt-5 rounded-lg border bg-muted/40 p-4">
                  <p className="font-serif text-[16px] italic leading-relaxed text-foreground">{card.a}</p>
                </div>
              ) : (
                <p className="mt-4 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Reveal, then rate honestly.</p>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                {!revealed ? (
                  <Button type='button' onClick={() => setRevealed(true)} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" variant="default">
                    Reveal answer <ChevronRight className="size-4" aria-hidden />
                  </Button>
                ) : (
                  <>
                    <Button type='button' onClick={() => {
                        answer(false)
                        next()
                      }} className="rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" variant="default">
                      Again
                    </Button>
                    <Button type='button' onClick={() => {
                        answer(true)
                        next()
                      }} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" variant="default">
                      Got it — next
                    </Button>
                    <Button type='button' onClick={() => setRevealed(false)} className="rounded-md border bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted" variant="default">
                      Hide
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </InView>

      <div className="mt-4 flex justify-center gap-1.5" aria-hidden>
        {cards.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 w-6 rounded-full transition-colors",
              i === idx % cards.length ? "bg-foreground" : answers[i] === "good" ? "bg-foreground" : answers[i] === "again" ? "bg-muted-foreground/40" : "bg-border"
            )}
          />
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {revealed ? `Answer: ${card.a}` : `Question ${idx + 1} of ${cards.length}: ${card.q}`}
      </p>
    
  </div>
</section>
  )
}
