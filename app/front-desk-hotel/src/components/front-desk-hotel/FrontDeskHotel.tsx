import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { BedDouble, CalendarClock, CreditCard, KeySquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel } from "@/components/primitives/handcraft"
import { DateRangePresets, type Range } from "date-range-presets"
import { TabsOverflowStrip, type AppTab } from "tabs-overflow-strip"
import { OfflineQueueBanner } from "offline-queue-banner"
import { ToastStack, type Toast } from "toast-stack"
import { Checkbox } from "@/components/watermelon/checkbox"

// COMPOSITE SCREEN · NIGHT PORTER
// composed of: date-range-presets (stay window), tabs-overflow-strip (channel
// switchboard), offline-queue-banner (PMS sync strip), watermelon checkbox
// (room rail) + purpose-built keycard pass printer.

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

const CHANNEL_TABS: AppTab[] = [
  { id: "direct", label: "Direct", pinned: true },
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

const ROOM_STYLES: Record<Room["status"], string> = {
  occupied: "border-[hsl(var(--info)/0.4)] text-[hsl(var(--info))]",
  clean: "border-[hsl(var(--ok)/0.4)] text-[hsl(var(--ok))]",
  dirty: "border-[hsl(var(--warn)/0.5)] text-[hsl(var(--warn))]",
  ooo: "border-border text-muted-foreground",
}

const FLOORS = [5, 4, 3, 2]

export function FrontDeskHotel({ hotel = "Hotel Strand · night porter", stay: initialStay = DEFAULT_STAY, rooms = DEFAULT_ROOMS, cards: initialCards = [], className }: FrontDeskHotelProps) {
  const [stay, setStay] = useState<Range | null>(initialStay)
  const [rail, setRail] = useState(rooms)
  const [sel, setSel] = useState<string[]>([])
  const [cards, setCards] = useState<Keycard[]>(initialCards)
  const [channel, setChannel] = useState("direct")
  const [online, setOnline] = useState(false)
  const [flushing, setFlushing] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = (title: string, tone: Toast["tone"] = "ok") =>
    setToasts((t) => [...t.slice(-2), { id: String(Date.now() + Math.random()), title, tone }])

  const nights = stay ? Math.max(1, Math.round((stay.to.getTime() - stay.from.getTime()) / 86_400_000)) : 0
  const occupied = rail.filter((r) => r.status === "occupied").length
  const cleanRooms = rail.filter((r) => r.status === "clean")

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
    <div className={cn("flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Front desk</h2>
        <span className="text-[12px] text-muted-foreground">{hotel}</span>
        <span className="text-[12px] text-muted-foreground">· {occupied}/{rail.length} rooms let</span>
        <button onClick={() => push("night audit queued — rates roll at 03:00")} className="ml-auto flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted">
          <CreditCard className="size-3.5" /> Night audit
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
        {!online && (
          <OfflineQueueBanner online={online} queued={3} flushing={flushing} onRetryNow={flushPms} />
        )}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[250px_minmax(0,1fr)_260px]">
          {/* stay window */}
          <aside className="flex flex-col gap-4">
            <section className="overflow-hidden rounded-lg border bg-card">
              <header className="flex h-9 items-center gap-1.5 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                <CalendarClock className="size-3.5" /> Stay window
              </header>
              <div className="p-3">
                <DateRangePresets value={stay} onChange={setStay} presets={[{ label: "1 night", days: 1 }, { label: "Weekend", days: 2 }, { label: "Week", days: 7 }]} />
                <dl className="mt-3 space-y-1 text-[12px]">
                  <div className="flex justify-between"><dt className="text-muted-foreground">Nights</dt><dd className="font-mono font-bold tabular-nums">{nights}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Arrivals</dt><dd className="font-mono tabular-nums">4</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Departures</dt><dd className="font-mono tabular-nums">2</dd></div>
                </dl>
              </div>
            </section>
            <section className="rounded-lg border bg-card p-3">
              <MonoLabel className="text-muted-foreground">Porter round</MonoLabel>
              <ul className="mt-2 space-y-1.5 text-[11px] leading-[1.5] text-muted-foreground">
                <li>· 23:30 back door lock + safe deposit sweep</li>
                <li>· 00:00 breakfast list to kitchen — 18 covers</li>
                <li>· 03:00 rates roll — wait for the audit stamp</li>
              </ul>
            </section>
          </aside>

          {/* room rail */}
          <section className="min-w-0 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground"><BedDouble className="size-3.5" /> Room rail · {cleanRooms.length} ready</span>
              <button onClick={cutKeys} disabled={sel.length === 0} className="flex items-center gap-1 text-[11px] font-bold text-[hsl(var(--info))] disabled:opacity-40">
                <KeySquare className="size-3.5" /> cut keycards ({sel.length})
              </button>
            </header>
            <ul className="divide-y">
              {FLOORS.map((f) => {
                const floorRooms = rail.filter((r) => r.floor === f)
                return (
                  <li key={f} className="flex items-start gap-3 px-3 py-2">
                    <span className="w-14 shrink-0 pt-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Floor {f}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {floorRooms.map((r) => (
                        <span key={r.id} className={cn("flex items-center gap-1.5 rounded border px-1.5 py-0.5", ROOM_STYLES[r.status])}>
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
            </ul>
            <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">Tick clean rooms, then cut — keycards print as passes with the stay window</div>
          </section>

          {/* channels + passes */}
          <aside className="flex flex-col gap-4">
            <section className="overflow-hidden rounded-lg border bg-card">
              <header className="h-9 border-b bg-muted/30 px-3 pt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Channel switchboard</header>
              <TabsOverflowStrip tabs={CHANNEL_TABS} value={channel} onChange={setChannel} className="border-b" />
              <ul className="divide-y">
                {ARRIVALS.filter((a) => a.channel === channel).map((a) => (
                  <li key={a.id} className="flex items-center justify-between px-3 py-1.5">
                    <div>
                      <p className="text-[12px] font-semibold">{a.name}</p>
                      <p className="text-[10px] text-muted-foreground">rm {a.room} · {a.nights}n</p>
                    </div>
                    <span className="rounded border bg-muted/40 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">arrive {channel}</span>
                  </li>
                ))}
                {ARRIVALS.filter((a) => a.channel === channel).length === 0 && (
                  <li className="px-3 py-3 text-[11px] text-muted-foreground">No arrivals on {channel} tonight.</li>
                )}
              </ul>
            </section>
            <section className="overflow-hidden rounded-lg border bg-card">
              <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Keycards <span className="font-mono normal-case tracking-normal">{cards.length} cut</span>
              </header>
              <ul className="max-h-[160px] divide-y overflow-auto">
                <AnimatePresence initial={false}>
                  {cards.map((c) => (
                    <motion.li key={c.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-between px-3 py-1.5">
                      <span className="flex items-center gap-1.5 text-[12px]">
                        <KeySquare className="size-3.5 text-[hsl(var(--info))]" /> <span className="font-mono font-bold tabular-nums">{c.room}</span> · {c.nights}n
                      </span>
                      <span className="font-mono text-[10px] tabular-nums text-muted-foreground">cut {c.cut}</span>
                    </motion.li>
                  ))}
                </AnimatePresence>
                {cards.length === 0 && <li className="px-3 py-3 text-[11px] text-muted-foreground">No passes cut yet tonight.</li>}
              </ul>
            </section>
          </aside>
        </div>
      </div>
      <ToastStack toasts={toasts} onDismiss={(id: string) => setToasts((t) => t.filter((x) => x.id !== id))} pos="br" />
    </div>
  )
}
