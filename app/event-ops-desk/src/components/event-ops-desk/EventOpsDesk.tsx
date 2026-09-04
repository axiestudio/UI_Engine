import { useState } from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { CalendarClock, DoorOpen, KeyRound, Radio, Stamp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DateRangePresets, type Range } from "date-range-presets"
import { StatusHealthStrip, type Service } from "status-health-strip"
import { JobTray, type Job } from "job-tray"
import { ToastStack, type Toast } from "toast-stack"
import { Checkbox } from "@/components/watermelon/checkbox"

// COMPOSITE SCREEN · EVENT OPS
// composed of: date-range-presets (capacity window), status-health-strip
// (gate services), job-tray (gate imports), watermelon checkbox (issue board)
// + purpose-built pass issuance board and crew call sheets.

export type PassGroup = { id: string; name: string; tier: "VIP" | "GA" | "Crew" | "Press"; issued: number; total: number }

export type EventOpsDeskProps = {
  venue?: string
  doors?: boolean
  window?: Range | null
  passes?: PassGroup[]
  onDoorsOpen?: () => void
  className?: string
}

const DEFAULT_WINDOW: Range = { from: new Date(new Date().setHours(18, 0, 0, 0)), to: new Date(new Date().setHours(26, 0, 0, 0)), label: "Doors 18:00 → 02:00" }

const DEFAULT_PASSES: PassGroup[] = [
  { id: "p1", name: "Season box holders", tier: "VIP", issued: 34, total: 40 },
  { id: "p2", name: "General admission A", tier: "GA", issued: 512, total: 900 },
  { id: "p3", name: "Crew — stage & rigging", tier: "Crew", issued: 22, total: 22 },
  { id: "p4", name: "Press pit", tier: "Press", issued: 8, total: 14 },
  { id: "p5", name: "General admission B", tier: "GA", issued: 0, total: 450 },
]

const DEFAULT_SERVICES: Service[] = [
  { name: "Gate scanners", state: "operational", note: "12 of 12 online" },
  { name: "Card printers", state: "degraded", note: "lamination slow" },
  { name: "Payment terminals", state: "operational", note: "" },
  { name: "Radio net", state: "down", region: "ch 3", note: "repeater reboot" },
]

const DEFAULT_JOBS: Job[] = [
  { id: "j1", label: "Import guest list — night CSV", status: "running", progress: 64, log: ["1 412 rows parsed", "312 duplicates skipped"] },
  { id: "j2", label: "Sync scanners firmware 4.2", status: "queued" },
  { id: "j3", label: "Export refunds to box office", status: "done" },
  { id: "j4", label: "Pull press accreditations", status: "error", log: ["upstream 502 — will retry"] },
]

const DEFAULT_CREW = [
  { id: "c1", name: "M. Falk", station: "Stage L", call: "15:30", radio: "ch 1", confirmed: true },
  { id: "c2", name: "D. Haile", station: "FOH mix", call: "16:00", radio: "ch 2", confirmed: true },
  { id: "c3", name: "S. Brandt", station: "Gate A lead", call: "17:00", radio: "ch 3", confirmed: false },
  { id: "c4", name: "J. Ruiz", station: "Medic", call: "17:30", radio: "ch 4", confirmed: false },
]

const TIER_STYLES: Record<PassGroup["tier"], string> = {
  VIP: "border-[hsl(var(--pinned)/0.4)] text-[hsl(var(--pinned))]",
  GA: "border-border text-muted-foreground",
  Crew: "border-[hsl(var(--info)/0.4)] text-[hsl(var(--info))]",
  Press: "border-[hsl(var(--warn)/0.5)] text-[hsl(var(--warn))]",
}

