import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { GitCommitHorizontal, Pause, Play, Server } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel } from "@/components/primitives/handcraft"
import { RadialGauge } from "radial-gauge"
import { ActivityHeatmap, type HeatCell } from "activity-heatmap"
import { EventTimelineDay, type TimelineEvent } from "event-timeline-day"
import { CronPreview } from "cron-preview"
import { DragNumberField } from "drag-number-field"

// COMPOSITE SCREEN · MLOPS MODEL MONITOR
// composed of: radial-gauge (p99 latency), activity-heatmap (feature drift),
// event-timeline-day (deploy log), cron-preview (retrain schedule),
// drag-number-field (SLO odometer) + purpose-built feature-store table and
// error-budget meter.
//
// DESIGN BAR: header strip ≤48px · label 11px semibold uppercase 12% tracking
// · body 13px · numerics 12px tabular right-aligned · panels rounded-lg
// bordered with a 36px header strip · functional copy only · motion marks
// state changes, never decorates.

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

const SLO = 99.9

export function ModelMonitor({ model = "prod-recommender", version = "v2.14.3", features = DEFAULT_FEATURES, className }: ModelMonitorProps) {
  const [canary, setCanary] = useState(true)
  const [slo, setSlo] = useState(SLO)
  const [cron, setCron] = useState("0 3 * * 1")

  const served = features.filter((f: FeatureRow) => f.state === "served").length
  const budgetMinutes = Math.round((1 - slo / 100) * 30 * 24 * 60)
  const burned = 47
  const burnPct = Math.min(100, Math.round((burned / budgetMinutes) * 100))

  return (
    <div className={cn("flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      {/* screen header */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Model monitor</h2>
        <span className="text-[12px] text-muted-foreground">{model}</span>
        <span className="text-[12px] text-muted-foreground">· {version} · shadow 5%</span>
        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]", canary ? "bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]" : "bg-[hsl(var(--warn)/0.14)] text-[hsl(var(--warn))]")}>
          {canary ? "canary 5% live" : "canary paused"}
        </span>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setCanary((c: boolean) => !c)}
            className="flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted"
          >
            {canary ? <Pause className="size-3.5" /> : <Play className="size-3.5" />} {canary ? "Pause canary" : "Resume canary"}
          </button>
          <button className="flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted">
            <Server className="size-3.5" /> Runbook
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
        {/* feature store */}
        <section className="min-w-0 overflow-hidden rounded-lg border bg-card">
          <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Feature store · {served}/{features.length} served</span>
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

        {/* gauges + drift + timeline */}
        <div className="flex min-w-0 flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <section className="overflow-hidden rounded-lg border bg-card">
              <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Serving latency</span>
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">window 1 h</span>
              </header>
              <div className="flex items-center justify-center p-3">
                <RadialGauge
                  value={342}
                  min={0}
                  max={800}
                  size={148}
                  label="p99 latency"
                  unit="ms"
                  precision={0}
                  zones={[
                    { to: 0.45, color: "hsl(var(--ok))", label: "healthy" },
                    { to: 0.75, color: "hsl(var(--warn))", label: "elevated" },
                    { to: 1, color: "hsl(var(--err))", label: "breach" },
                  ]}
                />
              </div>
              <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">p50 61 ms · p95 188 ms · 6 replicas</div>
            </section>
            <section className="overflow-hidden rounded-lg border bg-card">
              <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Feature drift</span>
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">psi/day · 26 wk</span>
              </header>
              <div className="p-3">
                <ActivityHeatmap cells={DRIFT_CELLS} weeks={26} />
                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>mar → aug</span>
                  <span className="flex items-center gap-1">
                    quiet
                    {[0, 1, 2, 3, 4].map((l: number) => (
                      <span
                        key={l}
                        className="size-2.5 rounded-[2px] border border-app-line"
                        style={{ background: `hsl(var(--info) / ${0.06 + l * 0.22})` }}
                      />
                    ))}
                    drift
                  </span>
                </div>
              </div>
            </section>
          </div>
          <section className="min-h-0 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Deploy timeline</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">last 4 days</span>
            </header>
            <div className="max-h-56 overflow-y-auto p-3">
              <EventTimelineDay events={DEFAULT_DEPLOYS} />
            </div>
          </section>
        </div>

        {/* SLA + retrain */}
        <aside className="flex min-w-0 flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">SLA odometer</span>
              <MonoLabel className="text-[10px] text-muted-foreground" tick={false}>aug</MonoLabel>
            </header>
            <div className="space-y-3 p-3">
              <DragNumberField label="SLO target" value={slo} onValueChange={(v: number) => setSlo(v)} min={99} max={99.99} step={0.01} precision={2} unit="%" />
              <div className="flex items-baseline justify-between border-t pt-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Error budget</span>
                <motion.span key={budgetMinutes} initial={{ scale: 1.06 }} animate={{ scale: 1 }} className="font-mono text-[20px] font-bold tabular-nums">
                  {budgetMinutes} min
                </motion.span>
              </div>
              <div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className={cn("h-full rounded-full", burnPct > 80 ? "bg-[hsl(var(--err))]" : burnPct > 50 ? "bg-[hsl(var(--warn))]" : "bg-[hsl(var(--ok))]")}
                    animate={{ width: `${burnPct}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">{burned} min burned · {budgetMinutes - burned} min left · burn rate 1.4×</p>
              </div>
            </div>
          </section>
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Retrain schedule</span>
              <GitCommitHorizontal className="size-3.5 text-muted-foreground" />
            </header>
            <div className="space-y-2 p-3">
              <CronPreview expr={cron} onChange={(v: string) => setCron(v)} />
              <p className="text-[11px] text-muted-foreground">Trains on 90-day window · gates on offline AUC ≥ 0.82 · auto-promote to canary at 5%.</p>
            </div>
          </section>
        </aside>
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
