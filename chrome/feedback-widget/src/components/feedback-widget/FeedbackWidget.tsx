import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, Frown, Heart, Meh, MessageSquare, X, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionHead } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB         Catch the feeling while it's still in the chair.
// ═══ EMOTION     A tab that never blinks, a form that says thank you and leaves.
// ═══ SIGNATURE   Bottom-right pill → mood (Love it / Ok / Broken) + note →
//                 "Tack! Noted." → auto-close. Demoed inside a dashed stage
//                 so the floating widget never escapes the showcase.

type Mood = "love" | "ok" | "broken"

const MOODS: { id: Mood; label: string; icon: LucideIcon }[] = [
  { id: "love", label: "Love it", icon: Heart },
  { id: "ok", label: "Ok", icon: Meh },
  { id: "broken", label: "Broken", icon: Frown },
]

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export type FeedbackWidgetProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function FeedbackWidget({
  eyebrow = "Chrome · Floating widget",
  title = "Feedback, one press away.",
  subtitle = "A bottom-right tab opens a mood-and-note popover that thanks you and clears itself — rendered inside a stage so it stays put.",
  caption = "PRESS THE TAB · PICK A MOOD · AUTO-CLOSES AFTER SEND",
  tone = "paper",
  className,
}: FeedbackWidgetProps) {
  const ink = tone === "ink"
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  const [open, setOpen] = React.useState(false)
  const [mood, setMood] = React.useState<Mood | null>(null)
  const [note, setNote] = React.useState("")
  const [sent, setSent] = React.useState(false)

  React.useEffect(() => {
    if (!sent) return
    const t = window.setTimeout(() => {
      setOpen(false)
      setSent(false)
      setMood(null)
      setNote("")
    }, 1600)
    return () => window.clearTimeout(t)
  }, [sent])

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!mood) return
    setSent(true)
  }

  return (
    <div className={cn("relative isolate w-full bg-background py-16 text-foreground", ink && "bg-foreground text-background", className)}>
      <div className="mx-auto w-full max-w-[720px] px-4 sm:px-6">
        <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: reduce ? 0 : 0.8, ease: EASE }}>
          <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
        </InView>

        <InView once variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: reduce ? 0 : 0.9, ease: EASE, delay: reduce ? 0 : 0.1 }}>
          <div className={cn("relative mt-8 h-[420px] rounded-xl border border-dashed", ink ? "border-background/25" : "border-border")}>
            <span
              aria-hidden
              className={cn(
                "absolute left-4 top-4 font-mono text-[10px] font-bold uppercase tracking-[0.25em]",
                ink ? "text-background/40" : "text-muted-foreground/70",
              )}
            >
              Stage · widget anchored bottom-right
            </span>
            <p
              className={cn(
                "pointer-events-none absolute inset-0 grid place-items-center px-6 text-center text-[13px] font-medium",
                ink ? "text-background/40" : "text-muted-foreground/80",
              )}
            >
              Nothing to configure — press the tab and tell us how it&rsquo;s going.
            </p>

            <div className="absolute bottom-6 right-6">
              <AnimatePresence>
                {open && (
                  <motion.div
                    key="popover"
                    role="dialog"
                    aria-label="Feedback form"
                    initial={reduce ? false : { opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduce ? undefined : { opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className={cn(
                      "absolute bottom-full right-0 mb-3 w-80 rounded-2xl border bg-card p-4 shadow-2xl",
                      ink ? "border-background/15" : "border-border",
                    )}
                  >
                    {sent ? (
                      <div role="status" className="flex items-center justify-center gap-2.5 py-7">
                        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-4" aria-hidden />
                        </span>
                        <p className="font-display text-base font-bold tracking-[-0.02em]">Tack! Noted.</p>
                      </div>
                    ) : (
                      <form onSubmit={submit}>
                        <div className="flex items-center justify-between">
                          <MonoLabel>Quiet Times Studio</MonoLabel>
                          <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Close feedback"
                            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <X className="size-4" aria-hidden />
                          </button>
                        </div>

                        <div role="group" aria-label="How's it going?" className="mt-3 flex gap-2">
                          {MOODS.map(({ id, label, icon: Icon }) => (
                            <button
                              key={id}
                              type="button"
                              aria-pressed={mood === id}
                              onClick={() => setMood(id)}
                              className={cn(
                                "flex flex-1 flex-col items-center gap-1.5 rounded-lg border px-2 py-2.5 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                mood === id ? "border-primary bg-muted text-foreground" : "border-border text-muted-foreground hover:bg-muted",
                              )}
                            >
                              <Icon className="size-4" aria-hidden />
                              {label}
                            </button>
                          ))}
                        </div>

                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows={3}
                          aria-label="Anything else? (optional)"
                          placeholder="What made the visit — or what broke it?"
                          className="mt-2 w-full rounded-md border border-border bg-background px-2.5 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />

                        <button
                          type="submit"
                          disabled={!mood}
                          className="mt-2 flex h-9 w-full items-center justify-center rounded-md bg-primary text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Send
                        </button>
                      </form>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className={cn(
                  "flex h-11 items-center gap-2 rounded-full px-4 shadow-lg transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  ink ? "bg-background text-foreground" : "bg-foreground text-background",
                )}
              >
                <MessageSquare className="size-4" aria-hidden />
                <span className="text-[13px] font-semibold">Feedback</span>
              </button>
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
      </div>
    </div>
  )
}
