import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { CarFront, CircleCheck, Clock3, KeySquare, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, CornerTicks } from "@/components/primitives/handcraft"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/watermelon/table"
import { Checkbox } from "@/components/watermelon/checkbox"
import { UploadQueue, type UploadFile } from "upload-queue"
import { InlineEditCell } from "inline-edit-cell"
import { SegmentedControl } from "segmented-control"
import { ToastStack, type Toast } from "toast-stack"

// COMPOSITE SCREEN · AUTO SERVICE LANE
// composed of: segmented-control (bay selector), upload-queue (damage photo
// intake), inline-edit-cell (labour lines), toast-stack (advisories) +
// purpose-built bay strip, keycard pass and service history rail.

export type LaneLine = {
  id: string
  desc: string
  hours: number
  partQty: number
  price: number
  advised?: boolean
}
export type HistoryVisit = { id: string; at: string; summary: string; odo: number; workshop: string }
export type BayState = "empty" | "intake" | "on-lift" | "road-test" | "ready"

export type ServiceLaneDeskProps = {
  reg?: string
  bay?: string
  lines?: LaneLine[]
  photos?: UploadFile[]
  history?: HistoryVisit[]
  onClosed?: (total: number) => void
  className?: string
}

const BAYS = [
  { value: "b1", label: "Bay 1" },
  { value: "b2", label: "Bay 2" },
  { value: "b3", label: "Bay 3" },
  { value: "b4", label: "Bay 4" },
]

const BAY_ROW: { bay: string; reg: string; model: string; state: BayState; tech: string }[] = [
  { bay: "b1", reg: "MLB 482", model: "V90 D4", state: "on-lift", tech: "R. Nyström" },
  { bay: "b2", reg: "KLP 917", model: "ID.4", state: "road-test", tech: "T. Aalto" },
  { bay: "b3", reg: "XRT 220", model: "C40", state: "ready", tech: "R. Nyström" },
  { bay: "b4", reg: "—", model: "open", state: "empty", tech: "—" },
]

const DEFAULT_LINES: LaneLine[] = [
  { id: "l1", desc: "Front brake pads + discs", hours: 1.6, partQty: 1, price: 3120 },
  { id: "l2", desc: "AC service · R134a recharge", hours: 0.8, partQty: 1, price: 1140 },
  { id: "l3", desc: "Wiper blades front pair", hours: 0.2, partQty: 1, price: 380, advised: true },
]

const STATE_TONE: Record<BayState, string> = {
  empty: "text-muted-foreground",
  intake: "text-[hsl(var(--info))]",
  "on-lift": "text-[hsl(var(--warn))]",
  "road-test": "text-[hsl(var(--pinned))]",
  ready: "text-[hsl(var(--ok))]",
}