export function EventOpsDesk({ venue = "Norrlandsplatsen · Hall A–D", doors = false, window: initialWindow = DEFAULT_WINDOW, passes = DEFAULT_PASSES, onDoorsOpen, className }: EventOpsDeskProps) {
  const [win, setWin] = useState<Range | null>(initialWindow)
  const [board, setBoard] = useState(passes)
  const [sel, setSel] = useState<string[]>([])
  const [crew, setCrew] = useState(DEFAULT_CREW)
  const [isDoors, setDoors] = useState(doors)
  const [jobs, setJobs] = useState<Job[]>(DEFAULT_JOBS)
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = (title: string, tone: Toast["tone"] = "ok") =>
    setToasts((t) => [...t.slice(-2), { id: String(Date.now() + Math.random()), title, tone }])

  const totalIssued = board.reduce((a, p) => a + p.issued, 0)
  const totalPasses = board.reduce((a, p) => a + p.total, 0)
  const hours = win ? Math.max(1, Math.round((win.to.getTime() - win.from.getTime()) / 3_600_000)) : 0
  const perHour = Math.round(totalPasses / Math.max(1, hours))

  const issue = (ids: string[]) => {
    setBoard((ps) => ps.map((p) => (ids.includes(p.id) && p.issued < p.total ? { ...p, issued: p.issued + 1 } : p)))
  }
  const openDoors = () => {
    setDoors(true)
    push("doors open — scanners live, queue timer started")
    onDoorsOpen?.()
  }

  return (
    <div className={cn("relative isolate flex min-h-[540px] w-full flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <MotionConfig reducedMotion="user">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Event ops</h2>
        <span className="text-[12px] text-muted-foreground">{venue}</span>
        <span className="flex items-center gap-1.5 rounded border border-[hsl(var(--warn)/0.5)] bg-[hsl(var(--warn)/0.08)] px-2 py-0.5 text-[11px] font-semibold text-[hsl(var(--warn))]">
          <Radio className="size-3.5" /> ch 3 down
        </span>
        <Button type="button" variant="ghost" onClick={openDoors} disabled={isDoors} className={cn("ml-auto flex h-8 items-center gap-1.5 rounded-md px-3 text-[11px] font-semibold", isDoors ? "border bg-background text-muted-foreground disabled:opacity-60" : "bg-[hsl(var(--ok))] text-primary-foreground hover:bg-[hsl(var(--ok)/0.9)]")}>
          <DoorOpen className="size-3.5" /> {isDoors ? "Doors open" : "Open doors"}
        </Button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[270px_minmax(0,1fr)_280px]">
        {/* capacity + health */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center gap-1.5 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <CalendarClock className="size-3.5" /> Capacity window
            </header>
            <div className="p-3">
              <DateRangePresets value={win} onChange={setWin} presets={[{ label: "Tonight", days: 0 }, { label: "Weekend", days: 2 }, { label: "Next 7 days", days: 7 }]} />
              <dl className="mt-3 space-y-1 text-[12px]">
                <div className="flex justify-between"><dt className="text-muted-foreground">Window</dt><dd className="font-mono text-[12px] tabular-nums">{hours} h</dd>      
          
    </div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Passes / hour</dt><dd className="font-mono font-bold tabular-nums">{perHour.toLocaleString()}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Peak lane load</dt><dd className="font-mono tabular-nums">Gate A · 340/h</dd></div>
              </dl>
            </div>
          </section>
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="h-9 border-b bg-muted/30 px-3 pt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Service health</header>
            <StatusHealthStrip services={DEFAULT_SERVICES} />
          </section>
        </aside>

        {/* pass issuance board */}
        <section className="min-w-0 overflow-hidden rounded-lg border bg-card">
          <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Pass issuance · {totalIssued}/{totalPasses} issued</span>
            <Button type="button" variant="ghost"
              onClick={() => { board.filter((p) => sel.includes(p.id) && p.issued < p.total).forEach((p) => issue([p.id])); push(`${sel.length} batches bumped by one pass`) }}
              disabled={sel.length === 0}
              className="flex items-center gap-1 text-[11px] font-bold text-[hsl(var(--info))] disabled:opacity-40"
            >
              <Stamp className="size-3.5" /> issue selected
            </Button>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b text-left text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="w-8 px-2 py-1.5" />
                <th className="px-3 py-1.5 font-semibold">Batch</th>
                <th className="px-2 py-1.5 font-semibold">Tier</th>
                <th className="px-2 py-1.5 text-right font-semibold">Issued</th>
                <th className="px-3 py-1.5 font-semibold">Progress</th>
              </tr>
            </thead>
            <tbody>
              {board.map((p) => (
                <tr key={p.id} className={cn("border-b border-app-line/60 last:border-0", sel.includes(p.id) && "bg-accent/40")}>
                  <td className="px-2 py-1">
                    <Checkbox checked={sel.includes(p.id)} onCheckedChange={(v: boolean | "indeterminate") => setSel((s) => (v === true ? [...s, p.id] : s.filter((x) => x !== p.id)))} aria-label={`Select ${p.name}`} className="size-3.5" />
                  </td>
                  <td className="px-3 py-1 font-medium">{p.name}</td>
                  <td className="px-2 py-1"><span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold", TIER_STYLES[p.tier])}>{p.tier}</span></td>
                  <td className="px-2 py-1 text-right font-mono tabular-nums">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span key={p.issued} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }} className="inline-block">
                        {p.issued.toLocaleString()}<span className="text-muted-foreground">/{p.total.toLocaleString()}</span>
                      </motion.span>
                    </AnimatePresence>
                  </td>
                  <td className="px-3 py-1">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-full max-w-[140px] overflow-hidden rounded-full bg-muted">
                        <motion.div className="h-full rounded-full bg-[hsl(var(--info))]" animate={{ width: `${Math.round((p.issued / p.total) * 100)}%` }} transition={{ type: "spring", stiffness: 160, damping: 22 }} />
                      </div>
                      <Button type="button" variant="ghost" onClick={() => issue([p.id])} disabled={p.issued >= p.total || !isDoors} className="text-[10px] font-bold uppercase text-muted-foreground hover:text-foreground disabled:opacity-30">
                        {p.issued >= p.total ? "full" : "issue"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">Issuing unlocks when doors open · batches print to the Hall A printer</div>
        </section>

        {/* crew + jobs */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Call sheets <span className="font-mono normal-case tracking-normal">{crew.filter((c) => c.confirmed).length}/{crew.length} confirmed</span>
            </header>
            <ul className="divide-y">
              {crew.map((c, i) => (
                <li key={c.id} className="flex items-center gap-2 px-3 py-1.5">
                  <span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.station} · <span className="font-mono">{c.call}</span> · {c.radio}</p>
                  </div>
                  <Button type="button" variant="ghost"
                    onClick={() => setCrew((cs) => cs.map((x) => (x.id === c.id ? { ...x, confirmed: !x.confirmed } : x)))}
                    className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold", c.confirmed ? "border-[hsl(var(--ok)/0.4)] text-[hsl(var(--ok))]" : "text-muted-foreground hover:bg-muted")}
                  >
                    {c.confirmed ? "on set" : "confirm"}
                  </Button>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-lg border bg-card">
            <header className="flex h-9 items-center gap-1.5 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <KeyRound className="size-3.5" /> Gate imports
            </header>
            <JobTray jobs={jobs} onCancel={(j: Job) => { setJobs((js) => js.filter((x) => x.id !== j.id)); push(`${j.label} cancelled`, "warn") }} onDismiss={(id: string) => setJobs((js) => js.filter((x) => x.id !== id))} className="border-0" />
          </section>
        </aside>
      </div>
      <ToastStack toasts={toasts} onDismiss={(id: string) => setToasts((t) => t.filter((x) => x.id !== id))} pos="br" />
          </MotionConfig>
    </div>
  )
}
