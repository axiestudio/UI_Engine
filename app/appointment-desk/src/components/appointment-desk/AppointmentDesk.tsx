import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { CalendarCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { DateRangePresets, type Range } from "date-range-presets"
import { BoardingPass } from "boarding-pass-gate"
import { ToastStack } from "toast-stack"

// COMPOSITE SCREEN · BOOKING DESK
// composed of: date-range-presets (booking window), boarding-pass-gate
// (confirmation stub) and a purpose-built day × resource availability grid
// with a remarks panel; ToastStack confirms holds and releases.

const DAYS = ["Saturday", "Monday", "Tuesday"] as const
const TIMES = ["09:30", "11:00", "13:00", "14:00", "15:40", "17:20"]
const CHAIRS = ["chair 01", "chair 03", "colour bar", "school bench"]
const busy = new Set(["0-2", "0-4", "1-0", "1-3", "2-1", "2-5"])
const held = new Set<string>()

export type AppointmentDeskProps = {
  onBook?: (slot: { day: string; time: string; resource: string }) => void
  className?: string
}

export function AppointmentDesk({ onBook, className }: AppointmentDeskProps) {
  const [range, setRange] = React.useState<Range | null>(null)
  const [sel, setSel] = React.useState<{ d: number; t: number; c: number } | null>(null)
  const [booked, setBooked] = React.useState<{ d: number; t: number; c: number } | null>(null)
  const [note, setNote] = React.useState("")
  const [toasts, setToasts] = React.useState<{ id: string; title: string; tone?: "ok" | "warn" }[]>([])
  const push = (title: string, tone: "ok" | "warn" = "ok") => setToasts((t) => [...t.slice(-2), { id: String(Date.now() + Math.random()), title, tone }])

  const busyAt = (d: number, t: number, c: number) => held.has(`${d}-${t}-${c}`) || busy.has(`${d}-${t}`) || busy.has(`${d}-${c}`) || busy.has(`${t}-${c}`)

  const confirm = () => {
    if (!sel) return
    held.add(`${sel.d}-${sel.t}-${sel.c}`)
    setBooked(sel)
    onBook?.({ day: DAYS[sel.d], time: TIMES[sel.t], resource: CHAIRS[sel.c] })
    push(`Held ${TIMES[sel.t]} · ${CHAIRS[sel.c]} on ${DAYS[sel.d]} — 24 h`, "ok")
    setSel(null)
  }
  const release = () => {
    if (!booked) return
    const k = `${booked.d}-${booked.t}-${booked.c}`
    held.delete(k)
    setBooked(null)
    setNote("")
    push("Hold released back to the day", "warn")
  }

  return (
    <div className={cn("flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Appointments</h2>
        <span className="text-[12px] text-muted-foreground">South House · walk-ins land on the board</span>
        <div className="ml-auto"><DateRangePresets value={range} onChange={(r) => { setRange(r); push(r ? "Window applied to availability" : "Showing all open days") }} /></div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        {/* availability grid */}
        <section className="min-w-0 overflow-hidden rounded-lg border bg-card">
          <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Next open days · tap a cell to hold</span>
            <span className="text-[11px] font-semibold text-muted-foreground">rows = time · columns = resource</span>
          </header>
          <div className="overflow-x-auto p-3">
            <div className="grid min-w-[560px] grid-cols-[64px_repeat(4,minmax(0,1fr))]" style={{ gap: 2 }}>
              <span />
              {DAYS.map((d) => <span key={d} className="pb-1 text-center text-[11px] font-bold">{d}</span>)}
              {TIMES.map((tm, t) => (
                <React.Fragment key={tm}>
                  <span className="self-center pr-2 text-right font-mono text-[11px] tabular-nums text-muted-foreground">{tm}</span>
                  {[0, 1, 2].map((d) =>
                    [0, 1, 2, 3].map((c) => {
                      const off = busyAt(d, t, c)
                      const isSel = sel?.d === d && sel?.t === t && sel?.c === c
                      const isBooked = booked?.d === d && booked?.t === t && booked?.c === c
                      return (
                        <button
                          key={`${d}-${t}-${c}`}
                          disabled={off || !!booked && !isBooked}
                          aria-label={`${DAYS[d]} ${tm} ${CHAIRS[c]}${off ? " unavailable" : isBooked ? " your hold" : " available"}`}
                          onClick={() => (isSel ? (setSel(null)) : setSel({ d, t, c }))}
                          className={cn(
                            "h-8 rounded-[4px] border text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors",
                            off && "cursor-not-allowed border-transparent bg-muted/50 text-muted-foreground/40",
                            !off && isBooked && "border-[hsl(var(--ok)/0.5)] bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]",
                            !off && !isBooked && isSel && "border-primary bg-accent text-accent-foreground shadow-[0_0_0_2px_hsl(var(--app-focus)/0.25)]",
                            !off && !isBooked && !isSel && "border-dashed border-border text-muted-foreground hover:border-solid hover:bg-accent/60 hover:text-foreground",
                          )}
                        >
                          {!off && (isBooked ? "held" : isSel ? "selected" : c === 3 ? "walk-in" : "open")}
                        </button>
                      )
                    })
                  )}
                  </React.Fragment>
                ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">The grid is deterministic demo data; wire `held` and `busy` to your availability API.</p>
          </div>
        </section>

        {/* selection / confirmation rail */}
        <aside className="flex min-w-0 flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Selection</header>
            <div className="space-y-3 p-3">
              <AnimatePresence mode="wait">
                {sel ? (
                  <motion.div key="sel" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
                    <p className="text-[13px] font-bold">{DAYS[sel.d]} · {TIMES[sel.t]}</p>
                    <p className="text-[12px] text-muted-foreground">{CHAIRS[sel.c]}</p>
                    <label className="block text-[11px] font-semibold text-muted-foreground">
                      Note for the chair (plain text — saved with the booking)
                      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={160} placeholder="e.g. north mirror, no phone calls" className="mt-1 w-full resize-none rounded-md border bg-background px-2.5 py-2 text-[12px] outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--app-focus))]" />
                    </label>
                    <button onClick={confirm} className="flex h-9 w-full items-center justify-center gap-2 rounded-md bg-primary text-[11px] font-black uppercase tracking-[0.12em] text-primary-foreground"><CalendarCheck className="size-4" /> Hold for 24 hours</button>
                  </motion.div>
                ) : booked ? null : (
                  <p className="py-2 text-[12px] text-muted-foreground">Pick an open cell in the grid. Holds are soft — no card yet.</p>
                )}
              </AnimatePresence>
              {booked && (
                <div className="space-y-2">
                  <p className="text-[12px] font-bold text-[hsl(var(--ok))]">Held · {DAYS[booked.d]} {TIMES[booked.t]} {CHAIRS[booked.c]}</p>
                  <button onClick={release} className="h-8 w-full rounded-md border text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground hover:bg-muted">Release hold</button>
                </div>
              )}
            </div>
          </section>
          <AnimatePresence mode="wait">
            {booked && (
              <motion.div key="stub" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }} transition={{ type: "spring", stiffness: 220, damping: 22 }}>
                <BoardingPass
                  eyebrow="HOLD CONFIRMED · NOT TICKETED"
                  pass={{ holder: note.trim().slice(0, 26).toUpperCase() || "WALK-IN GUEST", from: "WEB", to: "CHAIR " + String(booked.c + 1).padStart(2, "0"), when: `${DAYS[booked.d].slice(0, 3)} ${TIMES[booked.t]}`, seat: String(12 + booked.d), code: "HOLD-" + (4812 + booked.t), validUntil: "24H", stamp: "soft hold" }}
                  cta={{ label: "Add card to confirm" }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} pos="br" />
    </div>
  )
}
