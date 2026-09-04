import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { Check, Pause, Play, StepForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/watermelon/checkbox"
import { SegmentedControl } from "segmented-control"
import { DragNumberField } from "drag-number-field"
import { BulkSelectBar, type BulkAction } from "bulk-select-bar"
import { UndoHistorySlider, type Version as BoardVersion } from "undo-history-slider"

// COMPOSITE SCREEN · SALON STUDIO BOARD — signature piece.
// A solari departures board as the live appointment display: every character
// cell is a split-flap driven by motion/react (flips on row change only).
// composed of: segmented-control (view segments), drag-number-field (KPI
// odometers), bulk-select-bar (multi-select edits), undo-history-slider
// (board-version scrubber) + purpose-built flap board.

export type ApptStatus = "booked" | "seated" | "done" | "cancelled"
export type Appointment = {
  id: string
  at: number // minutes from midnight
  client: string
  service: string
  seat: string
  status: ApptStatus
}
export type StudioBoardProps = {
  salon?: string
  day?: string
  appointments?: Appointment[]
  clock?: number
  onStatusChanged?: (ids: string[], status: ApptStatus) => void
  className?: string
}

const DEFAULT_APPOINTMENTS: Appointment[] = [
  { id: "a1", at: 9 * 60, client: "Maja Lindqvist", service: "Cut & colour", seat: "S1", status: "done" },
  { id: "a2", at: 9 * 60 + 45, client: "Oskar Berg", service: "Beard trim", seat: "S2", status: "done" },
  { id: "a3", at: 10 * 60 + 30, client: "Freja Holm", service: "Balayage", seat: "S1", status: "seated" },
  { id: "a4", at: 11 * 60 + 15, client: "Nils Ahlberg", service: "Cut & style", seat: "S3", status: "booked" },
  { id: "a5", at: 13 * 60, client: "Ester Kall", service: "Keratin treatment", seat: "S2", status: "booked" },
  { id: "a6", at: 14 * 60 + 30, client: "Hugo Sand", service: "Fade", seat: "S3", status: "booked" },
  { id: "a7", at: 16 * 60, client: "Linnea Voss", service: "Colour refresh", seat: "S1", status: "booked" },
  { id: "a8", at: 17 * 60 + 15, client: "Per Olausson", service: "Cut & style", seat: "S2", status: "cancelled" },
]

const STATUS_WORD: Record<ApptStatus, string> = {
  booked: "BOOKED",
  seated: "SEATED",
  done: "DONE",
  cancelled: "CANCELLED",
}
const STATUS_TONE: Record<ApptStatus, string> = {
  booked: "text-background/55",
  seated: "text-[hsl(var(--warn))]",
  done: "text-[hsl(var(--ok))]",
  cancelled: "text-[hsl(var(--err))]",
}

const VIEW_OPTS = [
  { value: "all", label: "All day" },
  { value: "am", label: "Morning" },
  { value: "pm", label: "Afternoon" },
  { value: "eve", label: "Evening" },
]

const fmt = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(Math.floor(m % 60)).padStart(2, "0")}`

/** One split-flap character cell. Flips only when its character changes. */
function Flap({ text, width, className }: { text: string; width: number; className?: string }) {
  const chars = text.toUpperCase().slice(0, width).padEnd(width, " ").split("")
  return (
    <span className={cn("inline-flex select-none", className)} aria-hidden>
      {chars.map((ch, i) => (
        <span key={i} className="relative inline-flex h-[22px] w-[13px] items-center justify-center overflow-hidden rounded-[3px] bg-background/10">
          <AnimatePresence initial={false}>
            <motion.span
              key={ch}
              initial={{ rotateX: -90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{ rotateX: 90, opacity: 0 }}
              transition={{ duration: 0.24, ease: [0.2, 0.9, 0.3, 1] }}
              style={{ transformPerspective: 320 }}
              className="absolute inset-0 flex items-center justify-center bg-background/10 font-mono text-[13px] font-bold leading-none [backface-visibility:hidden]"
            >
              {ch === " " ? "\u00A0" : ch}
            </motion.span>
          </AnimatePresence>
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-background/20" />
              
    </span>
      ))}
    </span>
  )
}

type Snap = { v: BoardVersion; rows: Appointment[] }

export function StudioBoard({
  salon = "Salong Ester",
  day = "Thu 03 Sep 2026",
  appointments = DEFAULT_APPOINTMENTS,
  clock = 10 * 60 + 45,
  onStatusChanged,
  className,
}: StudioBoardProps) {
  const [rows, setRows] = React.useState(appointments)
  const [now, setNow] = React.useState(clock)
  const [running, setRunning] = React.useState(false)
  const [view, setView] = React.useState("all")
  const [picked, setPicked] = React.useState<string[]>([])
  const [seatsOpen, setSeatsOpen] = React.useState(5)
  const [avgTicket, setAvgTicket] = React.useState(640)
  const [turn, setTurn] = React.useState(45)

  const [snaps, setSnaps] = React.useState<Snap[]>([
    { v: { id: "v0", at: fmt(clock), label: "Opening board" }, rows: appointments },
  ])
  const [head, setHead] = React.useState("v0")

  const commit = React.useCallback(
    (label: string, nextRows: Appointment[]) => {
      const s: Snap = { v: { id: "v" + Date.now(), at: fmt(now), label }, rows: nextRows }
      setSnaps((xs) => [s, ...xs].slice(0, 9))
      setHead(s.v.id)
    },
    [now],
  )

  // clock marks state changes only: bookings seat themselves, seats finish
  React.useEffect(() => {
    if (!running) return
    const t = window.setInterval(() => setNow((n) => n + 1), 650)
    return () => window.clearInterval(t)
  }, [running])

  React.useEffect(() => {
    let changed = false
    const next = rows.map((r) => {
      if (r.status === "booked" && r.at <= now) {
        changed = true
        return { ...r, status: "seated" as ApptStatus }
      }
      if (r.status === "seated" && now - r.at >= turn) {
        changed = true
        return { ...r, status: "done" as ApptStatus }
      }
      return r
    })
    if (changed) {
      setRows(next)
      commit("clock · " + fmt(now), next)
    }
  }, [now, rows, turn, commit])

  const setStatus = (ids: string[], status: ApptStatus) => {
    const next = rows.map((r) => (ids.includes(r.id) ? { ...r, status } : r))
    setRows(next)
    setPicked([])
    commit(`${status} · ${ids.length} row${ids.length > 1 ? "s" : ""}`, next)
    onStatusChanged?.(ids, status)
  }

  const bulkActions: BulkAction[] = [
    { label: "Seat now", run: (ids) => setStatus(ids, "seated") },
    {
      label: "Move to seat 2",
      run: (ids) => {
        const next = rows.map((r) => (ids.includes(r.id) ? { ...r, seat: "S2" } : r))
        setRows(next)
        setPicked([])
        commit(`moved to S2 · ${ids.length}`, next)
      },
    },
    { label: "Cancel", tone: "danger", run: (ids) => setStatus(ids, "cancelled") },
  ]

  const visible = rows
    .filter((r) =>
      view === "all" ? true : view === "am" ? r.at < 12 * 60 : view === "pm" ? r.at >= 12 * 60 && r.at < 16 * 60 : r.at >= 16 * 60,
    )
    .sort((a, b) => a.at - b.at)

  const seated = rows.filter((r) => r.status === "seated").length
  const open = rows.filter((r) => r.status === "booked").length
  const occupancy = Math.min(100, Math.round(((seated + rows.filter((r) => r.status === "done").length) / rows.length) * 100))

  const restore = (id: string) => {
    const s = snaps.find((x) => x.v.id === id)
    if (!s) return
    setRows(s.rows)
    setHead(id)
  }

  return (
    <div className={cn("relative isolate flex min-h-[540px] w-full flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Studio board</h2>
        <span className="text-[12px] text-muted-foreground">{salon}</span>
        <span className="text-[12px] text-muted-foreground">· {day}</span>
        <div className="ml-auto flex items-center gap-2">
          <SegmentedControl size="sm" value={view} onChange={setView} options={VIEW_OPTS} />
          <Button type="button" variant="ghost"
            onClick={() => setRunning((r) => !r)}
            className={cn("flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted", running && "border-[hsl(var(--ok)/0.5)] text-[hsl(var(--ok))]")}
          >
            {running ? <Pause className="size-3.5" /> : <Play className="size-3.5" />} {running ? "Hold clock" : "Run clock"}
          </Button>
          <Button type="button" variant="ghost"
            onClick={() => setNow((n) => n + 1)}
            disabled={running}
            className="flex h-8 items-center gap-1.5 rounded-md border bg-background px-2.5 text-[11px] font-semibold hover:bg-muted disabled:opacity-40"
            aria-label="Step one minute"
          >
            <StepForward className="size-3.5" /> +1 min
          </Button>
    </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-auto p-4 lg:grid-cols-[250px_minmax(0,1fr)_290px]">
        {/* KPI odometers */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              KPI odometers
            </header>
            <div className="grid gap-3 p-3">
              <div>
                <DragNumberField label="Seats open" value={seatsOpen} onValueChange={setSeatsOpen} step={1} precision={0} min={0} max={24} />
                <p className="mt-1 text-[10px] text-muted-foreground">drag to cap concurrent bookings</p>
              </div>
              <div>
                <DragNumberField label="Avg ticket" value={avgTicket} onValueChange={setAvgTicket} step={10} precision={0} min={0} max={5000} unit="kr" />
                <p className="mt-1 text-[10px] text-muted-foreground">target 640 kr · rolling 7 days</p>
              </div>
              <div>
                <DragNumberField label="Turn time" value={turn} onValueChange={setTurn} step={5} precision={0} min={15} max={120} unit="min" />
                <p className="mt-1 text-[10px] text-muted-foreground">drives when seats flip to done</p>
              </div>
            </div>
          </section>

          <section className="flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Day ledger
              <span className="font-mono text-[10px] normal-case tracking-normal">live</span>
            </header>
            <div className="space-y-2 p-3 text-[12px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seated now</span>
                <span className="font-mono font-bold tabular-nums">{seated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Waiting today</span>
                <span className="font-mono font-bold tabular-nums">{open}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Projected take</span>
                <span className="font-mono font-bold tabular-nums">
                  {((rows.filter((r) => r.status !== "cancelled").length * avgTicket) / 1000).toFixed(1)}k kr
                </span>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
                  <span>Occupancy</span>
                  <span className="font-mono tabular-nums">{occupancy}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.span className="block h-full rounded-full bg-[hsl(var(--ok))]" animate={{ width: `${occupancy}%` }} />
                </div>
              </div>
            </div>
          </section>
        </aside>

        {/* the solari board */}
        <section className="flex min-w-0 flex-col overflow-hidden rounded-lg border bg-foreground text-background">
          <header className="flex h-9 shrink-0 items-center justify-between border-b border-background/15 px-3">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px] text-background/60">Solari · appointments</span>
            <span className="flex items-center gap-2 font-mono text-[13px] font-bold tabular-nums">
              <span aria-hidden className={cn("size-1.5 rounded-full", running ? "motion-safe:motion-safe:motion-safe:animate-pulse bg-[hsl(var(--ok))]" : "bg-background/40")} />
              {fmt(now)}
            </span>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {visible.map((r) => {
              const on = picked.includes(r.id)
              return (
                <div
                  key={r.id}
                  className={cn(
                    "grid grid-cols-[64px_minmax(0,1fr)_minmax(0,1fr)_44px_112px] items-center gap-2 border-b border-background/10 px-3 py-2 last:border-0",
                    on && "bg-background/10",
                    r.status === "cancelled" && "opacity-50",
                  )}
                >
                  <MotionConfig reducedMotion="user">
                  <span className="font-mono text-[13px] font-bold tabular-nums">{fmt(r.at)}</span>
                  <Flap text={r.client} width={16} />
                  <Flap text={r.service} width={16} />
                  <span className="text-center font-mono text-[12px] text-background/60">{r.seat}</span>
                  <div className="flex items-center justify-end gap-2">
                    <Flap text={STATUS_WORD[r.status]} width={9} className={STATUS_TONE[r.status]} />
                    <Checkbox
                      checked={on}
                      onCheckedChange={(c) => setPicked((p) => (c ? [...p, r.id] : p.filter((x) => x !== r.id)))}
                      aria-label={`Select ${r.client}`}
                      className="border-background/40 bg-transparent data-[state=checked]:border-background data-[state=checked]:bg-background data-[state=checked]:text-foreground"
                    />
                  </div>
                                  </MotionConfig>
                </div>
              )
            })}
          </div>
          <footer className="flex h-9 shrink-0 items-center justify-between border-t border-background/15 px-3 text-[10px] uppercase tracking-[0.1em] text-background/50">
            <span>{visible.length} rows · {view === "all" ? "full day" : VIEW_OPTS.find((o) => o.value === view)?.label.toLowerCase()}</span>
            <span className="flex items-center gap-1.5">
              <Check className="size-3" aria-hidden /> tick rows to batch-edit the board
            </span>
          </footer>
        </section>

        {/* version scrubber */}
        <aside className="flex flex-col gap-4">
          <section className="flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Board versions
              <span className="font-mono text-[10px] normal-case tracking-normal">{snaps.length} kept</span>
            </header>
            <div className="p-3">
              <UndoHistorySlider
                versions={snaps.map((s) => s.v)}
                head={head}
                render={(v) => {
                  const s = snaps.find((x) => x.v.id === v.id)
                  const rs = s?.rows ?? []
                  return (
                    <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                      {rs.length} rows · {rs.filter((r) => r.status === "seated").length} seated · {rs.filter((r) => r.status === "done").length} done
                    </span>
                  )
                }}
                onRestore={restore}
              />
            </div>
            <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">
              Scrub to a past board and restore it — the flaps re-deal to that moment.
            </div>
          </section>
        </aside>
      </div>

      {/* multi-select action bar */}
      <AnimatePresence>
        {picked.length > 0 && (
          <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }} className="border-t bg-background px-4 py-2">
            <BulkSelectBar selected={picked} total={rows.length} actions={bulkActions} onClear={() => setPicked([])} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
