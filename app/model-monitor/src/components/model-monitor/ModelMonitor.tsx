import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Database, Flame, GitCommitHorizontal, History, Pause, Play, Server } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel } from "@/components/primitives/handcraft"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RadialGauge } from "radial-gauge"
import { ActivityHeatmap, type HeatCell } from "activity-heatmap"
import { EventTimelineDay, type TimelineEvent } from "event-timeline-day"
import { CronPreview } from "cron-preview"
import { DragNumberField } from "drag-number-field"
import { LineChart, Line } from "@/components/bklit/line-chart"
import { AreaChart, Area } from "@/components/bklit/area-chart"
import { Grid } from "@/components/bklit/grid"
import { XAxis } from "@/components/bklit/x-axis"
import { YAxis } from "@/components/bklit/y-axis"
import { ChartTooltip } from "@/components/bklit/tooltip/chart-tooltip"

// COMPOSITE SCREEN · MLOPS MODEL MONITOR
// composed of: radial-gauge (p99 latency) + vendored Bklit LineChart (p50/p95/p99
// latency series — the domain-true companion to the gauge), activity-heatmap
// (feature drift), vendored Bklit AreaChart (error-budget burn), event-timeline-day
// (deploy log), cron-preview (retrain schedule), drag-number-field (SLO target)
// + purpose-built feature-store table.
//
// LAYOUT: the old three-pane template is gone. 12-col asymmetric grid —
// latency panel (gauge + 3-line chart) spans 8 against the drift heatmap rail
// (4); feature store 5 / error budget 3 / retrain 4; the deploy timeline runs
// as a full-width band. Canary pause retimes the live series, so gauge, lines
// and readouts all move together.

export type FeatureRow = {
  id: string
  name: string
  entity: string
  dtype: string
  freshness: string
  owner: string
  state: "served" | "materialising"
}

export type ModelMonitorProps = {
  model?: string
  version?: string
  features?: FeatureRow[]
  className?: string
}

const DEFAULT_FEATURES: FeatureRow[] = [
  { id: "f1", name: "cart_affinity_30d", entity: "customer", dtype: "float32", freshness: "4 min", owner: "personalisation", state: "served" },
  { id: "f2", name: "session_depth_seq", entity: "session", dtype: "int32[16]", freshness: "38 s", owner: "growth", state: "served" },
  { id: "f3", name: "return_rate_90d", entity: "customer", dtype: "float32", freshness: "12 min", owner: "risk", state: "served" },
  { id: "f4", name: "margin_band_daily", entity: "sku", dtype: "uint8", freshness: "materialising", owner: "pricing", state: "materialising" },
  { id: "f5", name: "store_footfall_hr", entity: "store", dtype: "int32", freshness: "1 min", owner: "ops", state: "served" },
]

const DRIFT_CELLS: HeatCell[] = Array.from({ length: 26 * 7 }, (_, i: number) => {
  const wave = Math.sin(i / 9) * 14 + Math.sin(i / 3.7) * 6
  const quiet = i % 7 === 6 || i % 7 === 5 ? 0.45 : 1
  return { count: Math.max(0, Math.round((18 + wave) * quiet)) }
})

const DEFAULT_DEPLOYS: TimelineEvent[] = [
  { id: "d1", at: "2026-08-31T05:58:00", actor: "release-captain", kind: "deploy", text: "v2.14.3 promoted to production — canary 5%" },
  { id: "d2", at: "2026-08-30T22:41:00", actor: "m.osei", kind: "edit", text: "feature view margin_band_daily re-materialised" },
  { id: "d3", at: "2026-08-30T14:03:00", actor: "monitor", kind: "alert", text: "p99 latency 512 ms — auto-scaled to 6 replicas" },
  { id: "d4", at: "2026-08-29T09:12:00", actor: "release-captain", kind: "deploy", text: "v2.14.2 shipped — calibration layer added" },
  { id: "d5", at: "2026-08-28T17:30:00", actor: "a.lind", kind: "comment", text: "drift on return_rate_90d accepted for promo period" },
  { id: "d6", at: "2026-08-28T08:47:00", actor: "release-captain", kind: "deploy", text: "v2.14.1 rollback — schema mismatch in store_footfall_hr" },
]

