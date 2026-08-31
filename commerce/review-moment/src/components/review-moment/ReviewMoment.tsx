import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Star } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Design language ──────────────────────────────────────────────────────────
// JOB: ask the one good question, once, while the feeling is warm — not a
//   popup ambush later.
// EMOTION: a friend at the door: "was it good? tell people." Zero guilt.
// SIGNATURE MOVE: the stars EARN the panel. Hover fills them up to the
//   cursor (like lighting candles); a choice swaps the whole panel with a
//   shared glyph — the question slide-flips out as the thank-you morphs in.
//   4–5 → a public-share path; 1–3 → a private "tell us" path. The ask
//   adapts to the answer; that's the whole craft.
// ─────────────────────────────────────────────────────────────────────────────

export type ReviewMomentProps = {
  eyebrow?: string
  question: string
  /** Label shown when a rating is submitted. Host decides what happens next. */
  onRate?: (rating: 1 | 2 | 3 | 4 | 5) => void | Promise<void>
  /** Where 4–5 stars go next. */
  publicLink?: { label: string; href: string }
  /** Where 1–3 stars go: feedback that lands *with you*, not in public. */
  privateLink?: { label: string; href: string }
  thanksHigh?: string
  thanksLow?: string
  skipLabel?: string
  className?: string
}

const MSGS = ["Needs work — tell us?", "Needed more", "Fine, not more", "Really nice", "Excellent"]

export function ReviewMoment({
  eyebrow = "One quick question",
  question = "How did you leave today?",
  onRate,
  publicLink,
  privateLink,
  thanksHigh = "That means the room to us. Mind saying it where others can hear?",
  thanksLow = "Thank you for saying it to us, not about us. What should we change?",
  skipLabel = "Not now",
  className,
}: ReviewMomentProps) {
  const reduce = useReducedMotion()
  const [hover, setHover] = React.useState(0)
  const [rating, setRating] = React.useState<0 | 1 | 2 | 3 | 4 | 5>(0)
  const lit = hover || rating

  const pick = (n: 1 | 2 | 3 | 4 | 5) => {
    setHover(0)
    setRating(n)
    void onRate?.(n)
  }

  return (
    <section className={cn("w-full bg-background text-foreground", className)} aria-label={question}>
      <InView variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-60px" }}>
        <div className="mx-auto w-full max-w-[560px] px-4 py-14 sm:px-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
            <AnimatePresence mode="wait" initial={false}>
              {rating === 0 ? (
                <motion.div key="ask" initial={{ opacity: 0, y: reduce ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduce ? 0 : -10 }} transition={{ duration: 0.25 }}>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{eyebrow}</p>
                  <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em]">{question}</h2>

                  <div className="mt-6 flex items-center gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rate your visit">
                    {([1, 2, 3, 4, 5] as const).map((n) => {
                      const on = lit >= n
                      return (
                        <button
                          key={n}
                          type="button"
                          role="radio"
                          aria-checked={false} // ask panel renders only while unrated
                          aria-label={`${n} of 5 — ${MSGS[n - 1]}`}
                          onMouseEnter={() => setHover(n)}
                          onFocus={() => setHover(n)}
                          onClick={() => pick(n)}
                          className="rounded-lg p-1.5 outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
                        >
                          <Star className={cn("h-8 w-8 transition-colors duration-150", on ? "fill-foreground text-foreground" : "text-border")} strokeWidth={1.75} />
                        </button>
                      )
                    })}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="min-h-[16px] font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{lit ? MSGS[lit - 1] : ""}</p>
                    <a href="#" onClick={(e) => { e.preventDefault() }} className="text-xs font-bold text-muted-foreground underline-offset-4 hover:underline">{skipLabel}</a>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="than" initial={{ opacity: 0, y: reduce ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="text-center">
                  <div aria-hidden className="mx-auto flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={cn("h-5 w-5 transition-all duration-500", n <= rating ? "fill-foreground text-foreground" : "text-border")} style={{ transitionDelay: `${n * 60}ms` }} />
                    ))}
                  </div>
                  <h2 className="mt-5 font-display text-xl font-semibold tracking-[-0.02em]">{rating >= 4 ? thanksHigh : thanksLow}</h2>
                  <div className="mt-6 flex justify-center gap-3">
                    {rating >= 4 ? (
                      publicLink && (
                        <Button asChild className="h-11 rounded-full px-7 font-display text-sm font-semibold tracking-[-0.02em]">
                          <a href={publicLink.href} target="_blank" rel="noopener noreferrer">{publicLink.label}</a>
                        </Button>
                      )
                    ) : (
                      privateLink && (
                        <Button asChild variant="outline" className="h-11 rounded-full px-7 font-display text-sm font-semibold tracking-[-0.02em]">
                          <a href={privateLink.href}>{privateLink.label}</a>
                        </Button>
                      )
                    )}
                    <button type="button" onClick={() => setRating(0)} className="self-center text-xs font-bold text-muted-foreground underline-offset-4 hover:underline">
                      Actually, take that back
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </InView>
    </section>
  )
}
