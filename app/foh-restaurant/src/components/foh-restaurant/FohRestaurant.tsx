import { useState } from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { Bell, ConciergeBell, PhoneCall, Wifi } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TabsOverflowStrip, type AppTab } from "tabs-overflow-strip"
import { DragNumberField } from "drag-number-field"
import { OfflineQueueBanner } from "offline-queue-banner"
import { ToastStack, type Toast } from "toast-stack"

// COMPOSITE SCREEN · FRONT OF HOUSE
// composed of: tabs-overflow-strip (call switchboard), drag-number-field
// (covers scrub), offline-queue-banner (POS wifi-drop resilience)
// + purpose-built sticky table rail and ping inbox.

export type CallLine = { id: string; caller: string; about: string; waited: string }

export type TableTicket = { id: string; table: string; party: number; server: string; state: "seated" | "dessert" | "bill" | "free"; mins: number }

export type Ping = { id: string; table: string; text: string; at: string }

export type FohRestaurantProps = {
  room?: string
  cap?: number
  tickets?: TableTicket[]
  pings?: Ping[]
  className?: string
}

const LINES: Record<string, CallLine[]> = {
  line1: [
    { id: "k1", caller: "Anna B.", about: "booking for 6, friday 19:00", waited: "0:12" },
    { id: "k2", caller: "Malmö Sushi", about: "delivery order mix-up", waited: "1:40" },
  ],
  line2: [{ id: "k3", caller: "unknown", about: "asked for kitchen — stock order", waited: "0:03" }],
  bookings: [{ id: "k4", caller: "Peter W.", about: "move 20:00 to 20:30, party of 2", waited: "0:31" }],
  delivery: [],
}

const TABS: AppTab[] = [
  { id: "line1", label: "Line 1", dirty: true, pinned: true },
  { id: "line2", label: "Line 2" },
  { id: "bookings", label: "Bookings", dirty: true },
  { id: "delivery", label: "Delivery" },
]

const DEFAULT_TICKETS: TableTicket[] = [
  { id: "t1", table: "T1", party: 2, server: "Nour", state: "dessert", mins: 64 },
  { id: "t2", table: "T2", party: 4, server: "Nour", state: "seated", mins: 21 },
  { id: "t3", table: "T3", party: 2, server: "Kim", state: "bill", mins: 78 },
  { id: "t4", table: "T4", party: 6, server: "Kim", state: "seated", mins: 12 },
  { id: "t5", table: "T5", party: 3, server: "Alex", state: "seated", mins: 47 },
  { id: "t6", table: "T6", party: 0, server: "—", state: "free", mins: 0 },
  { id: "t7", table: "T7", party: 2, server: "Alex", state: "dessert", mins: 55 },
  { id: "t8", table: "T8", party: 5, server: "Nour", state: "bill", mins: 91 },
  { id: "t9", table: "T9", party: 0, server: "—", state: "free", mins: 0 },
  { id: "t10", table: "T10", party: 4, server: "Kim", state: "seated", mins: 33 },
  { id: "t11", table: "T11", party: 2, server: "Alex", state: "seated", mins: 8 },
  { id: "t12", table: "T12", party: 7, server: "Nour", state: "seated", mins: 39 },
]

const DEFAULT_PINGS: Ping[] = [
  { id: "g1", table: "T4", text: "more bread + oat milk for the kids", at: "19:02" },
  { id: "g2", table: "T8", text: "bill split three ways", at: "19:04" },
  { id: "g3", table: "T7", text: "ask about allergens — nuts in dessert?", at: "19:07" },
]

const RAIL_STYLES: Record<TableTicket["state"], string> = {
  seated: "bg-[hsl(var(--info)/0.15)] text-[hsl(var(--info))] border-[hsl(var(--info)/0.35)]",
  dessert: "bg-[hsl(var(--warn)/0.12)] text-[hsl(var(--warn))] border-[hsl(var(--warn)/0.4)]",
  bill: "bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))] border-[hsl(var(--ok)/0.4)]",
  free: "bg-muted text-muted-foreground border-border",
}

