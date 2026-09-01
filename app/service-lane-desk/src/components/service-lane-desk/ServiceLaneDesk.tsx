import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { Camera, CircleCheck, Clock3, KeySquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, CornerTicks } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/watermelon/table"
import { Checkbox } from "@/components/watermelon/checkbox"
import { UploadQueue, type UploadFile } from "upload-queue"
import { InlineEditCell } from "inline-edit-cell"
import { SegmentedControl } from "segmented-control"
import { ToastStack, type Toast } from "toast-stack"
import { BarChart, Bar, Grid, BarXAxis, BarYAxis, ChartTooltip } from "@/components/bklit"

// COMPOSITE SCREEN · AUTO SERVICE LANE — lane-band build
// Structure: frameless full-bleed shell. The lane runs as a full-width band:
// bay utilisation (vendored Bklit stacked BarChart — hours booked vs open per
// bay, hover tooltip) wired to live bay state; the work order and the damage
// photo intake sit below; the right rail is bare — keycard pass + service
// history timeline, no floating card roster.
// Composed of: upload-queue · inline-edit-cell · segmented-control ·
// toast-stack · vendored bklit BarChart · shadcn Button · handcraft kit.

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

export type BayRow = { bay: string; reg: string; model: string; state: BayState; tech: string }

