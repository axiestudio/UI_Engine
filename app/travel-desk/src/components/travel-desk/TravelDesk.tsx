import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { Plane, PlaneTakeoff, RadioTower, TicketCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, CornerTicks } from "@/components/primitives/handcraft"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/watermelon/table"
import { Badge } from "@/components/ui/badge"
import { OfflineQueueBanner } from "offline-queue-banner"
import { EventTimelineDay, type TimelineEvent } from "event-timeline-day"
import { ToastStack, type Toast } from "toast-stack"

// COMPOSITE SCREEN · TRAVEL ITINERARY OPS
// composed of: offline-queue-banner (traveller sync resilience),
// event-timeline-day (trip events), toast-stack (ping centre) + purpose-built
// leg rail, booking windows and boarding passes issued as bookings land.

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
  { id: "ev1", at: "07:25", actor: "system", kind: "create", text: "ARN→OSL flown · booking closed" },
  { id: "ev2", at: "09:40", actor: "M. Ahlberg", kind: "comment", text: "Traveller note: need aisle seat on the long leg" },
  { id: "ev3", at: "10:05", actor: "ops", kind: "edit", text: "Seat 14A assigned on OSL→AMS" },
  { id: "ev4", at: "10:52", actor: "system", kind: "alert", text: "Gate change KL 1003: D8 → D14" },
  { id: "ev5", at: "11:30", actor: "ops", kind: "deploy", text: "E-ticket re-issued after fare upgrade to flex" },
]

const WINDOWS: { id: string; label: string; detail: string; state: "open" | "opens" | "closed" }[] = [
  { id: "wn1", label: "Check-in · OSL→AMS", detail: "opened T-36 h", state: "open" },
  { id: "wn2", label: "Seat map · AMS→JFK", detail: "closes T-1 h before dep", state: "opens" },
  { id: "wn3", label: "Bag drop · OSL", detail: "closes T-40 min", state: "opens" },
  { id: "wn4", label: "Upgrade bids · OSL→AMS", detail: "closed at T-24 h", state: "closed" },
]

const LEG_MAP = (legs: Leg[]) => Object.fromEntries(legs.map((l) => [l.id, l]))

