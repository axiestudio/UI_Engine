import { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { ChevronRight, FileCheck2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { CronPreview } from "cron-preview"
import { InlineEditCell } from "inline-edit-cell"
import { CopySecretField } from "copy-secret-field"
import { StatusHealthStrip, type Service } from "status-health-strip"
import { EventTimelineDay, type TimelineEvent } from "event-timeline-day"
import { Waveform } from "waveform"
import { Button } from "@/components/ui/button"

// COMPOSITE SCREEN · SAMPLE CHAIN — LAB TRACKER
// composed of: status-health-strip (bench system bar), waveform (live
// instrument trace — freezes on standby), purpose-built assay spine +
// dense result grid, cron-preview (run schedule), copy-secret-field (LIMS
// keys), event-timeline-day (custody band).
// STRUCTURE: frameless full-bleed bench — no outer card frame; hairline
// bands (system bar → trace band → 12-col workbench → custody band).

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

const ASSAY_TREE: { id: string; label: string; instrument: string; analytes: string[] }[] = [
  { id: "chem", label: "Clinical chem", instrument: "Architect c4000", analytes: ["ALB", "CRE", "GLU"] },
  { id: "immuno", label: "Immuno", instrument: "Cobas e801", analytes: ["TSH", "HBA1C"] },
]

const INITIAL_SERVICES: Service[] = [
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

export function LabTracker({ run = "RT-2408", samples = DEFAULT_SAMPLES, onRestamp, className }: LabTrackerProps) {
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
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES)
  const [region, setRegion] = useState("")
  const [selectedAnalyte, setSelectedAnalyte] = useState<string | null>(null)

  const stampTime = stampAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  const reduceMotion = useReducedMotion()

  // instrument health drives the live trace — standby/down freezes the waveform
  const instrument = services.find((s) => s.name === "LC-MS/MS-01")
  const traceLive = instrument?.state === "operational"
  const benchIssues = services.filter((s) => s.state !== "operational").length
  const benchTone = benchIssues === 0 ? "hsl(var(--ok))" : services.some((s) => s.state === "down") ? "hsl(var(--err))" : "hsl(var(--warn))"

  const shown = selectedAnalyte ? rows.filter((r) => r.analyte === selectedAnalyte) : rows

  const togglePanel = (p: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(p)) next.delete(p)
      else next.add(p)
      return next
    })

  const toggleStandby = () => {
    const goingDown = traceLive
    setServices((ss) =>
      ss.map((s) =>
        s.name === "LC-MS/MS-01"
          ? { ...s, state: goingDown ? "down" : "operational", note: goingDown ? "standby — between runs" : "cal ok" }
          : s
      )
    )
    setEvents((es) => [
      ...es,
      {
        id: "e" + String(Date.now()),
        at: new Date(),
        actor: "R. Okafor",
        kind: "deploy",
        text: goingDown ? "LC-MS/MS-01 set to standby — live trace frozen" : "LC-MS/MS-01 back online — trace live",
      },
    ])
  }

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
    <div className={cn("relative isolate flex w-full flex-col overflow-hidden bg-background font-sans text-foreground", className)}>
      {/* bench system bar — health strip runs full-bleed at the very top */}
      <StatusHealthStrip services={services} region={region} onRegion={setRegion} />

      {/* bezel header — instrument identity, not an app bar */}
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 px-6 pb-4 pt-5">
        <div>
          <div className="flex items-center gap-2.5">
            <motion.span
              aria-hidden
              animate={!reduceMotion && benchIssues > 0 ? { opacity: [1, 0.35, 1] } : { opacity: 1 }}
              transition={!reduceMotion && benchIssues > 0 ? { repeat: Infinity, duration: 1.6 } : undefined}
              className="size-2.5 rounded-full"
              style={{ background: benchTone }}
            />
            <h2 className="font-display text-[22px] font-bold leading-none tracking-[-0.02em]">{run}</h2>
            <span className="rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">wet bench · sample chain</span>
          </div>
          <p className="mt-1.5 text-[12px] text-muted-foreground">
            schedule <span className="font-mono">{cron}</span> · {shown.length} of {rows.length} result cells on the bench
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-mono text-[10px] font-medium text-muted-foreground">custody stamp</p>
            <motion.span key={stampTime} initial={{ scale: 1.08, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }} className="block font-mono text-[14px] font-bold tabular-nums">
              {stampTime}
            </motion.span>
          </div>
          <Button variant="outline" size="sm" onClick={restamp} disabled={stamping}>
            <FileCheck2 className={cn("size-3.5", stamping && "motion-safe:animate-pulse")} />
            {stamping ? "Stamping…" : "Re-stamp custody"}
          </Button>
        </div>
      </header>

      {/* live trace band — waveform freezes when the LC-MS goes to standby */}
      <section className="border-y bg-muted/20" aria-label="Instrument signal">
        <div className="flex flex-col lg:flex-row lg:items-stretch">
          <div className="flex shrink-0 flex-col justify-center gap-1 border-b px-6 py-3 lg:w-60 lg:border-b-0 lg:border-r">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Instrument trace</p>
            <p className="flex items-center gap-2 text-[13px] font-semibold">
              LC-MS/MS-01
              <span aria-hidden className={cn("size-1.5 rounded-full", traceLive ? "bg-[hsl(var(--ok))]" : "bg-[hsl(var(--err))]")} />
              <span className="sr-only">{traceLive ? "trace live" : "trace frozen"}</span>
            </p>
            <Button variant="ghost" size="sm" className="h-7 self-start px-2 text-[11px]" aria-pressed={!traceLive} onClick={toggleStandby}>
              {traceLive ? "Set standby" : "Resume run"}
            </Button>
          </div>
          <div className="relative min-w-0 flex-1">
            <Waveform label="sample feed · 610 nm" height={84} samples={150} amplitude={0.34} speed={0.7} paused={!traceLive} className="border-0 bg-transparent" />
            <AnimatePresence>
              {!traceLive && (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-4 top-4 rounded-full border border-[hsl(var(--err)/0.5)] bg-background px-2.5 py-1 font-mono text-[10px] font-semibold text-[hsl(var(--err))]"
                >
                  trace frozen — instrument in standby
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* workbench — assay spine | result grid | config rail */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-12">
        {/* assay spine — bare rail, tree + selectable analytes */}
        <aside className="min-h-0 border-b lg:col-span-3 lg:border-b-0 lg:border-r" aria-label="Assay tree">
          <div className="flex items-baseline justify-between px-6 pt-4 lg:px-5">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Assay panels</h3>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{ASSAY_TREE.length}</span>
          </div>
          <ul className="px-2 py-2">
            {ASSAY_TREE.map((p) => (
              <li key={p.id} className="relative">
                <Button type="button" variant="ghost"
                  onClick={() => togglePanel(p.id)}
                  aria-expanded={open.has(p.id)}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--app-focus))]"
                >
                  <ChevronRight className={cn("size-3.5 text-muted-foreground transition-transform", open.has(p.id) && "rotate-90")} />
                  <span className="text-[12px] font-semibold">{p.label}</span>
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">{p.instrument}</span>
                </Button>
                <AnimatePresence initial={false}>
                  {open.has(p.id) && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="relative ml-[22px] overflow-hidden border-l border-dashed pl-2"
                    >
                      {p.analytes.map((a) => {
                        const n = rows.filter((r) => r.analyte === a).length
                        const on = selectedAnalyte === a
                        return (
                          <li key={a}>
                            <Button type="button" variant="ghost"
                              aria-pressed={on}
                              onClick={() => setSelectedAnalyte((sel) => (sel === a ? null : a))}
                              className={cn(
                                "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-left font-mono text-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--app-focus))]",
                                on ? "bg-accent font-bold text-accent-foreground" : "hover:bg-muted/60"
                              )}
                            >
                              <span className="font-semibold">{a}</span>
                              <span className="text-[10px] tabular-nums text-muted-foreground">{n} · {RANGES[a].ref}</span>
                            </Button>
                          </li>
                        )
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
          <p className="border-t border-dashed px-6 py-3 text-[11px] leading-[1.5] text-muted-foreground lg:px-5">
            {selectedAnalyte ? `Filtering the grid to ${selectedAnalyte}.` : "Tap an analyte to filter the result grid."}
          </p>
        </aside>

        {/* result grid — solid card, dense, sticky head */}
        <section className={cn("min-h-0 bg-card lg:col-span-6", stamping && "ring-1 ring-inset ring-[hsl(var(--info)/0.6)]")} aria-label="Result cells">
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 pb-2 pt-4">
            <h3 className="text-[12px] font-semibold">Result cells <span className="ml-1 font-mono text-[11px] tabular-nums text-muted-foreground">{shown.length}</span></h3>
            <div className="flex items-center gap-2">
              {selectedAnalyte && (
                <Button variant="ghost" size="sm" className="h-6 gap-1 rounded-full border px-2 font-mono text-[10px]" onClick={() => setSelectedAnalyte(null)}>
                  <X className="size-3" /> {selectedAnalyte}
                </Button>
              )}
              <span className="text-[11px] text-muted-foreground">tap a result to edit · QC flags recompute</span>
            </div>
          </div>
          <div className="max-h-[420px] overflow-auto">
            <table className="w-full border-collapse text-[12px]">
              <thead className="sticky top-0 z-[1] bg-card">
                <tr className="border-b text-left font-mono text-[10px] text-muted-foreground">
                  <th className="px-5 py-1.5 font-semibold">Sample</th>
                  <th className="w-16 px-2 py-1.5 font-semibold">Anl</th>
                  <th className="w-24 px-2 py-1.5 text-right font-semibold">Result</th>
                  <th className="w-32 px-2 py-1.5 text-right font-semibold">Reference</th>
                  <th className="w-20 px-5 py-1.5 text-right font-semibold">QC</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => {
                  const f = flagOf(r)
                  return (
                    <tr key={r.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/30">
                      <td className="px-5 py-1">
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
                      <td className="px-5 py-1 text-right">
                        <motion.span key={f} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className={cn("inline-block rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase", flagTone[f])}>{f}</motion.span>
                      </td>
                    </tr>
                  )
                })}
                {shown.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 text-center text-[12px] text-muted-foreground">No cells for this analyte on the bench.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* config rail — dashed run-config surface + bare key list */}
        <aside className="min-h-0 border-t lg:col-span-3 lg:border-l lg:border-t-0" aria-label="Run configuration">
          <div className="px-5 pt-4">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Run schedule</h3>
            <div className="mt-2 rounded-lg border border-dashed p-3">
              <CronPreview expr={cron} onChange={setCron} />
            </div>
          </div>
          <div className="px-5 pb-5 pt-4">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">LIMS keys</h3>
            <div className="mt-2 space-y-2.5">
              {keys.map((k) => (
                <CopySecretField key={k.id} value={k.value} label={k.label} mono rotating={rotating === k.id} onRotate={() => rotate(k.id)} />
              ))}
            </div>
            <p className="mt-3 border-t border-dashed pt-2.5 text-[11px] leading-[1.5] text-muted-foreground">
              Keys scope to run {run} · rotation revokes the previous secret immediately.
            </p>
          </div>
        </aside>
      </div>

      {/* custody band — full-width audit strip anchoring the bench */}
      <section className="border-t bg-muted/30" aria-label="Custody trail">
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 pb-1 pt-3">
          <div className="flex items-center gap-3">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Custody trail</h3>
            <motion.span key={stampTime} initial={{ scale: 1.1, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} className="font-mono text-[11px] tabular-nums text-muted-foreground">
              stamp {stampTime}
            </motion.span>
          </div>
          <p className="text-[11px] text-muted-foreground">chain re-certified · {events.length} entries — stamp covers all of them</p>
        </div>
        <div className="max-h-56 overflow-y-auto px-6 pb-5 pt-2 [&>ol]:columns-1 lg:[&>ol]:columns-2 lg:[&>ol]:gap-10 [&>ol>li]:break-inside-avoid">
          <EventTimelineDay events={events} />
        </div>
      </section>
    </div>
  )
}
