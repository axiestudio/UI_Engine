import { useState } from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { Inbox, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/watermelon/checkbox"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, Grid, BarXAxis, BarYAxis, ChartTooltip } from "@/components/bklit"
import { SegmentedControl } from "segmented-control"
import { KpiTileLive } from "kpi-tile-live"
import { ActivityHeatmap, type HeatCell } from "activity-heatmap"
import { StickyGroupList, type GroupList } from "sticky-group-list"
import { UploadQueue, type UploadFile } from "upload-queue"

// COMPOSITE SCREEN · MARKING DESK
// Frameless editorial ledger: a display-numeral header, an uneven KPI strip
// (odometer tiles over a 12-col band), a full-bleed submission-heat rule,
// the student sticky list as the one solid card, and a bare-rail grade
// distribution (vendored Bklit bar) + artefact inbox on the right.
// Cohort switch reseeds roster, KPIs, heat and distribution together.

export type StudentRow = {
  id: string
  name: string
  status: "graded" | "unmarked" | "late"
  grade?: string
  submitted: string
}

export type GradeDeskProps = {
  course?: string
  term?: string
  students?: StudentRow[]
  artefacts?: UploadFile[]
  onPublished?: (graded: number) => void
  className?: string
}

const GRADES = ["A", "B", "C", "D", "E"] as const
type Grade = (typeof GRADES)[number]

const COHORT_IDS = ["8A", "8B", "8C", "9A"] as const

const COHORTS: Record<string, { mean: number; trend: number[]; heat: number[] }> = {
  "8A": { mean: 3.8, trend: [4.2, 4.1, 4.0, 3.9, 3.9, 3.8], heat: [2, 4, 6, 3, 8, 5, 2, 4, 7, 9, 4, 3, 6, 8, 2, 5, 7, 4, 9, 6, 3, 2, 5, 8, 4, 7, 3, 6, 9, 4, 2, 5, 7, 8, 3, 6, 4, 9, 2, 5, 7, 3, 8, 4, 6, 2, 9, 5, 3, 7, 4, 8, 2, 6, 5, 9, 3, 4, 7, 2, 8, 5, 6, 3, 9, 4, 2, 7] },
  "8B": { mean: 3.1, trend: [2.6, 2.8, 2.7, 3.0, 2.9, 3.1], heat: [4, 2, 3, 7, 5, 6, 1, 3, 5, 4, 8, 2, 6, 3, 7, 4, 2, 9, 5, 3, 6, 8, 4, 2, 7, 5, 3, 6, 9, 4, 8, 2, 5, 3, 7, 6, 4, 2, 8, 5, 9, 3, 6, 4, 2, 7, 8, 5, 3, 6, 9, 4, 2, 7, 5, 8, 3, 6, 4, 9, 2, 5, 7, 3, 8, 4] },
  "8C": { mean: 4.2, trend: [3.4, 3.6, 3.5, 3.9, 3.7, 4.2], heat: [6, 8, 4, 9, 5, 7, 3, 8, 6, 9, 4, 7, 5, 8, 9, 3, 6, 8, 5, 9, 4, 7, 8, 6, 9, 5, 4, 8, 7, 9, 6, 5, 8, 4, 9, 7, 6, 8, 5, 9, 4, 7, 8, 6, 9, 5, 8, 4, 9, 7, 6, 8, 5, 9, 7, 4, 8, 6, 9, 5, 8, 7, 4, 9, 6, 5, 8, 9, 7] },
  "9A": { mean: 3.5, trend: [3.1, 3.3, 3.2, 3.6, 3.4, 3.5], heat: [3, 5, 2, 6, 4, 8, 3, 5, 7, 2, 6, 4, 8, 5, 3, 7, 6, 4, 8, 5, 2, 6, 9, 4, 3, 7, 5, 8, 6, 4, 2, 9, 5, 7, 3, 6, 8, 4, 5, 2, 7, 9, 3, 6, 4, 8, 5, 2, 7, 3, 9, 6, 4, 8, 5, 3, 7, 6, 9, 4, 2, 5, 8, 3, 6, 7, 4, 5] },
}

const DEFAULT_STUDENTS: StudentRow[] = [
  { id: "s1", name: "M. Ahlberg", status: "graded", grade: "A", submitted: "apr 28" },
  { id: "s2", name: "J. Bergström", status: "graded", grade: "C", submitted: "apr 28" },
  { id: "s3", name: "T. Lindqvist", status: "late", submitted: "may 02 · 3 days" },
  { id: "s4", name: "F. Ekström", status: "unmarked", submitted: "apr 30" },
  { id: "s5", name: "H. Nyberg", status: "unmarked", submitted: "apr 30" },
  { id: "s6", name: "A. Sjöberg", status: "graded", grade: "B", submitted: "apr 29" },
  { id: "s7", name: "K. Wallin", status: "late", submitted: "may 01 · 2 days" },
  { id: "s8", name: "E. Holm", status: "unmarked", submitted: "apr 30" },
  { id: "s9", name: "R. Dahlgren", status: "graded", grade: "D", submitted: "apr 27" },
  { id: "s10", name: "L. Fredriksson", status: "unmarked", submitted: "apr 30" },
]

// Per-cohort rosters — [name, status, grade?]. Late submissions default to a
// chase note; the 8C roster comes from the `students` prop.
type Seed = [name: string, status: StudentRow["status"], grade?: Grade]

const ROSTER_SEEDS: Record<string, Seed[]> = {
  "8A": [
    ["M. Ahlberg", "unmarked"], ["J. Bergström", "unmarked"], ["T. Lindqvist", "late"],
    ["F. Ekström", "graded", "E"], ["H. Nyberg", "unmarked"], ["A. Sjöberg", "late"],
    ["K. Wallin", "graded", "D"], ["E. Holm", "unmarked"],
  ],
  "8B": [
    ["S. Nylander", "graded", "B"], ["P. Wallenberg", "late"], ["I. Forsberg", "unmarked"],
    ["D. Carlsson", "graded", "C"], ["U. Magnusson", "unmarked"], ["B. Hellström", "graded", "A"],
    ["G. Sandberg", "late"], ["V. Lundgren", "unmarked"],
  ],
  "9A": [
    ["O. Wetterberg", "graded", "A"], ["N. Berglund", "graded", "B"], ["E. Sandström", "graded", "A"],
    ["J. Öberg", "unmarked"], ["C. Engström", "graded", "C"], ["R. Lindgren", "late"],
    ["A. Norén", "graded", "B"], ["T. Hagström", "unmarked"],
  ],
}

const DEFAULT_SUBMITTED: Record<StudentRow["status"], string> = {
  graded: "apr 29",
  unmarked: "apr 30",
  late: "may 02 · 3 days",
}

const seedRoster = (cohort: string): StudentRow[] =>
  (ROSTER_SEEDS[cohort] ?? []).map(([name, status, grade], i) => ({
    id: `${cohort.toLowerCase()}-${i + 1}`,
    name,
    status,
    grade,
    submitted: DEFAULT_SUBMITTED[status],
  }))

const DEFAULT_ARTEFACTS: UploadFile[] = [
  { id: "u1", name: "essay-ahlberg.pdf", size: 842_000, status: "done", progress: 100 },
  { id: "u2", name: "lab-photos-4c.zip", size: 18_400_000, status: "uploading", progress: 64 },
  { id: "u3", name: "presentation-lindqvist.key", size: 5_200_000, status: "error", tries: 2, error: "413 payload too large" },
]

const gradeTone = (g: string) =>
  g === "A" || g === "B" ? "border-[hsl(var(--ok)/0.4)] text-[hsl(var(--ok))]" : g === "C" ? "border-[hsl(var(--info)/0.4)] text-[hsl(var(--info))]" : "border-[hsl(var(--warn)/0.5)] text-[hsl(var(--warn))]"

export function GradeDesk({
  course = "Swedish 2 · essay cycle 3",
  term = "vt 2026",
  students = DEFAULT_STUDENTS,
  artefacts = DEFAULT_ARTEFACTS,
  onPublished,
  className,
}: GradeDeskProps) {
  const [cohort, setCohort] = useState<string>("8C")
  const [rosters, setRosters] = useState<Record<string, StudentRow[]>>(() => ({
    ...Object.fromEntries(COHORT_IDS.filter((c) => c !== "8C").map((c) => [c, seedRoster(c)])),
    "8C": students,
  }))
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [published, setPublished] = useState<null | { at: string }>(null)

  const rows = rosters[cohort] ?? students
  const stats = COHORTS[cohort] ?? COHORTS["8C"]

  const graded = rows.filter((s) => s.status === "graded")
  const unmarked = rows.filter((s) => s.status === "unmarked")
  const late = rows.filter((s) => s.status === "late")
  const markedPct = rows.length ? Math.round((graded.length / rows.length) * 100) : 0
  const heatCells: HeatCell[] = stats.heat.map((count) => ({ count }))
  const distribution = GRADES.map((g) => ({ grade: g, count: rows.filter((r) => r.grade === g).length }))

  const setRoster = (updater: (rs: StudentRow[]) => StudentRow[]) =>
    setRosters((rs) => ({ ...rs, [cohort]: updater(rs[cohort] ?? students) }))

  const cycle = (s: StudentRow) => {
    const next = !s.grade ? GRADES[0] : GRADES[GRADES.indexOf(s.grade as Grade) + 1] ?? undefined
    setRoster((rs) => rs.map((r) => (r.id === s.id ? { ...r, grade: next, status: next ? "graded" : r.status === "graded" ? "unmarked" : r.status } : r)))
  }

  const toggleSel = (id: string, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  const applyGrade = (g: Grade) => {
    setRoster((rs) => rs.map((r) => (selected.has(r.id) ? { ...r, grade: g, status: "graded" } : r)))
    setSelected(new Set())
  }

  const publish = () => {
    setPublished({ at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })
    onPublished?.(graded.length)
  }

  const groupDefs: { key: StudentRow["status"]; label: string }[] = [
    { key: "unmarked", label: "Unmarked" },
    { key: "late", label: "Late" },
    { key: "graded", label: "Graded" },
  ]
  const groups: GroupList<StudentRow>[] = groupDefs.map(({ key, label }) => {
    const gRows = rows.filter((s) => s.status === key)
    return {
      key,
      header: (
        <div className="flex items-baseline justify-between px-3 py-1.5">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px] text-muted-foreground">{label}</span>
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{gRows.length}</span>
        </div>
      ),
      rows: gRows,
    }
  })

  return (
    <div className={cn("flex min-h-dvh flex-col bg-background font-sans text-foreground", className)}>
      <MotionConfig reducedMotion="user">
      {/* header — display-numeral voice: the cohort itself is the masthead */}
      <header className="flex flex-wrap items-end gap-x-4 gap-y-2 border-b px-5 py-3">
        <motion.h2
          key={cohort}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-[40px] font-black leading-none tracking-[-0.04em]"
        >
          {cohort}
        </motion.h2>
        <div className="pb-1">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Marking desk</span>
          <p className="text-[13px] font-semibold">{course} <span className="font-normal text-muted-foreground">· {term}</span></p>
          
    </div>
        <span className="mb-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold tabular-nums">
          {unmarked.length} unmarked
        </span>
        <div className="mb-0.5 ml-auto">
          <Button size="sm" onClick={publish} disabled={unmarked.length > 0 || !!published} aria-label="Publish graded marks to guardians">
            <Send className="size-3.5" /> Publish grades
          </Button>
        </div>
      </header>

      {/* cohort KPI strip — uneven spans on a 12-col band */}
      <div className="grid grid-cols-2 gap-3 border-b px-5 py-4 lg:grid-cols-12" role="list" aria-label={`Cohort ${cohort} KPIs`}>
        <KpiTileLive
          className="col-span-2 lg:col-span-4"
          label={`Mean grade · ${cohort}`}
          value={stats.mean}
          format={(v: number) => v.toFixed(1)}
          spark={stats.trend}
          sparkColor="var(--chart-2)"
          sparkHeight={30}
        />
        <KpiTileLive className="lg:col-span-2" label="Marked" value={markedPct} unit="%" />
        <KpiTileLive className="lg:col-span-2" label="Late chase" value={late.length} />
        <KpiTileLive className="lg:col-span-2" label="Unmarked" value={unmarked.length} />
        <KpiTileLive className="lg:col-span-2" label="Artefacts in flight" value={artefacts.filter((a) => a.status !== "done").length} />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-12">
        {/* left rail — dashed cohort config + publish ledger */}
        <aside className="flex flex-col gap-5 border-b p-5 lg:col-span-3 lg:border-b-0 lg:border-r">
          <section aria-label="Class switcher" className="rounded-lg border border-dashed bg-background p-3">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px] text-muted-foreground">Class</span>
              <span className="font-mono text-[10px] text-muted-foreground">recomputes all panels</span>
            </div>
            <SegmentedControl
              size="sm"
              className="w-full justify-between"
              value={cohort}
              onChange={(v: string) => { setCohort(v); setSelected(new Set()); setPublished(null) }}
              options={COHORT_IDS.map((c) => ({ value: c, label: c }))}
            />
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Roster, KPIs, submission heat and the grade distribution all reseed with the class.
            </p>
          </section>

          {/* publish ledger — bare rail, rules only */}
          <section aria-label="Publish ledger" className="flex flex-1 flex-col">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px] text-muted-foreground">Ledger</span>
            <dl className="mt-1 divide-y border-y text-[12px]">
              {[
                ["Graded", String(graded.length)],
                ["Unmarked", String(unmarked.length)],
                ["Late", String(late.length)],
              ].map(([k, v], i) => (
                <div key={k} className="flex items-baseline justify-between py-1.5">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className={cn("font-mono text-[13px] font-bold tabular-nums", i === 2 && late.length > 0 && "text-[hsl(var(--warn))]")}>{v}</dd>
                </div>
              ))}
            </dl>
            <AnimatePresence>
              {published ? (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 rounded-md border border-[hsl(var(--ok)/0.5)] bg-[hsl(var(--ok)/0.08)] px-3 py-2 text-[12px] font-bold text-[hsl(var(--ok))]"
                >
                  PUBLISHED · {published.at} to guardians
                </motion.p>
              ) : (
                <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                  {unmarked.length > 0
                    ? `${unmarked.length} essays unmarked — publishing is blocked until the set is complete.`
                    : "Set complete. Publishing notifies guardians by email."}
                </motion.p>
              )}
            </AnimatePresence>
          </section>
        </aside>

        {/* centre — full-bleed heat rule + the one solid card (students) */}
        <section className="flex min-w-0 flex-col lg:col-span-6">
          <div className="border-b bg-muted/40 px-5 py-3" aria-label="Submission heat">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-[13px] font-bold">Submission heat · 10 weeks</h3>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{cohort}</span>
            </div>
            <div className="mt-2">
              <ActivityHeatmap cells={heatCells} weeks={10} weekStartDay={1} showTooltip showLegend />
            </div>
          </div>

          <div className="relative min-h-0 flex-1 p-5">
            <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
              <div className="flex items-baseline justify-between px-3 py-2">
                <h3 className="font-display text-[13px] font-bold">Students <span className="font-mono text-[11px] font-normal tabular-nums text-muted-foreground">· {rows.length}</span></h3>
                <span className="text-[11px] text-muted-foreground">tap a grade chip to re-mark</span>
              </div>
              <AnimatePresence>
                {selected.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex flex-wrap items-center gap-1.5 border-y bg-accent/50 px-3 py-2"
                  >
                    <span className="text-[11px] font-semibold">Apply grade to {selected.size}:</span>
                    {GRADES.map((g) => (
                      <Button key={g} variant="outline" size="xs" onClick={() => applyGrade(g)} className="w-7 px-0 font-mono text-[11px] font-bold" aria-label={`Apply grade ${g} to ${selected.size} students`}>
                        {g}
                      </Button>
                    ))}
                    <Button variant="ghost" size="xs" onClick={() => setSelected(new Set())} aria-label="Clear selection" className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground">
                      clear
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              <StickyGroupList
                groups={groups}
                height="260px"
                renderRow={(s: StudentRow) => (
                  <div className={cn("flex items-center gap-2.5 px-3 py-1.5", selected.has(s.id) && "bg-accent/40")}>
                    <Checkbox checked={selected.has(s.id)} onCheckedChange={(v) => toggleSel(s.id, v === true)} aria-label={`Select ${s.name}`} />
                    <span className="w-40 truncate text-[13px] font-medium">{s.name}</span>
                    <span className={cn("font-mono text-[11px] tabular-nums", s.status === "late" ? "text-[hsl(var(--warn))]" : "text-muted-foreground")}>{s.submitted}</span>
                    <motion.button
                      key={s.grade ?? "none"}
                      initial={{ scale: s.grade ? 1.15 : 1 }}
                      animate={{ scale: 1 }}
                      onClick={() => cycle(s)}
                      aria-label={`Grade ${s.name}, currently ${s.grade ?? "unmarked"}`}
                      className={cn(
                        "ml-auto flex h-6 w-8 items-center justify-center rounded border bg-background font-mono text-[11px] font-bold tabular-nums hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        s.grade ? gradeTone(s.grade) : "text-muted-foreground",
                      )}
                    >
                      {s.grade ?? "—"}
                    </motion.button>
                  </div>
                )}
              />
            </div>
          </div>
        </section>

        {/* right rail — bare grade distribution + artefact inbox */}
        <aside className="flex flex-col gap-5 border-t p-5 lg:col-span-3 lg:border-l lg:border-t-0">
          <section aria-label={`Grade distribution for ${cohort}`}>
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-[13px] font-bold">Grade distribution</h3>
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground">live · marks as filed</span>
            </div>
            <div
              role="img"
              aria-label={`Grade distribution: ${distribution.map((d) => `${d.count} at ${d.grade}`).join(", ")}`}
              className="mt-1"
            >
              <BarChart
                data={distribution}
                xDataKey="grade"
                aspectRatio="8 / 3"
                animationDuration={700}
                margin={{ top: 6, right: 4, bottom: 20, left: 24 }}
              >
                <Grid horizontal numTicksRows={3} vertical={false} />
                <Bar dataKey="count" fill="var(--chart-1)" lineCap={2} yAxisId="left" />
                <BarYAxis />
                <BarXAxis maxLabels={5} />
                <ChartTooltip rows={(p: Record<string, unknown>) => [{ color: "var(--chart-1)", label: `${String(p.grade)} essays`, value: Number(p.count ?? 0) }]} />
              </BarChart>
            </div>
            <p className="mt-1 border-t pt-2 text-[11px] leading-relaxed text-muted-foreground">
              Recounts as chips are filed — an A-heavy set fronts the register before publish.
            </p>
          </section>

          <section aria-label="Artefact inbox" className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
            <div className="flex items-baseline justify-between px-3 py-2">
              <h3 className="flex items-center gap-1.5 font-display text-[13px] font-bold"><Inbox className="size-3.5 text-muted-foreground" /> Artefact inbox</h3>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{artefacts.filter((a) => a.status !== "done").length} pending</span>
            </div>
            <div className="min-h-0 flex-1 overflow-auto px-3 pb-3">
              <UploadQueue files={artefacts} onRetry={() => undefined} onRemove={() => undefined} />
            </div>
          </section>
        </aside>
      </div>
          </MotionConfig>
    </div>
  )
}