export function TravelDesk({
  pnr = "QK7TRD",
  traveller = "M. Ahlberg",
  legs = DEFAULT_LEGS,
  bookings = DEFAULT_BOOKINGS,
  events = DEFAULT_EVENTS,
  onPassIssued,
  className,
}: TravelDeskProps) {
  const legOf = React.useMemo(() => LEG_MAP(legs), [legs])
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

  return (
    <div className={cn("flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Itinerary ops</h2>
        <span className="font-mono text-[12px] text-muted-foreground">PNR {pnr}</span>
        <span className="text-[12px] text-muted-foreground">· {traveller} · ARN→JFK via OSL/AMS</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => { setOnline(false); setQueued((q) => q + 3); push({ title: "traveller device dropped offline", tone: "warn" }) }}
            className="flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted"
          >
            <RadioTower className="size-3.5" /> Simulate drop
          </button>
          <button
            onClick={() => push({ title: `pinged ${traveller} — push + SMS`, tone: "info" })}
            className="flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted"
          >
            Ping traveller
          </button>
        </div>
      </header>

      <div className="border-b bg-background px-4 py-2.5">
        <OfflineQueueBanner online={online} queued={queued} flushing={flushing} onRetryNow={retryNow} />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-auto p-4 lg:grid-cols-[270px_minmax(0,1fr)_300px]">
        {/* leg rail + windows */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center gap-2 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <PlaneTakeoff className="size-3.5" /> Leg rail
            </header>
            <ol className="p-3">
              {legs.map((l, i) => (
                <li key={l.id} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < legs.length - 1 && <span aria-hidden className="absolute left-[7px] top-5 h-full w-px bg-border" />}
                  <span
                    className={cn(
                      "relative z-10 mt-1 grid size-[15px] shrink-0 place-items-center rounded-full border-2 bg-background",
                      l.state === "landed" && "border-[hsl(var(--muted-foreground))]",
                      l.state === "boarding" && "border-[hsl(var(--ok))] animate-pulse",
                      l.state === "scheduled" && "border-border",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-mono text-[12px] font-bold">{l.from} → {l.to}</span>
                      <span className={cn("text-[10px] font-bold uppercase tracking-wide", l.state === "boarding" && "text-[hsl(var(--ok))]")}>{l.state}</span>
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                      {l.flight} · {l.dep}–{l.arr}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Booking windows
            </header>
            <ul className="grid gap-2 p-3">
              {WINDOWS.map((w) => (
                <li key={w.id} className="flex items-center justify-between gap-2 rounded-md border bg-background px-2.5 py-2">
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
        </aside>

        {/* bookings + timeline */}
        <div className="flex min-w-0 flex-col gap-4">
          <section className="min-w-0 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Bookings · {rows.length}</span>
              <MonoLabel tick={false} className="text-[10px] text-muted-foreground">passes queue to device when issued</MonoLabel>
            </header>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-8 px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Leg</TableHead>
                  <TableHead className="h-8 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Passenger</TableHead>
                  <TableHead className="h-8 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Fare</TableHead>
                  <TableHead className="h-8 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Status</TableHead>
                  <TableHead className="h-8 px-3 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Pass</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((b) => {
                  const leg = legOf[b.legId]
                  return (
                    <TableRow key={b.id}>
                      <TableCell className="px-3 py-1.5 font-mono text-[12px] font-bold">{leg.from}→{leg.to}</TableCell>
                      <TableCell className="px-2 py-1.5 text-[12px] font-medium">{b.pax}</TableCell>
                      <TableCell className="px-2 py-1.5"><Badge variant="secondary" className="text-[10px] uppercase">{b.fare}</Badge></TableCell>
                      <TableCell className="px-2 py-1.5">
                        <span className={cn("text-[11px] font-bold uppercase tracking-wide", b.status === "confirmed" ? "text-[hsl(var(--ok))]" : "text-[hsl(var(--warn))]")}>
                          {b.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 py-1.5 text-right">
                        {b.passIssued ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[hsl(var(--ok))]">
                            <TicketCheck className="size-3.5" /> issued
                          </span>
                        ) : (
                          <button
                            disabled={b.status !== "confirmed"}
                            onClick={() => issue(b)}
                            className="rounded-md border bg-background px-2 py-1 text-[11px] font-semibold hover:bg-muted disabled:opacity-40"
                          >
                            Issue pass
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">Waitlisted companions get a pass automatically when the seat clears</div>
          </section>

          <section className="flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Trip events · today
            </header>
            <div className="p-3">
              <EventTimelineDay events={events} groupBy={(e) => (e.kind === "alert" ? "disruptions" : "operations")} />
            </div>
          </section>
        </div>

        {/* boarding passes */}
        <aside className="flex flex-col gap-4">
          <section className="flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Boarding passes
              <span className="font-mono text-[10px] normal-case tracking-normal">{rows.filter((r) => r.passIssued).length} issued</span>
            </header>
            <div className="grid gap-3 p-3">
              <AnimatePresence initial={false}>
                {rows
                  .filter((r) => r.passIssued)
                  .map((b) => {
                    const leg = legOf[b.legId]
                    return (
                      <motion.article
                        key={b.id}
                        layout
                        initial={{ opacity: 0, y: 14, rotate: -1.5 }}
                        animate={{ opacity: 1, y: 0, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 320, damping: 26 }}
                        className="group relative overflow-hidden rounded-lg border bg-background"
                      >
                        <CornerTicks className="text-muted-foreground/40" />
                        <div className="flex items-center justify-between px-3 pb-2 pt-3">
                          <MonoLabel tick={false} className="text-[9px] text-muted-foreground">Boarding pass · {b.fare}</MonoLabel>
                          <span className="font-mono text-[10px] uppercase text-muted-foreground">{pnr}</span>
                        </div>
                        <div className="flex items-baseline gap-2 px-3">
                          <span className="text-[22px] font-black tracking-tight">{leg.from}</span>
                          <Plane className="size-4 text-muted-foreground" />
                          <span className="text-[22px] font-black tracking-tight">{leg.to}</span>
                          <span className="ml-auto font-mono text-[11px] text-muted-foreground">{leg.flight}</span>
                        </div>
                        <p className="px-3 text-[11px] text-muted-foreground">
                          {b.pax} · dep {leg.dep} · gate <span className="font-mono font-bold text-foreground">{leg.state === "boarding" ? "D14" : "—"}</span>
                        </p>
                        <div className="relative my-2.5 border-t border-dashed">
                          <span aria-hidden className="absolute -left-[5px] -top-[5px] size-2.5 rounded-full border bg-muted/20" />
                          <span aria-hidden className="absolute -right-[5px] -top-[5px] size-2.5 rounded-full border bg-muted/20" />
                        </div>
                        <div className="flex items-end justify-between px-3 pb-3">
                          <div className="flex gap-4 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                            <span>seat<br /><b className="text-[13px] text-foreground">{b.id === "bk3" ? "14A" : "09C"}</b></span>
                            <span>board<br /><b className="text-[13px] text-foreground">grp 2</b></span>
                          </div>
                          <div className="flex h-6 items-end gap-[2px]" aria-hidden>
                            {Array.from({ length: 20 }, (_, i) => (
                              <span key={i} className="w-[2px] bg-foreground/70" style={{ height: `${((i * 5) % 11) + 5}px` }} />
                            ))}
                          </div>
                        </div>
                      </motion.article>
                    )
                  })}
              </AnimatePresence>
              {!rows.some((r) => r.passIssued) && (
                <p className="p-3 text-center text-[11px] text-muted-foreground">No passes yet — issue one from the bookings table.</p>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center gap-2 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <RadioTower className="size-3.5" /> Ping centre
            </header>
            <div className="grid grid-cols-2 gap-2 p-3">
              {[
                { label: "Gate change", tone: "warn" as const },
                { label: "Delay +25 min", tone: "warn" as const },
                { label: "Docs ready", tone: "ok" as const },
                { label: "Car booked", tone: "ok" as const },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => push({ title: `ping sent — ${p.label.toLowerCase()}`, tone: p.tone })}
                  className="h-8 rounded-md border bg-background text-[11px] font-semibold hover:bg-muted"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} pos="br" />
    </div>
  )
}
