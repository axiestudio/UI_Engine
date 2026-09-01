import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { CalendarClock, KeySquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { DateRangePresets, type Range } from "date-range-presets"
import { OfflineQueueBanner } from "offline-queue-banner"
import { ToastStack, type Toast } from "toast-stack"
import { RadialGauge } from "radial-gauge"
import { Checkbox } from "@/components/watermelon/checkbox"

// COMPOSITE SCREEN · NIGHT PORTER — rail-spine build
// Structure: frameless full-bleed shell. The room rail is the spine: a
// full-height occupancy rail with floor groupings (display floor numerals,
// compact room cells), topped by a linear notch gauge reading the house.
// Passes deal in as fanned keycards; the channel switchboard is compact
// switch rows; the PMS offline strip runs as a full-width band under the
// header. Composed of: radial-gauge · date-range-presets · offline-queue-banner
// · toast-stack · watermelon checkbox · shadcn Button · handcraft kit.

export type Room = { id: string; no: string; floor: number; status: "occupied" | "clean" | "dirty" | "ooo"; guest?: string; nights?: number }

export type Keycard = { id: string; room: string; nights: number; cut: string }

export type FrontDeskHotelProps = {
  hotel?: string
  stay?: Range | null
  rooms?: Room[]
  cards?: Keycard[]
  className?: string
}

const DEFAULT_STAY: Range = { from: new Date(new Date().setHours(15, 0, 0, 0)), to: new Date(new Date().setHours(11, 0, 0, 0) + 86_400_000), label: "1 night" }

const DEFAULT_ROOMS: Room[] = [
  { id: "r201", no: "201", floor: 2, status: "occupied", guest: "M. Ahlberg", nights: 1 },
  { id: "r203", no: "203", floor: 2, status: "clean" },
  { id: "r205", no: "205", floor: 2, status: "dirty" },
  { id: "r301", no: "301", floor: 3, status: "clean" },
  { id: "r304", no: "304", floor: 3, status: "occupied", guest: "T. Wei", nights: 3 },
  { id: "r306", no: "306", floor: 3, status: "ooo" },
  { id: "r402", no: "402", floor: 4, status: "clean" },
  { id: "r405", no: "405", floor: 4, status: "clean" },
  { id: "r501", no: "501", floor: 5, status: "occupied", guest: "K. Blom", nights: 2 },
  { id: "r503", no: "503", floor: 5, status: "dirty" },
]

const CHANNELS: { id: string; label: string; dirty?: boolean }[] = [
  { id: "direct", label: "Direct" },
  { id: "booking", label: "Booking", dirty: true },
  { id: "airbnb", label: "Airbnb" },
  { id: "expedia", label: "Expedia", dirty: true },
]

const ARRIVALS: { id: string; name: string; channel: string; room: string; nights: number }[] = [
  { id: "a1", name: "R. Okafor", channel: "direct", room: "203", nights: 2 },
  { id: "a2", name: "D. Haile", channel: "booking", room: "402", nights: 1 },
  { id: "a3", name: "S. Brandt", channel: "expedia", room: "405", nights: 3 },
  { id: "a4", name: "J. Ruiz", channel: "direct", room: "301", nights: 1 },
]

const FLOORS = [5, 4, 3, 2]
const FLOOR_NOTES: Record<number, string> = { 5: "sea side", 4: "quiet wing", 3: "courtyard", 2: "street side" }

const DEPARTURES = 2

const ROOM_CELL: Record<Room["status"], string> = {
  occupied: "border-[hsl(var(--info)/0.45)] text-[hsl(var(--info))]",
  clean: "border-[hsl(var(--ok)/0.45)] text-[hsl(var(--ok))]",
  dirty: "border-[hsl(var(--warn)/0.5)] text-[hsl(var(--warn))]",
  ooo: "border-dashed text-muted-foreground",
}

export function FrontDeskHotel({ hotel = "Hotel Strand · night porter", stay: initialStay = DEFAULT_STAY, rooms = DEFAULT_ROOMS, cards: initialCards = [], className }: FrontDeskHotelProps) {
  const [stay, setStay] = React.useState<Range | null>(initialStay)
  const [rail, setRail] = React.useState(rooms)
  const [sel, setSel] = React.useState<string[]>([])
  const [cards, setCards] = React.useState<Keycard[]>(initialCards)
  const [channel, setChannel] = React.useState("direct")
  const [online, setOnline] = React.useState(false)
  const [flushing, setFlushing] = React.useState(false)
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const push = (title: string, tone: Toast["tone"] = "ok") =>
    setToasts((t) => [...t.slice(-2), { id: String(Date.now() + Math.random()), title, tone }])

  const nights = stay ? Math.max(1, Math.round((stay.to.getTime() - stay.from.getTime()) / 86_400_000)) : 0
  const occupied = rail.filter((r) => r.status === "occupied").length
  const occupancy = rail.length ? Math.round((occupied / rail.length) * 100) : 0
  const cleanRooms = rail.filter((r) => r.status === "clean")
  const channelArrivals = ARRIVALS.filter((a) => a.channel === channel)

  const toggle = (id: string, on: boolean) => setSel((s) => (on ? [...s, id] : s.filter((x) => x !== id)))

  const cutKeys = () => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    const fresh: Keycard[] = sel.map((id, i) => {
      const room = rail.find((r) => r.id === id)
      return { id: "kc" + Date.now() + i, room: room?.no ?? "—", nights, cut: now }
    })
    setCards((cs) => [...fresh, ...cs])
    setRail((rs) => rs.map((r) => (sel.includes(r.id) ? { ...r, status: "occupied", guest: r.guest ?? "walk-in", nights } : r)))
    push(`${fresh.length} keycard${fresh.length === 1 ? "" : "s"} cut — passes valid to 12:00 +${nights}d`)
    setSel([])
  }

  const flushPms = () => {
    setFlushing(true)
    window.setTimeout(() => {
      setFlushing(false)
      setOnline(true)
      push("PMS queue drained — 3 night-audit batches confirmed")
    }, 1400)
  }

  return (
    <div className={cn("flex flex-col overflow-hidden border-y bg-background font-sans text-foreground", className)}>
      {/* header — plain voice with count chips */}
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-5 py-3">
        <div className="min-w-0">
          <MonoLabel className="text-[10px] text-muted-foreground">Night porter</MonoLabel>
          <h2 className="mt-0.5 truncate text-[15px] font-semibold leading-tight">{hotel}</h2>
        </div>
        <dl className="ml-2 hidden items-baseline gap-1.5 sm:flex" aria-label="Tonight at the desk">
          <div className="rounded-full border bg-muted/40 px-2.5 py-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
            <dt className="sr-only">Arrivals tonight</dt>
            <dd><span className="font-bold text-foreground">{ARRIVALS.length}</span> in</dd>
          </div>
          <div className="rounded-full border bg-muted/40 px-2.5 py-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
            <dt className="sr-only">Departures tomorrow</dt>
            <dd><span className="font-bold text-foreground">{DEPARTURES}</span> out</dd>
          </div>
        </dl>
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => push("night audit queued — rates roll at 03:00")}>
          Night audit
        </Button>
      </header>

      {/* PMS offline strip — full-width band, no padding wrapper */}
      <OfflineQueueBanner online={online} queued={3} flushing={flushing} onRetryNow={flushPms} className="rounded-none" />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* the spine — full-height occupancy rail with floor groupings */}
        <aside aria-label="Room rail" className="flex w-full shrink-0 flex-col border-b lg:w-[300px] lg:border-b-0 lg:border-r">
          <div className="border-b px-4 pb-4 pt-3">
            <MonoLabel tick={false} className="text-[10px] text-muted-foreground">House · rooms let</MonoLabel>
            <div className="mt-2">
              <RadialGauge
                value={occupancy}
                min={0}
                max={100}
                unit="%"
                label="rooms let"
                precision={0}
                size={252}
                orientation="linear"
                notches={28}
                showCenterValue
                zones={[
                  { to: 70, color: "hsl(var(--warn))", label: "quiet night" },
                  { to: 92, color: "hsl(var(--ok))", label: "healthy" },
                  { to: 100, color: "hsl(var(--info))", label: "full house" },
                ]}
              />
            </div>
          </div>
          <ol className="min-h-0 flex-1 overflow-auto divide-y" aria-label="Floors">
            {FLOORS.map((f) => {
              const floorRooms = rail.filter((r) => r.floor === f)
              const floorLet = floorRooms.filter((r) => r.status === "occupied").length
              return (
                <li key={f} className="px-4 pb-3 pt-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-[19px] font-bold leading-none tracking-[-0.02em]">{f}</span>
                    <span className="text-[11px] text-muted-foreground">{FLOOR_NOTES[f]} · <span className="font-mono tabular-nums">{floorLet}/{floorRooms.length}</span> let</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {floorRooms.map((r) => (
                      <span
                        key={r.id}
                        className={cn(
                          "flex min-w-16 items-center gap-1.5 rounded-md border px-2 py-1",
                          sel.includes(r.id) && "border-ring bg-accent text-accent-foreground",
                          ROOM_CELL[r.status],
                        )}
                      >
                        {r.status === "clean" ? (
                          <Checkbox checked={sel.includes(r.id)} onCheckedChange={(v: boolean | "indeterminate") => toggle(r.id, v === true)} aria-label={`Select room ${r.no}`} className="size-3" />
                        ) : null}
                        <span className="font-mono text-[11px] font-bold tabular-nums">{r.no}</span>
                        <span className="text-[10px] font-semibold uppercase">{r.status === "ooo" ? "OOO" : r.status[0]}</span>
                      </span>
                    ))}
                  </div>
                </li>
              )
            })}
          </ol>
          <div className="border-t px-4 py-2.5">
            <Button size="sm" className="w-full" disabled={sel.length === 0} onClick={cutKeys}>
              <KeySquare aria-hidden /> Cut {sel.length > 0 ? `${sel.length} ` : ""}keycard{sel.length === 1 ? "" : "s"}
            </Button>
            <p className="mt-1.5 text-center text-[11px] leading-snug text-muted-foreground">Tick clean rooms — passes carry the stay window</p>
          </div>
        </aside>

        {/* desk side — stay window strip + switchboard / pass tray */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* stay window strip */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b px-5 py-3">
            <div className="flex items-baseline gap-2">
              <CalendarClock className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <MonoLabel tick={false} className="text-[10px] text-muted-foreground">Stay window</MonoLabel>
            </div>
            <DateRangePresets value={stay} onChange={setStay} presets={[{ label: "1 night", days: 1 }, { label: "Weekend", days: 2 }, { label: "Week", days: 7 }]} />
            <dl className="flex items-baseline gap-4 font-mono text-[11px] tabular-nums text-muted-foreground">
              <div><dt className="sr-only">Nights</dt><dd><span className="font-bold text-foreground">{nights}</span> nights</dd></div>
              <div><dt className="sr-only">Arrivals in window</dt><dd><span className="font-bold text-foreground">{ARRIVALS.length}</span> arrivals</dd></div>
              <div><dt className="sr-only">Departures in window</dt><dd><span className="font-bold text-foreground">{DEPARTURES}</span> departures</dd></div>
            </dl>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-12">
            {/* channel switchboard — compact switch rows */}
            <section aria-label="Channel switchboard" className="min-w-0 border-b lg:col-span-7 lg:border-b-0 lg:border-r">
              <div className="flex items-baseline justify-between border-b px-5 py-2">
                <MonoLabel tick={false} className="text-[10px] text-muted-foreground">Channel switchboard</MonoLabel>
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{channelArrivals.length} tonight on {channel}</span>
              </div>
              <ul className="divide-y" role="listbox" aria-label="Channels">
                {CHANNELS.map((c) => {
                  const count = ARRIVALS.filter((a) => a.channel === c.id).length
                  const on = channel === c.id
                  return (
                    <li key={c.id}>
                      <Button
                        variant="ghost"
                        className={cn("flex h-auto w-full items-center gap-3 rounded-none px-5 py-2 text-left font-normal", on && "bg-muted/40")}
                        role="option"
                        aria-selected={on}
                        onClick={() => setChannel(c.id)}
                      >
                        <span aria-hidden className={cn("flex h-4 w-7 items-center rounded-full border p-0.5 transition-colors", on ? "border-primary bg-primary/15" : "bg-muted")}>
                          <motion.span layout className={cn("block size-2.5 rounded-full", on ? "ml-auto bg-primary" : "bg-muted-foreground/60")} />
                        </span>
                        <span className={cn("text-[13px]", on ? "font-semibold" : "font-medium")}>{c.label}</span>
                        {c.dirty && <span className="rounded-full bg-[hsl(var(--warn)/0.15)] px-1.5 py-0.5 text-[10px] font-bold text-[hsl(var(--warn))]">sync</span>}
                        <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground">{count} arr</span>
                      </Button>
                    </li>
                  )
                })}
              </ul>
              <ul className="divide-y border-t" aria-label={`Arrivals on ${channel}`}>
                <AnimatePresence initial={false} mode="popLayout">
                  {channelArrivals.map((a) => (
                    <motion.li
                      key={a.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-between px-5 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold">{a.name}</p>
                        <p className="text-[11px] text-muted-foreground">rm {a.room} · {a.nights}n</p>
                      </div>
                      <span className="rounded border bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{a.channel}</span>
                    </motion.li>
                  ))}
                </AnimatePresence>
                {channelArrivals.length === 0 && (
                  <li className="px-5 py-3 text-[12px] text-muted-foreground">No arrivals on {channel} tonight.</li>
                )}
              </ul>
            </section>

            {/* pass tray — keycards deal in */}
            <section aria-label="Keycards" className="flex min-h-0 min-w-0 flex-col bg-muted/20 lg:col-span-5">
              <div className="flex items-baseline justify-between border-b px-5 py-2">
                <MonoLabel tick={false} className="text-[10px] text-muted-foreground">Passes</MonoLabel>
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{cards.length} cut</span>
              </div>
              <ul className="min-h-0 flex-1 space-y-2 overflow-auto px-4 py-3">
                <AnimatePresence initial={false}>
                  {cards.map((c, i) => (
                    <motion.li
                      key={c.id}
                      initial={{ y: -30, rotate: -5, opacity: 0 }}
                      animate={{ y: 0, rotate: i % 2 ? 1 : -1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 320, damping: 22 }}
                      className="relative overflow-hidden rounded-md border border-dashed bg-background px-4 py-2.5 shadow-sm"
                    >
                      <span aria-hidden className="absolute -left-1.5 top-1/2 size-3 -translate-y-1/2 rounded-full border bg-muted/30" />
                      <span aria-hidden className="absolute -right-1.5 top-1/2 size-3 -translate-y-1/2 rounded-full border bg-muted/30" />
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <KeySquare className="size-3.5 text-[hsl(var(--info))]" aria-hidden />
                          <span className="font-mono text-[15px] font-bold tabular-nums">rm {c.room}</span>
                        </span>
                        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">cut {c.cut}</span>
                      </div>
                      <div className="mt-1.5 flex items-end justify-between">
                        <span className="text-[11px] text-muted-foreground">{c.nights}n · valid to 12:00 +{c.nights}d</span>
                        <span aria-hidden className="flex h-4 items-end gap-[2px]">
                          {Array.from({ length: 12 }, (_, k) => (
                            <span key={k} className="w-[2px] bg-foreground/60" style={{ height: `${((k * 5) % 11) + 5}px` }} />
                          ))}
                        </span>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
                {cards.length === 0 && (
                  <li className="px-1 py-6 text-center text-[12px] leading-relaxed text-muted-foreground">
                    No passes cut yet tonight.<br />Tick clean rooms on the rail, then cut.
                  </li>
                )}
              </ul>
              <p className="border-t px-4 py-2 text-[11px] leading-snug text-muted-foreground">
                {cleanRooms.length} clean rooms ready · ticked rooms turn occupied when the pass prints
              </p>
            </section>
          </div>
        </div>
      </div>

      <ToastStack toasts={toasts} onDismiss={(id: string) => setToasts((t) => t.filter((x) => x.id !== id))} pos="br" />
    </div>
  )
}
