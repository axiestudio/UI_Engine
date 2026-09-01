import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, RotateCcw, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"


// ═══ JOB         Teach the house rules with three honest questions.
// ═══ EMOTION     A calm exam at the counter — no red pen, just the ledger.
// ═══ SIGNATURE   Answers LOCK on pick: correct glows ink, wrong dims and the
//                 right one lights up; a one-line verdict slides in, and the
//                 result dial inks itself to the score out of three.

export type QuizQuestion = { q: string; answers: string[]; correct: number; expl: string }

export type QuizRunnerProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  heading?: string
  questions?: QuizQuestion[]
  /** One verdict per possible score, index = score. */
  verdicts?: string[]
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_QUESTIONS: QuizQuestion[] = [
  {
    q: "The first chair spins at 09:00. When does the ledger close?",
    answers: ["Before the first chair spins", "After the lunch rush", "Whenever — it's digital"],
    correct: 0,
    expl: "Numbers before hair. The ledger closes before the first chair spins.",
  },
  {
    q: "A client no-shows twice in one month. The board's standard move?",
    answers: ["A quiet word at the next visit", "Card hold on the next booking", "Removed from online booking"],
    correct: 1,
    expl: "A card hold on rebooking cut no-shows from 11% to 3% on the Jönköping floor.",
  },
  {
    q: "What earns a chair the golden scissors for the week?",
    answers: ["Most kr rung through the till", "Fewest tools left out", "Five-star calm, every day"],
    correct: 2,
    expl: "The board votes on calm — five-star manners beat raw kr every time.",
  },
]

const DEFAULT_VERDICTS = [
  "the board schedules training",
  "the board is patient",
  "the board approves",
  "the board applauds",
]

