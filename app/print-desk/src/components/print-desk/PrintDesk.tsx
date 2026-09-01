import * as React from "react"
import { motion, MotionConfig } from "motion/react"
import { Layers, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SegmentedControl } from "segmented-control"
import { PipelineRunGraph, type Stage } from "pipeline-run-graph"
import { DragNumberField } from "drag-number-field"
import { DiffPaneSplit, type DiffLine } from "diff-pane-split"
import { AreaChart, Area } from "@/components/bklit/area-chart"
import { Grid } from "@/components/bklit/grid"
import { XAxis } from "@/components/bklit/x-axis"
import { YAxis } from "@/components/bklit/y-axis"
import { ChartTooltip } from "@/components/bklit/tooltip/chart-tooltip"

// COMPOSITE SCREEN · PRINT SHOP FLOOR — ledger-and-band build
// Structure: frameless full-bleed shell (no floating card roster). A press
// band runs the full width under the header (stage graph inline, chrome
// stripped). The artwork queue is a dense ruled ledger, proofs are one wide
// overlay panel with a floating revision switcher, throughput is a vendored
// Bklit area chart driven by run state + the drag target, and the stock
// selector docks as a full-width strip along the bottom edge.
//composed of: pipeline-run-graph · drag-number-field · diff-pane-split ·
// segmented-control · vendored bklit AreaChart · shadcn Button · handcraft kit.

export type ArtworkJob = {
  id: string
  job: string
  client: string
  stock: string
  pages: number
  due: string
  state: "approved" | "proofing" | "waiting"
}

export type PrintDeskProps = {
  press?: string
  shift?: string
  queue?: ArtworkJob[]
  className?: string
}

const DEFAULT_QUEUE: ArtworkJob[] = [
  { id: "a1", job: "J-2291 · annual report", client: "Kammer & Co", stock: "170g silk", pages: 96, due: "tue 10:00", state: "approved" },
  { id: "a2", job: "J-2294 · gallery flyer", client: "Studio Örn", stock: "130g silk", pages: 2, due: "tue 16:00", state: "proofing" },
  { id: "a3", job: "J-2296 · menu rebrand", client: "Brasserie Astor", stock: "300g board", pages: 8, due: "wed 09:00", state: "proofing" },
  { id: "a4", job: "J-2298 · conference tote tags", client: "Nordic JS", stock: "170g silk", pages: 1, due: "thu 12:00", state: "waiting" },
]

const PRESS_STAGES: Stage[] = [
  { id: "s1", label: "Prepress", status: "pass", duration: "18 min" },
  { id: "s2", label: "Plating", status: "pass", duration: "26 min" },
  { id: "s3", label: "Ink mix · PMS 485", status: "pass", duration: "12 min" },
  { id: "s4", label: "Press run", status: "running", duration: "2 h 04" },
  { id: "s5", label: "Varnish coat", status: "fail", duration: "—", log: ["roller pressure out of band", "recoat after plate inspection"] },
  { id: "s6", label: "Cutting", status: "idle" },
  { id: "s7", label: "QA count", status: "idle" },
]

const REV_B: DiffLine[] = [
  { kind: "hunk", text: "cover · headline" },
  { kind: "del", text: "- Everything ships twice." },
  { kind: "add", text: "+ Everything ships twice — once for you, once for the shelf." },
  { kind: "ctx", text: "  sub: Kammer & Co annual report 2026" },
  { kind: "hunk", text: "page 3 · stat block" },
  { kind: "del", text: "- 98.2 % on-time delivery" },
  { kind: "add", text: "+ 98.4 % on-time delivery (audited)" },
]

const REV_A: DiffLine[] = [
  { kind: "hunk", text: "cover · headline" },
  { kind: "del", text: "- Logistics, at human scale." },
  { kind: "add", text: "+ Everything ships twice." },
  { kind: "hunk", text: "back page · colophon" },
  { kind: "ctx", text: "  printed by Press 2 · 170g silk" },
]

const STOCK_NOTES: Record<string, string> = {
  "300g board": "Board needs a longer drying gap — varnish slot adds 40 min.",
  "130g silk": "Light silk runs 4 % faster but jams below 12 k sheets/h.",
  "170g silk": "House stock · PMS 485 cover ink holds ±2 ΔE on this grade.",
}

const RUN_HOURS = ["06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17"]

/** Deterministic per-hour jitter in [-1, 1] seeded by the run signature. */
function hourNoise(i: number, seed: number) {
  const s = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453
  return (s - Math.floor(s)) * 2 - 1
}

/**
 * Impressions per hour across the press run — derived from run state:
 * makeready ramp for the first two hours, steady jittered output near target,
 * a crash while varnish has failed, and a recovery tail once it is requeued.
 */
