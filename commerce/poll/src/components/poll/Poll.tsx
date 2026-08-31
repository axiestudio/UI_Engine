import * as React from "react"
import { Check } from "lucide-react"
import { AnimatedNumber } from "@/components/primitives/animated-number"
import { InView } from "@/components/primitives/in-view"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type PollOption = {
  id: string
  label: string
  /** Existing vote count (server state). */
  votes: number
}

export type PollProps = {
  question: string
  note?: string
  options: PollOption[]
  /** Called with the chosen option id. Host persists + returns fresh `options` to animate updates. */
  onVote?: (id: string) => void | Promise<void>
  /** Set after a host-side accepted vote (replaces buttons with a thank-you state). */
  voted?: boolean
  voteLabel?: string
  thanksLabel?: string
  totalLabel?: (n: number) => string
  className?: string
}

// ── Poll ─────────────────────────────────────────────────────────────────────

export function Poll({
  question,
  note,
  options,
  onVote,
  voted = false,
  voteLabel = "Vote",
  thanksLabel = "Thanks — your vote counted",
  totalLabel = (n) => `${n.toLocaleString()} votes`,
  className,
}: PollProps) {
  const [choice, setChoice] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)
  const [errored, setErrored] = React.useState(false)
  const showResults = voted || !!choice
  const total = options.reduce((s, o) => s + o.votes + (voted && o.id === choice ? 1 : 0), 0)
  const sorted = [...options].sort((a, b) => b.votes + (voted && b.id === choice ? 1 : 0) - (a.votes + (voted && a.id === choice ? 1 : 0)))

  const vote = async (id: string) => {
    if (voted || pending) return
    setChoice(id)
    if (!onVote) return
    setErrored(false)
    setPending(true)
    try {
      await onVote(id)
    } catch {
      setErrored(true)
      setChoice(null)
    } finally {
      setPending(false)
    }
  }

  return (
    <section className={cn("w-full bg-background text-foreground", className)} aria-label={question}>
      <InView variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-60px" }}>
        <div className="mx-auto w-full max-w-[560px] px-4 py-14 sm:px-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-xl font-semibold leading-snug tracking-[-0.02em]">{question}</h2>
              {!voted && total > 0 && (
                <Badge variant="outline" className="shrink-0 font-mono text-[10px] font-bold tracking-[0.12em]">
                  <AnimatedNumber value={total} /> {""}votes
                </Badge>
              )}
            </div>
            {note && <p className="mt-2 text-sm font-medium text-muted-foreground">{note}</p>}

            <form
              onSubmit={(e) => { e.preventDefault(); if (choice && voted !== true) vote(choice) }}
              className="mt-5 flex flex-col gap-2"
              role="group"
              aria-label="Poll options"
            >
              {sorted.map((o) => {
                const votes = o.votes + (voted && o.id === choice ? 1 : 0)
                const pct = total ? Math.round((votes / total) * 100) : 0
                const picked = choice === o.id
                return (
                  <label
                    key={o.id}
                    className={cn(
                      "relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3 transition-colors",
                      picked ? "border-foreground bg-muted/40" : "hover:bg-accent/50",
                      voted && !picked && "opacity-70"
                    )}
                  >
                    {showResults && (
                      <span aria-hidden className="absolute inset-y-0 left-0 bg-foreground/10 transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
                    )}
                    <input
                      type="radio"
                      name="poll-option"
                      value={o.id}
                      checked={picked}
                      onChange={() => setChoice(o.id)}
                      onClick={() => vote(o.id)}
                      disabled={voted || pending}
                      className="peer sr-only"
                    />
                    <span aria-hidden className={cn("relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-border bg-background transition-colors", picked && "border-foreground bg-foreground text-background")}>
                      {picked && <Check className="h-3 w-3 stroke-[3]" />}
                    </span>
                    <span className="relative z-10 flex-1 text-sm font-bold tracking-[-0.02em]">{o.label}</span>
                    {showResults && <span className="relative z-10 font-mono text-xs font-semibold tabular-nums text-muted-foreground">{pct}%</span>}
                  </label>
                )
              })}

              {!voted && (
                <Button type="submit" disabled={!choice || pending} className="mt-2 h-10 self-start rounded-full px-6 font-display text-sm font-semibold tracking-[-0.02em]" aria-busy={pending}>
                  {pending ? "Sending…" : voted ? thanksLabel : onVote ? voteLabel : `${voteLabel} (wire onVote)`}
                </Button>
              )}
              {errored && <p role="alert" className="text-xs font-semibold text-destructive">Vote failed — try again.</p>}
              {voted && <p role="status" className="mt-2 text-sm font-bold text-success">{thanksLabel}</p>}
            </form>

            <p className="mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {total ? totalLabel(total) : "First vote"}
            </p>
          </div>
        </div>
      </InView>
    </section>
  )
}