const DEFAULT_BAY_ROW: BayRow[] = [
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

/** Shift hours a bay spends in each state today — the utilisation ledger. */
const STATE_HOURS: Record<BayState, number> = {
  empty: 0,
  intake: 2,
  "on-lift": 3.5,
  "road-test": 1.5,
  ready: 1,
}
const SHIFT_HOURS = 7.5

const STATE_TONE: Record<BayState, string> = {
  empty: "text-muted-foreground",
  intake: "text-[hsl(var(--info))]",
  "on-lift": "text-[hsl(var(--warn))]",
  "road-test": "text-[hsl(var(--pinned))]",
  ready: "text-[hsl(var(--ok))]",
}

const BOOKED_COLOR = "var(--chart-2)"
const OPEN_COLOR = "var(--chart-grid)"

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
  const [bayRow, setBayRow] = React.useState<BayRow[]>(DEFAULT_BAY_ROW)
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
  const activeCar = bayRow.find((b) => b.bay === activeBay) ?? bayRow[0]

  // bay utilisation derives from live bay state — closing an order re-draws it
  const utilisation = React.useMemo(
    () =>
      bayRow.map((b) => {
        const booked = STATE_HOURS[b.state]
        return { bay: b.bay.replace("b", "B").toUpperCase(), booked, open: Math.round((SHIFT_HOURS - booked) * 10) / 10 }
      }),
    [bayRow],
  )
  const bookedTotal = utilisation.reduce((a, u) => a + u.booked, 0)

  const setLine = (id: string, patch: Partial<LaneLine>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))

  const closeOrder = () => {
    setClosing(true)
    window.setTimeout(() => {
      setClosing(false)
      setBayRow((bs) => bs.map((b) => (b.bay === activeBay && b.state !== "empty" ? { ...b, state: "ready" } : b)))
      push({ title: `order closed — ${total.toLocaleString()} kr · ${activeBay.replace("b", "bay ").toUpperCase()} released to ready`, tone: "ok" })
      onClosed?.(total)
    }, 900)
  }

  return (
    <div className={cn("flex flex-col overflow-hidden border-y bg-background font-sans text-foreground", className)}>
      {/* header — plain label voice */}
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-5 py-3">
        <h2 className="text-[15px] font-semibold leading-tight">Service lane</h2>
        <span className="font-mono text-[12px] text-muted-foreground">{reg}</span>
        <span className="min-w-0 truncate text-[12px] text-muted-foreground">· {activeCar.model} · owner M. Ahlberg · booked 09:30–14:00</span>
        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={() => push({ title: "keycard sent to front desk printer", tone: "info" })}>
            <KeySquare aria-hidden /> Print keycard
          </Button>
          <Button size="sm" disabled={closing || approvedRows.length === 0} onClick={closeOrder}>
            <CircleCheck aria-hidden /> {closing ? "Closing…" : "Close order"}
          </Button>
        </div>
      </header>

      {/* lane band — bay utilisation across the shop floor */}
      <section aria-label="Bay utilisation" className="border-b bg-muted/30 px-4 pb-2 pt-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <MonoLabel tick={false} className="text-[10px] text-muted-foreground">Bay utilisation · hours booked vs open</MonoLabel>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{bookedTotal.toFixed(1)} of {(SHIFT_HOURS * bayRow.length).toFixed(1)} shift-hours</span>
            <SegmentedControl size="sm" value={activeBay} onChange={setActiveBay} options={BAYS} />
          </div>
        </div>
        <div role="img" aria-label={`Bay utilisation, hours booked versus open across ${bayRow.length} bays — ${bookedTotal.toFixed(1)} booked of ${SHIFT_HOURS * bayRow.length} shift-hours`} className="px-1 pt-1.5">
          <BarChart
            data={utilisation}
            xDataKey="bay"
            stacked
            barGap={0.32}
            aspectRatio="4.4 / 1"
            animationDuration={900}
            margin={{ top: 8, right: 8, bottom: 22, left: 30 }}
          >
            <Grid horizontal numTicksRows={3} vertical={false} strokeDasharray="3,5" strokeOpacity={0.8} />
            <Bar dataKey="booked" fill={BOOKED_COLOR} lineCap={2} yAxisId="left" minBarHeight={2} />
            <Bar dataKey="open" fill={OPEN_COLOR} lineCap={2} yAxisId="left" minBarHeight={2} />
            <BarYAxis />
            <BarXAxis maxLabels={4} />
            <ChartTooltip
              rows={(p) => [
                { color: BOOKED_COLOR, label: "booked", value: `${Number(p.booked).toFixed(1)} h` },
                { color: OPEN_COLOR, label: "open", value: `${Number(p.open).toFixed(1)} h` },
              ]}
            />
          </BarChart>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t px-2 py-1.5">
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
            <span aria-hidden className="size-2 rounded-[2px]" style={{ background: BOOKED_COLOR }} /> booked
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
            <span aria-hidden className="size-2 rounded-[2px]" style={{ background: OPEN_COLOR }} /> open
          </span>
          <span className="ml-auto flex flex-wrap gap-1.5">
            {bayRow.map((b) => (
              <Button
                key={b.bay}
                size="xs"
                variant={activeBay === b.bay ? "secondary" : "ghost"}
                aria-pressed={activeBay === b.bay}
                onClick={() => setActiveBay(b.bay)}
                className={cn("rounded-full font-mono tabular-nums", activeBay !== b.bay && "text-muted-foreground")}
              >
                {b.bay.replace("b", "B").toUpperCase()} · {b.reg} · <span className={cn("font-sans", STATE_TONE[b.state])}>{b.state}</span>
              </Button>
            ))}
          </span>
        </div>
      </section>

      {/* main — work ledger + intake, bare right rail */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col lg:col-span-7">
          {/* work order ledger */}
          <section aria-label="Work order" className="min-w-0 border-b">
            <div className="flex items-baseline justify-between border-b px-4 py-2">
              <MonoLabel tick={false} className="text-[10px] text-muted-foreground">Work order · {approvedRows.length}/{rows.length} approved</MonoLabel>
              <span className="font-mono text-[12px] font-bold tabular-nums">{total.toLocaleString()} kr</span>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-8 w-9 px-4" />
                  <TableHead className="h-8 px-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Operation</TableHead>
                  <TableHead className="h-8 px-2 text-center text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Hours</TableHead>
                  <TableHead className="h-8 px-2 text-center text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Parts</TableHead>
                  <TableHead className="h-8 px-4 text-right text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const on = approved.includes(r.id)
                  return (
                    <TableRow key={r.id} className={cn(!on && "opacity-45")}>
                      <TableCell className="px-4 py-1.5">
                        <Checkbox
                          checked={on}
                          onCheckedChange={(c) => {
                            setApproved((xs) => (c ? [...xs, r.id] : xs.filter((x) => x !== r.id)))
                            if (c && r.advised) push({ title: `advised line accepted — ${r.desc}`, tone: "ok" })
                          }}
                          aria-label={`Approve ${r.desc}`}
                        />
                      </TableCell>
                      <TableCell className="px-2 py-1.5 text-[12.5px] font-medium">
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
                      <TableCell className="px-4 py-1.5 text-right font-mono text-[12px] font-bold tabular-nums">
                        {(r.price + r.hours * 940).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            <div className="flex flex-wrap gap-x-4 border-t px-4 py-2 text-[11px] text-muted-foreground">
              <span>Tap hours to edit · labour rate 940 kr/h</span>
              <span className="font-mono tabular-nums">labour {labour.toLocaleString()} + parts {parts.toLocaleString()} kr</span>
            </div>
          </section>

          {/* damage photo intake — dashed surface, camera-trap feel */}
          <section aria-label="Damage photos" className="min-h-0 flex-1 p-3">
            <div className="flex h-full flex-col rounded-lg border border-dashed bg-muted/20 p-3">
              <div className="flex items-baseline justify-between">
                <span className="flex items-baseline gap-2">
                  <Camera className="size-3.5 shrink-0 translate-y-0.5 text-muted-foreground" aria-hidden />
                  <MonoLabel tick={false} className="text-[10px] text-muted-foreground">Damage photos · intake camera</MonoLabel>
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">claims ref CL-88214</span>
              </div>
              <div className="mt-2.5">
                <UploadQueue
                  files={photos_}
                  className="rounded-none border-0 bg-transparent p-0 shadow-none"
                  onRetry={(id) => setPhotos_((fs) => fs.map((f) => (f.id === id ? { ...f, status: "uploading", progress: 8, tries: (f.tries ?? 0) + 1 } : f)))}
                  onRemove={(id) => setPhotos_((fs) => fs.filter((f) => f.id !== id))}
                />
              </div>
            </div>
          </section>
        </div>

        {/* bare right rail — pass + history, separated by rules not cards */}
        <aside aria-label="Vehicle rail" className="flex min-w-0 flex-col border-t lg:col-span-5 lg:border-t-0 lg:border-l">
          {/* vehicle keycard pass */}
          <section className="group relative overflow-hidden border-b px-4 py-4" aria-label="Vehicle keycard">
            <CornerTicks className="text-muted-foreground/50" />
            <div className="flex items-center justify-between">
              <MonoLabel tick={false} className="text-[10px] text-muted-foreground">Loan pass · day</MonoLabel>
              <KeySquare className="size-4 text-[hsl(var(--info))]" aria-hidden />
            </div>
            <p className="mt-2 font-mono text-[20px] font-bold tracking-[0.08em]">{activeCar.reg}</p>
            <p className="text-[12px] text-muted-foreground">{activeCar.model} · {activeBay.replace("b", "bay ").toUpperCase()} · {activeCar.tech}</p>
            <div className="mt-3 flex h-7 items-end gap-[3px]" aria-hidden>
              {Array.from({ length: 26 }, (_, i) => (
                <span key={i} className="w-[3px] bg-foreground/70" style={{ height: `${((i * 7) % 17) + 8}px` }} />
              ))}
            </div>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">valid to 20:00 · fuel card pin 8842</p>
          </section>

          {/* service history rail */}
          <section aria-label="Service history" className="min-h-0 flex-1 px-4 py-3">
            <MonoLabel tick={false} className="text-[10px] text-muted-foreground">Service history</MonoLabel>
            <ol className="mt-2.5">
              {history.map((h, i) => (
                <li key={h.id} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < history.length - 1 && <span aria-hidden className="absolute left-[9px] top-5 h-full w-px bg-border" />}
                  <span className="relative z-10 mt-1 grid size-[19px] shrink-0 place-items-center rounded-full border bg-background text-muted-foreground">
                    <Clock3 className="size-3" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold">{h.summary}</p>
                    <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                      {h.at} · {h.odo.toLocaleString()} km · {h.workshop}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
          <p className="border-t px-4 py-2 text-[11px] text-muted-foreground">Odometer photos attach to the claim automatically · closing an order sets the bay to ready</p>
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
