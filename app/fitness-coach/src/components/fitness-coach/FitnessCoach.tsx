import { useState } from "react"
import { motion } from "motion/react"
import { Activity, CalendarClock, Dumbbell, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, Ordinal } from "@/components/primitives/handcraft"
import { ActivityHeatmap, type HeatCell } from "activity-heatmap"
import { RadialGauge } from "radial-gauge"
import { CronPreview } from "cron-preview"
import { SegmentedControl } from "segmented-control"
import { UploadQueue, type UploadFile } from "upload-queue"
import { ToastStack, type Toast } from "toast-stack"

// COMPOSITE SCREEN · COACH VIEW
// composed of: activity-heatmap (adherence), radial-gauge (readiness),
// cron-preview (session cadence), segmented-control (athlete switch),
// upload-queue (form video drops) + purpose-built program segment list.

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

const SEGMENTS = [
  { name: "Warm-up ramp", mins: 12, detail: "bike 5' · banded hips · empty bar complexes" },
  { name: "Main — back squat", mins: 32, detail: "5×5 @ 82.5% · 3' rests · belt optional" },
  { name: "Accessory — RDL + row", mins: 14, detail: "3×10 RDL · 3×12 chest-supported row" },
  { name: "Cooldown", mins: 8, detail: "calf stretch · breath work 4-7-8" },
]

const PATTERN = [1, 3, 0, 2, 4, 1, 2, 3, 1, 0, 4, 2, 1, 3, 2, 4]

function buildCells(adherence: number): HeatCell[] {
  return Array.from({ length: PATTERN.length * 7 }, (_, i) => {
    const base = PATTERN[i % PATTERN.length]
    const decay = 1 - (i / (PATTERN.length * 7)) * 0.25
    return { count: Math.min(4, Math.round(base * adherence * decay)) }
  })
}

const levelOf = (c: number): 0 | 1 | 2 | 3 | 4 => (c === 0 ? 0 : c === 1 ? 1 : c === 2 ? 2 : c === 3 ? 3 : 4)

export function FitnessCoach({ block = "Hypertrophy — lower focus", week = "Week 6 of 12", athletes = DEFAULT_ATHLETES, cadence: initialCadence = "0 6 * * 1,3,5", drops = DEFAULT_DROPS, className }: FitnessCoachProps) {
  const [who, setWho] = useState("a1")
  const [cadence, setCadence] = useState(initialCadence)
  const [files, setFiles] = useState(drops)
  const [segments, setSegments] = useState(SEGMENTS)
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = (title: string, tone: Toast["tone"] = "ok") =>
    setToasts((t) => [...t.slice(-2), { id: String(Date.now() + Math.random()), title, tone }])

  const athlete = athletes.find((a) => a.id === who) ?? athletes[0]
  const cells = buildCells(athlete.adherence)
  const weeksDone = cells.reduce((a, c) => a + (c.count > 0 ? 1 : 0), 0)
  const totalMins = segments.reduce((a, s) => a + s.mins, 0)

  return (
    <div className={cn("flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Coach view</h2>
        <span className="text-[12px] text-muted-foreground">{block} · {week}</span>
        <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground"><Dumbbell className="size-3.5" /> {athletes.length} athletes on the card</span>
        <SegmentedControl
          size="sm"
          className="ml-auto"
          value={who}
          onChange={setWho}
          options={athletes.map((a) => ({ value: a.id, label: a.name }))}
        />
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[250px_minmax(0,1fr)_270px]">
        {/* readiness + cadence */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center gap-1.5 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <Activity className="size-3.5" /> Readiness · {athlete.name}
            </header>
            <div className="flex flex-col items-center gap-2 p-3">
              <RadialGauge value={athlete.readiness} min={0} max={100} precision={0} size={140} label="ready" unit="%" zones={[{ to: 55, color: "hsl(var(--err))", label: "deload" }, { to: 75, color: "hsl(var(--warn))", label: "moderate" }, { to: 100, color: "hsl(var(--ok))", label: "go" }]} />
              <p className="text-center text-[11px] leading-[1.5] text-muted-foreground">{athlete.note}</p>
            </div>
          </section>
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center gap-1.5 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <CalendarClock className="size-3.5" /> Session cadence
            </header>
            <div className="p-3">
              <CronPreview expr={cadence} onChange={(v: string) => { setCadence(v); push(`cadence updated — next sessions re-booked`, "info") }} />
              <p className="mt-2 text-[11px] text-muted-foreground">Changing cadence moves unbooked sessions only — logged sessions keep their day.</p>
            </div>
          </section>
        </aside>

        {/* adherence + program */}
        <section className="min-w-0 space-y-4">
          <div className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Adherence · last 16 weeks</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{weeksDone} sessions logged</span>
            </header>
            <div className="p-3">
              <ActivityHeatmap cells={cells} weeks={16} levelOf={levelOf} />
              <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>missed</span>
                {[0, 1, 2, 3, 4].map((l) => <span key={l} className={cn("size-2.5 rounded-[2px]", ["bg-muted", "bg-[hsl(var(--info)/0.25)]", "bg-[hsl(var(--info)/0.5)]", "bg-[hsl(var(--info)/0.75)]", "bg-[hsl(var(--info))]"][l])} />)}
                <span>full session</span>
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Program segments · {totalMins}′</span>
              <span className="text-[11px] font-bold text-[hsl(var(--info))]">tap to shuffle order</span>
            </header>
            <ul className="divide-y">
              {segments.map((s, i) => (
                <li key={s.name} className="flex items-center gap-3 px-3 py-2">
                  <Ordinal n={i + 1} total={segments.length} className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold">{s.name}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{s.detail}</p>
                  </div>
                  <span className="font-mono text-[12px] tabular-nums">{s.mins}′</span>
                  <button
                    aria-label={`Move ${s.name} later`}
                    onClick={() => setSegments((ss) => { const n = [...ss]; const j = (i + 1) % n.length;[n[i], n[j]] = [n[j], n[i]]; return n })}
                    className="text-[10px] font-bold uppercase text-muted-foreground hover:text-foreground"
                  >
                    move
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* video drops */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center gap-1.5 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <Video className="size-3.5" /> Form drops
            </header>
            <UploadQueue
              files={files}
              onRetry={(id: string) => { setFiles((fs) => fs.map((f) => (f.id === id ? { ...f, status: "uploading", progress: 4, error: undefined } : f))); push("retrying on gym wi-fi", "info") }}
              onRemove={(id: string) => setFiles((fs) => fs.filter((f) => f.id !== id))}
              className="border-0"
            />
          </section>
          <section className="rounded-lg border bg-card p-3">
            <MonoLabel className="text-muted-foreground">Coach marks</MonoLabel>
            <ul className="mt-2 space-y-1.5 text-[11px] leading-[1.5] text-muted-foreground">
              <li className="flex gap-1.5"><span className="text-[hsl(var(--ok))]">·</span> squat top set 3 — depth good, bar path steady</li>
              <li className="flex gap-1.5"><motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-[hsl(var(--warn))]">·</motion.span> deadlift friday — hips shoot early, cue wedge</li>
              <li className="flex gap-1.5"><span className="text-muted-foreground">·</span> press review lands after tonight's session</li>
            </ul>
          </section>
        </aside>
      </div>
      <ToastStack toasts={toasts} onDismiss={(id: string) => setToasts((t) => t.filter((x) => x.id !== id))} pos="br" />
    </div>
  )
}