const HOUR_MS = 3_600_000
const DAY_MS = 86_400_000
const LAT_ANCHOR = new Date(2026, 7, 31, 14, 0, 0)

// 48 hourly latency percentiles — stable p50, breathing p95, spiky p99.
const BASE_LATENCY = Array.from({ length: 48 }, (_, i: number) => ({
  date: new Date(LAT_ANCHOR.getTime() - (47 - i) * HOUR_MS),
  p50: Math.round(56 + Math.sin(i / 7) * 9 + Math.sin(i / 2.3) * 4),
  p95: Math.round(168 + Math.sin(i / 9 + 1.2) * 28 + Math.sin(i / 3.1) * 14),
  p99: Math.round(318 + Math.sin(i / 6.5) * 85 + (i % 13 === 0 ? 85 : 0) + Math.sin(i / 1.7) * 16),
}))

// Pausing the canary sends 100% of traffic to the new build — latencies climb.
const PAUSED_LATENCY = BASE_LATENCY.map((d) => ({
  date: d.date,
  p50: Math.round(d.p50 * 1.18),
  p95: Math.round(d.p95 * 1.22),
  p99: Math.round(d.p99 * 1.25),
}))

const BURNED = 47
const BURN_RAW = Array.from({ length: 30 }, (_, i: number) =>
  1.4 + Math.sin(i / 4.2) * 1.1 + (i % 7 === 5 || i % 7 === 6 ? 0.9 : 0) + Math.sin(i / 1.9) * 0.4
)
const BURN_SCALE = BURNED / BURN_RAW.reduce((a, b) => a + b, 0)
const BURN_SERIES = (() => {
  let cum = 0
  return BURN_RAW.map((v, i) => {
    cum += v * BURN_SCALE
    return { date: new Date(LAT_ANCHOR.getTime() - (29 - i) * DAY_MS), burned: i === 29 ? BURNED : Math.round(cum) }
  })
})()

const SLO = 99.9
const BURN_SERIES_META = [
  { dataKey: "p50", label: "p50", color: "var(--chart-3)" },
  { dataKey: "p95", label: "p95", color: "var(--chart-4)" },
  { dataKey: "p99", label: "p99", color: "var(--chart-5)" },
] as const

