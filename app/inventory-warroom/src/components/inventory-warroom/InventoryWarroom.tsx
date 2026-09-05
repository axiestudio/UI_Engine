import { useMemo, useState } from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { RefreshCw, ScatterChart as ScatterChartIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/watermelon/checkbox"
import { Button } from "@/components/ui/button"
import { TreeGridTable, type TreeNode } from "tree-grid-table"
import { SparklineCell } from "sparkline-cell"
import { FilterTokenBuilder, type FilterToken } from "filter-token-builder"
import { JobTray, type Job } from "job-tray"
import { StatusHealthStrip, type Service } from "status-health-strip"
import { ScatterChart, Scatter, Grid, XAxis, YAxis, ChartTooltip } from "@/components/bklit"

// COMPOSITE SCREEN · STOCK CONTROL WAR ROOM
// composed of: tree-grid-table (lazy category tree), sparkline-cell (per-row
// movement with crosshair tooltips), filter-token-builder (stock queries that
// scope BOTH the table and the new scatter), job-tray (receive docs + cycle
// counts), status-health-strip (sync strip) + a vendored Bklit ScatterChart —
// days-of-stock (x) vs pick velocity (y), one point per SKU, colored by
// stock-status band.
//
// Layout is domain-shaped: a full-width sync band and query band set context;
// the aisle rail (3/12) carries the lazy tree plus count rules; the ledger
// (5/12) is the primary surface; the scatter (4/12) is the aerial view.

export type SkuRow = {
  id: string
  name: string
  sku: string
  zone: "cold" | "dry" | "bond"
  onHand: number
  reserved: number
  trail: number[]
}

export type InventoryWarroomProps = {
  warehouse?: string
  skus?: SkuRow[]
  onQueued?: (label: string) => void
  className?: string
}

const DEFAULT_SKUS: SkuRow[] = [
  { id: "s1", name: "Oat base 12 l", sku: "HTW-0114", zone: "dry", onHand: 34, reserved: 6, trail: [12, 18, 9, 14, 22, 17, 26] },
  { id: "s2", name: "Cold brew 250 ml", sku: "HTW-0207", zone: "cold", onHand: 11, reserved: 4, trail: [30, 41, 38, 45, 52, 44, 58] },
  { id: "s3", name: "Oat drink barista 1 l", sku: "HTW-0203", zone: "cold", onHand: 8, reserved: 12, trail: [40, 36, 44, 39, 47, 51, 49] },
  { id: "s4", name: "Cocoa tin 750 g", sku: "HTW-0441", zone: "dry", onHand: 62, reserved: 3, trail: [8, 6, 11, 7, 9, 5, 12] },
  { id: "s5", name: "Bonded gift set A4", sku: "HTW-0812", zone: "bond", onHand: 19, reserved: 15, trail: [4, 9, 6, 12, 8, 14, 11] },
  { id: "s6", name: "Cold foam charger", sku: "HTW-0290", zone: "cold", onHand: 4, reserved: 2, trail: [15, 12, 18, 9, 14, 11, 16] },
  { id: "s7", name: "Filter paper 200 pk", sku: "HTW-0448", zone: "dry", onHand: 88, reserved: 10, trail: [20, 16, 24, 18, 22, 15, 26] },
]

const DEFAULT_TREE: TreeNode[] = [
  {
    id: "aisle-a",
    label: "Aisle A — dry goods",
    meta: "2 bins · 48 SKU",
    children: [
      { id: "a-01", label: "A-01 · pasta & grains", meta: "26 SKU" },
      { id: "a-04", label: "A-04 · tins & cocoa", meta: "22 SKU" },
    ],
  },
  { id: "aisle-b", label: "Aisle B — cold", meta: "lazy" },
  { id: "aisle-c", label: "Aisle C — bonded", meta: "lazy" },
]

const BINS: Record<string, TreeNode[]> = {
  "aisle-b": [
    { id: "b-01", label: "B-01 · dairy & oat", meta: "31 SKU" },
    { id: "b-02", label: "B-02 · produce", meta: "17 SKU" },
  ],
  "aisle-c": [{ id: "c-01", label: "C-01 · bonded sets", meta: "12 SKU" }],
}

const DEFAULT_JOBS: Job[] = [
  { id: "j1", label: "ASN 8841 · 40 cartons oat drink", status: "running", progress: 64, log: ["dock 2 · received 26/40"] },
  { id: "j2", label: "ASN 8855 · 12 cartons chargers", status: "queued" },
]

const SERVICES: Service[] = [
  { name: "ERP sync", state: "operational", region: "wh-2", note: "delta 12 s" },
  { name: "Scanner gate", state: "degraded", region: "wh-2", note: "2 handhelds offline" },
  { name: "Carrier feed", state: "operational", region: "wh-2", note: "postnord ok" },
]

// ── stock vs velocity model ──────────────────────────────────────────────
// velocity = mean daily picks over the 7-day trail (units/day);
// days-of-stock = available (on hand − reserved) ÷ velocity.

type Band = "critical" | "low" | "healthy" | "surplus"

const velocityOf = (s: SkuRow) => {
  const total = s.trail.reduce((a, b) => a + b, 0)
  return Math.max(0.1, Number((total / s.trail.length).toFixed(1)))
}
const daysOfStock = (s: SkuRow) =>
  Math.max(0, Number(((s.onHand - s.reserved) / velocityOf(s)).toFixed(1)))
const bandOf = (dos: number): Band =>
  dos < 4 ? "critical" : dos < 10 ? "low" : dos < 24 ? "healthy" : "surplus"

const BAND_META: Record<Band, { token: string; label: string }> = {
  critical: { token: "var(--chart-5)", label: "critical < 4 d" },
  low: { token: "var(--chart-4)", label: "low < 10 d" },
  healthy: { token: "var(--chart-3)", label: "healthy < 24 d" },
  surplus: { token: "var(--chart-1)", label: "surplus ≥ 24 d" },
}

type ScatterPoint = {
  dos: number
  vel: number
  band: Band
  name: string
  sku: string
  zone: SkuRow["zone"]
  onHand: number
  reserved: number
  date: Date
  vCritical?: number
  vLow?: number
  vHealthy?: number
  vSurplus?: number
}

const toScatterPoint = (s: SkuRow): ScatterPoint => {
  const vel = velocityOf(s)
  const dos = daysOfStock(s)
  const band = bandOf(dos)
  return {
    dos,
    vel,
    band,
    name: s.name,
    sku: s.sku,
    zone: s.zone,
    onHand: s.onHand,
    reserved: s.reserved,
    date: new Date(dos * 86_400_000),
    vCritical: band === "critical" ? vel : undefined,
    vLow: band === "low" ? vel : undefined,
    vHealthy: band === "healthy" ? vel : undefined,
    vSurplus: band === "surplus" ? vel : undefined,
  }
}

export function InventoryWarroom({ warehouse = "WH-2 · Solna", skus = DEFAULT_SKUS, onQueued, className }: InventoryWarroomProps) {
  const [tokens, setTokens] = useState<FilterToken[]>([
    { field: "zone", op: "=", value: "cold" },
    { field: "state", op: "=", value: "low" },
  ])
  const [and, setAnd] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [jobs, setJobs] = useState<Job[]>(DEFAULT_JOBS)
  const [services, setServices] = useState<Service[]>(SERVICES)
  const [syncing, setSyncing] = useState(false)
  const [tree] = useState(DEFAULT_TREE)

  const matches = (s: SkuRow) => {
    const test = (t: FilterToken) => {
      if (t.field === "zone") return t.op === "=" ? s.zone === t.value : t.op === "≠" ? s.zone !== t.value : s.zone.includes(t.value)
      if (t.field === "state") {
        const low = s.onHand - s.reserved < 25
        return t.op === "=" ? low : !low
      }
      const hit = s.name.toLowerCase().includes(t.value.toLowerCase())
      return t.op === "≠" ? !hit : hit
    }
    return and ? tokens.every(test) : tokens.some(test)
  }

  const visible = skus.filter(matches)

  // One shared filtered model drives BOTH the table and the scatter — that is
  // the functional win of the token band living above both surfaces.
  // Sorted by days-of-stock so the chart's date bisector hovers the nearest SKU.
  const scatterPoints = useMemo(
    () => visible.map(toScatterPoint).sort((a, b) => a.dos - b.dos),
    [visible],
  )
  const criticalCount = scatterPoints.filter((p) => p.band === "critical").length

  const toggleSel = (id: string, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  const queueCount = () => {
    const label = `Cycle count · ${selected.size} SKU · ${visible.find((s) => selected.has(s.id))?.zone ?? "mix"}`
    const id = "j" + String(Date.now())
    setJobs((js) => [...js, { id, label, status: "running", progress: 8 }])
    setSelected(new Set())
    onQueued?.(label)
    setTimeout(() => setJobs((js) => js.map((j) => (j.id === id ? { ...j, status: "done", progress: 100, log: ["variance 0 · posted"] } : j))), 1600)
  }

  const resync = () => {
    setSyncing(true)
    setTimeout(() => {
      setSyncing(false)
      setServices((ss) => ss.map((s) => (s.name === "Scanner gate" ? { ...s, state: "operational", note: "all handhelds back" } : s)))
    }, 1400)
  }

  const loadChildren = (n: TreeNode) => new Promise<TreeNode[]>((resolve) => setTimeout(() => resolve(BINS[n.id] ?? []), 500))

  const zoneTone: Record<SkuRow["zone"], string> = {
    cold: "text-[hsl(var(--info))]",
    dry: "text-muted-foreground",
    bond: "text-[hsl(var(--warn))]",
  }

  return (
    <div className={cn("relative isolate flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <MotionConfig reducedMotion="user">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Stock control</h2>
        <span className="text-[12px] text-muted-foreground">{warehouse}</span>
        <span className="text-[12px] text-muted-foreground">· {visible.length} of {skus.length} SKU shown</span>
        {criticalCount > 0 && (
          <span className="rounded border border-[hsl(var(--err)/0.4)] px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-[hsl(var(--err))]">
            {criticalCount} critical
          </span>
        )}
        <Button variant="outline" size="sm" onClick={resync} disabled={syncing} className="ml-auto gap-1.5">
          <RefreshCw className={cn("size-3.5", syncing && "motion-safe:motion-safe:motion-safe:animate-spin")} /> {syncing ? "Resyncing…" : "Resync ERP"}
        </Button>
      </header>

      {/* sync strip band */}
      <div className="px-4 pt-4">
        <section className="overflow-hidden rounded-lg border bg-card">
          <StatusHealthStrip services={services} region="wh-2" />
        </section>
          
    </div>

      {/* query band — tokens scope the ledger AND the scatter */}
      <div className="px-4 pt-3">
        <section className="rounded-lg border bg-card px-3 py-2.5">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-[13px] font-bold">Stock query</h3>
            <span className="text-[11px] text-muted-foreground">
              scopes the aisle ledger and the stock-vs-velocity scatter · {scatterPoints.length} plotted
            </span>
          </div>
          <FilterTokenBuilder
            tokens={tokens}
            onChange={setTokens}
            and={and}
            onAnd={setAnd}
            fields={["zone", "state", "name"]}
            placeholder="filter stock — zone cold · state low · name foam"
          />
        </section>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 items-start gap-4 p-4 lg:grid-cols-12">
        {/* aisle rail — lazy tree + bare count rules */}
        <aside className="flex min-h-0 flex-col gap-4 lg:col-span-3">
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Aisles</span>
              <span className="font-mono text-[10px] uppercase text-muted-foreground">lazy</span>
            </header>
            <div className="min-h-0 flex-1 overflow-auto p-2">
              <TreeGridTable bare nodes={tree} loadChildren={loadChildren} defaultOpen={["aisle-a"]} />
            </div>
            <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">Bins load on expand · counts reconcile nightly at 02:00.</div>
          </section>
          <section className="rounded-lg border border-dashed bg-background/60 p-3">
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Cycle count rules</h3>
            <div className="space-y-1.5 text-[12px]">
              <div className="flex justify-between"><span className="text-muted-foreground">Cold zone</span><span className="font-mono tabular-nums">weekly</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Dry zone</span><span className="font-mono tabular-nums">monthly</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Bonded</span><span className="font-mono tabular-nums">per movement</span></div>
            </div>
            <p className="pt-2 text-[11px] leading-relaxed text-muted-foreground">Counts post variances directly to ERP — no separate journal.</p>
          </section>
        </aside>

        {/* aisle ledger — primary surface */}
        <section className="flex min-h-0 min-w-0 flex-col gap-3 overflow-hidden rounded-lg border bg-card p-3 lg:col-span-5">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr className="border-b text-left text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  <th className="w-8 px-2 py-1.5" />
                  <th className="px-3 py-1.5 font-semibold">SKU</th>
                  <th className="w-16 px-2 py-1.5 font-semibold">Zone</th>
                  <th className="w-20 px-2 py-1.5 text-right font-semibold">On hand</th>
                  <th className="w-20 px-2 py-1.5 text-right font-semibold">Reserved</th>
                  <th className="w-28 px-2 py-1.5 text-right font-semibold">7-day pick</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((s) => (
                  <tr key={s.id} className={cn("border-b border-border/60 last:border-0", selected.has(s.id) && "bg-accent/40")}>
                    <td className="px-2 py-1">
                      <Checkbox checked={selected.has(s.id)} onCheckedChange={(v) => toggleSel(s.id, v === true)} aria-label={`Select ${s.name}`} />
                    </td>
                    <td className="px-3 py-1">
                      <span className="block font-medium leading-snug">{s.name}</span>
                      <span className="block font-mono text-[11px] tabular-nums text-muted-foreground">{s.sku}</span>
                    </td>
                    <td className={cn("px-2 py-1 text-[11px] font-semibold uppercase", zoneTone[s.zone])}>{s.zone}</td>
                    <td className={cn("px-2 py-1 text-right font-mono tabular-nums", s.onHand < 25 && "text-[hsl(var(--warn))]")}>{s.onHand}</td>
                    <td className="px-2 py-1 text-right font-mono tabular-nums text-muted-foreground">{s.reserved}</td>
                    <td className="px-2 py-1">
                      <div className="flex justify-end">
                        <SparklineCell values={s.trail} width={84} height={20} />
                      </div>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr><td colSpan={6} className="px-3 py-6 text-center text-[12px] text-muted-foreground">No SKU matches the current tokens.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <AnimatePresence>
            {selected.size > 0 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="mt-auto flex items-center gap-2 rounded-md border bg-accent/50 px-3 py-2">
                <span className="text-[12px] font-semibold">{selected.size} selected for cycle count</span>
                <Button size="sm" onClick={queueCount} className="ml-auto">Queue count</Button>
                <Button size="icon-sm" variant="ghost" onClick={() => setSelected(new Set())} aria-label="Clear selection">
                  <X className="size-3.5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* stock vs velocity — aerial view, colored by status band */}
        <aside className="flex min-h-0 flex-col gap-4 lg:col-span-4">
          <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border bg-card">
            <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b bg-muted/30 px-3 py-2">
              <h3 className="flex items-center gap-1.5 font-display text-[13px] font-bold">
                <ScatterChartIcon className="size-3.5 text-muted-foreground" aria-hidden /> Stock vs velocity
              </h3>
              <div className="ml-auto flex flex-wrap gap-x-3 gap-y-1">
                {(Object.keys(BAND_META) as Band[]).map((b) => (
                  <span key={b} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="size-2 rounded-full" style={{ background: BAND_META[b].token }} aria-hidden />
                    {BAND_META[b].label}
                  </span>
                ))}
              </div>
            </header>
            <div className="min-h-0 flex-1 p-3" role="img" aria-label="Scatter of days of stock versus pick velocity, one point per SKU, colored by stock status band">
              {scatterPoints.length > 0 ? (
                <ScatterChart
                  data={scatterPoints}
                  xDataKey="date"
                  aspectRatio="4 / 3"
                  animationDuration={900}
                  margin={{ top: 14, right: 14, bottom: 28, left: 40 }}
                  xLabelFmt={(d) => `${d.dos}d`}
                >
                  <Grid horizontal numTicksRows={4} vertical numTicksColumns={5} fadeHorizontal={false} fadeVertical={false} />
                  <Scatter dataKey="vCritical" fill={BAND_META.critical.token} radius={5.5} />
                  <Scatter dataKey="vLow" fill={BAND_META.low.token} radius={5.5} />
                  <Scatter dataKey="vHealthy" fill={BAND_META.healthy.token} radius={5.5} />
                  <Scatter dataKey="vSurplus" fill={BAND_META.surplus.token} radius={5.5} />
                  <XAxis numTicks={4} />
                  <YAxis numTicks={4} formatValue={(v) => `${v}u/d`} />
                  <ChartTooltip
                    showDots={false}
                    showDatePill={false}
                    content={({ point }) => (
                      <div className="min-w-[176px] px-3 py-2.5">
                        <div className="text-xs font-medium text-chart-tooltip-foreground">{String(point.name)}</div>
                        <div className="font-mono text-[10px] uppercase tracking-wide text-chart-tooltip-muted">
                          {String(point.sku)} · {String(point.zone)}
                        </div>
                        <dl className="mt-2 space-y-1 text-xs">
                          <div className="flex justify-between gap-4">
                            <dt className="text-chart-tooltip-muted">days of stock</dt>
                            <dd className="font-medium tabular-nums text-chart-tooltip-foreground">{String(point.dos)}d</dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-chart-tooltip-muted">velocity</dt>
                            <dd className="font-medium tabular-nums text-chart-tooltip-foreground">{String(point.vel)} u/d</dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-chart-tooltip-muted">on hand · reserved</dt>
                            <dd className="font-medium tabular-nums text-chart-tooltip-foreground">{String(point.onHand)} · {String(point.reserved)}</dd>
                          </div>
                        </dl>
                      </div>
                    )}
                  />
                </ScatterChart>
              ) : (
                <div className="grid h-full min-h-[160px] place-items-center text-[12px] text-muted-foreground">
                  Adjust the query — nothing to plot.
                </div>
              )}
            </div>
            <p className="border-t px-3 py-2 text-[11px] text-muted-foreground">
              x = days of stock left · y = mean picks/day. Left-bottom = reorder now; top-left = fast movers about to run dry.
            </p>
          </section>

          {/* receive docs — tray floats, strip anchor stays */}
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Receive docs</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{jobs.length}</span>
            </header>
            <div className="p-3">
              <JobTray jobs={jobs} onCancel={(j: Job) => setJobs((js) => js.filter((x) => x.id !== j.id))} onDismiss={(id: string) => setJobs((js) => js.filter((x) => x.id !== id))} />
            </div>
          </section>
        </aside>
      </div>
          </MotionConfig>
    </div>
  )
}
