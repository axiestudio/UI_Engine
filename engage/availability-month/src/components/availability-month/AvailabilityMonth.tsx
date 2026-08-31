import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB         Answer "when can I get in?" with a calendar, not a phone call.
// ═══ EMOTION     Flipping the kitchen calendar to next month.
// ═══ SIGNATURE   A real Date-driven month grid — Monday-first, blanks where
//                 weeks start — where free days open a strip of three slots.

export type AvailabilityMonthProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  caption?: string
  tone?: "paper" | "ink"
  /** Month the demo opens on (defaults to October 2026). */
  initialMonth?: Date
  /** Times offered on any free day. */
  slots?: string[]
  className?: string
}

const WEEKDAYS = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"]

const DEFAULT_SLOTS = ["09:00", "11:30", "15:00"]

/** Fully-booked days per month index; October 2026 is curated, other months derive deterministically. */
const BOOKED_BY_MONTH: Record<number, number[]> = {
  9: [2, 5, 9, 13, 16, 19, 23, 27, 29],
}

const isBooked = (month: number, day: number) => {
  const listed = BOOKED_BY_MONTH[month]
  if (listed) return listed.includes(day)
  return (day * 11 + month * 3) % 9 === 4
}

/** Monday-first offset blanks + one cell per real day, padded to full weeks. */
function buildGrid(cursor: Date): (number | null)[] {
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const lead = (new Date(year, month, 1).getDay() + 6) % 7
  const days = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function AvailabilityMonth({
  eyebrow = "Engage · Availability",
  title = "The month, open for booking.",
  subtitle = "Real calendar math, no fake Fridays. Struck-through days are fully booked — pick a free day and grab a slot before it goes.",
  caption = "SELECT A DAY · SLOTS HOLD 15 MIN · CHAIRS 1–3",
  tone = "paper",
  initialMonth = new Date(2026, 9, 1),
  slots = DEFAULT_SLOTS,
  className,
}: AvailabilityMonthProps) {
  const ink = tone === "ink"
  const hair = ink ? "border-background/15" : "border-border"
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  const [cursor, setCursor] = React.useState(initialMonth)
  const [selected, setSelected] = React.useState<number | null>(null)
  const [slot, setSlot] = React.useState<string | null>(null)

  const cells = React.useMemo(() => buildGrid(cursor), [cursor])
  const today = new Date()

  const monthLabel = cap(cursor.toLocaleDateString("sv-SE", { month: "long", year: "numeric" }))

  const selDate = selected !== null ? new Date(cursor.getFullYear(), cursor.getMonth(), selected) : null
  const selLabel = selDate ? cap(selDate.toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long" })) : null

  const go = (delta: number) => {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1))
    setSelected(null)
    setSlot(null)
  }

  return (
    <SectionShell tone={tone} width={760} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>

      <InView once variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: reduce ? 0 : 0.9, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.1 }}>
        <div className="mt-10">
          <div className={cn("mx-auto w-full max-w-[480px] overflow-hidden rounded-[16px] border bg-card shadow-[0_24px_52px_-30px_hsl(var(--foreground)/0.45)]", ink ? "border-background/15" : "border-border")}>
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <MonoLabel>Boka tid — Quiet Times Studio</MonoLabel>
              <span className="font-mono text-[11px] font-bold text-muted-foreground">Jönköping</span>
            </div>

            <div className="px-5 py-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold tracking-[-0.02em]" aria-live="polite">
                  {monthLabel}
                </h3>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Previous month"
                    className="flex size-9 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ChevronLeft className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Next month"
                    className="flex size-9 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ChevronRight className="size-4" aria-hidden />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-7 gap-1.5">
                {WEEKDAYS.map((w) => (
                  <span key={w} aria-hidden className="grid h-7 place-items-center font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    {w}
                  </span>
                ))}
                {cells.map((d, i) => {
                  if (d === null) return <span key={`blank-${i}`} aria-hidden />
                  const booked = isBooked(cursor.getMonth(), d)
                  const isSelected = selected === d
                  const isToday =
                    today.getFullYear() === cursor.getFullYear() &&
                    today.getMonth() === cursor.getMonth() &&
                    today.getDate() === d
                  return (
                    <button
                      key={d}
                      type="button"
                      disabled={booked}
                      aria-pressed={isSelected}
                      aria-label={`${cap(new Date(cursor.getFullYear(), cursor.getMonth(), d).toLocaleDateString("sv-SE", { day: "numeric", month: "long" }))}${
                        booked ? " — fully booked" : " — 3 slots available"
                      }`}
                      onClick={() => {
                        setSelected(d)
                        setSlot(null)
                      }}
                      className={cn(
                        "grid aspect-square place-items-center rounded-md border text-[13px] font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        booked
                          ? "cursor-not-allowed border-transparent text-muted-foreground/50 line-through"
                          : "border-border hover:bg-muted",
                        isSelected && "border-primary bg-primary text-primary-foreground hover:bg-primary",
                        isToday && !isSelected && "ring-1 ring-primary",
                      )}
                    >
                      {d}
                    </button>
                  )
                })}
              </div>

              <AnimatePresence initial={false}>
                {selDate && selected !== null && (
                  <motion.div
                    key={`${selDate.getFullYear()}-${selDate.getMonth()}-${selected}`}
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={reduce ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
                    className="mt-4 rounded-[12px] border border-border bg-muted/40 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <MonoLabel>{selLabel}</MonoLabel>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        {slots.length} slots
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {slots.map((s) => (
                        <button
                          key={s}
                          type="button"
                          aria-pressed={slot === s}
                          onClick={() => setSlot(s)}
                          className={cn(
                            "h-9 rounded-md border px-3 font-mono text-[12px] font-bold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            slot === s
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background hover:bg-muted",
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <p className="mt-3 text-[12px] font-medium text-muted-foreground">
                      Chairs 1–3 · your slot holds for 15 minutes.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <p
            className={cn(
              "mx-auto mt-8 flex w-full max-w-[480px] items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
              ink ? "border-background/15 text-background/55" : "border-border text-muted-foreground",
            )}
          >
            <span>{caption}</span>
            <span aria-hidden>●</span>
          </p>
        </div>
      </InView>
    </SectionShell>
  )
}
