import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { BadgeCheck, Flag, HardDriveDownload, RefreshCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { SegmentedControl } from "segmented-control"
import { InlineEditCell } from "inline-edit-cell"
import { DateRangePresets, type Range } from "date-range-presets"
import { BulkSelectBar, type BulkAction } from "bulk-select-bar"
import { OfflineQueueBanner } from "offline-queue-banner"
import { ActivityHeatmap } from "activity-heatmap"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/watermelon/checkbox"

// COMPOSITE SCREEN · TIME & ATTENDANCE
// Split-band shell: controls dock into a horizontal band (shift + pay period),
// the punch sheet runs as a real LEDGER — full-width ruled rows grouped per
// employee, no card nesting — and a tinted canvas carries the weekly heat band
// plus a bare rail of range totals beside the kiosk fleet.
// Range presets and the shift segment recompute ledger + totals together.

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

// "Mon 24" → a real date in the Aug 2026 pay period, so range presets filter.
const DAY_OF_WEEK: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 }
const rowDate = (day: string): Date => {
  const m = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(\d{1,2})$/.exec(day.trim())
  return m ? new Date(2026, 7, Number(m[2])) : new Date(2026, 7, 1)
}
const rowWeekday = (day: string): number => {
  const m = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/.exec(day.trim())
  return m ? DAY_OF_WEEK[m[1]] ?? 0 : 0
}

// Seeded weekly attendance history (hours on the floor per weekday), weeks oldest-first.
const WEEKS = 8
const HISTORY: number[] = [26, 34, 31, 29, 33, 18, 9]
const heatCells = (shown: AttendanceRow[]) => {
  const cells = Array.from({ length: WEEKS * 7 }, (_, i) => {
    const week = Math.floor(i / 7)
    return { count: Math.round(HISTORY[i % 7] * (0.85 + ((week * 7 + (i % 7)) % 5) * 0.07)) }
  })
  for (const r of shown) cells[(WEEKS - 1) * 7 + rowWeekday(r.day)].count += Math.round(span(r) / 60)
  return cells
}

