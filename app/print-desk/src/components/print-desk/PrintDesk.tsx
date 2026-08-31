import { useState } from "react"
import { Layers, RotateCcw, Timer } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel } from "@/components/primitives/handcraft"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/watermelon/table"
import { SegmentedControl } from "segmented-control"
import { PipelineRunGraph, type Stage } from "pipeline-run-graph"
import { DragNumberField } from "drag-number-field"
import { DiffPaneSplit, type DiffLine } from "diff-pane-split"

// COMPOSITE SCREEN · PRINT SHOP FLOOR
// composed of: pipeline-run-graph (press stage graph), drag-number-field
// (throughput odometer), diff-pane-split (copy proofs by revision),
// segmented-control (stock selector) + watermelon table for the artwork queue
// and a purpose-built shift counter.
//
// DESIGN BAR: header strip ≤48px · label 11px semibold uppercase 12% tracking
// · body 13px · numerics 12px tabular right-aligned · panels rounded-lg
// bordered with a 36px header strip · functional copy only · motion marks
// state changes, never decorates.

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

export function PrintDesk({ press = "Press 2 · 6-colour sheet-fed", shift = "B", queue = DEFAULT_QUEUE, className }: PrintDeskProps) {
  const [stock, setStock] = useState("170g silk")
  const [target, setTarget] = useState(14200)
  const [rev, setRev] = useState<"a" | "b">("b")
  const [varnish, setVarnish] = useState<Stage>(PRESS_STAGES[4])

  const actual = 13240
  const attainment = Math.round((actual / target) * 100)
  const stages: Stage[] = PRESS_STAGES.map((s: Stage) => (s.id === "s5" ? varnish : s))
  const proofs = rev === "b" ? REV_B : REV_A

  return (
    <div className={cn("flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      {/* screen header */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Print desk</h2>
        <span className="text-[12px] text-muted-foreground">{press}</span>
        <span className="text-[12px] text-muted-foreground">· shift {shift}</span>
        <span className="ml-auto font-mono text-[12px] tabular-nums text-muted-foreground">sheets today 38 412</span>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 xl:grid-cols-[320px_minmax(0,1fr)_340px]">
        {/* artwork queue + stock */}
        <div className="flex min-w-0 flex-col gap-4">
          <section className="min-w-0 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Artwork queue</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{queue.length} jobs</span>
            </header>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="h-8 px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Job</TableHead>
                  <TableHead className="h-8 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Pages</TableHead>
                  <TableHead className="h-8 px-3 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue.map((a: ArtworkJob) => (
                  <TableRow key={a.id} className="text-[12px]">
                    <TableCell className="px-3">
                      <span className="block font-medium">{a.job}</span>
                      <span className="block text-[11px] text-muted-foreground">{a.client} · {a.stock}</span>
                    </TableCell>
                    <TableCell className="px-2 font-mono tabular-nums">{a.pages}</TableCell>
                    <TableCell className="px-3 text-right">
                      <span className="block font-mono tabular-nums text-muted-foreground">{a.due}</span>
                      <span className={cn("block text-[10px] font-bold uppercase", a.state === "approved" && "text-[hsl(var(--ok))]", a.state === "proofing" && "text-[hsl(var(--info))]", a.state === "waiting" && "text-muted-foreground")}>
                        {a.state}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center gap-2 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <Layers className="size-3.5" /> Stock selector
            </header>
            <div className="space-y-2 p-3">
              <SegmentedControl
                size="sm"
                className="w-full justify-between"
                value={stock}
                onChange={(v: string) => setStock(v)}
                options={[
                  { value: "130g silk", label: "130g silk" },
                  { value: "170g silk", label: "170g silk" },
                  { value: "300g board", label: "300g board" },
                ]}
              />
              <p className="text-[11px] text-muted-foreground">
                {stock === "300g board" ? "Board needs a longer drying gap — varnish slot adds 40 min." : stock === "130g silk" ? "Light silk runs 4 % faster but jams below 12 k sheets/h." : "House stock · PMS 485 cover ink holds ±2 ΔE on this grade."}
              </p>
            </div>
          </section>
        </div>

        {/* press stage graph + odometer */}
        <div className="flex min-w-0 flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Press stage graph · run P2-1188</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">annual report · 12 000 sheets</span>
            </header>
            <div className="p-3">
              <PipelineRunGraph run="P2-1188" stages={stages} onRerunFailed={() => setVarnish((v: Stage) => ({ ...v, status: "queued", log: ["requeued by operator", "roller re-gauged at 2.4 bar"] }))} />
            </div>
          </section>
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Throughput odometer</span>
              <Timer className="size-3.5 text-muted-foreground" />
            </header>
            <div className="space-y-3 p-3">
              <DragNumberField label="Target sheets / h" value={target} onValueChange={(v: number) => setTarget(v)} min={8000} max={18000} step={100} precision={0} unit="sh/h" />
              <div className="flex items-baseline justify-between border-t pt-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Last hour</span>
                <span className="font-mono text-[20px] font-bold tabular-nums">{actual.toLocaleString("sv-SE")}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className={cn("h-full rounded-full", attainment >= 95 ? "bg-[hsl(var(--ok))]" : attainment >= 80 ? "bg-[hsl(var(--warn))]" : "bg-[hsl(var(--err))]")} style={{ width: `${Math.min(100, attainment)}%` }} />
              </div>
              <p className="text-[11px] text-muted-foreground">{attainment}% of target · waste 1.8 % · makeready 2 spool-ups</p>
            </div>
          </section>
        </div>

        {/* proofs by revision */}
        <aside className="flex min-w-0 flex-col gap-4">
          <section className="min-h-0 flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Copy proofs</span>
              <div className="flex gap-1">
                {(["a", "b"] as const).map((r: "a" | "b") => (
                  <button
                    key={r}
                    onClick={() => setRev(r)}
                    className={cn("rounded px-1.5 py-0.5 font-mono text-[11px] font-bold", rev === r ? "bg-foreground text-background" : "border bg-background text-muted-foreground hover:bg-muted")}
                  >
                    rev {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </header>
            <div className="p-3">
              <DiffPaneSplit lines={proofs} file={`brochure-copy · rev ${rev === "b" ? "A → B" : "orig → A"}`} />
            </div>
          </section>
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center gap-2 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <RotateCcw className="size-3.5" /> Proof policy
            </header>
            <p className="p-3 text-[11px] text-muted-foreground">
              Each revision is diffed against the previous ink-jet proof. The client sign-off locks the copy; later text changes restart the queue at prepress.
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}
