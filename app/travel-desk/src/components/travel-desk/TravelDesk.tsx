import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { Plane, RadioTower, TicketCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { OfflineQueueBanner } from "offline-queue-banner"
import { EventTimelineDay, type TimelineEvent } from "event-timeline-day"
import { ToastStack, type Toast } from "toast-stack"

// COMPOSITE SCREEN · TRAVEL ITINERARY OPS
// Frameless itinerary board: the vertical leg rail IS the desk — a full-height
// spine down the left with each leg's bookings and boarding-pass stubs dealt
// in beneath it as they are issued. Right column is a docked booking-windows
// panel (dashed), trip events as a bare rail, and the ping centre.
// Offline sync runs as a full-width band under the header.

export type Leg = {
  id: string
  flight: string
  from: string
  to: string
  dep: string
  arr: string
  state: "scheduled" | "boarding" | "landed"
}
export type Booking = {
  id: string
  legId: string
  pax: string
  fare: "flex" | "standard" | "basic"
  status: "confirmed" | "waitlist"
  passIssued?: boolean
}
export type TravelDeskProps = {
  pnr?: string
  traveller?: string
  legs?: Leg[]
  bookings?: Booking[]
  events?: TimelineEvent[]
  onPassIssued?: (booking: Booking) => void
  className?: string
}

const DEFAULT_LEGS: Leg[] = [
  { id: "lg1", flight: "SK 1421", from: "ARN", to: "OSL", dep: "07:25", arr: "08:30", state: "landed" },
  { id: "lg2", flight: "SK 2851", from: "OSL", to: "AMS", dep: "11:10", arr: "13:35", state: "boarding" },
  { id: "lg3", flight: "KL 1003", from: "AMS", to: "JFK", dep: "16:40", arr: "19:05", state: "scheduled" },
]

const DEFAULT_BOOKINGS: Booking[] = [
  { id: "bk1", legId: "lg1", pax: "M. Ahlberg", fare: "flex", status: "confirmed", passIssued: true },
  { id: "bk2", legId: "lg2", pax: "M. Ahlberg", fare: "flex", status: "confirmed" },
  { id: "bk3", legId: "lg3", pax: "M. Ahlberg", fare: "standard", status: "confirmed" },
  { id: "bk4", legId: "lg3", pax: "E. Kall (companion)", fare: "basic", status: "waitlist" },
]

const DEFAULT_EVENTS: TimelineEvent[] = [
  { id: "ev1", at: "2026-09-01T07:25:00", actor: "system", kind: "create", text: "ARN→OSL flown · booking closed" },
  { id: "ev2", at: "2026-09-01T09:40:00", actor: "M. Ahlberg", kind: "comment", text: "Traveller note: need aisle seat on the long leg" },
  { id: "ev3", at: "2026-09-01T10:05:00", actor: "ops", kind: "edit", text: "Seat 14A assigned on OSL→AMS" },
  { id: "ev4", at: "2026-09-01T10:52:00", actor: "system", kind: "alert", text: "Gate change KL 1003: D8 → D14" },
  { id: "ev5", at: "2026-09-01T11:30:00", actor: "ops", kind: "deploy", text: "E-ticket re-issued after fare upgrade to flex" },
]

const WINDOWS: { id: string; label: string; detail: string; state: "open" | "opens" | "closed" }[] = [
  { id: "wn1", label: "Check-in · OSL→AMS", detail: "opened T-36 h", state: "open" },
  { id: "wn2", label: "Seat map · AMS→JFK", detail: "closes T-1 h before dep", state: "opens" },
  { id: "wn3", label: "Bag drop · OSL", detail: "closes T-40 min", state: "opens" },
  { id: "wn4", label: "Upgrade bids · OSL→AMS", detail: "closed at T-24 h", state: "closed" },
]

const SEATS: Record<string, string> = { bk1: "09C", bk2: "09C", bk3: "14A" }

export function TravelDesk({
  pnr = "QK7TRD",
  traveller = "M. Ahlberg",
  legs = DEFAULT_LEGS,
  bookings = DEFAULT_BOOKINGS,
  events = DEFAULT_EVENTS,
  onPassIssued,
  className,
}: TravelDeskProps) {
  const legOf = React.useMemo(() => Object.fromEntries(legs.map((l) => [l.id, l])), [legs])
  const [rows, setRows] = React.useState(bookings)
  const [online, setOnline] = React.useState(true)
  const [queued, setQueued] = React.useState(2)
  const [flushing, setFlushing] = React.useState(false)
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const push = (t: Omit<Toast, "id">) => setToasts((ts) => [...ts.slice(-2), { id: String(Date.now() + Math.random()), ...t }])

  const issue = (b: Booking) => {
    const leg = legOf[b.legId]
    setRows((rs) => rs.map((r) => (r.id === b.id ? { ...r, passIssued: true } : r)))
    setQueued((q) => q + 1)
    push({ title: `pass issued — ${leg.flight} ${leg.from}→${leg.to}`, body: `${b.pax} · queued for device sync`, tone: "ok" })
    onPassIssued?.(b)
  }

  const retryNow = () => {
    setFlushing(true)
    window.setTimeout(() => {
      setFlushing(false)
      setQueued(0)
      setOnline(true)
      push({ title: "sync complete — traveller device up to date", tone: "ok" })
    }, 1400)
  }

  const issuedCount = rows.filter((r) => r.passIssued).length

  return (
    <div className={cn("flex min-h-dvh flex-col bg-background font-sans text-foreground", className)}>
      <MotionConfig reducedMotion="user">
      {/* header — mono masthead: the PNR is the identity */}
      <header className="flex flex-wrap items-end gap-x-5 gap-y-2 px-5 py-3">
        <div>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Itinerary ops</span>
          <p className="font-mono text-[26px] font-bold leading-none tracking-tight">{pnr}</p>
          
    </div>
        <p className="pb-0.5 text-[13px] font-semibold">
          {traveller} <span className="font-normal text-muted-foreground">· ARN→JFK via OSL/AMS</span>
        </p>
        <span className="mb-0.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold tabular-nums" aria-label={`${issuedCount} of ${rows.length} passes issued`}>
          <TicketCheck className="size-3.5 text-[hsl(var(--ok))]" /> {issuedCount}/{rows.length} passes
        </span>
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setOnline(false); setQueued((q) => q + 3); push({ title: "traveller device dropped offline", tone: "warn" }) }}
          >
            <RadioTower className="size-3.5" /> Simulate drop
          </Button>
          <Button size="sm" onClick={() => push({ title: `pinged ${traveller} — push + SMS`, tone: "info" })}>
            Ping traveller
          </Button>
        </div>
      </header>

      {/* offline sync — full-width band */}
      <div className="border-y bg-background px-5 py-2">
        <OfflineQueueBanner online={online} queued={queued} flushing={flushing} onRetryNow={retryNow} />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-12">
        {/* THE SPINE — leg rail with bookings + pass stubs dealt in per leg */}
        <section className="min-w-0 border-b px-5 py-4 lg:col-span-7 lg:border-b-0 lg:border-r" aria-label="Itinerary spine">
          <ol>
            {legs.map((l, i) => {
              const legBookings = rows.filter((r) => r.legId === l.id)
              return (
                <li key={l.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < legs.length - 1 && <span aria-hidden className="absolute left-[7px] top-6 h-full w-px bg-border" />}
                  <span
                    className={cn(
                      "relative z-10 mt-1.5 grid size-[15px] shrink-0 place-items-center rounded-full border-2 bg-background",
                      l.state === "landed" && "border-[hsl(var(--muted-foreground))]",
                      l.state === "boarding" && "border-[hsl(var(--ok))] motion-safe:motion-safe:motion-safe:animate-pulse",
                      l.state === "scheduled" && "border-border",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-mono text-[14px] font-bold">
                        {l.from} → {l.to}
                        <span className="ml-2 text-[11px] font-normal text-muted-foreground">{l.flight} · {l.dep}–{l.arr}</span>
                      </p>
                      <span className={cn("text-[10px] font-bold uppercase tracking-wide", l.state === "boarding" && "text-[hsl(var(--ok))]")}>{l.state}</span>
                    </div>

                    {/* bookings riding this leg */}
                    <ul className="mt-2 grid gap-1.5">
                      {legBookings.map((b) => (
                        <li key={b.id} className="min-w-0">
                          <div className={cn("flex flex-wrap items-center gap-2 rounded-md border bg-muted/30 px-2.5 py-1.5", b.status === "waitlist" && "border-dashed")}>
                            <span className="text-[12px] font-semibold">{b.pax}</span>
                            <Badge variant="secondary" className="text-[10px] uppercase">{b.fare}</Badge>
                            <span className={cn("text-[11px] font-bold uppercase tracking-wide", b.status === "confirmed" ? "text-[hsl(var(--ok))]" : "text-[hsl(var(--warn))]")}>
                              {b.status}
                            </span>
                            {b.passIssued ? (
                              <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-[hsl(var(--ok))]">
                                <TicketCheck className="size-3.5" /> issued
                              </span>
                            ) : (
                              <Button
                                variant="outline"
                                size="xs"
                                className="ml-auto"
                                disabled={b.status !== "confirmed"}
                                onClick={() => issue(b)}
                                aria-label={`Issue boarding pass for ${b.pax} on ${l.from}→${l.to}`}
                              >
                                Issue pass
                              </Button>
                            )}
                          </div>

                          {/* pass stub — dealt in as the booking lands */}
                          <AnimatePresence initial={false}>
                            {b.passIssued && (
                              <motion.article
                                key="stub"
                                initial={{ opacity: 0, y: 14, rotate: -1.5 }}
                                animate={{ opacity: 1, y: 0, rotate: 0 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                                className="relative mt-1.5 overflow-hidden rounded-lg border bg-card"
                              >
                                <div className="flex items-baseline gap-2 px-3 pb-1.5 pt-2.5">
                                  <span className="text-[19px] font-black tracking-tight">{l.from}</span>
                                  <Plane className="size-3.5 text-muted-foreground" />
                                  <span className="text-[19px] font-black tracking-tight">{l.to}</span>
                                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] ml-auto text-[9px] text-muted-foreground">{b.fare} · {pnr}</span>
                                </div>
                                <p className="px-3 text-[11px] text-muted-foreground">
                                  {b.pax} · dep {l.dep} · gate <span className="font-mono font-bold text-foreground">{l.state === "boarding" ? "D14" : "—"}</span>
                                </p>
                                <div className="relative my-2 border-t border-dashed">
                                  <span aria-hidden className="absolute -left-[5px] -top-[5px] size-2.5 rounded-full border bg-background" />
                                  <span aria-hidden className="absolute -right-[5px] -top-[5px] size-2.5 rounded-full border bg-background" />
                                </div>
                                <div className="flex items-end justify-between px-3 pb-2.5">
                                  <div className="flex gap-4 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                                    <span>seat<br /><b className="text-[13px] text-foreground">{SEATS[b.id] ?? "—"}</b></span>
                                    <span>board<br /><b className="text-[13px] text-foreground">grp 2</b></span>
                                  </div>
                                  <div className="flex h-6 items-end gap-[2px]" aria-hidden>
                                    {Array.from({ length: 20 }, (_, k) => (
                                      <span key={k} className="w-[2px] bg-foreground/70" style={{ height: `${((k * 5) % 11) + 5}px` }} />
                                    ))}
                                  </div>
                                </div>
                              </motion.article>
                            )}
                          </AnimatePresence>
                        </li>
                      ))}
                      {legBookings.length === 0 && (
                        <li className="rounded-md border border-dashed px-2.5 py-1.5 text-[11px] text-muted-foreground">No bookings on this leg.</li>
                      )}
                    </ul>
                  </div>
                </li>
              )
            })}
          </ol>
          <p className="mt-1 border-t pt-2 text-[11px] text-muted-foreground">Waitlisted companions get a pass automatically when the seat clears.</p>
        </section>

        {/* right column — docked windows, bare event rail, ping centre */}
        <aside className="flex flex-col gap-5 p-5 lg:col-span-5">
          <section aria-label="Booking windows" className="rounded-lg border border-dashed bg-background p-3">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px] text-muted-foreground">Booking windows</span>
              <span className="font-mono text-[10px] uppercase text-muted-foreground">docked</span>
            </div>
            <ul className="grid gap-1.5">
              {WINDOWS.map((w) => (
                <li key={w.id} className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-2.5 py-1.5">
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-bold">{w.label}</p>
                    <p className="text-[11px] text-muted-foreground">{w.detail}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      w.state === "open" && "border-[hsl(var(--ok)/0.4)] text-[hsl(var(--ok))]",
                      w.state === "opens" && "border-[hsl(var(--info)/0.4)] text-[hsl(var(--info))]",
                      w.state === "closed" && "text-muted-foreground",
                    )}
                  >
                    {w.state}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-label="Trip events" className="min-h-0">
            <div className="flex items-baseline justify-between border-b pb-1.5">
              <h3 className="font-display text-[13px] font-bold">Trip events · today</h3>
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground">{events.length} entries</span>
            </div>
            <div className="pt-2">
              <EventTimelineDay events={events} groupBy={(e) => (e.kind === "alert" ? "disruptions" : "operations")} />
            </div>
          </section>

          <section aria-label="Ping centre">
            <h3 className="border-b pb-1.5 font-display text-[13px] font-bold">Ping centre</h3>
            <div className="grid grid-cols-2 gap-1.5 pt-2">
              {[
                { label: "Gate change", tone: "warn" as const },
                { label: "Delay +25 min", tone: "warn" as const },
                { label: "Docs ready", tone: "ok" as const },
                { label: "Car booked", tone: "ok" as const },
              ].map((p) => (
                <Button key={p.label} variant="outline" size="xs" onClick={() => push({ title: `ping sent — ${p.label.toLowerCase()}`, tone: p.tone })} aria-label={`Send ${p.label.toLowerCase()} ping to ${traveller}`}>
                  {p.label}
                </Button>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} pos="br" />
          </MotionConfig>
    </div>
  )
}
