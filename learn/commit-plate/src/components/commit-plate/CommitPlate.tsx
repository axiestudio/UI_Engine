import * as React from "react"
import { motion } from "motion/react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"
import { cva } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: { default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm", outline: "border bg-background hover:bg-accent hover:text-accent-foreground", ghost: "hover:bg-accent hover:text-accent-foreground" },
      size: { default: "h-9 px-4 py-2", sm: "h-8 px-3 text-xs" },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

// ═══ JOB      turn intention into commitment — lightweight, respectful
// ═══ EMOTION  calm resolve — no hard stamps, no fake social proof

export type CommitPlateProps = {
  kicker?: string
  placeholder?: string
  maxLength?: number
  onCommit?: (goal: string) => void
  className?: string
}

export function CommitPlate({ kicker = "THE ASK", placeholder = "I will ship one small thing by Friday…", maxLength = 120, onCommit, className }: CommitPlateProps) {
  const [goal, setGoal] = React.useState("")
  const [committed, setCommitted] = React.useState(false)
  const [dateLabel, setDateLabel] = React.useState("")
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  React.useEffect(() => {
    setDateLabel(new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }))
  }, [])

  const valid = goal.trim().length >= 4

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    setCommitted(true)
    onCommit?.(goal.trim())
  }

  const pct = Math.min(100, (goal.length / maxLength) * 100)

  return (
    <SectionShell width={760} padding="grand" className={cn(className)}>
      <MonoLabel className="text-muted-foreground">{kicker} · YOUR COMMITMENT</MonoLabel>

      {!committed ? (
        <InView once className="mt-6">
          <form onSubmit={submit} className="max-w-[560px]">
            <h2 className="font-display text-[30px] font-bold leading-[0.98] tracking-tight text-foreground sm:text-[36px]">
              Name one thing you’ll finish this week.
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">Keep it small enough to demo. We’ll hold it with you — privately.</p>

            <label htmlFor="commit-goal" className="mt-8 block font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Your one thing
            </label>
            <div className="relative mt-2">
              <input
                id="commit-goal"
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value.slice(0, maxLength))}
                placeholder={placeholder}
                maxLength={maxLength}
                aria-describedby="commit-help commit-count"
                className="w-full rounded-xl border bg-background px-4 py-3.5 font-serif text-[18px] italic leading-none text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden rounded-b-xl">
                <motion.span className="block h-px bg-foreground" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.25 }} />
              </div>
            </div>
            <div className="mt-2 flex justify-between gap-4">
              <span id="commit-help" className="font-mono text-[10px] font-medium text-muted-foreground">
                Press Enter to commit · private to you
              </span>
              <span id="commit-count" className="font-mono text-[10px] tabular-nums text-muted-foreground">
                {goal.length}/{maxLength}
              </span>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="submit"
                disabled={!valid}
                className={cn(buttonVariants({ variant: "default" }))}
              >
                Commit
              </button>
              <span className="font-mono text-[11px] font-medium text-muted-foreground">You can edit after</span>
            </div>
          </form>
        </InView>
      ) : (
        <div className="mt-8 flex flex-col items-center text-center">
          <motion.div
            initial={reduce ? false : { scale: 0.98, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[420px] rounded-2xl border bg-card p-6 shadow-sm sm:p-8"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Check className="size-3.5" aria-hidden /> Committed
            </span>
            <p className="mt-4 font-serif text-xl italic leading-snug text-foreground">“{goal}”</p>
            <p className="mt-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Saved · {dateLabel || "today"}</p>
          </motion.div>
          <button
            type="button"
            onClick={() => {
              setCommitted(false)
              setGoal("")
            }}
            className="mt-6 inline-flex items-center gap-1.5 rounded-md border bg-background px-4 py-2 font-mono text-xs font-medium text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Edit commitment
          </button>
        </div>
      )}
      <p aria-live="polite" className="sr-only">
        {committed ? "Goal committed" : ""}
      </p>
    </SectionShell>
  )
}
