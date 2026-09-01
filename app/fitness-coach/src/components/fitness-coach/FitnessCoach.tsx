import { useMemo, useState } from "react"
import { motion, MotionConfig } from "motion/react"
import { ArrowDownUp, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { ActivityHeatmap, type HeatCell } from "activity-heatmap"
import { RadialGauge } from "radial-gauge"
import { CronPreview } from "cron-preview"
import { SegmentedControl } from "segmented-control"
import { UploadQueue, type UploadFile } from "upload-queue"
import { ToastStack, type Toast } from "toast-stack"
import { Button } from "@/components/ui/button"
import { AreaChart, Area } from "@/components/bklit/area-chart"
import { Grid } from "@/components/bklit/grid"
import { XAxis } from "@/components/bklit/x-axis"
import { ChartTooltip } from "@/components/bklit/tooltip/chart-tooltip"

// COMPOSITE SCREEN · COACH CONSOLE
// composed of: radial-gauge (readiness, zoned), cron-preview (session
// cadence), activity-heatmap (adherence band), upload-queue (form video
// drops), segmented-control (athlete + program switching), vendored Bklit
// AreaChart (weekly session load) + purpose-built program segment list.
// STRUCTURE: split band — dark ink console band on top, light 12-col
// workspace below (gauge rail | load + program | drops), full-width
// adherence heatmap band anchoring the bottom.

export type Athlete = { id: string; name: string; readiness: number; adherence: number; note: string }

export type FitnessCoachProps = {
  block?: string
  week?: string
  athletes?: Athlete[]
  cadence?: string
  drops?: UploadFile[]
  className?: string
}

const DEFAULT_ATHLETES: Athlete[] = [
  { id: "a1", name: "Maja", readiness: 74, adherence: 0.85, note: "left shoulder grumble — press volume trimmed" },
  { id: "a2", name: "Oskar", readiness: 58, adherence: 0.6, note: "two missed sessions — reset to week 5 loads" },
  { id: "a3", name: "Noor", readiness: 86, adherence: 0.95, note: "cleared to test back squat single" },
]

const DEFAULT_DROPS: UploadFile[] = [
  { id: "v1", name: "squat-top-set-3.mov", size: 48_200_000, status: "done" },
  { id: "v2", name: "deadlift-friday-4.mov", size: 39_500_000, status: "uploading", progress: 27 },
  { id: "v3", name: "press-set-2.mov", size: 31_800_000, status: "error", tries: 1, error: "gym wi-fi captive portal timed out" },
]

type Segment = { name: string; mins: number; detail: string }

const PROGRAMS: Record<string, { label: string; segments: Segment[] }> = {
  base: {
    label: "Base build",
    segments: [
      { name: "Warm-up ramp", mins: 12, detail: "bike 5' · banded hips · empty bar complexes" },
      { name: "Tempo zones", mins: 26, detail: "4×8' @ zone 2 · cadence holds" },
      { name: "Accessory circuit", mins: 16, detail: "3×12 sled push · farmer carries" },
      { name: "Cooldown", mins: 8, detail: "calf stretch · breath work 4-7-8" },
    ],
  },
  hypertrophy: {
    label: "Hypertrophy",
    segments: [
      { name: "Warm-up ramp", mins: 12, detail: "bike 5' · banded hips · empty bar complexes" },
      { name: "Main — back squat", mins: 32, detail: "5×5 @ 82.5% · 3' rests · belt optional" },
      { name: "Accessory — RDL + row", mins: 14, detail: "3×10 RDL · 3×12 chest-supported row" },
      { name: "Cooldown", mins: 8, detail: "calf stretch · breath work 4-7-8" },
    ],
  },
  peak: {
    label: "Peak & test",
    segments: [
      { name: "Prime openers", mins: 10, detail: "ramp to 70% · singles at 85%" },
      { name: "Test — back squat", mins: 24, detail: "work to 1RM · 3 attempts max" },
      { name: "Back-off volume", mins: 12, detail: "2×4 @ 75% · speed reps" },
      { name: "Cooldown", mins: 10, detail: "full body stretch · contrast bath" },
    ],
  },
}

const WEEKS = 12
const PATTERN = [1, 3, 0, 2, 4, 1, 2, 3, 1, 0, 4, 2, 1, 3, 2, 4]

function buildCells(adherence: number): HeatCell[] {
  return Array.from({ length: PATTERN.length * 7 }, (_, i) => {
    const base = PATTERN[i % PATTERN.length]
    const decay = 1 - (i / (PATTERN.length * 7)) * 0.25
    return { count: Math.min(4, Math.round(base * adherence * decay)) }
  })
}

const levelOf = (c: number): 0 | 1 | 2 | 3 | 4 => (c === 0 ? 0 : c === 1 ? 1 : c === 2 ? 2 : c === 3 ? 3 : 4)

/** deterministic seed from a string — stable weekly load, no Math.random */
const seedOf = (s: string) => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 1000) / 1000
}

type LoadPoint = { date: Date; planned: number; completed: number }