export function QuizRunner({
  eyebrow = "LEARN · QUIZ",
  title = "The studio quiz.",
  subtitle = "Three questions from the Quiet Times board — how well do you read the floor? Pick an answer and it locks; the explanation follows.",
  heading = "Quiet Times Studio · chair test",
  questions = DEFAULT_QUESTIONS,
  verdicts = DEFAULT_VERDICTS,
  caption = "SCORE TO PASS · 2 / 3 — THE BOARD APPROVES",
  tone = "paper",
  className,
}: QuizRunnerProps) {
  const ink = tone === "ink"
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const [picked, setPicked] = React.useState<(number | null)[]>(() => questions.map(() => null))
  const [current, setCurrent] = React.useState(0)
  const [finished, setFinished] = React.useState(false)

  const answered = picked.filter((p) => p !== null).length
  const score = picked.reduce<number>((acc, p, i) => (p === questions[i]?.correct ? acc + 1 : acc), 0)
  const locked = picked[current] !== null
  const pickedIdx = picked[current]
  const last = current >= questions.length - 1

  const pick = (i: number) => {
    if (locked) return
    setPicked((cur) => cur.map((v, x) => (x === current ? i : v)))
  }

  const next = () => {
    if (!locked) return
    if (last) setFinished(true)
    else setCurrent((c) => c + 1)
  }

  const restart = () => {
    setPicked(questions.map(() => null))
    setCurrent(0)
    setFinished(false)
  }

  const R = 50
  const C = 2 * Math.PI * R

  const hair = ink ? "border-background/15" : "border-border"

  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <InView
        once
        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>

      <InView
        once
        variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <figure className="mt-10">
          <div className="mx-auto max-w-[520px]">
            <motion.div
              whileHover={reduce ? undefined : { y: -3 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className={cn(
                "overflow-hidden rounded-[16px] border bg-card shadow-[0_24px_52px_-30px_hsl(var(--foreground)/0.45)]",
                ink ? "border-background/15" : "border-border",
              )}
            >
              {/* ── chrome: label + progress segments ── */}
              <div className={cn("border-b px-6 pb-5 pt-6", hair)}>
                <div className="flex items-center justify-between gap-3">
                  <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{heading}</span>
                  <span className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.2em] opacity-60")}>Math.min(current + 1, questions.length)<span className="opacity-50"> / questions.length</span></span>
                </div>
                <div aria-hidden className="mt-4 flex gap-1.5">
                  {questions.map((_, i) => (
                    <span
                      key={i}
                      className={cn("h-1.5 flex-1 rounded-full transition-colors duration-300", i < answered || finished ? "bg-primary" : "bg-muted")}
                    />
                  ))}
                </div>
              </div>

              <div className="flex min-h-[356px] flex-col px-6 py-6">
                <AnimatePresence mode="wait" initial={false}>
                  {finished ? (
                    /* ── result: dial inks itself to the score ── */
                    <motion.div
                      key="result"
                      initial={reduce ? { opacity: 0 } : { opacity: 0, x: 28 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, x: -28 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-1 flex-col items-center justify-center py-4 text-center"
                    >
                      <div className="relative size-28">
                        <svg viewBox="0 0 120 120" className="size-28 -rotate-90" aria-hidden>
                          <circle cx="60" cy="60" r={R} fill="none" strokeWidth="8" className="stroke-muted" />
                          <motion.circle
                            cx="60"
                            cy="60"
                            r={R}
                            fill="none"
                            strokeWidth="8"
                            strokeLinecap="round"
                            className="stroke-primary"
                            strokeDasharray={C}
                            initial={{ strokeDashoffset: reduce ? C * (1 - score / questions.length) : C }}
                            animate={{ strokeDashoffset: C * (1 - score / questions.length) }}
                            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                          />
                        </svg>
                        <span aria-hidden className="absolute inset-0 grid place-items-center font-display text-2xl font-black tabular-nums">
                          {score}/{questions.length}
                        </span>
                        <span className="sr-only">
                          Score {score} out of {questions.length}
                        </span>
                      </div>
                      <p role="status" className="mt-5 font-display text-xl font-bold tracking-[-0.02em]">
                        {score} / {questions.length} — {verdicts[score] ?? ""}
                      </p>
                      <p className="mt-2 max-w-[320px] text-sm text-muted-foreground">
                        Retakes encouraged. The ledger never judges, it only remembers.
                      </p>
                      <Button type='button' onClick={restart} className="mt-6 inline-flex h-10 items-center gap-2 rounded-full border px-5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" variant="default">
                        <RotateCcw className="size-3.5" aria-hidden /> Restart
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`q-${current}`}
                      initial={reduce ? { opacity: 0 } : { opacity: 0, x: 28 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, x: -28 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <h3 className="font-display text-xl font-bold leading-snug tracking-[-0.02em]">{questions[current].q}</h3>

                      <div className="mt-5 grid gap-2">
                        {questions[current].answers.map((a, i) => {
                          const isCorrect = i === questions[current].correct
                          const isPicked = i === pickedIdx
                          const state = pickedIdx === null ? "idle" : isCorrect ? "correct" : isPicked ? "wrong" : "dim"
                          return (
                            <Button type='button' key={a} disabled={pickedIdx !== null} onClick={() => pick(i)} className={cn(
                                "flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                state === "idle" && "border-border hover:bg-muted",
                                state === "correct" && "border-primary bg-primary/[0.06]",
                                state === "wrong" && "border-border opacity-60",
                                state === "dim" && "border-border opacity-40",
                              )} variant="default">
                              <span>{a}</span>
                              {state === "correct" && <Check className="size-4 shrink-0 text-primary" aria-hidden />}
                              {state === "wrong" && <X className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
                            </Button>
                          )
                        })}
                      </div>

                      {locked && (
                        <p role="status" className={cn("mt-4 rounded-lg px-4 py-3 text-sm leading-relaxed", ink ? "bg-background/5" : "bg-muted/70")}>
                          <span className="font-bold">{pickedIdx === questions[current].correct ? "Correct. " : "Not quite. "}</span>
                          <span className="text-muted-foreground">{questions[current].expl}</span>
                        </p>
                      )}

                      {locked && (
                        <motion.button
                          type="button"
                          onClick={next}
                          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                          className="mt-5 h-10 w-full rounded-md bg-primary font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {last ? "See the result" : "Next question"}
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          <figcaption
            className={cn(
              "mx-auto mt-8 flex max-w-[520px] items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
              hair,
              ink ? "text-background/55" : "text-muted-foreground",
            )}
          >
            <span>{caption}</span>
            <span aria-hidden>●</span>
          </figcaption>
        </figure>
      </InView>
    
  </div>
</section>
  )
}
