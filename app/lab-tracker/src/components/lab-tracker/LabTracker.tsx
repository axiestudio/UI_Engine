import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronRight, FileCheck2, RotateCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { CronPreview } from "cron-preview"
import { InlineEditCell } from "inline-edit-cell"
import { CopySecretField } from "copy-secret-field"
import { StatusHealthStrip, type Service } from "status-health-strip"
import { EventTimelineDay, type TimelineEvent } from "event-timeline-day"

// COMPOSITE SCREEN · SAMPLE CHAIN — LAB TRACKER
// composed of: cron-preview (run schedule), inline-edit-cell (result cells),
// copy-secret-field (LIMS keys), status-health-strip (instrument health),
// event-timeline-day (custody trail) + purpose-built assay tree.

export type SampleResult = {
  id: string
  code: string
  panel: string
  analyte: string
  ref: string
  low: number
  high: number
  result: number | null
  unit: string
}

export type LabTrackerProps = {
  run?: string
  samples?: SampleResult[]
  onRestamp?: () => void
  className?: string
}

const RANGES: Record<string, { low: number; high: number; ref: string }> = {
  ALB: { low: 35, high: 52, ref: "35–52 g/L" },
  CRE: { low: 60, high: 110, ref: "60–110 µmol/L" },
  GLU: { low: 3.9, high: 6.1, ref: "3.9–6.1 mmol/L" },
  TSH: { low: 0.4, high: 4, ref: "0.4–4.0 mIU/L" },
  HBA1C: { low: 20, high: 42, ref: "20–42 mmol/mol" },
}

const UNITS: Record<string, string> = { ALB: "g/L", CRE: "µmol/L", GLU: "mmol/L", TSH: "mIU/L", HBA1C: "mmol/mol" }

const DEFAULT_SAMPLES: SampleResult[] = [
  { id: "r1", code: "SAM-2214", panel: "Clinical chem", analyte: "ALB", ref: RANGES.ALB.ref, low: RANGES.ALB.low, high: RANGES.ALB.high, result: 41, unit: UNITS.ALB },
  { id: "r2", code: "SAM-2214", panel: "Clinical chem", analyte: "CRE", ref: RANGES.CRE.ref, low: RANGES.CRE.low, high: RANGES.CRE.high, result: 128, unit: UNITS.CRE },
  { id: "r3", code: "SAM-2215", panel: "Clinical chem", analyte: "GLU", ref: RANGES.GLU.ref, low: RANGES.GLU.low, high: RANGES.GLU.high, result: 5.4, unit: UNITS.GLU },
  { id: "r4", code: "SAM-2216", panel: "Immuno", analyte: "TSH", ref: RANGES.TSH.ref, low: RANGES.TSH.low, high: RANGES.TSH.high, result: 6.8, unit: UNITS.TSH },
  { id: "r5", code: "SAM-2216", panel: "Immuno", analyte: "HBA1C", ref: RANGES.HBA1C.ref, low: RANGES.HBA1C.low, high: RANGES.HBA1C.high, result: null, unit: UNITS.HBA1C },
]

const ASSAY_TREE: { id: string; label: string; analytes: string[] }[] = [
  { id: "chem", label: "Clinical chem · Architect c4000", analytes: ["ALB", "CRE", "GLU"] },
  { id: "immuno", label: "Immuno · Cobas e801", analytes: ["TSH", "HBA1C"] },
]

const SERVICES: Service[] = [
  { name: "LC-MS/MS-01", state: "operational", region: "bay 3", note: "cal ok" },
  { name: "Centrifuge bank", state: "degraded", region: "bay 1", note: "spin 3 rotor wear" },
  { name: "Autoclave", state: "operational", region: "bay 2" },
]

const flagOf = (r: SampleResult): "ok" | "review" | "fail" => {
  if (r.result === null) return "review"
  if (r.result < r.low / 2 || r.result > r.high * 1.5) return "fail"
  if (r.result < r.low || r.result > r.high) return "review"
  return "ok"
}