function buildLoadSeries(segments: Segment[], adherence: number): LoadPoint[] {
  const base = segments.reduce((a, s) => a + s.mins, 0)
  const intensity = segments.reduce((a, s) => a + s.mins * (0.9 + seedOf(s.name) * 0.45), 0) / Math.max(1, base)
  const thisMonday = (() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    return d
  })()
  return Array.from({ length: WEEKS }, (_, i) => {
    const w = WEEKS - 1 - i
    const date = new Date(thisMonday.getTime() - w * 7 * 86_400_000)
    const wave = 0.82 + seedOf(`wave-${i}-${segments.map((s) => s.name).join("|")}`) * 0.36
    const ramp = 0.8 + (i / (WEEKS - 1)) * 0.4
    const planned = Math.round(base * intensity * wave * ramp)
    const done = seedOf(`done-${i}-${adherence}`)
    const completed = Math.round(planned * Math.min(1, adherence * (0.75 + done * 0.35)))
    return { date, planned, completed }
  })
}

export function FitnessCoach({ block = "Hypertrophy — lower focus", week = "Week 6 of 12", athletes = DEFAULT_ATHLETES, cadence: initialCadence = "0 6 * * 1,3,5", drops = DEFAULT_DROPS, className }: FitnessCoachProps) {
  const [who, setWho] = useState("a1")
  const [program, setProgram] = useState("hypertrophy")
  const [cadence, setCadence] = useState(initialCadence)
  const [files, setFiles] = useState(drops)
  const [segments, setSegments] = useState<Segment[]>(PROGRAMS.hypertrophy.segments)
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = (title: string, tone: Toast["tone"] = "ok") =>
    setToasts((t) => [...t.slice(-2), { id: String(Date.now() + Math.random()), title, tone }])

  const athlete = athletes.find((a) => a.id === who) ?? athletes[0]

  // program segment state drives the load panel — switching/reordering recomputes
  const loadSeries = useMemo(() => buildLoadSeries(segments, athlete.adherence), [segments, athlete.adherence])
  const latestLoad = loadSeries[loadSeries.length - 1]
  const totalMins = segments.reduce((a, s) => a + s.mins, 0)
  const maxMins = Math.max(...segments.map((s) => s.mins))

  const switchProgram = (v: string) => {
    setProgram(v)
    setSegments(PROGRAMS[v]?.segments ?? [])
    push(`program switched — ${WEEKS} wk load recomputed`, "info")
  }

  const switchAthlete = (v: string) => {
    setWho(v)
    push(`card switched to ${athletes.find((a) => a.id === v)?.name ?? v}`, "info")
  }

  const cells = buildCells(athlete.adherence)
  const weeksDone = cells.reduce((a, c) => a + (c.count > 0 ? 1 : 0), 0)

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-xl border bg-background font-sans text-foreground", className)}>
      <MotionConfig reducedMotion="user">
      {/* console band — dark ink, split off the workspace below */}
      <header className="bg-foreground px-6 py-5 text-background">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-background/60">Coach console</span>
            <h2 className="mt-1.5 font-display text-[21px] font-bold leading-none tracking-[-0.02em]">
              {block} <span aria-hidden className="mx-1.5 opacity-40">/</span> <span className="font-mono text-[15px] font-medium opacity-80">{week}</span>
            </h2>
          </MotionConfig>
    </div>
          <SegmentedControl
            size="sm"
            value={who}
            onChange={switchAthlete}
            options={athletes.map((a) => ({ value: a.id, label: a.name }))}
          />
        </div>
        <p className="mt-2 text-[12px] text-background/65">
          <span className="font-semibold text-background">{athlete.name}</span> — {athlete.note} · {athletes.length} athletes on the card
        </p>
      </header>

      {/* workspace — asymmetric 12-col: gauge rail | load + program | drops */}
      <div className="grid flex-1 grid-cols-1 gap-x-6 gap-y-6 px-6 py-5 lg:grid-cols-12">
        <div className="flex flex-col gap-5 lg:col-span-4 lg:border-r lg:pr-6">
          <section aria-label={`Readiness · ${athlete.name}`}>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Readiness</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{athlete.name}</span>
            </div>
            <RadialGauge
              className="mt-3"
              value={athlete.readiness}
              min={0}
              max={100}
              precision={0}
              size={168}
              notches={32}
              showCenterValue
              label="ready"
              unit="%"
              zones={[
                { to: 55, color: "hsl(var(--err))", label: "deload" },
                { to: 75, color: "hsl(var(--warn))", label: "moderate" },
                { to: 100, color: "hsl(var(--ok))", label: "go" },
              ]}
            />
            <p className="mt-4 text-[11px] leading-[1.5] text-muted-foreground">{athlete.note}</p>
          </section>

          <section aria-label="Session cadence" className="mt-auto rounded-lg border border-dashed p-4">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Auto-book cadence</span>
            <div className="mt-3">
              <CronPreview expr={cadence} onChange={(v: string) => { setCadence(v); push("cadence updated — next sessions re-booked", "info") }} />
            </div>
            <p className="mt-3 border-t border-dashed pt-2.5 text-[11px] leading-[1.5] text-muted-foreground">
              Changing cadence moves unbooked sessions only — logged sessions keep their day.
            </p>
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-5 lg:col-span-5">
          <section aria-label="Session load" className="rounded-lg border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 pb-2.5 pt-3">
              <div>
                <h3 className="text-[12px] font-semibold">Session load</h3>
                <p className="font-mono text-[10px] tabular-nums text-muted-foreground">latest wk {latestLoad.completed} / {latestLoad.planned} u</p>
              </div>
              <SegmentedControl
                size="sm"
                value={program}
                onChange={switchProgram}
                options={Object.entries(PROGRAMS).map(([value, p]) => ({ value, label: p.label }))}
              />
            </div>
            <div className="px-2 pb-2 pt-3">
              <AreaChart data={loadSeries} margin={{ top: 8, right: 10, bottom: 24, left: 4 }} style={{ aspectRatio: "auto", height: 148 }}>
                <Grid horizontal numTicksRows={3} />
                <Area dataKey="planned" stroke="var(--chart-line-secondary)" fill="var(--chart-line-secondary)" fillOpacity={0.05} strokeWidth={1.5} />
                <Area dataKey="completed" stroke="var(--chart-line-primary)" fill="var(--chart-line-primary)" fillOpacity={0.26} />
                <XAxis numTicks={4} />
                <ChartTooltip
                  rows={(p) => [
                    { color: "var(--chart-line-primary)", label: "completed", value: `${Math.round(Number(p.completed)).toLocaleString()} u` },
                    { color: "var(--chart-line-secondary)", label: "planned", value: `${Math.round(Number(p.planned)).toLocaleString()} u` },
                  ]}
                />
              </AreaChart>
            </div>
            <p className="border-t px-4 py-2 text-[11px] text-muted-foreground">Weekly training load from the live segment list — switching program recomputes the whole curve.</p>
          </section>

          <section aria-label="Program segments" className="rounded-lg border bg-card">
            <div className="flex items-center justify-between border-b px-4 pb-2.5 pt-3">
              <h3 className="text-[12px] font-semibold">Program segments <span className="ml-1 font-mono text-[11px] tabular-nums text-muted-foreground">{totalMins}′</span></h3>
              <span className="text-[11px] font-semibold text-[hsl(var(--info))]">tap to shuffle order</span>
            </div>
            <ul className="divide-y divide-border/60">
              {segments.map((s, i) => (
                <li key={s.name} className="flex items-center gap-3 px-4 py-2">
                  <span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground shrink-0">{String(i + 1).padStart(2, "0")}<span className="opacity-50"> / {String(segments.length).padStart(2, "0")}</span></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold">{s.name}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{s.detail}</p>
                    <div aria-hidden className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                      <motion.span layout className="block h-full rounded-full bg-accent" style={{ width: `${Math.round((s.mins / maxMins) * 100)}%` }} />
                    </div>
                  </div>
                  <span className="font-mono text-[12px] tabular-nums">{s.mins}′</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 font-mono text-[10px]"
                    aria-label={`Move ${s.name} later`}
                    onClick={() => setSegments((ss) => { const n = [...ss]; const j = (i + 1) % n.length;[n[i], n[j]] = [n[j], n[i]]; return n })}
                  >
                    <ArrowDownUp className="size-3" /> move
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-3">
          <section aria-label="Form video drops">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Form drops</span>
              <Video className="size-3.5 text-muted-foreground" aria-hidden />
            </div>
            <UploadQueue
              className="mt-2 rounded-none border-0 bg-transparent p-0 shadow-none"
              files={files}
              onRetry={(id: string) => { setFiles((fs) => fs.map((f) => (f.id === id ? { ...f, status: "uploading", progress: 4, error: undefined } : f))); push("retrying on gym wi-fi", "info") }}
              onRemove={(id: string) => setFiles((fs) => fs.filter((f) => f.id !== id))}
            />
          </section>
          <section aria-label="Coach marks" className="mt-auto border-t pt-3">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Coach marks</span>
            <ul className="mt-2 space-y-1.5 text-[11px] leading-[1.5] text-muted-foreground">
              <li className="flex gap-1.5"><span className="text-[hsl(var(--ok))]">·</span> squat top set 3 — depth good, bar path steady</li>
              <li className="flex gap-1.5"><motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-[hsl(var(--warn))]">·</motion.span> deadlift friday — hips shoot early, cue wedge</li>
              <li className="flex gap-1.5"><span className="text-muted-foreground">·</span> press review lands after tonight's session</li>
            </ul>
          </section>
        </div>
      </div>

      {/* adherence band — full-width heatmap anchors the console */}
      <section className="border-t bg-muted/20 px-6 py-4" aria-label="Adherence">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Adherence · {athlete.name}</span>
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{weeksDone} sessions logged</span>
        </div>
        <ActivityHeatmap className="mt-3" cells={cells} weeks={16} levelOf={levelOf} weekStartDay={1} showTooltip showLegend />
      </section>

      <ToastStack toasts={toasts} onDismiss={(id: string) => setToasts((t) => t.filter((x) => x.id !== id))} pos="br" />
    </div>
  )
}