export function ModelMonitor({ model = "prod-recommender", version = "v2.14.3", features = DEFAULT_FEATURES, className }: ModelMonitorProps) {
  const [canary, setCanary] = useState(true)
  const [slo, setSlo] = useState(SLO)
  const [cron, setCron] = useState("0 3 * * 1")

  const served = features.filter((f: FeatureRow) => f.state === "served").length
  const budgetMinutes = Math.round((1 - slo / 100) * 30 * 24 * 60)
  const burnPct = Math.min(100, Math.round((BURNED / budgetMinutes) * 100))
  const burnTone = burnPct > 80 ? "var(--chart-5)" : burnPct > 50 ? "var(--chart-4)" : "var(--chart-3)"

  const latency = canary ? BASE_LATENCY : PAUSED_LATENCY
  const latest = latency[latency.length - 1]
  const latencyMeta = useMemo(
    () => BURN_SERIES_META.map((m) => ({ ...m, value: latest[m.dataKey as "p50" | "p95" | "p99"] })),
    [latest]
  )

  return (
    <div className={cn("flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-background font-sans text-foreground", className)}>
      {/* masthead — two-row editorial header, not the 48px strip */}
      <header className="flex flex-wrap items-end gap-x-6 gap-y-3 border-b bg-card px-5 pb-4 pt-5">
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">MLOPS · MONITOR 02</p>
          <h2 className="mt-1.5 font-display text-2xl font-semibold tracking-tight">Model monitor</h2>
          <p className="mt-1 font-mono text-[12px] tabular-nums text-muted-foreground">{model} · {version} · shadow 5%</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          <span
            className={cn(
              "rounded px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em]",
              canary ? "bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]" : "bg-[hsl(var(--warn)/0.14)] text-[hsl(var(--warn))]"
            )}
          >
            {canary ? "canary 5% live" : "canary paused"}
          </span>
          <Button variant="outline" size="sm" onClick={() => setCanary((c: boolean) => !c)}>
            {canary ? <Pause className="size-3.5" /> : <Play className="size-3.5" />} {canary ? "Pause canary" : "Resume canary"}
          </Button>
          <Button variant="ghost" size="sm"><Server className="size-3.5" /> Runbook</Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-12">
        {/* latency — notch gauge beside the real p50/p95/p99 line chart */}
        <section className="min-w-0 overflow-hidden rounded-lg border bg-card lg:col-span-8">
          <header className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b bg-muted/30 px-3 py-2">
            <MonoLabel className="text-[10px] text-muted-foreground">Serving latency</MonoLabel>
            <span className="ml-auto flex flex-wrap items-center gap-3">
              {latencyMeta.map((m) => (
                <span key={m.dataKey} className="flex items-center gap-1.5 font-mono text-[11px] tabular-nums text-muted-foreground">
                  <span aria-hidden className="size-2 rounded-full" style={{ background: m.color }} />
                  {m.label} {m.value} ms
                </span>
              ))}
            </span>
          </header>
          <div className="flex flex-col md:flex-row md:items-stretch">
            <div className="flex items-center justify-center border-b p-4 md:w-60 md:border-b-0 md:border-r">
              <RadialGauge
                value={latest.p99}
                min={0}
                max={800}
                size={150}
                label="p99 latency"
                unit="ms"
                precision={0}
                notches={48}
                showCenterValue
                zones={[
                  { to: 0.45, color: "hsl(var(--ok))", label: "healthy" },
                  { to: 0.75, color: "hsl(var(--warn))", label: "elevated" },
                  { to: 1, color: "hsl(var(--err))", label: "breach" },
                ]}
              />
            </div>
            <div className="min-w-0 flex-1 p-3">
              <LineChart
                data={latency}
                margin={{ top: 12, right: 14, bottom: 26, left: 4 }}
                revealSignature={canary ? "canary" : "paused"}
                yDomainTween
                style={{ aspectRatio: "auto", height: 218 }}
              >
                <Grid horizontal numTicksRows={4} />
                <Line dataKey="p50" stroke="var(--chart-3)" strokeWidth={2} />
                <Line dataKey="p95" stroke="var(--chart-4)" strokeWidth={2} />
                <Line dataKey="p99" stroke="var(--chart-5)" strokeWidth={2.5} />
                <XAxis numTicks={5} />
                <YAxis numTicks={4} formatValue={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}s` : `${Math.round(v)} ms`)} />
                <ChartTooltip
                  rows={(p) => latencyMeta.map((m) => ({ color: m.color, label: m.label, value: `${p[m.dataKey]} ms` }))}
                />
              </LineChart>
            </div>
          </div>
        </section>

        {/* drift — 26-week heatmap rail, tooltip on, legend from the leaf */}
        <section className="min-w-0 overflow-hidden rounded-lg border bg-card lg:col-span-4">
          <header className="flex items-center justify-between border-b bg-muted/30 px-3 py-2">
            <MonoLabel className="text-[10px] text-muted-foreground">Feature drift</MonoLabel>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">psi/day · 26 wk</span>
          </header>
          <div className="p-3">
            <ActivityHeatmap cells={DRIFT_CELLS} weeks={26} showTooltip showLegend />
            <p className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>mar → aug</span>
              <span>weekend traffic halved</span>
            </p>
          </div>
        </section>

        {/* feature store — dense table, count chip */}
        <section className="min-w-0 overflow-hidden rounded-lg border bg-card lg:col-span-5">
          <header className="flex items-center justify-between border-b bg-muted/30 px-3 py-2">
            <MonoLabel className="text-[10px] text-muted-foreground">Feature store</MonoLabel>
            <Badge variant="secondary" className="font-mono text-[10px]">{served}/{features.length} served</Badge>
          </header>
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b text-left text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="px-3 py-1.5 font-semibold">Feature</th>
                <th className="px-2 py-1.5 font-semibold">Entity</th>
                <th className="w-20 px-2 py-1.5 text-right font-semibold">Fresh</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f: FeatureRow) => (
                <tr key={f.id} className="border-b border-app-line/60 last:border-0">
                  <td className="px-3 py-1 font-mono text-[11px]">{f.name}</td>
                  <td className="px-2 py-1 text-[11px] text-muted-foreground">{f.entity} · {f.dtype}</td>
                  <td className="px-2 py-1 text-right">
                    {f.state === "materialising" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[hsl(var(--info))]">
                        <motion.span
                          className="size-1.5 rounded-full bg-[hsl(var(--info))]"
                          animate={{ opacity: [1, 0.25, 1] }}
                          transition={{ repeat: Infinity, duration: 1.1 }}
                        />
                        materialising
                      </span>
                    ) : (
                      <span className="font-mono tabular-nums text-muted-foreground">{f.freshness}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">Offline store: parquet on s3 · online: redis, ttl 24 h</div>
        </section>

        {/* error budget — real burn trajectory (vendored Bklit area) under the SLO odometer */}
        <section className="min-w-0 overflow-hidden rounded-lg border bg-card lg:col-span-3">
          <header className="flex items-center justify-between border-b bg-muted/30 px-3 py-2">
            <MonoLabel className="text-[10px] text-muted-foreground">Error budget</MonoLabel>
            <Flame className="size-3.5 text-muted-foreground" />
          </header>
          <div className="space-y-2 p-3">
            <DragNumberField label="SLO target" value={slo} onValueChange={(v: number) => setSlo(v)} min={99} max={99.99} step={0.01} precision={2} unit="%" />
            <div className="flex items-baseline justify-between border-t pt-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">30-day pool</span>
              <motion.span key={budgetMinutes} initial={{ scale: 1.06 }} animate={{ scale: 1 }} className="font-mono text-[20px] font-bold tabular-nums">
                {budgetMinutes} min
              </motion.span>
            </div>
            <AreaChart
              data={BURN_SERIES}
              margin={{ top: 8, right: 8, bottom: 22, left: 4 }}
              style={{ aspectRatio: "auto", height: 96 }}
            >
              <Grid
                horizontal
                numTicksRows={3}
                highlightRowValues={[budgetMinutes]}
                highlightRowStroke="var(--chart-crosshair)"
                highlightRowStrokeDasharray="4,3"
                highlightRowStrokeWidth={1}
              />
              <Area dataKey="burned" fill={burnTone} stroke={burnTone} fillOpacity={0.32} />
              <XAxis numTicks={3} />
              <ChartTooltip
                rows={(p) => [{ color: burnTone, label: "burned", value: `${p.burned} min` }]}
              />
            </AreaChart>
            <p className="text-[11px] text-muted-foreground">{BURNED} min burned · {budgetMinutes - BURNED} min left · burn rate 1.4× · dashed line = pool</p>
          </div>
        </section>

        {/* retrain — cron preview keeps recomputing */}
        <section className="min-w-0 overflow-hidden rounded-lg border bg-card lg:col-span-4">
          <header className="flex items-center justify-between border-b bg-muted/30 px-3 py-2">
            <MonoLabel className="text-[10px] text-muted-foreground">Retrain schedule</MonoLabel>
            <GitCommitHorizontal className="size-3.5 text-muted-foreground" />
          </header>
          <div className="space-y-2 p-3">
            <CronPreview expr={cron} onChange={(v: string) => setCron(v)} />
            <p className="text-[11px] text-muted-foreground">Trains on 90-day window · gates on offline AUC ≥ 0.82 · auto-promote to canary at 5%.</p>
          </div>
        </section>

        {/* deploy timeline — full-width band, label docked left */}
        <section className="min-w-0 overflow-hidden rounded-lg border bg-card lg:col-span-12">
          <header className="flex items-center gap-3 border-b bg-muted/30 px-3 py-2">
            <History className="size-3.5 text-muted-foreground" />
            <MonoLabel className="text-[10px] text-muted-foreground">Deploy timeline</MonoLabel>
            <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground">last 4 days · {DEFAULT_DEPLOYS.length} events</span>
          </header>
          <div className="max-h-56 overflow-y-auto p-3">
            <EventTimelineDay events={DEFAULT_DEPLOYS} />
          </div>
        </section>
      </div>

      <AnimatePresence>
        {!canary && (
          <motion.footer
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex items-center gap-2 border-t bg-[hsl(var(--warn)/0.08)] px-4 py-2 text-[11px] font-semibold text-[hsl(var(--warn))]"
          >
            Canary traffic paused — 100% of requests served by {version}. Resume before the Friday peak.
          </motion.footer>
        )}
      </AnimatePresence>
    </div>
  )
}