export function AttendanceDesk({ rows = DEFAULT_ROWS, onApprove, className }: AttendanceDeskProps) {
  const [data, setData] = React.useState(rows)
  const [shift, setShift] = React.useState("all")
  const [period, setPeriod] = React.useState<Range | null>(null)
  const [selected, setSelected] = React.useState<string[]>([])
  const [online, setOnline] = React.useState(true)
  const [flushing, setFlushing] = React.useState(false)
  const [pending, setPending] = React.useState(15)

  const ranged = React.useMemo(() => {
    if (!period) return data
    const from = new Date(period.from.getFullYear(), period.from.getMonth(), period.from.getDate()).getTime()
    const to = new Date(period.to.getFullYear(), period.to.getMonth(), period.to.getDate(), 23, 59).getTime()
    return data.filter((r) => {
      const d = rowDate(r.day).getTime()
      return d >= from && d <= to
    })
  }, [data, period])

  const shown = ranged.filter((r) => shift === "all" || r.shift === shift)
  const worked = shown.filter((r) => !r.flagged).reduce((a, r) => a + span(r), 0)
  const overtime = shown.filter((r) => span(r) > 480).reduce((a, r) => a + span(r) - 480, 0)
  const cells = React.useMemo(() => heatCells(shown), [shown])

  // ledger order — grouped per employee, days ascending
  const ledger = [...shown].sort((a, b) => (a.emp === b.emp ? a.day.localeCompare(b.day) : a.emp.localeCompare(b.emp)))

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

  let lastEmp = ""

  return (
    <div className={cn("relative isolate flex min-h-dvh w-full flex-col overflow-hidden bg-muted/30 font-sans text-foreground", className)}>
      <MotionConfig reducedMotion="user">
      {/* header — plain label voice, sits on the canvas */}
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 px-5 py-3">
        <h2 className="text-[13px] font-bold">Time & attendance</h2>
        <span className="font-mono text-[12px] text-muted-foreground">site · Vällingby 04</span>
        <span className="text-[12px] text-muted-foreground">· supervisor desk</span>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setOnline((o) => !o)}>
            <HardDriveDownload className="size-3.5" /> {online ? "Simulate kiosk drop" : "Kiosks offline"}
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCcw className="size-3.5" /> Refresh punches
          </Button>
          
    </div>
      </header>

      {/* split band — shift + pay period docked into one control strip */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-y bg-background px-5 py-2.5" role="toolbar" aria-label="Ledger controls">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px] text-muted-foreground">Shift</span>
          <SegmentedControl size="sm" value={shift} onChange={setShift} options={[{ value: "all", label: "All" }, { value: "early", label: "Early" }, { value: "day", label: "Day" }, { value: "eve", label: "Eve" }]} />
        </div>
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px] text-muted-foreground">Pay period</span>
          <DateRangePresets value={period} onChange={setPeriod} presets={[{ label: "Last 7 days", days: 7 }, { label: "Last 14 days", days: 14 }, { label: "Month to date", days: 26 }]} />
        </div>
        {period && (
          <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground">
            {period.from.toLocaleDateString()} → {period.to.toLocaleDateString()} · feeds payroll lock on the 25th
          </span>
        )}
      </div>

      <OfflineQueueBanner online={online} queued={pending} flushing={flushing} onRetryNow={retrySync} className="rounded-none border-x-0" />

      {/* the punch ledger — one paper sheet, ruled rows, no nested cards */}
      <section className="mx-5 mt-5 overflow-hidden rounded-lg border bg-background shadow-sm" aria-label="Punch ledger">
        <div className="flex items-baseline justify-between px-4 py-2.5">
          <h3 className="font-display text-[13px] font-bold">Punch ledger <span className="font-mono text-[11px] font-normal tabular-nums text-muted-foreground">· {shown.length} rows</span></h3>
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{data.filter((r) => r.kiosk).length} awaiting kiosk sync</span>
        </div>
        <AnimatePresence>
          {selected.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <BulkSelectBar selected={selected} total={shown.length} actions={actions} onClear={() => setSelected([])} className="rounded-none border-x-0" />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="border-y bg-muted/40 text-left text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              <th className="w-8 px-4 py-1.5">
                <Checkbox
                  checked={shown.length > 0 && shown.every((r) => selected.includes(r.id))}
                  onCheckedChange={(v: boolean) => setSelected(v ? shown.map((r) => r.id) : [])}
                  aria-label="select all ledger rows"
                />
              </th>
              <th className="px-2 py-1.5 font-semibold">Employee</th>
              <th className="px-2 py-1.5 font-semibold">Day · shift</th>
              <th className="w-20 px-2 py-1.5 font-semibold">In</th>
              <th className="w-20 px-2 py-1.5 font-semibold">Out</th>
              <th className="w-20 px-2 py-1.5 text-right font-semibold">Span</th>
              <th className="w-16 px-4 py-1.5 text-right font-semibold">State</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((r, i) => {
              const groupStart = r.emp !== lastEmp
              lastEmp = r.emp
              return (
                <React.Fragment key={r.id}>
                  {groupStart && (
                    <tr className="border-b bg-muted/20">
                      <td colSpan={7} className="px-4 py-1">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                          {r.emp} · {r.dept}
                        </span>
                      </td>
                    </tr>
                  )}
                  <tr className={cn("border-b border-app-line/60 last:border-0 odd:bg-muted/20", selected.includes(r.id) && "bg-accent/40", r.flagged && "bg-[hsl(var(--warn)/0.07)]")}>
                    <td className="px-4 py-1.5">
                      <Checkbox
                        checked={selected.includes(r.id)}
                        onCheckedChange={(v: boolean) => setSelected((s) => (v ? [...s, r.id] : s.filter((x) => x !== r.id)))}
                        aria-label={`select ${r.emp} ${r.day}`}
                      />
                    </td>
                    <td className="px-2 py-1.5 font-medium">
                      {r.emp}
                      {r.kiosk && <span className="ml-1.5 rounded bg-muted px-1 py-px font-mono text-[9px] font-bold uppercase text-muted-foreground">kiosk</span>}
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground">{r.day} · {r.shift}</td>
                    <td className="px-2 py-1.5"><InlineEditCell value={r.punchIn} name={`punch in ${r.emp} ${r.day}`} mono width={44} onSave={editPunch(r.id, "punchIn")} /></td>
                    <td className="px-2 py-1.5"><InlineEditCell value={r.punchOut} name={`punch out ${r.emp} ${r.day}`} mono width={44} onSave={editPunch(r.id, "punchOut")} /></td>
                    <td className="px-2 py-1.5 text-right font-mono tabular-nums">{fmtH(span(r))}</td>
                    <td className="px-4 py-1.5 text-right">
                      {r.approved ? <BadgeCheck className="ml-auto size-3.5 text-[hsl(var(--ok))]" /> : r.flagged ? <Flag className="ml-auto size-3.5 text-[hsl(var(--warn))]" /> : <span className="text-[10px] uppercase text-muted-foreground">open</span>}
                    </td>
                  </tr>
                </React.Fragment>
              )
            })}
            {ledger.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-[12px] text-muted-foreground">
                  No punches in range — widen the pay period or clear the shift filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
        <div className="border-t px-4 py-2 text-[11px] text-muted-foreground">Tap a punch time to correct it · edits stamp the audit trail with your supervisor ID</div>
      </section>

      {/* canvas floor — weekly heat band + bare totals rail + kiosk fleet */}
      <div className="grid grid-cols-1 gap-4 px-5 py-5 lg:grid-cols-12">
        <section className="rounded-lg border bg-background p-4 lg:col-span-8" aria-label="Weekly attendance heat">
          <div className="flex items-baseline justify-between">
            <h3 className="font-display text-[13px] font-bold">Weekly attendance heat</h3>
            <span className="font-mono text-[10px] uppercase text-muted-foreground">hours on floor · {shift === "all" ? "all shifts" : `${shift} shift`}</span>
          </div>
          <div className="mt-3">
            <ActivityHeatmap cells={cells} weekStartDay={1} showTooltip showLegend />
          </div>
          <p className="mt-2 border-t pt-2 text-[11px] leading-relaxed text-muted-foreground">
            The current week is live — correcting a punch moves hours between weekday cells.
          </p>
        </section>

        <div className="flex flex-col gap-4 lg:col-span-4">
          {/* range totals — bare rail, rules only */}
          <section aria-label="Range totals" className="px-1">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px] text-muted-foreground">Range totals</span>
            <dl className="mt-1 divide-y border-y text-[12px]">
              {([
                ["Punches shown", String(shown.length), false],
                ["Worked", fmtH(worked), false],
                ["Overtime > 8h", fmtH(overtime), overtime > 0],
                ["Flagged rows", String(shown.filter((r) => r.flagged).length), shown.some((r) => r.flagged)],
              ] as [string, string, boolean][]).map(([l, v, accent]) => (
                <div key={l} className="flex items-baseline justify-between py-1.5">
                  <dt className="text-muted-foreground">{l}</dt>
                  <dd className={cn("font-mono text-[13px] font-bold tabular-nums", accent && "text-[hsl(var(--warn))]")}>{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-label="Kiosk fleet" className="flex-1 rounded-lg border bg-background p-3 shadow-sm">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-[13px] font-bold">Kiosk fleet</h3>
              <span className={cn("font-mono text-[11px] tabular-nums", online ? "text-muted-foreground" : "text-[hsl(var(--err))]")}>{online ? "link up" : "link down"}</span>
            </div>
            <div className="grid gap-2 pt-2">
              {KIOSKS.map((k) => (
                <div key={k.id} className="flex items-center justify-between rounded-md border bg-muted/20 px-2.5 py-1.5">
                  <div>
                    <p className="text-[12px] font-semibold">{k.site}</p>
                    <p className="text-[11px] text-muted-foreground">last sync {k.lastSync}</p>
                  </div>
                  <span className={cn("font-mono text-[12px] tabular-nums", k.pending > 0 && "text-[hsl(var(--warn))]")}>{k.pending} pending</span>
                </div>
              ))}
            </div>
            <dl className="mt-2 divide-y border-t text-[12px]">
              {([
                ["Punches queued", String(pending), pending > 0],
                ["Synced today", "128", false],
                ["Conflicts", "0", false],
              ] as [string, string, boolean][]).map(([l, v, accent]) => (
                <div key={l} className="flex items-baseline justify-between py-1.5">
                  <dt className="text-muted-foreground">{l}</dt>
                  <dd className={cn("font-mono tabular-nums", accent && "font-bold text-[hsl(var(--warn))]")}>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="pt-1.5 text-[10px] text-muted-foreground">kiosk punches win unless a supervisor edits first</p>
          </section>
        </div>
      </div>
          </MotionConfig>
    </div>
  )
}