export function ServiceLaneDesk({
  reg = "MLB 482",
  bay = "b1",
  lines = DEFAULT_LINES,
  photos = [
    { id: "p1", name: "front-bumper-scrape.jpg", size: 2_410_000, status: "done", progress: 100 },
    { id: "p2", name: "wheel-arch-dent.jpg", size: 1_870_000, status: "uploading", progress: 62 },
    { id: "p3", name: "underbody-rust.jpg", size: 3_020_000, status: "waiting" },
  ],
  history = [
    { id: "h1", at: "12 Mar 2026", summary: "Oil service + pollen filter", odo: 118_400, workshop: "Depot Söder" },
    { id: "h2", at: "03 Nov 2025", summary: "Rear shock pair replaced", odo: 104_900, workshop: "Depot Söder" },
    { id: "h3", at: "19 Jun 2025", summary: "Tyre rotation, alignment", odo: 96_200, workshop: "Depot Norr" },
  ],
  onClosed,
  className,
}: ServiceLaneDeskProps) {
  const [activeBay, setActiveBay] = React.useState(bay)
  const [rows, setRows] = React.useState(lines)
  const [approved, setApproved] = React.useState<string[]>(lines.filter((l) => !l.advised).map((l) => l.id))
  const [photos_, setPhotos_] = React.useState<UploadFile[]>(photos)
  const [toasts, setToasts] = React.useState<Toast[]>([])
  const [closing, setClosing] = React.useState(false)

  const push = (t: Omit<Toast, "id">) =>
    setToasts((ts) => [...ts.slice(-2), { id: String(Date.now() + Math.random()), ...t }])

  const approvedRows = rows.filter((r) => approved.includes(r.id))
  const labour = approvedRows.reduce((a, r) => a + r.hours * 940, 0)
  const parts = approvedRows.reduce((a, r) => a + r.price, 0)
  const total = labour + parts

  const setLine = (id: string, patch: Partial<LaneLine>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))

  const closeOrder = () => {
    setClosing(true)
    window.setTimeout(() => {
      setClosing(false)
      push({ title: `order closed — ${total.toLocaleString()} kr`, tone: "ok" })
      onClosed?.(total)
    }, 900)
  }

  return (
    <div className={cn("flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Service lane</h2>
        <span className="font-mono text-[12px] text-muted-foreground">{reg}</span>
        <span className="text-[12px] text-muted-foreground">· V90 D4 · owner M. Ahlberg · booked 09:30–14:00</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => push({ title: "keycard sent to front desk printer", tone: "info" })}
            className="flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted"
          >
            <KeySquare className="size-3.5" /> Print keycard
          </button>
          <button
            disabled={closing || approvedRows.length === 0}
            onClick={closeOrder}
            className="flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted disabled:opacity-40"
          >
            <CircleCheck className="size-3.5" /> {closing ? "Closing…" : "Close order"}
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-auto p-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-4">
          {/* bay segment */}
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between gap-3 border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Lane segment</span>
              <SegmentedControl size="sm" value={activeBay} onChange={setActiveBay} options={BAYS} />
            </header>
            <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
              {BAY_ROW.map((b) => (
                <button
                  key={b.bay}
                  onClick={() => setActiveBay(b.bay)}
                  className={cn(
                    "flex flex-col gap-1 bg-background p-3 text-left transition-colors",
                    activeBay === b.bay ? "bg-accent" : "hover:bg-muted/50",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <MonoLabel tick={false} className="text-[10px]">{b.bay.replace("b", "BAY ")}</MonoLabel>
                    <CarFront className={cn("size-4", STATE_TONE[b.state])} />
                  </div>
                  <span className="font-mono text-[12px] font-bold tabular-nums">{b.reg}</span>
                  <span className="text-[11px] text-muted-foreground">{b.model} · {b.tech}</span>
                  <span className={cn("text-[10px] font-bold uppercase tracking-[0.1em]", STATE_TONE[b.state])}>{b.state}</span>
                </button>
              ))}
            </div>
          </section>

          {/* work order lines */}
          <section className="min-w-0 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Work order · {approvedRows.length}/{rows.length} approved
              </span>
              <span className="font-mono text-[12px] tabular-nums">{total.toLocaleString()} kr</span>
            </header>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-8 w-9 px-3" />
                  <TableHead className="h-8 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Operation</TableHead>
                  <TableHead className="h-8 px-2 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Hours</TableHead>
                  <TableHead className="h-8 px-2 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Parts</TableHead>
                  <TableHead className="h-8 px-3 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const on = approved.includes(r.id)
                  return (
                    <TableRow key={r.id} className={cn(!on && "opacity-45")}>
                      <TableCell className="px-3 py-1.5">
                        <Checkbox
                          checked={on}
                          onCheckedChange={(c) => {
                            setApproved((xs) => (c ? [...xs, r.id] : xs.filter((x) => x !== r.id)))
                            if (c && r.advised) push({ title: `advised line accepted — ${r.desc}`, tone: "ok" })
                          }}
                          aria-label={`Approve ${r.desc}`}
                        />
                      </TableCell>
                      <TableCell className="px-2 py-1.5 text-[12px] font-medium">
                        {r.desc}
                        {r.advised && <span className="ml-2 rounded border bg-muted/40 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">advised</span>}
                      </TableCell>
                      <TableCell className="px-2 py-1">
                        <InlineEditCell
                          value={String(r.hours)}
                          name={`hours for ${r.desc}`}
                          mono
                          width={44}
                          onSave={async (v) => {
                            const n = Number(v)
                            if (!isFinite(n) || n < 0 || n > 24) throw new Error("hours")
                            setLine(r.id, { hours: Math.round(n * 10) / 10 })
                          }}
                        />
                      </TableCell>
                      <TableCell className="px-2 py-1 text-center font-mono text-[12px] tabular-nums">{r.partQty}</TableCell>
                      <TableCell className="px-3 py-1.5 text-right font-mono text-[12px] font-bold tabular-nums">
                        {(r.price + r.hours * 940).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            <div className="grid gap-1 border-t px-3 py-2 text-[11px] text-muted-foreground">
              <span>Tap hours to edit · labour rate 940 kr/h · advised lines need a checkbox before close</span>
              <span className="font-mono tabular-nums">labour {labour.toLocaleString()} kr + parts {parts.toLocaleString()} kr</span>
            </div>
          </section>

          {/* damage photos */}
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Damage photos · intake camera</span>
              <span className="font-mono text-[10px] text-muted-foreground">claims ref CL-88214</span>
            </header>
            <div className="p-3">
              <UploadQueue
                files={photos_}
                onRetry={(id) => setPhotos_((fs) => fs.map((f) => (f.id === id ? { ...f, status: "uploading", progress: 8, tries: (f.tries ?? 0) + 1 } : f)))}
                onRemove={(id) => setPhotos_((fs) => fs.filter((f) => f.id !== id))}
              />
            </div>
          </section>
        </div>

        {/* keycard + history rail */}
        <aside className="flex flex-col gap-4">
          <section className="group relative overflow-hidden rounded-lg border bg-card">
            <CornerTicks className="text-muted-foreground/50" />
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Vehicle keycard
            </header>
            <div className="relative p-4">
              <div className="flex items-center justify-between">
                <MonoLabel tick={false} className="text-[10px] text-muted-foreground">Loan pass · day</MonoLabel>
                <KeySquare className="size-4 text-[hsl(var(--info))]" />
              </div>
              <p className="mt-2 font-mono text-[20px] font-black tracking-[0.08em]">{reg}</p>
              <p className="text-[12px] text-muted-foreground">V90 D4 · bay 1 · R. Nyström</p>
              <div className="mt-3 flex h-7 items-end gap-[3px]" aria-hidden>
                {Array.from({ length: 26 }, (_, i) => (
                  <span key={i} className="w-[3px] bg-foreground/70" style={{ height: `${((i * 7) % 17) + 8}px` }} />
                ))}
              </div>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">valid to 20:00 · fuel card pin 8842</p>
            </div>
          </section>

          <section className="flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Service history
              <Wrench className="size-3.5" />
            </header>
            <ol className="p-3">
              {history.map((h, i) => (
                <li key={h.id} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < history.length - 1 && <span aria-hidden className="absolute left-[9px] top-5 h-full w-px bg-border" />}
                  <span className="relative z-10 mt-1 grid size-[19px] shrink-0 place-items-center rounded-full border bg-background text-muted-foreground">
                    <Clock3 className="size-3" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold">{h.summary}</p>
                    <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                      {h.at} · {h.odo.toLocaleString()} km · {h.workshop}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">Odometer photos attach to the claim automatically</div>
          </section>
        </aside>
      </div>

      <AnimatePresence>
        {closing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none fixed inset-0 z-40 grid place-items-center">
            <span className="rounded-md bg-foreground px-4 py-2 text-[12px] font-bold text-background">Closing order · printing job card…</span>
          </motion.div>
        )}
      </AnimatePresence>
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} pos="br" />
    </div>
  )
}