export function LabTracker({ run = "RT-2408 · wet bench", samples = DEFAULT_SAMPLES, onRestamp, className }: LabTrackerProps) {
  const [rows, setRows] = useState(samples)
  const [events, setEvents] = useState<TimelineEvent[]>([
    { id: "e1", at: new Date(Date.now() - 5_400_000), actor: "R. Okafor", kind: "create", text: "Samples registered — cooler 4, seal intact" },
    { id: "e2", at: new Date(Date.now() - 3_600_000), actor: "LIMS", kind: "deploy", text: "Run RT-2408 queued on wet bench" },
    { id: "e3", at: new Date(Date.now() - 1_200_000), actor: "M. Strand", kind: "comment", text: "Hemolysis noted on SAM-2216 — repeat spin" },
  ])
  const [cron, setCron] = useState("0 6 * * 1-5")
  const [keys, setKeys] = useState([
    { id: "pat", value: "lims_pat_7f3a9c41d2e8", label: "PAT key" },
    { id: "hook", value: "lims_hook_2b6e0d95aa17", label: "Webhook" },
  ])
  const [rotating, setRotating] = useState<string | null>(null)
  const [stampAt, setStampAt] = useState(() => new Date(Date.now() - 600_000))
  const [stamping, setStamping] = useState(false)
  const [open, setOpen] = useState<Set<string>>(new Set(["chem"]))

  const stampTime = stampAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })

  const toggleAnalyte = (a: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(a)) next.delete(a)
      else next.add(a)
      return next
    })

  const saveResult = async (r: SampleResult, v: string) => {
    const num = Number(v.replace(",", "."))
    if (!isFinite(num) || num < 0 || num > 10_000) throw new Error("out of physical range")
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, result: num } : x)))
    const flag = flagOf({ ...r, result: num })
    setEvents((es) => [
      ...es,
      { id: "e" + String(Date.now()), at: new Date(), actor: "M. Strand", kind: "edit", text: `${r.code} ${r.analyte} result set ${num} ${r.unit}${flag !== "ok" ? ` · flagged ${flag}` : ""}` },
    ])
  }

  const rotate = (id: string) => {
    setRotating(id)
    setTimeout(() => {
      const suffix = Math.random().toString(16).slice(2, 14)
      setKeys((ks) => ks.map((k) => (k.id === id ? { ...k, value: id === "pat" ? `lims_pat_${suffix}` : `lims_hook_${suffix}` } : k)))
      setRotating(null)
      setEvents((es) => [...es, { id: "e" + String(Date.now()), at: new Date(), actor: "R. Okafor", kind: "alert", text: `${id === "pat" ? "PAT key" : "Webhook secret"} rotated in LIMS` }])
    }, 900)
  }

  const restamp = () => {
    setStamping(true)
    setTimeout(() => {
      const at = new Date()
      setStampAt(at)
      setEvents((es) => [...es, { id: "e" + String(Date.now()), at, actor: "R. Okafor", kind: "edit", text: "Custody re-stamped — full chain re-certified" }])
      setStamping(false)
      onRestamp?.()
    }, 900)
  }

  const flagTone: Record<"ok" | "review" | "fail", string> = {
    ok: "border-[hsl(var(--ok)/0.4)] text-[hsl(var(--ok))]",
    review: "border-[hsl(var(--warn)/0.5)] text-[hsl(var(--warn))]",
    fail: "border-[hsl(var(--err)/0.5)] text-[hsl(var(--err))]",
  }

  return (
    <div className={cn("flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Lab tracker</h2>
        <span className="text-[12px] text-muted-foreground">{run}</span>
        <span className="text-[12px] text-muted-foreground">· schedule <span className="font-mono">{cron}</span></span>
        <button onClick={restamp} disabled={stamping} className="ml-auto flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted disabled:opacity-40">
          <FileCheck2 className={cn("size-3.5", stamping && "animate-pulse")} /> {stamping ? "Stamping…" : "Re-stamp custody"}
        </button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[280px_minmax(0,1fr)_300px]">
        {/* schedule + instruments */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Run schedule</header>
            <div className="p-3">
              <CronPreview expr={cron} onChange={setCron} />
            </div>
          </section>
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Instrument health</header>
            <div className="p-3">
              <StatusHealthStrip services={SERVICES} region="bay 1" />
            </div>
          </section>
        </aside>

        {/* assay tree + results */}
        <section className="flex min-w-0 flex-col gap-4">
          <div className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Assay tree</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{ASSAY_TREE.length} panels</span>
            </header>
            <div className="divide-y divide-border/60">
              {ASSAY_TREE.map((p) => (
                <div key={p.id}>
                  <button onClick={() => toggleAnalyte(p.id)} className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/50">
                    <ChevronRight className={cn("size-3.5 text-muted-foreground transition-transform", open.has(p.id) && "rotate-90")} />
                    <span className="text-[12px] font-semibold">{p.label}</span>
                    <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground">{p.analytes.length} analytes</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open.has(p.id) && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <ul className="grid gap-x-6 px-3 pb-2 pl-8 sm:grid-cols-2">
                          {p.analytes.map((a) => {
                            const n = rows.filter((r) => r.analyte === a).length
                            return (
                              <li key={a} className="flex items-center justify-between border-b border-border/40 py-1 text-[12px] last:border-0">
                                <span className="font-mono font-semibold">{a}</span>
                                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{n} · {RANGES[a].ref}</span>
                              </li>
                            )
                          })}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Result cells · {rows.length}</span>
              <span className="text-[11px] text-muted-foreground">tap a result to edit · QC flags recompute</span>
            </header>
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr className="border-b text-left text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  <th className="px-3 py-1.5 font-semibold">Sample</th>
                  <th className="w-20 px-2 py-1.5 font-semibold">Analyte</th>
                  <th className="w-24 px-2 py-1.5 text-right font-semibold">Result</th>
                  <th className="w-32 px-2 py-1.5 text-right font-semibold">Reference</th>
                  <th className="w-20 px-3 py-1.5 text-right font-semibold">Flag</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const f = flagOf(r)
                  return (
                    <tr key={r.id} className="border-b border-border/60 last:border-0">
                      <td className="px-3 py-1">
                        <span className="font-mono text-[11px] tabular-nums">{r.code}</span>
                        <span className="ml-2 text-muted-foreground">{r.panel}</span>
                      </td>
                      <td className="px-2 py-1 font-mono font-semibold">{r.analyte}</td>
                      <td className="px-2 py-1 text-right">
                        <div className="flex justify-end">
                          <InlineEditCell
                            value={r.result === null ? "—" : String(r.result)}
                            name={`${r.code} ${r.analyte} result`}
                            mono
                            width={56}
                            onSave={async (v: string) => saveResult(r, v)}
                          />
                          <span className="self-center pl-1 text-[10px] text-muted-foreground">{r.unit}</span>
                        </div>
                      </td>
                      <td className="px-2 py-1 text-right font-mono text-[11px] tabular-nums text-muted-foreground">{r.ref}</td>
                      <td className="px-3 py-1 text-right">
                        <motion.span key={f} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className={cn("inline-block rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase", flagTone[f])}>{f}</motion.span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* keys + custody */}
        <aside className="flex min-h-0 flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">LIMS keys</header>
            <div className="space-y-2.5 p-3">
              {keys.map((k) => (
                <CopySecretField key={k.id} value={k.value} label={k.label} mono rotating={rotating === k.id} onRotate={() => rotate(k.id)} />
              ))}
              <p className="text-[11px] text-muted-foreground">Keys scope to run RT-2408 · rotation revokes the previous secret immediately.</p>
            </div>
          </section>
          <section className={cn("flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card transition-colors", stamping && "border-[hsl(var(--info)/0.6)]")}>
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Custody trail</span>
              <motion.span key={stampTime} initial={{ scale: 1.1, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} className="font-mono text-[11px] tabular-nums text-muted-foreground">
                stamp {stampTime}
              </motion.span>
            </header>
            <div className="min-h-0 flex-1 overflow-auto p-3">
              <EventTimelineDay events={events} />
            </div>
            <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">Chain re-certified {events.length} entries · stamp covers all of them.</div>
          </section>
        </aside>
      </div>
    </div>
  )
}
