import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { CalendarClock, ClipboardCheck, Download, RefreshCcw, Sparkles, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, Grain, CornerTicks, Accent, Ordinal } from "@/components/primitives/handcraft"
import { FunnelStageBars } from "funnel-stage-bars"
import { PipelineRunGraph, type Stage } from "pipeline-run-graph"
import { JobTray, type Job } from "job-tray"
import { Checkbox } from "@/components/watermelon/checkbox"

// COMPOSITE SCREEN · STUDIO OPERATIONS
// composed of: funnel-stage-bars (pitch funnel), pipeline-run-graph (production
// runs), job-tray (render farm) + purpose-built crew roster, welcome pass and
// throughput figures.
//
// DESIGN BAR: header strip ≤48px · labels 11px semibold uppercase 12% tracking
// · body 13px · numerics 12px mono tabular right · panels rounded-lg with 36px
// header strips · functional copy only · motion marks state changes only.

export type AgencyPipelineDeskProps = {
  studio?: string
  week?: string
  onRerunFailed?: () => void
  className?: string
}

const DEFAULT_STAGES: Stage[] = [
  { id: "s1", label: "Cut conform", status: "pass", duration: "06:12", log: ["conform v4 accepted", "handles +12f"] },
  { id: "s2", label: "Grade — colour", status: "running", duration: "11:40" },
  { id: "s3", label: "VFX comp pass", status: "running", duration: "03:58" },
  { id: "s4", label: "Mix & master", status: "queued" },
  { id: "s5", label: "QC playout", status: "idle" },
]

const DEFAULT_JOBS: Job[] = [
  { id: "j1", label: "SKY-104 · 4K delivery · node 07", status: "running", progress: 62 },
  { id: "j2", label: "SKY-104 · proxies x14", status: "done", progress: 100 },
  { id: "j3", label: "TIDE-22 · retimed plates", status: "queued", progress: 0 },
  { id: "j4", label: "TIDE-22 · denoise pass", status: "error", progress: 41, log: ["node 03 out of memory — retry queued"] },
]

const PITCHES = [
  { label: "Briefs in", value: 24 },
  { label: "Treatments", value: 16 },
  { label: "Pitched", value: 9 },
  { label: "Optioned", value: 4 },
  { label: "Greenlit", value: 2 },
]

type CrewMember = { id: string; name: string; craft: string; booking: string; util: number; booked: boolean }

const DEFAULT_CREW: CrewMember[] = [
  { id: "c1", name: "Agneta Lind", craft: "Colourist", booking: "SKY-104 · w34–35", util: 92, booked: true },
  { id: "c2", name: "Tomas Ekwall", craft: "VFX lead", booking: "TIDE-22 · w34", util: 78, booked: true },
  { id: "c3", name: "Ruth Okafor", craft: "Editor", booking: "unassigned", util: 34, booked: false },
  { id: "c4", name: "Milo Brandt", craft: "Sound mix", booking: "unassigned", util: 12, booked: false },
  { id: "c5", name: "June Halvorsen", craft: "Producer", booking: "pitch · Nova Bank", util: 61, booked: false },
]

const PASSES = [
  { id: "p1", client: "Nordbro Bank", job: "brand film · 3×45s", door: "Thu 11:40", floor: "suite 2 · floor 4" },
  { id: "p2", client: "Klara Turell", job: "doc interview", door: "Thu 15:00", floor: "suite 1 · floor 3" },
]

