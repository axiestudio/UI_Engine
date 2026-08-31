import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { BadgeCheck, Flag, HardDriveDownload, RefreshCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, Grain } from "@/components/primitives/handcraft"
import { SegmentedControl } from "segmented-control"
import { InlineEditCell } from "inline-edit-cell"
import { DateRangePresets, type Range } from "date-range-presets"
import { BulkSelectBar, type BulkAction } from "bulk-select-bar"
import { OfflineQueueBanner } from "offline-queue-banner"
import { Checkbox } from "@/components/watermelon/checkbox"

// COMPOSITE SCREEN · TIME & ATTENDANCE
// composed of: segmented-control (shift view), date-range-presets (pay period),
// inline-edit-cell (punch edits), bulk-select-bar (supervisor bulk edits),
// offline-queue-banner (kiosk sync) + watermelon checkbox + purpose-built
// range totals and kiosk fleet panel.
//
// DESIGN BAR: header strip ≤48px · labels 11px semibold uppercase 12% tracking
// · body 13px · numerics 12px mono tabular right · panels rounded-lg with 36px
// header strips · motion marks state changes only.

export type AttendanceRow = {
  id: string
  emp: string
  dept: string
  day: string
  shift: "early" | "day" | "eve"
  punchIn: string
  punchOut: string
  kiosk?: boolean
  approved?: boolean
  flagged?: boolean
}

export type AttendanceDeskProps = {
  rows?: AttendanceRow[]
  onApprove?: (ids: string[]) => void
  className?: string
}

const DEFAULT_ROWS: AttendanceRow[] = [
  { id: "r1", emp: "Aya Demir", dept: "floor", day: "Mon 24", shift: "early", punchIn: "06:02", punchOut: "14:31", kiosk: true },
  { id: "r2", emp: "Aya Demir", dept: "floor", day: "Tue 25", shift: "day", punchIn: "09:00", punchOut: "17:24" },
  { id: "r3", emp: "Bo Lindqvist", dept: "kitchen", day: "Mon 24", shift: "day", punchIn: "10:12", punchOut: "18:45", kiosk: true },
  { id: "r4", emp: "Bo Lindqvist", dept: "kitchen", day: "Tue 25", shift: "eve", punchIn: "14:58", punchOut: "23:07" },
  { id: "r5", emp: "Cissi Aho", dept: "floor", day: "Tue 25", shift: "day", punchIn: "08:47", punchOut: "16:02", approved: true },
  { id: "r6", emp: "Dan Petrov", dept: "stock", day: "Mon 24", shift: "early", punchIn: "05:58", punchOut: "13:59" },
  { id: "r7", emp: "Dan Petrov", dept: "stock", day: "Wed 26", shift: "eve", punchIn: "15:04", punchOut: "22:10", flagged: true },
]

const KIOSKS = [
  { id: "k1", site: "Entrance A", lastSync: "09:41", pending: 3 },
  { id: "k2", site: "Dock door 2", lastSync: "yesterday", pending: 12 },
  { id: "k3", site: "Mezzanine", lastSync: "09:40", pending: 0 },
]

const toMin = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map((p) => Number(p))
  if (!Number.isFinite(h) || !Number.isFinite(m) || h < 0 || h > 23 || m < 0 || m > 59) return 0
  return h * 60 + m
}

const span = (row: AttendanceRow): number => Math.max(0, toMin(row.punchOut) - toMin(row.punchIn))

const fmtH = (min: number): string => `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, "0")}`

