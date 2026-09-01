import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { ClipboardCheck, Download, RefreshCcw, Sparkles, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FunnelStageBars } from "funnel-stage-bars"
import { PipelineRunGraph, type Stage } from "pipeline-run-graph"
import { JobTray, type Job } from "job-tray"
import { Checkbox } from "@/components/watermelon/checkbox"

// COMPOSITE SCREEN · STUDIO OPERATIONS
// Frameless studio board with the pitch funnel as a TALL VERTICAL SPINE on the
// left (2-layer, drop-off chips, hover readout below). The production run runs
// as a band across the centre with crew assignment beneath it; welcome passes
// and the render job tray round out the right rail as bare rails + cards.

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
  const [stageHover, setStageHover] = React.useState<number | null>(null)

  const booked = crew.filter((c) => c.booked).length
  const utilAvg = Math.round(crew.reduce((a, c) => a + c.util, 0) / crew.length)
  const running = stages.filter((s) => s.status === "running").length
  const queuedStages = stages.filter((s) => s.status === "queued" || s.status === "idle")

  const toggleCrew = (id: string, on: boolean) =>
    setCrew((cs) => cs.map((c) => (c.id === id ? { ...c, booked: on, booking: on ? c.booking === "unassigned" ? "SKY-104 · w34" : c.booking : "unassigned" } : c)))

  const advance = (id: string) =>
    setStages((ss) => ss.map((s) => (s.id === id && s.status === "queued" ? { ...s, status: "running" } : s)))

  const dismissJob = (id: string) => setJobs((js) => js.filter((j) => j.id !== id))
  const cancelJob = (j: Job) =>
    setJobs((js) => js.map((x) => (x.id === j.id ? { ...x, status: "error", log: ["cancelled by operator"] } : x)))

  const hovered = stageHover !== null ? PITCHES[stageHover] : null
  const holdFromPrev = stageHover !== null && stageHover > 0 ? Math.round((PITCHES[stageHover].value / PITCHES[stageHover - 1].value) * 100) : null

  return (
    <div className={cn("flex min-h-dvh flex-col bg-background font-sans text-foreground", className)}>
      <MotionConfig reducedMotion="user">
      {/* header — display masthead: the studio name carries the desk */}
      <header className="flex flex-wrap items-end gap-x-4 gap-y-2 border-b px-5 py-3">
        <div>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Studio operations · {week}</span>
          <h2 className="font-display text-[24px] font-black leading-none tracking-[-0.03em]">{studio}</h2>
          
    </div>
        <span className="mb-0.5 hidden items-center gap-1.5 rounded border bg-muted/40 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground md:inline-flex">render farm · 11 nodes online</span>
        <div className="ml-auto mb-0.5 flex gap-2">
          <Button variant="outline" size="sm"><Download className="size-3.5" /> Weekly PDF</Button>
          <Button size="sm"><RefreshCcw className="size-3.5" /> Sync farm</Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-12">
        {/* FUNNEL SPINE — tall vertical rail, the desk's left bone */}
        <aside className="flex min-w-0 flex-col border-b p-5 lg:col-span-3 lg:border-b-0 lg:border-r" aria-label="Pitch funnel">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px] text-muted-foreground">Pitch funnel</span>
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground">q3 · 24 in</span>
          </div>
          <div className="mt-3 min-h-0 flex-1">
            <FunnelStageBars
              stages={PITCHES}
              orientation="vertical"
              layers={2}
              edges="curved"
              showDropOff
              hoveredIndex={stageHover}
              onHoverChange={setStageHover}
              className="text-[12px]"
            />
          </div>
          {/* live readout for the hovered stage */}
          <div className="mt-3 border-t pt-2" aria-live="polite">
            {hovered ? (
              <motion.p key={stageHover} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-[12px]">
                <span className="font-bold">{hovered.label}</span>
                <span className="font-mono tabular-nums text-muted-foreground"> · {hovered.value}</span>
                {holdFromPrev !== null && <span className="text-muted-foreground"> · {holdFromPrev}% hold from previous</span>}
              </motion.p>
            ) : (
              <p className="text-[12px] text-muted-foreground">Hover a stage for its count and hold rate.</p>
            )}
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              Two optioned treatments go to board on Friday. Treatments past 30 days need a chase.
            </p>
          </div>
        </aside>

        {/* centre — production run band + crew assignment */}
        <section className="flex min-w-0 flex-col gap-5 p-5 lg:col-span-5">
          <section aria-label="Production run" className="overflow-hidden rounded-lg border bg-card shadow-sm">
            <div className="flex items-baseline justify-between px-3 py-2">
              <h3 className="font-display text-[13px] font-bold">Production run · SKY-104 master</h3>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{running} running · {queuedStages.length} waiting</span>
            </div>
            <div className="px-3 pb-3">
              <PipelineRunGraph run="SKY-104 · conform → playout" stages={stages} onRerunFailed={onRerunFailed} className="text-[12px]" />
              {queuedStages.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 border-t pt-2">
                  {queuedStages.map((s) => (
                    <Button key={s.id} variant="outline" size="xs" onClick={() => advance(s.id)} aria-label={`Release ${s.label} into the run`}>
                      <ClipboardCheck className="size-3" /> release {s.label.toLowerCase()}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section aria-label="Crew assignment" className="min-h-0 flex-1 overflow-hidden rounded-lg border bg-card shadow-sm">
            <div className="flex items-baseline justify-between px-3 py-2">
              <h3 className="font-display text-[13px] font-bold">Crew assignment <span className="font-mono text-[11px] font-normal tabular-nums text-muted-foreground">· {booked} booked</span></h3>
              <span className="font-mono text-[12px] tabular-nums text-muted-foreground">avg util {utilAvg}%</span>
            </div>
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr className="border-y bg-muted/40 text-left text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
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

        {/* right rail — welcome passes + render tray + bare throughput stats */}
        <aside className="flex min-w-0 flex-col gap-5 border-t p-5 lg:col-span-4 lg:border-l lg:border-t-0">
          <section aria-label="Client welcome passes">
            <div className="flex items-baseline justify-between border-b pb-1.5">
              <h3 className="font-display text-[13px] font-bold">Client welcome passes</h3>
              <span className="font-mono text-[10px] uppercase text-muted-foreground">visiting this week</span>
            </div>
            <div className="grid gap-2 pt-2.5">
              {PASSES.map((p, i) => (
                <div key={p.id} className="group relative overflow-hidden rounded-md border bg-muted/20 p-3">
                  <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-muted-foreground">{String(i + 1).padStart(2, "0")} /</span>
                  <p className="mt-1 font-display text-[15px] font-black leading-tight tracking-tight">
                    Welcome, <em className="font-serif italic">{p.client}</em>
                  </p>
                  <p className="text-[12px] text-muted-foreground">{p.job}</p>
                  <div className="mt-2 flex items-center justify-between border-t border-dashed pt-2 text-[11px]">
                    <span className="font-mono tabular-nums">{p.door}</span>
                    <span className="text-muted-foreground">{p.floor}</span>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full"><UserPlus className="size-3.5" /> Issue pass</Button>
            </div>
          </section>

          <section aria-label="Render job tray" className="min-h-0 flex-1 overflow-hidden rounded-lg border bg-card shadow-sm">
            <div className="flex items-baseline justify-between px-3 py-2">
              <h3 className="font-display text-[13px] font-bold">Render job tray</h3>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{jobs.filter((j) => j.status === "running" || j.status === "queued").length} live</span>
            </div>
            <div className="px-3 pb-3">
              <JobTray jobs={jobs} onCancel={cancelJob} onDismiss={dismissJob} />
            </div>
          </section>

          {/* farm throughput — bare mono rail, rules only */}
          <section aria-label="Farm throughput">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px] text-muted-foreground">Farm throughput</span>
            <dl className="mt-1 grid grid-cols-2 divide-x border-y text-[12px] [&>div:nth-child(odd)]:border-r">
              {[
                ["frames / h", "41,208"],
                ["queue wait", "4 min"],
                ["fail rate", "0.8%"],
                ["nodes online", "11 / 12"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-2 px-3 py-2">
                  <dt className="text-muted-foreground">{k}</dt>
                  <motion.dd key={v} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="font-mono text-[13px] font-bold tabular-nums">{v}</motion.dd>
                </div>
              ))}
            </dl>
            <AnimatePresence>
              {jobs.some((j) => j.status === "error") && (
                <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 pt-2 text-[11px] font-semibold text-[hsl(var(--err))]">
                  <Sparkles className="size-3.5" /> A failed job is holding two queued dependants
                </motion.p>
              )}
            </AnimatePresence>
          </section>
        </aside>
      </div>
          </MotionConfig>
    </div>
  )
}