export function AgencyPipelineDesk({ studio = "Zigzag Film", week = "week 34", onRerunFailed, className }: AgencyPipelineDeskProps) {
  const [stages, setStages] = React.useState(DEFAULT_STAGES)
  const [jobs, setJobs] = React.useState(DEFAULT_JOBS)
  const [crew, setCrew] = React.useState(DEFAULT_CREW)
  const [picked, setPicked] = React.useState<string[]>(["c3"])

  const booked = crew.filter((c) => c.booked).length
  const utilAvg = Math.round(crew.reduce((a, c) => a + c.util, 0) / crew.length)

  const toggleCrew = (id: string, on: boolean) =>
    setCrew((cs) => cs.map((c) => (c.id === id ? { ...c, booked: on, booking: on ? c.booking === "unassigned" ? "SKY-104 · w34" : c.booking : "unassigned" } : c)))

  const advance = (id: string) =>
    setStages((ss) => ss.map((s) => (s.id === id && s.status === "queued" ? { ...s, status: "running" } : s)))

  const dismissJob = (id: string) => setJobs((js) => js.filter((j) => j.id !== id))
  const cancelJob = (j: Job) =>
    setJobs((js) => js.map((x) => (x.id === j.id ? { ...x, status: "error", log: ["cancelled by operator"] } : x)))

  return (
    <div className={cn("relative isolate flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <Grain opacity={0.03} />

      {/* screen header */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Studio operations</h2>
        <span className="text-[12px] text-muted-foreground">{studio}</span>
        <span className="text-[12px] text-muted-foreground">· {week}</span>
        <span className="ml-2 hidden items-center gap-1.5 rounded border bg-muted/40 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground md:inline-flex">render farm · 11 nodes online</span>
        <button className="ml-auto flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted"><Download className="size-3.5" /> Weekly PDF</button>
        <button className="flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted"><RefreshCcw className="size-3.5" /> Sync farm</button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
        {/* left rail — pitch funnel + welcome passes */}
        <aside className="flex min-w-0 flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Pitch funnel</span>
              <Ordinal n={34} className="text-muted-foreground" />
            </header>
            <div className="p-3">
              <FunnelStageBars stages={PITCHES} eyebrow="q3 new business" className="text-[12px]" />
              <p className="mt-2 border-t pt-2 text-[11px] text-muted-foreground">Two optioned treatments go to board on Friday. Treatments past 30 days need a chase.</p>
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Client welcome passes</span>
              <CalendarClock className="size-3.5 text-muted-foreground" />
            </header>
            <div className="grid gap-2 p-3">
              {PASSES.map((p, i) => (
                <div key={p.id} className="group relative overflow-hidden rounded-md border bg-background p-3">
                  <CornerTicks offset={6} size={9} className="text-border" />
                  <Ordinal n={i + 1} total={PASSES.length} className="text-muted-foreground" />
                  <p className="mt-1 font-display text-[15px] font-black leading-tight tracking-tight">
                    Welcome, <Accent>{p.client}</Accent>
                  </p>
                  <p className="text-[12px] text-muted-foreground">{p.job}</p>
                  <div className="mt-2 flex items-center justify-between border-t border-dashed pt-2 text-[11px]">
                    <span className="font-mono tabular-nums">{p.door}</span>
                    <span className="text-muted-foreground">{p.floor}</span>
                  </div>
                </div>
              ))}
              <button className="flex h-8 items-center justify-center gap-1.5 rounded-md border bg-background text-[11px] font-semibold hover:bg-muted"><UserPlus className="size-3.5" /> Issue pass</button>
            </div>
          </section>
        </aside>

        {/* centre — production run graph + crew assignment */}
        <section className="flex min-w-0 flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Production run · SKY-104 master</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">2 running · 1 queued</span>
            </header>
            <div className="p-3">
              <PipelineRunGraph run="SKY-104 · conform → playout" stages={stages} onRerunFailed={onRerunFailed} className="text-[12px]" />
              <div className="mt-2 flex gap-1.5 border-t pt-2">
                {stages.filter((s) => s.status === "queued" || s.status === "idle").map((s) => (
                  <button key={s.id} onClick={() => advance(s.id)} className="flex h-7 items-center gap-1 rounded border bg-background px-2 text-[11px] font-semibold hover:bg-muted"><ClipboardCheck className="size-3" /> release {s.label.toLowerCase()}</button>
                ))}
              </div>
            </div>
          </section>

          <section className="min-h-0 flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Crew assignment · {booked} booked</span>
              <span className="font-mono text-[12px] tabular-nums text-muted-foreground">avg util {utilAvg}%</span>
            </header>
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr className="border-b text-left text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  <th className="w-8 px-3 py-1.5" />
                  <th className="px-2 py-1.5 font-semibold">Name</th>
                  <th className="px-2 py-1.5 font-semibold">Craft</th>
                  <th className="px-2 py-1.5 font-semibold">Booking</th>
                  <th className="px-3 py-1.5 text-right font-semibold">Util</th>
                </tr>
              </thead>
              <tbody>
                {crew.map((c) => (
                  <tr key={c.id} className={cn("border-b border-app-line/60 last:border-0 transition-colors", c.booked && "bg-accent/40")}>
                    <td className="px-3 py-1.5">
                      <Checkbox checked={c.booked} onCheckedChange={(v: boolean) => toggleCrew(c.id, v)} aria-label={`book ${c.name}`} />
                    </td>
                    <td className="px-2 py-1.5 font-medium">{c.name}</td>
                    <td className="px-2 py-1.5 text-muted-foreground">{c.craft}</td>
                    <td className="px-2 py-1.5 text-muted-foreground">{c.booking}</td>
                    <td className="px-3 py-1.5 text-right font-mono tabular-nums">{c.util}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">Tick to book onto SKY-104 for w34 · unticked seats release at 18:00</div>
          </section>
        </section>

        {/* right rail — render job tray */}
        <aside className="flex min-w-0 flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Render job tray</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{jobs.filter((j) => j.status === "running" || j.status === "queued").length} live</span>
            </header>
            <div className="p-3">
              <JobTray jobs={jobs} onCancel={cancelJob} onDismiss={dismissJob} />
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Farm throughput</header>
            <div className="grid grid-cols-2 gap-px bg-border p-px">
              {[
                ["frames / h", "41,208"],
                ["queue wait", "4 min"],
                ["fail rate", "0.8%"],
                ["nodes online", "11 / 12"],
              ].map(([k, v]) => (
                <div key={k} className="bg-card p-3">
                  <MonoLabel tick={false} className="block text-[10px] text-muted-foreground">{k}</MonoLabel>
                  <motion.span key={v} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="mt-0.5 block text-right font-mono text-[15px] font-bold tabular-nums">{v}</motion.span>
                </div>
              ))}
            </div>
            <AnimatePresence>
              {jobs.some((j) => j.status === "error") && (
                <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 border-t bg-[hsl(var(--err)/0.06)] px-3 py-2 text-[11px] font-semibold text-[hsl(var(--err))]">
                  <Sparkles className="size-3.5" /> A failed job is holding two queued dependants
                </motion.p>
              )}
            </AnimatePresence>
          </section>
        </aside>
      </div>
    </div>
  )
}