export function AttendanceDesk({ rows = DEFAULT_ROWS, onApprove, className }: AttendanceDeskProps) {
  const [data, setData] = React.useState(rows)
  const [shift, setShift] = React.useState("all")
  const [period, setPeriod] = React.useState<Range | null>(null)
  const [selected, setSelected] = React.useState<string[]>([])
  const [online, setOnline] = React.useState(true)
  const [flushing, setFlushing] = React.useState(false)
  const [pending, setPending] = React.useState(15)

  const shown = data.filter((r) => shift === "all" || r.shift === shift)
  const worked = shown.filter((r) => !r.flagged).reduce((a, r) => a + span(r), 0)
  const overtime = shown.filter((r) => span(r) > 480).reduce((a, r) => a + span(r) - 480, 0)

  const editPunch = (id: string, key: "punchIn" | "punchOut") => async (v: string) => {
    if (!/^\d{1,2}:\d{2}$/.test(v.trim()) || toMin(v.trim()) === 0) throw new Error("bad punch")
    setData((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: v.trim(), kiosk: false } : r)))
  }

  const runBulk = (kind: "approve" | "flag") => {
    setData((rs) => rs.map((r) => (selected.includes(r.id) ? { ...r, approved: kind === "approve" ? true : r.approved, flagged: kind === "flag" ? true : r.flagged } : r)))
    if (kind === "approve") onApprove?.(selected)
    setSelected([])
  }

  const actions: BulkAction[] = [
    { label: "Approve", run: () => runBulk("approve") },
    { label: "Flag for review", run: () => runBulk("flag"), tone: "danger" },
  ]

  const retrySync = () => {
    if (online || flushing) return
    setFlushing(true)
    window.setTimeout(() => {
      setFlushing(false)
      setPending(0)
      setOnline(true)
      setData((rs) => rs.map((r) => ({ ...r, kiosk: false })))
    }, 1400)
  }

  return (
    <div className={cn("relative isolate flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <Grain opacity={0.03} />

      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Time & attendance</h2>
        <span className="text-[12px] text-muted-foreground">site · Vällingby 04</span>
        <span className="text-[12px] text-muted-foreground">· supervisor desk</span>
        <button onClick={() => setOnline((o) => !o)} className="ml-auto flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted">
          <HardDriveDownload className="size-3.5" /> {online ? "Simulate kiosk drop" : "Kiosks offline"}
        </button>
        <button className="flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted"><RefreshCcw className="size-3.5" /> Refresh punches</button>
      </header>

      <OfflineQueueBanner online={online} queued={pending} flushing={flushing} onRetryNow={retrySync} className="shrink-0 rounded-none border-x-0 border-t-0" />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[270px_minmax(0,1fr)_260px]">
        {/* left rail — period + shift + totals */}
        <aside className="flex min-w-0 flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Pay period</header>
            <div className="p-3">
              <DateRangePresets value={period} onChange={setPeriod} presets={[{ label: "This week", days: 7 }, { label: "Last week", days: 7 }, { label: "Month to date", days: 26 }]} />
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Shift view</header>
            <div className="p-3">
              <SegmentedControl size="sm" className="w-full justify-between" value={shift} onChange={setShift} options={[{ value: "all", label: "All" }, { value: "early", label: "Early" }, { value: "day", label: "Day" }, { value: "eve", label: "Eve" }]} />
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Range totals</header>
            <div className="space-y-1.5 p-3 text-[12px]">
              <TotalRow l="Punches shown" v={String(shown.length)} />
              <TotalRow l="Worked" v={fmtH(worked)} />
              <TotalRow l="Overtime > 8h" v={fmtH(overtime)} accent={overtime > 0} />
              <TotalRow l="Flagged rows" v={String(shown.filter((r) => r.flagged).length)} accent={shown.some((r) => r.flagged)} />
              {period && <p className="border-t pt-2 text-[11px] text-muted-foreground">Period {period.from.toLocaleDateString()} → {period.to.toLocaleDateString()} feeds payroll lock on the 25th.</p>}
            </div>
          </section>
        </aside>

        {/* centre — punch sheet */}
        <section className="min-h-0 overflow-hidden rounded-lg border bg-card">
          <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Punch sheet · {shown.length} rows</span>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{data.filter((r) => r.kiosk).length} awaiting kiosk sync</span>
          </header>
          <AnimatePresence>
            {selected.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <BulkSelectBar selected={selected} total={shown.length} actions={actions} onClear={() => setSelected([])} className="rounded-none border-x-0 border-t-0" />
              </motion.div>
            )}
          </AnimatePresence>
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b text-left text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="w-8 px-3 py-1.5">
                  <Checkbox
                    checked={shown.length > 0 && shown.every((r) => selected.includes(r.id))}
                    onCheckedChange={(v: boolean) => setSelected(v ? shown.map((r) => r.id) : [])}
                    aria-label="select all rows"
                  />
                </th>
                <th className="px-2 py-1.5 font-semibold">Employee</th>
                <th className="px-2 py-1.5 font-semibold">Day</th>
                <th className="w-20 px-2 py-1.5 font-semibold">In</th>
                <th className="w-20 px-2 py-1.5 font-semibold">Out</th>
                <th className="w-20 px-2 py-1.5 text-right font-semibold">Span</th>
                <th className="w-16 px-3 py-1.5 text-right font-semibold">State</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className={cn("border-b border-app-line/60 last:border-0", selected.includes(r.id) && "bg-accent/40", r.flagged && "bg-[hsl(var(--warn)/0.07)]")}>
                  <td className="px-3 py-1.5">
                    <Checkbox
                      checked={selected.includes(r.id)}
                      onCheckedChange={(v: boolean) => setSelected((s) => (v ? [...s, r.id] : s.filter((x) => x !== r.id)))}
                      aria-label={`select ${r.emp} ${r.day}`}
                    />
                  </td>
                  <td className="px-2 py-1.5 font-medium">
                    {r.emp}
                    {r.kiosk && <span className="ml-1.5 rounded bg-muted px-1 py-px text-[9px] font-bold uppercase text-muted-foreground">kiosk</span>}
                  </td>
                  <td className="px-2 py-1.5 text-muted-foreground">{r.day} · {r.shift}</td>
                  <td className="px-2 py-1.5"><InlineEditCell value={r.punchIn} name={`punch in ${r.emp} ${r.day}`} mono width={44} onSave={editPunch(r.id, "punchIn")} /></td>
                  <td className="px-2 py-1.5"><InlineEditCell value={r.punchOut} name={`punch out ${r.emp} ${r.day}`} mono width={44} onSave={editPunch(r.id, "punchOut")} /></td>
                  <td className="px-2 py-1.5 text-right font-mono tabular-nums">{fmtH(span(r))}</td>
                  <td className="px-3 py-1.5 text-right">
                    {r.approved ? <BadgeCheck className="ml-auto size-3.5 text-[hsl(var(--ok))]" /> : r.flagged ? <Flag className="ml-auto size-3.5 text-[hsl(var(--warn))]" /> : <span className="text-[10px] uppercase text-muted-foreground">open</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">Tap a punch time to correct it · edits stamp the audit trail with your supervisor ID</div>
        </section>

        {/* right rail — kiosk fleet */}
        <aside className="flex min-w-0 flex-col gap-4">
          <section className="min-h-0 flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Kiosk fleet</span>
              <span className={cn("font-mono text-[11px] tabular-nums", online ? "text-muted-foreground" : "text-[hsl(var(--err))]")}>{online ? "link up" : "link down"}</span>
            </header>
            <div className="grid gap-2 p-3">
              {KIOSKS.map((k) => (
                <div key={k.id} className="flex items-center justify-between rounded-md border bg-background px-2.5 py-2">
                  <div>
                    <p className="text-[12px] font-semibold">{k.site}</p>
                    <p className="text-[11px] text-muted-foreground">last sync {k.lastSync}</p>
                  </div>
                  <span className={cn("font-mono text-[12px] tabular-nums", k.pending > 0 && "text-[hsl(var(--warn))]")}>{k.pending} pending</span>
                </div>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Sync ledger</header>
            <div className="space-y-1.5 p-3 text-[12px]">
              <TotalRow l="Punches queued" v={String(pending)} accent={pending > 0} />
              <TotalRow l="Synced today" v="128" />
              <TotalRow l="Conflicts" v="0" />
              <MonoLabel tick={false} className="block pt-1 text-[10px] text-muted-foreground">kiosk punches win unless a supervisor edits first</MonoLabel>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function TotalRow({ l, v, accent }: { l: string; v: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{l}</span>
      <span className={cn("font-mono tabular-nums", accent && "text-[hsl(var(--warn))]")}>{v}</span>
    </div>
  )
}