export function FohRestaurant({ room = "Salong A · Thursday service", cap: initialCap = 46, tickets = DEFAULT_TICKETS, pings = DEFAULT_PINGS, className }: FohRestaurantProps) {
  const [line, setLine] = useState("line1")
  const [cap, setCap] = useState(initialCap)
  const [board, setBoard] = useState(tickets)
  const [sel, setSel] = useState<string>("T4")
  const [inbox, setInbox] = useState(pings)
  const [online, setOnline] = useState(false)
  const [flushing, setFlushing] = useState(false)
  const [queued, setQueued] = useState(6)
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = (title: string, tone: Toast["tone"] = "ok") =>
    setToasts((t) => [...t.slice(-2), { id: String(Date.now() + Math.random()), title, tone }])

  const seated = board.filter((t) => t.state !== "free").reduce((a, t) => a + t.party, 0)
  const calls = LINES[line] ?? []
  const activePings = inbox.filter((p) => p.table === sel)

  const retryPos = () => {
    setFlushing(true)
    window.setTimeout(() => {
      setFlushing(false)
      setOnline(true)
      setQueued(0)
      push(`${queued} queued POS orders flushed — kitchen confirmed`)
    }, 1400)
  }

  const advance = (t: TableTicket) => {
    const next: Record<TableTicket["state"], TableTicket["state"]> = { seated: "dessert", dessert: "bill", bill: "free", free: "seated" }
    setBoard((ts) => ts.map((x) => (x.id === t.id ? { ...x, state: next[x.state], mins: next[x.state] === "seated" ? 0 : x.mins } : x)))
    push(`${t.table} → ${next[t.state]}`)
  }

  return (
    <div className={cn("flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <MotionConfig reducedMotion="user">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Floor manager</h2>
        <span className="text-[12px] text-muted-foreground">{room}</span>
        <span className="text-[12px] text-muted-foreground">· {seated}/{cap} covers</span>
        <span className={cn("flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-semibold", online ? "border-border text-muted-foreground" : "border-[hsl(var(--err)/0.4)] bg-[hsl(var(--err)/0.08)] text-[hsl(var(--err))]")}>
          <Wifi className="size-3.5" /> {online ? "wi-fi ok" : "wi-fi drop"}
        </span>
        <Button type="button" variant="ghost" onClick={() => push("shift note pinned to the pass — 86ers all night")} className="ml-auto flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted">
          <ConciergeBell className="size-3.5" /> Shift note
        </Button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[250px_minmax(0,1fr)_250px]">
        {/* switchboard */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center gap-1.5 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <PhoneCall className="size-3.5" /> Switchboard
            </header>
            <TabsOverflowStrip tabs={TABS} value={line} onChange={setLine} className="border-b" />
            <ul className="divide-y">
              {calls.length === 0 && <li className="px-3 py-3 text-[11px] text-muted-foreground">No calls holding on this line.</li>}
              {calls.map((c) => (
                <li key={c.id} className="px-3 py-2">
                  <div className="flex items-baseline justify-between">
                    <p className="text-[12px] font-semibold">{c.caller}</p>
                    <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{c.waited}</span>
          </MotionConfig>
    </div>
                  <p className="text-[11px] text-muted-foreground">{c.about}</p>
                  <div className="mt-1.5 flex gap-1.5">
                    {["→ host", "→ kitchen", "take booking"].map((r) => (
                      <Button type="button" variant="ghost" key={r} onClick={() => push(`${c.caller} routed — ${r.replace("→ ", "")}`)} className="rounded border bg-muted/40 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
                        {r}
                      </Button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-lg border bg-card p-3">
            <OfflineQueueBanner online={online} queued={queued} flushing={flushing} onRetryNow={retryPos} />
            <p className="mt-2 text-[11px] text-muted-foreground">POS keeps taking orders offline — card auth catches up when the access point returns.</p>
          </section>
        </aside>

        {/* sticky table rail */}
        <section className="min-w-0 overflow-hidden rounded-lg border bg-card">
          <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Floor · {board.filter((t) => t.state !== "free").length} occupied</span>
            <span className="text-[11px] font-bold text-[hsl(var(--info))]">tap a chip to select · tap a row to advance</span>
          </header>
          <div className="max-h-[380px] overflow-y-auto">
            <div className="sticky top-0 z-10 flex flex-wrap gap-1.5 border-b bg-card/95 px-3 py-2 backdrop-blur">
              {board.map((t) => (
                <Button type="button" variant="ghost"
                  key={t.id}
                  onClick={() => setSel(t.table)}
                  className={cn("rounded border px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums transition-colors", RAIL_STYLES[t.state], sel === t.table && "ring-2 ring-[hsl(var(--app-focus))] ring-offset-1")}
                >
                  {t.table}
                </Button>
              ))}
            </div>
            <table className="w-full border-collapse text-[12px]">
              <thead className="sticky top-[46px] z-10 bg-card">
                <tr className="border-b text-left text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  <th className="px-3 py-1.5 font-semibold">Table</th>
                  <th className="px-2 py-1.5 text-right font-semibold">Pax</th>
                  <th className="px-2 py-1.5 font-semibold">Server</th>
                  <th className="px-2 py-1.5 font-semibold">State</th>
                  <th className="px-3 py-1.5 text-right font-semibold">Mins</th>
                </tr>
              </thead>
              <tbody>
                {board.map((t) => (
                  <tr key={t.id} onClick={() => advance(t)} className={cn("cursor-pointer border-b border-app-line/60 last:border-0 hover:bg-muted/50", sel === t.table && "bg-accent/40")}>
                    <td className="px-3 py-1 font-mono font-bold tabular-nums">{t.table}</td>
                    <td className="px-2 py-1 text-right font-mono tabular-nums">{t.party || "—"}</td>
                    <td className="px-2 py-1">{t.server}</td>
                    <td className="px-2 py-1"><span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold", RAIL_STYLES[t.state])}>{t.state}</span></td>
                    <td className="px-3 py-1 text-right font-mono tabular-nums text-muted-foreground">{t.mins || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* covers + pings */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Covers</header>
            <div className="space-y-3 p-3">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px] text-muted-foreground">Seated now</span>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={seated} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} className="font-mono text-[26px] font-black tabular-nums">
                    {seated}
                  </motion.span>
                </AnimatePresence>
              </div>
              <DragNumberField label="Tonight cap" value={cap} onValueChange={(v: number) => setCap(Math.max(0, Math.round(v)))} step={1} precision={0} min={0} max={80} unit="pax" />
              <div className="flex justify-between text-[12px]">
                <span className="text-muted-foreground">Waitlist</span>
                <span className="font-mono tabular-nums">4 parties · 25′</span>
              </div>
            </div>
          </section>
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center gap-1.5 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <Bell className="size-3.5" /> Pings · table {sel}
            </header>
            <ul className="divide-y">
              <AnimatePresence initial={false}>
                {activePings.length === 0 && <li className="px-3 py-3 text-[11px] text-muted-foreground">Nothing asked for from this table.</li>}
                {activePings.map((p, i) => (
                  <motion.li key={p.id} layout initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex items-center gap-2 px-3 py-1.5">
                    <span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px]">{p.text}</p>
                      <p className="font-mono text-[10px] tabular-nums text-muted-foreground">{p.at}</p>
                    </div>
                    <Button type="button" variant="ghost" onClick={() => { setInbox((ps) => ps.filter((x) => x.id !== p.id)); push(`ping cleared — ${p.table}`) }} className="text-[10px] font-bold uppercase text-muted-foreground hover:text-[hsl(var(--ok))]">
                      done
                    </Button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </section>
        </aside>
      </div>
      <ToastStack toasts={toasts} onDismiss={(id: string) => setToasts((t) => t.filter((x) => x.id !== id))} pos="br" />
    </div>
  )
}