function buildThroughput(target: number, varnish: Stage, seed: number) {
  const failed = varnish.status === "fail"
  const requeued = varnish.status === "queued"
  const recoverAt = requeued ? RUN_HOURS.length - 1 : -1
  return RUN_HOURS.map((h, i) => {
    const jitter = 0.9 + hourNoise(i, seed) * 0.07
    let rate: number
    if (i < 2) rate = target * (0.24 + i * 0.17)
    else rate = target * jitter
    if (failed && i >= RUN_HOURS.length - 2) rate = i === RUN_HOURS.length - 1 ? target * 0.16 : target * 0.38
    if (requeued && i >= RUN_HOURS.length - 1) rate = target * 0.82
    if (recoverAt >= 0 && i === recoverAt - 1) rate = target * 0.52
    return { hour: `${h}:00`, imp: Math.round(rate), target }
  })
}

const STATE_DOT: Record<ArtworkJob["state"], string> = {
  approved: "bg-[hsl(var(--ok))]",
  proofing: "bg-[hsl(var(--info))]",
  waiting: "bg-border",
}

export function PrintDesk({ press = "Press 2 · 6-colour sheet-fed", shift = "B", queue = DEFAULT_QUEUE, className }: PrintDeskProps) {
  const [stock, setStock] = React.useState("170g silk")
  const [target, setTarget] = React.useState(14200)
  const [rev, setRev] = React.useState<"a" | "b">("b")
  const [varnish, setVarnish] = React.useState<Stage>(PRESS_STAGES[4])

  const actual = 13240
  const attainment = Math.round((actual / target) * 100)
  const stages: Stage[] = PRESS_STAGES.map((s: Stage) => (s.id === "s5" ? varnish : s))
  const proofs = rev === "b" ? REV_B : REV_A
  // seed shifts when the run state changes so the trace visibly re-shapes
  const throughput = React.useMemo(
    () => buildThroughput(target, varnish, varnish.status === "fail" ? 3 : varnish.status === "queued" ? 7 : 11),
    [target, varnish],
  )
  const peak = throughput.reduce((a, p) => (p.imp > a.imp ? p : a), throughput[0])

  return (
    <div className={cn("flex flex-col overflow-hidden border-y bg-background font-sans text-foreground", className)}>
      <MotionConfig reducedMotion="user">
      {/* header — mono eyebrow + odometer numeral, no 48px strip */}
      <header className="flex items-end justify-between gap-6 border-b px-6 pb-3 pt-4">
        <div className="min-w-0">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px] text-muted-foreground">Print desk · shift {shift}</span>
          <h2 className="mt-1 truncate font-display text-[22px] font-bold leading-tight tracking-[-0.02em]">{press}</h2>
          
    </div>
        <div className="shrink-0 text-right">
          <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">sheets today</span>
          <motion.span
            key="sheets"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="block font-mono text-[30px] font-bold leading-none tabular-nums"
          >
            38 412
          </motion.span>
        </div>
      </header>

      {/* press band — the stage graph runs full-bleed across the shop floor */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b bg-muted/30 px-6 py-3">
        <PipelineRunGraph
          run="P2-1188"
          stages={stages}
          className="min-w-0 flex-1 rounded-none border-0 bg-transparent p-0 shadow-none"
          onRerunFailed={() => setVarnish((v: Stage) => ({ ...v, status: "queued", log: ["requeued by operator", "roller re-gauged at 2.4 bar"] }))}
        />
        <dl className="flex shrink-0 items-baseline gap-5 font-mono text-[11px] tabular-nums text-muted-foreground">
          <div>
            <dt className="sr-only">Annual report run size</dt>
            <dd>annual report · 12 000 sheets</dd>
          </div>
          <div>
            <dt className="sr-only">Waste</dt>
            <dd>waste 1.8 %</dd>
          </div>
          <div>
            <dt className="sr-only">Makeready spool-ups</dt>
            <dd>2 spool-ups</dd>
          </div>
        </dl>
      </div>

      {/* main — asymmetric ledger / instrument split */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-12">
        {/* artwork ledger — bare ruled rows, no card chrome */}
        <section aria-label="Artwork queue" className="min-w-0 border-b lg:col-span-5 lg:border-b-0 lg:border-r">
          <div className="flex items-baseline justify-between border-b px-4 py-2">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px] text-muted-foreground">Artwork queue</span>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{queue.length} jobs</span>
          </div>
          <ul className="divide-y">
            {queue.map((a: ArtworkJob) => (
              <li key={a.id} className="grid grid-cols-[76px_minmax(0,1fr)_44px_74px] items-baseline gap-2 px-4 py-2 text-[12px] odd:bg-muted/20">
                <span className="truncate font-mono text-[11px] font-bold tabular-nums">{a.job.split(" · ")[0]}</span>
                <span className="min-w-0">
                  <span className="block truncate font-medium leading-tight">{a.job.split(" · ")[1]}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{a.client} · {a.stock}</span>
                </span>
                <span className="text-right font-mono tabular-nums">{a.pages}p</span>
                <span className="flex items-baseline justify-end gap-1.5">
                  <span className="font-mono tabular-nums text-muted-foreground">{a.due}</span>
                  <span aria-hidden className={cn("size-1.5 shrink-0 rounded-[2px]", STATE_DOT[a.state])} />
                </span>
              </li>
            ))}
          </ul>
          <p className="border-t px-4 py-2 text-[11px] leading-relaxed text-muted-foreground">
            Sign-off locks the copy — later text changes restart the queue at prepress.
          </p>
        </section>

        {/* instruments — throughput trace + proof overlay */}
        <div className="flex min-w-0 flex-col lg:col-span-7">
          {/* throughput — vendored Bklit area chart, driven by run state + target */}
          <section aria-label="Throughput" className="border-b">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px] text-muted-foreground">Throughput · impressions per hour</span>
              <div className="flex items-center gap-3">
                <DragNumberField
                  label="Target sheets / h"
                  value={target}
                  onValueChange={(v: number) => setTarget(v)}
                  min={8000}
                  max={18000}
                  step={100}
                  precision={0}
                  unit="sh/h"
                  className="text-[11px]"
                />
                <span className={cn("font-mono text-[12px] font-bold tabular-nums", attainment >= 95 ? "text-[hsl(var(--ok))]" : attainment >= 80 ? "text-[hsl(var(--warn))]" : "text-[hsl(var(--err))]")}>
                  {attainment}%
                </span>
              </div>
            </div>
            <div role="img" aria-label={`Hourly impressions across run P2-1188, last hour ${actual.toLocaleString("sv-SE")} sheets of ${target.toLocaleString("sv-SE")} target — varnish stage ${varnish.status}`} className="px-2 pb-1 pt-1">
              <AreaChart data={throughput} xDataKey="hour" margin={{ top: 8, right: 12, bottom: 22, left: 40 }} style={{ height: 168 }}>
                <Grid horizontal numTicksRows={3} vertical={false} />
                <Area dataKey="imp" fillOpacity={0.3} gradientToOpacity={0} />
                <XAxis numTicks={5} />
                <YAxis numTicks={3} />
                <ChartTooltip
                  rows={(p) => [
                    { color: "var(--chart-line-primary)", label: "impressions", value: `${Number(p.imp).toLocaleString("sv-SE")} sh/h` },
                    { color: "hsl(var(--muted-foreground))", label: "vs target", value: `${Math.round((Number(p.imp) / Number(p.target)) * 100)} %` },
                  ]}
                />
              </AreaChart>
            </div>
            <dl className="flex gap-4 border-t px-4 py-2 font-mono text-[11px] tabular-nums text-muted-foreground">
              <div className="min-w-0">
                <dt className="sr-only">Last hour</dt>
                <dd><span className="font-bold text-foreground">{actual.toLocaleString("sv-SE")}</span> last hour</dd>
              </div>
              <div className="min-w-0">
                <dt className="sr-only">Peak hour</dt>
                <dd>peak {peak.imp.toLocaleString("sv-SE")} · {peak.hour}</dd>
              </div>
              <div className="ml-auto min-w-0">
                <dt className="sr-only">Varnish state</dt>
                <dd>varnish {varnish.status}</dd>
              </div>
            </dl>
          </section>

          {/* proofs — wide overlay panel, revision switcher floats over the diff */}
          <section aria-label="Copy proofs" className="relative min-h-0 flex-1">
            <div className="flex items-baseline justify-between border-b px-4 py-2 pr-36">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px] text-muted-foreground">Copy proofs</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{proofs.filter((l) => l.kind === "add").length}+ {proofs.filter((l) => l.kind === "del").length}− vs previous ink-jet proof</span>
            </div>
            <div className="absolute right-3 top-1.5 z-10 flex gap-0.5 rounded-md border bg-background/90 p-0.5 shadow-sm backdrop-blur-sm">
              {(["a", "b"] as const).map((r: "a" | "b") => (
                <Button
                  key={r}
                  size="xs"
                  variant={rev === r ? "secondary" : "ghost"}
                  aria-pressed={rev === r}
                  onClick={() => setRev(r)}
                  className="font-mono text-[11px] font-bold"
                >
                  rev {r.toUpperCase()}
                  {r === "a" && <RotateCcw className="size-3" aria-hidden />}
                </Button>
              ))}
            </div>
            <div className="px-3 py-2">
              <DiffPaneSplit lines={proofs} file={`brochure-copy · rev ${rev === "b" ? "A → B" : "orig → A"}`} className="rounded-none border-0 shadow-none" />
            </div>
          </section>
        </div>
      </div>

      {/* stock dock — full-width strip pinned to the bottom edge */}
      <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t bg-muted/20 px-4 py-2.5">
        <Layers className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] shrink-0 text-[10px] text-muted-foreground">Stock</span>
        <SegmentedControl
          size="sm"
          value={stock}
          onChange={(v: string) => setStock(v)}
          options={[
            { value: "130g silk", label: "130g silk" },
            { value: "170g silk", label: "170g silk" },
            { value: "300g board", label: "300g board" },
          ]}
        />
        <p className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">{STOCK_NOTES[stock]}</p>
      </footer>
          </MotionConfig>
    </div>
  )
}
