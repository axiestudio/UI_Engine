import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { Barcode, CircleAlert, RefreshCcw, ScanLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/watermelon/table"
import { OfflineQueueBanner } from "offline-queue-banner"
import { TokenInput } from "token-input"
import { DragNumberField } from "drag-number-field"
import { InlineEditCell } from "inline-edit-cell"
import { JobTray, type Job } from "job-tray"

// COMPOSITE SCREEN · WAREHOUSE CYCLE COUNT
// composed of: token-input (bin scope), drag-number-field (counted cells,
// drag-scrub), inline-edit-cell (count notes), job-tray (sync jobs),
// offline-queue-banner (offline resilience) + purpose-built discrepancy rail.

export type CountRow = {
  id: string
  bin: string
  sku: string
  name: string
  expected: number
  counted: number
  note: string
  accepted?: boolean
}
export type WarehouseScanProps = {
  zone?: string
  device?: string
  rows?: CountRow[]
  jobs?: Job[]
  onSynced?: (variances: number) => void
  className?: string
}

const DEFAULT_ROWS: CountRow[] = [
  { id: "c1", bin: "B07-14", sku: "SKU-88412", name: "Hex bolt M10 · 500 box", expected: 24, counted: 24, note: "" },
  { id: "c2", bin: "B07-14", sku: "SKU-88450", name: "Nyloc nut M10 · 200 box", expected: 12, counted: 10, note: "two boxes torn, stock written off" },
  { id: "c3", bin: "B08-02", sku: "SKU-90117", name: "Bearing 6204-2RS", expected: 40, counted: 44, note: "" },
  { id: "c4", bin: "B08-07", sku: "SKU-90233", name: "Circlip pliers 180 mm", expected: 6, counted: 6, note: "" },
  { id: "c5", bin: "B08-07", sku: "SKU-90310", name: "T-handle key set", expected: 9, counted: 0, note: "" },
]

const DEFAULT_JOBS: Job[] = [
  { id: "j1", label: "Push variance report · zone B", status: "running", progress: 64, log: ["packing 5 lines", "waiting on B08-07 recount"] },
  { id: "j2", label: "Pull item master diff", status: "queued" },
  { id: "j3", label: "Reprint shelf labels B07", status: "done", log: ["12 labels"] },
]

const binOk = (t: string) => /^B\d{2}-\d{2}$/.test(t)

export function WarehouseScan({
  zone = "Zone B · fast movers",
  device = "MC9300-04",
  rows = DEFAULT_ROWS,
  jobs = DEFAULT_JOBS,
  onSynced,
  className,
}: WarehouseScanProps) {
  const [sheet, setSheet] = React.useState(rows)
  const [bins, setBins] = React.useState<string[]>(["B07-14", "B08-02", "B08-07"])
  const [jobList, setJobList] = React.useState(jobs)
  const [online, setOnline] = React.useState(false)
  const [queued, setQueued] = React.useState(3)
  const [flushing, setFlushing] = React.useState(false)
  const [lastScan, setLastScan] = React.useState<{ bin: string; at: string } | null>(null)

  const setCounted = (id: string, v: number) =>
    setSheet((rs) => rs.map((r) => (r.id === id ? { ...r, counted: v } : r)))
  const setNote = async (id: string, v: string) => {
    setSheet((rs) => rs.map((r) => (r.id === id ? { ...r, note: v } : r)))
  }

  const variances = sheet.filter((r) => r.counted !== r.expected && !r.accepted)
  const netVariance = sheet.reduce((a, r) => a + (r.counted - r.expected), 0)

  const addBin = (list: string[]) => {
    const fresh = list.filter((b) => !sheet.some((r) => r.bin === b))
    if (!fresh.length) return
    const added: CountRow[] = fresh.map((b) => ({
      id: "c" + Date.now() + b,
      bin: b,
      sku: "SKU-" + String(91000 + Math.floor(Math.random() * 900)),
      name: "Unmapped item — scan to identify",
      expected: 0,
      counted: 0,
      note: "",
    }))
    setSheet((rs) => [...rs, ...added])
    setLastScan({ bin: fresh[fresh.length - 1], at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) })
  }

  const retryNow = () => {
    setFlushing(true)
    window.setTimeout(() => {
      setFlushing(false)
      setQueued(0)
      setOnline(true)
      setJobList((js) => js.map((j) => (j.status === "running" ? { ...j, status: "done", progress: 100 } : j)))
      onSynced?.(variances.length)
    }, 1500)
  }

  const scanNext = () => {
    const candidates = sheet.filter((r) => r.counted === r.expected)
    const pick = candidates[Math.floor(Math.random() * candidates.length)] ?? sheet[0]
    setLastScan({ bin: pick.bin, at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) })
  }

  return (
    <div className={cn("relative isolate flex min-h-[540px] w-full flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <MotionConfig reducedMotion="user">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Cycle count</h2>
        <span className="text-[12px] text-muted-foreground">{zone}</span>
        <span className="font-mono text-[12px] text-muted-foreground">· {device}</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1 font-mono text-[11px] tabular-nums text-muted-foreground">
            <ScanLine className={cn("size-3.5", lastScan && "text-[hsl(var(--ok))]")} aria-hidden />
            {lastScan ? `last scan ${lastScan.bin} · ${lastScan.at}` : "no scans yet"}
          </span>
          <Button type="button" variant="ghost" onClick={scanNext} className="flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted">
            <Barcode className="size-3.5" /> Scan next
          </Button>
          
    </div>
      </header>

      <div className="border-b bg-background px-4 py-2.5">
        <OfflineQueueBanner online={online} queued={queued} flushing={flushing} onRetryNow={retryNow} />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-auto p-4 lg:grid-cols-[280px_minmax(0,1fr)_280px]">
        {/* bin scope + sync jobs */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Bin scope
            </header>
            <div className="p-3">
              <TokenInput
                label="Bins"
                value={bins}
                onChange={addBin}
                placeholder="Scan or type B07-14…"
                validate={(t) => (binOk(t.toUpperCase()) ? null : "bins read like B07-14")}
              />
              <p className="mt-2 text-[11px] text-muted-foreground">Adding an unknown bin opens a blank count line — identify it by scan.</p>
            </div>
          </section>

          <section className="flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Sync jobs
              <RefreshCcw className={cn("size-3.5", flushing && "motion-safe:motion-safe:motion-safe:animate-spin")} />
            </header>
            <div className="p-3">
              <JobTray
                jobs={jobList}
                onCancel={(j) => setJobList((js) => js.map((x) => (x.id === j.id ? { ...x, status: "error", log: [...(x.log ?? []), "cancelled by operator"] } : x)))}
                onDismiss={(id) => setJobList((js) => js.filter((x) => x.id !== id))}
              />
            </div>
          </section>
        </aside>

        {/* count sheet */}
        <section className="min-w-0 overflow-hidden rounded-lg border bg-card">
          <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Count sheet · {sheet.length} lines</span>
            <span className="font-mono text-[12px] tabular-nums">
              net variance <b className={cn(netVariance === 0 ? "text-[hsl(var(--ok))]" : netVariance < 0 ? "text-[hsl(var(--err))]" : "text-[hsl(var(--warn))]")}>{netVariance > 0 ? `+${netVariance}` : netVariance}</b>
            </span>
          </header>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-8 px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Bin / SKU</TableHead>
                <TableHead className="h-8 px-2 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Expected</TableHead>
                <TableHead className="h-8 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Counted</TableHead>
                <TableHead className="h-8 px-2 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Var</TableHead>
                <TableHead className="h-8 px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sheet.map((r) => {
                const v = r.counted - r.expected
                return (
                  <TableRow key={r.id}>
                    <TableCell className="px-3 py-1.5">
                      <p className="font-mono text-[12px] font-bold">{r.bin}</p>
                      <p className="text-[11px] text-muted-foreground">{r.sku} · {r.name}</p>
                    </TableCell>
                    <TableCell className="px-2 py-1.5 text-right font-mono text-[12px] tabular-nums">{r.expected}</TableCell>
                    <TableCell className="px-2 py-1">
                      <DragNumberField value={r.counted} onValueChange={(nv) => setCounted(r.id, nv)} step={1} precision={0} min={0} max={9999} className="w-full justify-end" />
                    </TableCell>
                    <TableCell className={cn("px-2 py-1.5 text-right font-mono text-[12px] font-bold tabular-nums", v === 0 && "text-muted-foreground", v < 0 && "text-[hsl(var(--err))]", v > 0 && "text-[hsl(var(--warn))]")}>
                      {v > 0 ? `+${v}` : v}
                    </TableCell>
                    <TableCell className="px-3 py-1">
                      <InlineEditCell value={r.note} name={`note for ${r.sku}`} width={150} onSave={async (nv) => setNote(r.id, nv)} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">
            Drag the counted cell sideways to scrub (Shift ×10) · notes attach to the variance line
          </div>
        </section>

        {/* discrepancy rail */}
        <aside className="flex flex-col gap-4">
          <section className="flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Discrepancies
              <span className="font-mono text-[10px] normal-case tracking-normal">{variances.length} open</span>
            </header>
            <ul className="grid gap-2 p-3">
              <AnimatePresence initial={false}>
                {variances.map((r) => {
                  const v = r.counted - r.expected
                  return (
                    <motion.li key={r.id} layout initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                      <div className={cn("rounded-md border p-2.5", v < 0 ? "border-[hsl(var(--err)/0.4)]" : "border-[hsl(var(--warn)/0.5)]")}>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
                            <CircleAlert className={cn("size-3.5", v < 0 ? "text-[hsl(var(--err))]" : "text-[hsl(var(--warn))]")} />
                            {r.sku}
                          </span>
                          <span className={cn("font-mono text-[12px] font-bold tabular-nums", v < 0 ? "text-[hsl(var(--err))]" : "text-[hsl(var(--warn))]")}>
                            {v > 0 ? `+${v}` : v}
                          </span>
                        </div>
                        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                          {r.bin} · expected {r.expected} · counted {r.counted}
                        </p>
                        <div className="mt-2 flex gap-1.5">
                          <Button type="button" variant="ghost"
                            onClick={() => setSheet((rs) => rs.map((x) => (x.id === r.id ? { ...x, accepted: true } : x)))}
                            className="h-6 flex-1 rounded border bg-background text-[10px] font-bold uppercase tracking-wide hover:bg-muted"
                          >
                            Accept
                          </Button>
                          <Button type="button" variant="ghost"
                            onClick={() => setCounted(r.id, r.expected)}
                            className="h-6 flex-1 rounded border bg-background text-[10px] font-bold uppercase tracking-wide hover:bg-muted"
                          >
                            Set to expected
                          </Button>
                        </div>
                      </div>
                    </motion.li>
                  )
                })}
              </AnimatePresence>
              {!variances.length && (
                <li className="rounded-md border border-dashed p-4 text-center text-[11px] text-muted-foreground">
                  Rail clear — every line matches or is accepted.
                </li>
              )}
            </ul>
          </section>

          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Shift tally
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px] text-muted-foreground">{device}</span>
            </header>
            <div className="space-y-1.5 p-3 text-[12px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lines counted</span>
                <span className="font-mono font-bold tabular-nums">{sheet.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Variances accepted</span>
                <span className="font-mono font-bold tabular-nums">{sheet.filter((r) => r.accepted).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Held offline</span>
                <span className="font-mono font-bold tabular-nums">{online ? 0 : queued}</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
          </MotionConfig>
    </div>
  )
}
