import * as React from "react"
import { Check, Clock3 } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { Magnetic } from "@/components/primitives/magnetic"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type WeekDay = {
  /** Display label (any language) — Monday-first order assumed for `todayIndex`. */
  day: string
  /** e.g. "09:00 – 18:00". Ignored when `closed`. */
  hours?: string
  closed?: boolean
}

export type Slot = {
  day: string
  time: string
  label?: string
}

export type ScheduleProps = {
  eyebrow?: string
  title?: string
  intro?: React.ReactNode
  week: WeekDay[]
  /** Next bookable slots — rendered as selectable chips. */
  slots?: Slot[]
  /** Highlight the weekday at this index (Mon-first). Defaults to today. */
  todayIndex?: number
  todayLabel?: string
  closedLabel?: string
  /** Rendered when the today row has hours: e.g. "Open now — until 18:00". */
  openLabel?: (day: WeekDay) => string
  /** Pick a slot → host does the actual booking (Bokadirekt, API…). */
  onBook?: (slot: { day: string; time: string }) => void
  bookLabel?: string
  /** Optional free-form CTA below the slots (e.g. "All times & cancellations"). */
  footerNote?: string
  className?: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function todayIndexDefault() {
  return (new Date().getDay() + 6) % 7
}

// ── Schedule ─────────────────────────────────────────────────────────────────

export function Schedule({
  eyebrow = "Plan your visit",
  title = "Opening hours & next slots",
  intro,
  week,
  slots = [],
  todayIndex,
  todayLabel = "Today",
  closedLabel = "Closed",
  openLabel = (d) => (d.hours ? `Open now — until ${d.hours.split(/[–—-]/)[1]?.trim() ?? d.hours}` : closedLabel),
  onBook,
  bookLabel = "Book",
  footerNote,
  className,
}: ScheduleProps) {
  const today = todayIndex !== undefined ? todayIndex : todayIndexDefault()
  const [selected, setSelected] = React.useState<number | null>(null)
  const todayDay = week[today]
  const openNow = !!todayDay && !todayDay.closed

  return (
    <section className={cn("w-full bg-background text-foreground", className)} aria-label={title}>
      <InView variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-80px" }}>
        <div className="mx-auto w-full max-w-[1080px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <header className="mb-10 max-w-2xl">
            {eyebrow && <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>}
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
            <p className="mt-3 flex items-center gap-2 text-sm font-semibold">
              <span className={cn("relative flex h-2 w-2", !openNow && "opacity-40")} aria-hidden>
                {openNow && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/40" />}
                <span className={cn("relative inline-flex h-2 w-2 rounded-full", openNow ? "bg-foreground" : "bg-muted-foreground")} />
              </span>
              <span className={openNow ? "" : "text-muted-foreground"}>
                {openNow ? (todayDay ? openLabel(todayDay) : "") : "Closed today"}
              </span>
              {intro && <span className="ml-2 font-medium text-muted-foreground">— {intro}</span>}
            </p>
          </header>

          <div className="grid gap-4 rounded-[24px] border bg-card p-4 shadow-sm sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            {/* week table */}
            <div className="rounded-[16px] border bg-background/40 p-4 sm:p-5">
              <h3 className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <Clock3 className="h-3 w-3" /> Week
              </h3>
              <table className="mt-3 w-full text-sm">
                <tbody>
                  {week.map((d, i) => (
                    <tr key={d.day} className={cn("align-top", i === today && "font-extrabold")}>
                      <td className="py-1.5 pr-2">
                        <span className="flex items-center gap-2">
                          {d.day}
                          {i === today && (
                            <span className="rounded-full bg-foreground px-1.5 py-0.5 font-mono text-[9px] font-black uppercase leading-none tracking-wide text-background">
                              {todayLabel}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className={cn("py-1.5 text-right font-mono text-xs font-semibold tabular-nums", d.closed && "text-muted-foreground")}>
                        {d.closed ? closedLabel : d.hours}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* next slots */}
            <div className="rounded-[16px] border bg-background/40 p-4 sm:p-5">
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Next available</h3>
              {slots.length === 0 ? (
                <p className="mt-3 text-sm font-medium text-muted-foreground">No published slots — use the booking link.</p>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Choose a time slot">
                  {slots.map((s, i) => {
                    const active = selected === i
                    return (
                      <button
                        key={`${s.day}-${s.time}`}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setSelected(i)}
                        className={cn(
                          "flex flex-col items-start rounded-xl border px-3 py-2.5 text-left transition-all",
                          active ? "border-foreground bg-foreground text-background shadow-sm" : "bg-background hover:bg-accent"
                        )}
                      >
                        <span className="font-display text-sm font-extrabold tracking-tight">{s.time}</span>
                        <span className={cn("font-mono text-[10px] font-bold uppercase tracking-widest", active ? "text-background/70" : "text-muted-foreground")}>{s.day}</span>
                        {s.label && <span className={cn("mt-1 text-[10px] font-semibold", active ? "text-background/70" : "text-muted-foreground")}>{s.label}</span>}
                      </button>
                    )
                  })}
                </div>
              )}
              {onBook && slots.length > 0 && (
                <div className="mt-4 flex items-center justify-between gap-3">
                  {footerNote ? <p className="text-[11px] font-medium text-muted-foreground">{footerNote}</p> : <span />}
                  <Magnetic intensity={0.2} range={50}>
                    <button
                      type="button"
                      disabled={selected === null}
                      onClick={() => {
                        const s = slots[selected ?? 0]
                        if (s) onBook({ day: s.day, time: s.time })
                      }}
                      className={cn(
                        "inline-flex h-10 items-center gap-1.5 rounded-full px-5 font-display text-sm font-extrabold tracking-tight shadow-sm transition-all",
                        selected === null ? "cursor-not-allowed bg-muted text-muted-foreground" : "bg-foreground text-background hover:scale-[1.02] active:scale-[0.98]"
                      )}
                    >
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                      {bookLabel}
                      {selected !== null && (
                        <span className="ml-1 font-mono text-[10px] font-bold uppercase tracking-widest opacity-70">
                          {slots[selected]?.time}
                        </span>
                      )}
                    </button>
                  </Magnetic>
                </div>
              )}
            </div>
          </div>
        </div>
      </InView>
    </section>
  )
}
