import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { Stamp } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Design language ──────────────────────────────────────────────────────────
// JOB: look after the guest AFTER the appointment — the 48 hours where the
//   treatment either settles or washes out. This is the retention section.
// EMOTION: the host who walks you to the door: "water, not gym, tonight."
// SIGNATURE MOVE: the line-through that HAPPEXS while you're looking — tick
//   an item and the strike grows across it like a pen, letter-spacing
//   relaxes 1px to 0 like a shoulder dropping. Small, real, physical.
// TYPE: time markers as mono ghost columns ("tonight" / "tomorrow"),
//   items in display-bold 15px, note in serif-muted 13px.
// ─────────────────────────────────────────────────────────────────────────────

export type AftercareItem = {
  id: string
  todo: string
  note?: string
  when?: string
}

export type RecapProps = {
  eyebrow?: string
  title?: string
  signedBy?: string
  items?: AftercareItem[]
  /** Shows a stamp once everything's ticked. Default true. */
  celebrate?: boolean
  doneLabel?: string
  /** Controlled-ish: pass persisted state; component falls back to internal. */
  onDoneChange?: (doneIds: string[]) => void
  className?: string
}


// Self-demo defaults: bare mount (= tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_RECAP_ITEMS = [ { id: "water", todo: "Water, more than feels sensible", when: "tonight", note: "The tissues you just moved need it." }, { id: "no-gym", todo: "Skip the gym tonight", when: "tonight" }, { id: "heat", todo: "Warm shower, slow neck rolls", when: "tomorrow", note: "Ten seconds each way, not ten." }, { id: "book", todo: "Book the next one before you forget", when: "day 7" }, ]

export function Recap({
  eyebrow = "Before checkout",
  title = "What happens next",
  signedBy,
  items = DEMO_RECAP_ITEMS,
  celebrate = true,
  doneLabel = "You're set.",
  onDoneChange,
  className,
}: RecapProps) {
  const reduce = useReducedMotion()
  const [done, setDone] = React.useState<Set<string>>(new Set())
  const toggle = (id: string) => {
    const next = new Set(done)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setDone(next)
    onDoneChange?.([...next])
  }
  const allDone = items.length > 0 && items.every((i) => done.has(i.id))

  return (
    <section className={cn("w-full bg-background text-foreground", className)} aria-label={title}>
      <InView variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-60px" }}>
        <div className="mx-auto w-full max-w-[720px] px-4 py-16 sm:px-6 lg:py-20">
          <header className="mb-8">
            {eyebrow && <p className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{eyebrow}</p>}
            <h2 className="mt-1 flex items-center justify-between gap-4 font-display text-3xl font-semibold tracking-[-0.02em]">
              {title}
              {signedBy && <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">— {signedBy}</span>}
            </h2>
          </header>

          <ul className="flex flex-col">
            {items.map((it, i) => {
              const isDone = done.has(it.id)
              const when = it.when ?? (i === 0 ? "tonight" : `day ${Math.min(i, 2) || 1}`)
              return (
                <li key={it.id} className="border-b border-border last:border-b-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggle(it.id)}
                    aria-pressed={isDone}
                    className="group grid h-auto w-full grid-cols-[56px_1fr_auto] items-start gap-3 py-4 text-left sm:grid-cols-[84px_1fr_auto]"
                  >
                    <span className="pt-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{when}</span>
                    <span className="min-w-0">
                      <span className="relative inline-flex items-center">
                        <span className={cn("font-display text-[15px] font-bold leading-snug tracking-[-0.02em] transition-all duration-300", isDone && "text-muted-foreground/60")}>{it.todo}</span>
                        <span
                          aria-hidden
                          className={cn("pointer-events-none absolute -inset-x-1 top-1/2 h-[2px] origin-left rounded-full bg-foreground", isDone ? "scale-x-100" : "scale-x-0")}
                          style={{ transition: reduce ? "none" : "transform 420ms cubic-bezier(0.16,1,0.3,1)" }}
                        />
                      </span>
                      {it.note && <span className={cn("mt-1 block max-w-prose text-[13px] font-medium leading-relaxed text-muted-foreground", isDone && "opacity-50")}>{it.note}</span>}
                    </span>
                    <span
                      aria-hidden
                      className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors", isDone ? "border-foreground bg-foreground text-background" : "border-border group-hover:border-foreground/40")}
                    >
                      {isDone && (
                        <svg viewBox="0 0 12 12" className="h-3 w-3"><path d="M2.5 6.5 5 9l4.5-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      )}
                    </span>
                  </Button>
                </li>
              )
            })}
          </ul>

          {celebrate && (
            <motion.p
              initial={false}
              animate={{ opacity: allDone ? 1 : 0, y: allDone ? 0 : 6, scale: allDone ? 1 : 0.98 }}
              transition={{ type: "spring", bounce: 0.45, duration: 0.55 }}
              className={cn("mt-6 flex items-center gap-2 text-sm font-semibold tracking-[-0.02em]", allDone ? "" : "pointer-events-none sr-only")}
              aria-live="polite"
            >
              <Stamp className="h-4 w-4 -rotate-6" /> {doneLabel}
            </motion.p>
          )}
        </div>
      </InView>
    </section>
  )
}
