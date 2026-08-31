import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { PenLine } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB         Let proof do the selling — and let a new voice join it.
// ═══ EMOTION     The wall by the till where regulars pin their notes.
// ═══ SIGNATURE   A 4.9 in display type over five honest bars, and a mini
//                 form that posts your stars straight to the top of the wall.

export type Review = {
  id: string
  name: string
  rating: number
  text: string
  tag: string
}

export type ReviewWallProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  caption?: string
  tone?: "paper" | "ink"
  rating?: number
  breakdown?: { stars: number; count: number }[]
  reviews?: Review[]
  className?: string
}

const DEFAULT_BREAKDOWN = [
  { stars: 5, count: 180 },
  { stars: 4, count: 32 },
  { stars: 3, count: 9 },
  { stars: 2, count: 3 },
  { stars: 1, count: 2 },
]

const DEFAULT_REVIEWS: Review[] = [
  {
    id: "r1",
    name: "Freja Holm",
    rating: 5,
    text: "Tove mixed a colour that finally looks like it grew out of me. Three weeks on and the gloss still holds.",
    tag: "after Colour bar",
  },
  {
    id: "r2",
    name: "Mateus Ribeiro",
    rating: 5,
    text: "Booked Chair 2 on a whim. Precise scissor work, zero small-talk pressure, a proper espresso. Rebooked before I left.",
    tag: "after Skin fade",
  },
  {
    id: "r3",
    name: "Ingrid Åkesson",
    rating: 4,
    text: "Lovely calm room in Jönköping and an honest consultation. One star short because Saturday slots vanish in minutes.",
    tag: "after Bridal trial",
  },
]

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

function Stars({ rating }: { rating: number }) {
  return (
    <>
      <span aria-hidden className="font-mono text-[13px] tracking-[0.18em]">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={i < rating ? "text-primary" : "text-muted-foreground/40"}>
            {i < rating ? "★" : "☆"}
          </span>
        ))}
      </span>
      <span className="sr-only">{rating} out of 5 stars</span>
    </>
  )
}

export function ReviewWall({
  eyebrow = "Commerce · Review wall",
  title = "Two hundred and twenty-six honest voices.",
  subtitle = "Every star on this wall walked out of a chair here. Add yours — it lands at the top, unedited.",
  caption = "WRITE · RATE · PUBLISHED INSTANTLY · QUIET TIMES STUDIO",
  tone = "paper",
  rating = 4.9,
  breakdown = DEFAULT_BREAKDOWN,
  reviews = DEFAULT_REVIEWS,
  className,
}: ReviewWallProps) {
  const ink = tone === "ink"
  const hair = ink ? "border-background/15" : "border-border"
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  const [cards, setCards] = React.useState<Review[]>(reviews)
  const [writing, setWriting] = React.useState(false)
  const [draftRating, setDraftRating] = React.useState<number | null>(null)
  const [draftText, setDraftText] = React.useState("")

  const total = breakdown.reduce((sum, b) => sum + b.count, 0)

  const postReview = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (draftRating === null) return
    const review: Review = {
      id: `you-${Date.now()}`,
      name: "You",
      rating: draftRating,
      text: draftText.trim() || "—",
      tag: "Just now",
    }
    setCards((cs) => [review, ...cs])
    setDraftRating(null)
    setDraftText("")
    setWriting(false)
  }

  return (
    <SectionShell tone={tone} width={920} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: reduce ? 0 : 0.8, ease: EASE }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: reduce ? 0 : 0.8, ease: EASE, delay: reduce ? 0 : 0.1 }}>
        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div>
            <p className="font-display text-[72px] font-bold leading-none tracking-[-0.04em]">
              {rating.toFixed(1)}
              <span className="align-top text-xl font-semibold text-muted-foreground"> / 5</span>
            </p>
            <p className="mt-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {total} verified reviews · Jönköping
            </p>

            <div className="mt-6 space-y-2.5">
              {breakdown.map(({ stars, count }) => (
                <div key={stars} className="flex items-center gap-3">
                  <span className="w-10 shrink-0 font-mono text-[11px] font-bold tabular-nums text-muted-foreground">{stars}★</span>
                  <div aria-hidden className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                    <span className="block h-full rounded-full bg-primary" style={{ width: `${(count / total) * 100}%` }} />
                  </div>
                  <span className="w-10 shrink-0 text-right font-mono text-[11px] font-bold tabular-nums text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>

            {!writing && (
              <button
                type="button"
                onClick={() => setWriting(true)}
                className="mt-7 inline-flex h-10 items-center gap-2 rounded-full border border-border px-5 text-[13px] font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <PenLine className="size-4" aria-hidden />
                Write a review
              </button>
            )}

            <AnimatePresence initial={false}>
              {writing && (
                <motion.form
                  key="mini-form"
                  onSubmit={postReview}
                  initial={reduce ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.28, ease: EASE }}
                  style={{ overflow: "hidden" }}
                  className="mt-7"
                >
                  <div className={cn("rounded-[12px] border bg-card p-4", hair)}>
                    <MonoLabel>Write a review</MonoLabel>

                    <fieldset className="mt-3">
                      <legend className="sr-only">Your rating</legend>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <label key={v} className="cursor-pointer">
                            <input
                              type="radio"
                              name="review-rating"
                              value={v}
                              checked={draftRating === v}
                              onChange={() => setDraftRating(v)}
                              className="peer sr-only"
                            />
                            <span
                              aria-hidden
                              className={cn(
                                "grid size-8 place-items-center rounded-md text-[15px] transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
                                draftRating !== null && v <= draftRating ? "text-primary" : "text-muted-foreground/40 hover:text-primary/60",
                              )}
                            >
                              {draftRating !== null && v <= draftRating ? "★" : "☆"}
                            </span>
                            <span className="sr-only">
                              {v} {v === 1 ? "star" : "stars"}
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <textarea
                      value={draftText}
                      onChange={(e) => setDraftText(e.target.value)}
                      rows={3}
                      aria-label="Your review"
                      placeholder="How was the chair, the colour, the coffee?"
                      className="mt-3 w-full rounded-md border border-border bg-background px-2.5 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        {draftRating ? `${draftRating}/5` : "Pick a rating"}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setWriting(false)}
                          className="h-9 rounded-full border border-border px-4 text-[12px] font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={draftRating === null}
                          className="h-9 rounded-full bg-primary px-4 text-[12px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Post review
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-4">
            {cards.map((r) => (
              <motion.article
                key={r.id}
                layout={reduce ? undefined : true}
                initial={reduce ? false : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className={cn("rounded-[16px] border bg-card p-5", hair)}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-semibold">{r.name}</p>
                  <Stars rating={r.rating} />
                </div>
                <p className="mt-2.5 text-sm leading-6 text-muted-foreground">{r.text}</p>
                <span className={cn("mt-3 inline-flex rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground", hair)}>
                  {r.tag}
                </span>
              </motion.article>
            ))}
          </div>
        </div>

        <p
          className={cn(
            "mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
            ink ? "border-background/15 text-background/55" : "border-border text-muted-foreground",
          )}
        >
          <span>{caption}</span>
          <span aria-hidden>●</span>
        </p>
      </InView>
    </SectionShell>
  )
}
