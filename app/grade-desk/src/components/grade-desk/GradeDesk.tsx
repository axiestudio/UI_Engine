import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Send, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel } from "@/components/primitives/handcraft"
import { Checkbox } from "@/components/watermelon/checkbox"
import { SegmentedControl } from "segmented-control"
import { KpiTileLive } from "kpi-tile-live"
import { ActivityHeatmap, type HeatCell } from "activity-heatmap"
import { StickyGroupList, type GroupList } from "sticky-group-list"
import { UploadQueue, type UploadFile } from "upload-queue"

// COMPOSITE SCREEN · MARKING DESK
// composed of: segmented-control (class switcher), kpi-tile-live (cohort KPI),
// activity-heatmap (submission heat), sticky-group-list (students), upload-queue
// (artefact inbox) + purpose-built grade chips and bulk-mark bar.

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

const DEFAULT_ARTEFACTS: UploadFile[] = [
  { id: "u1", name: "essay-ahlberg.pdf", size: 842_000, status: "done", progress: 100 },
  { id: "u2", name: "lab-photos-4c.zip", size: 18_400_000, status: "uploading", progress: 64 },
  { id: "u3", name: "presentation-lindqvist.key", size: 5_200_000, status: "error", tries: 2, error: "413 payload too large" },
]

const COHORTS: Record<string, { mean: number; heat: number[] }> = {
  "8A": { mean: 3.8, heat: [2, 4, 6, 3, 8, 5, 2, 4, 7, 9, 4, 3, 6, 8, 2, 5, 7, 4, 9, 6, 3, 2, 5, 8, 4, 7, 3, 6, 9, 4, 2, 5, 7, 8, 3, 6, 4, 9, 2, 5, 7, 3, 8, 4, 6, 2, 9, 5, 3, 7, 4, 8, 2, 6, 5, 9, 3, 4, 7, 2, 8, 5, 6, 3, 9, 4, 2, 7] },
  "8B": { mean: 3.1, heat: [4, 2, 3, 7, 5, 6, 1, 3, 5, 4, 8, 2, 6, 3, 7, 4, 2, 9, 5, 3, 6, 8, 4, 2, 7, 5, 3, 6, 9, 4, 8, 2, 5, 3, 7, 6, 4, 2, 8, 5, 9, 3, 6, 4, 2, 7, 8, 5, 3, 6, 9, 4, 2, 7, 5, 8, 3, 6, 4, 9, 2, 5, 7, 3, 8, 4] },
  "8C": { mean: 4.2, heat: [6, 8, 4, 9, 5, 7, 3, 8, 6, 9, 4, 7, 5, 8, 9, 3, 6, 8, 5, 9, 4, 7, 8, 6, 9, 5, 4, 8, 7, 9, 6, 5, 8, 4, 9, 7, 6, 8, 5, 9, 4, 7, 8, 6, 9, 5, 8, 4, 9, 7, 6, 8, 5, 9, 7, 4, 8, 6, 9, 5, 8, 7, 4, 9, 6, 5, 8, 9, 7] },
  "9A": { mean: 3.5, heat: [3, 5, 2, 6, 4, 8, 3, 5, 7, 2, 6, 4, 8, 5, 3, 7, 6, 4, 8, 5, 2, 6, 9, 4, 3, 7, 5, 8, 6, 4, 2, 9, 5, 7, 3, 6, 8, 4, 5, 2, 7, 9, 3, 6, 4, 8, 5, 2, 7, 3, 9, 6, 4, 8, 5, 3, 7, 6, 9, 4, 2, 5, 8, 3, 6, 7, 4, 5] },
}

export function GradeDesk({
  course = "8C · Swedish 2",
  term = "vt 2026 · essay cycle 3",
  students = DEFAULT_STUDENTS,
  artefacts = DEFAULT_ARTEFACTS,
  onPublished,
  className,
}: GradeDeskProps) {
  const [cohort, setCohort] = useState("8C")
  const [rows, setRows] = useState(students)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [published, setPublished] = useState<null | { at: string }>(null)

  const stats = COHORTS[cohort] ?? COHORTS["8C"]
  const graded = rows.filter((s) => s.status === "graded")
  const unmarked = rows.filter((s) => s.status === "unmarked")
  const late = rows.filter((s) => s.status === "late")
  const markedPct = rows.length ? Math.round((graded.length / rows.length) * 100) : 0
  const heatCells: HeatCell[] = stats.heat.map((count) => ({ count }))

  const cycle = (s: StudentRow) => {
    const next = !s.grade ? GRADES[0] : GRADES[GRADES.indexOf(s.grade as (typeof GRADES)[number]) + 1] ?? undefined
    setRows((rs) => rs.map((r) => (r.id === s.id ? { ...r, grade: next, status: next ? "graded" : r.status === "graded" ? "unmarked" : r.status } : r)))
  }

  const toggleSel = (id: string, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  const applyGrade = (g: (typeof GRADES)[number]) => {
    setRows((rs) => rs.map((r) => (selected.has(r.id) ? { ...r, grade: g, status: "graded" } : r)))
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
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{gRows.length}</span>
        </div>
      ),
      rows: gRows,
    }
  })

  const gradeTone = (g: string) =>
    g === "A" || g === "B" ? "border-[hsl(var(--ok)/0.4)] text-[hsl(var(--ok))]" : g === "C" ? "border-[hsl(var(--info)/0.4)] text-[hsl(var(--info))]" : "border-[hsl(var(--warn)/0.5)] text-[hsl(var(--warn))]"

  return (
    <div className={cn("flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Marking desk</h2>
        <MonoLabel className="hidden text-muted-foreground sm:inline-flex" tick={false}>{course}</MonoLabel>
        <span className="text-[12px] text-muted-foreground">· {term}</span>
        <button
          onClick={publish}
          disabled={unmarked.length > 0 || !!published}
          className="ml-auto flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted disabled:opacity-40"
        >
          <Send className="size-3.5" /> Publish grades
        </button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[250px_minmax(0,1fr)_290px]">
        {/* cohort rail */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Class</header>
            <div className="p-3">
              <SegmentedControl
                size="sm"
                className="w-full justify-between"
                value={cohort}
                onChange={setCohort}
                options={[
                  { value: "8A", label: "8A" },
                  { value: "8B", label: "8B" },
                  { value: "8C", label: "8C" },
                  { value: "9A", label: "9A" },
                ]}
              />
              <p className="mt-2 text-[11px] text-muted-foreground">KPIs and submission heat follow the selected class.</p>
            </div>
          </section>
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Cohort KPI</header>
            <div className="grid grid-cols-2 gap-2 p-3">
              <KpiTileLive label="Mean grade" value={stats.mean} format={(v: number) => v.toFixed(1)} />
              <KpiTileLive label="Marked" value={markedPct} unit="%" />
            </div>
            <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">{late.length} late submissions chase · unmarked {unmarked.length}</div>
          </section>
        </aside>

        {/* heat + students */}
        <section className="flex min-w-0 flex-col gap-4">
          <div className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Submission heat · 10 weeks</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{cohort}</span>
            </header>
            <div className="p-3">
              <ActivityHeatmap cells={heatCells} weeks={10} />
            </div>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Students · {rows.length}</span>
              <span className="text-[11px] text-muted-foreground">tap a grade chip to re-mark</span>
            </header>
            <AnimatePresence>
              {selected.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex flex-wrap items-center gap-1.5 border-b bg-accent/50 px-3 py-2"
                >
                  <span className="text-[11px] font-semibold">Apply grade to {selected.size}:</span>
                  {GRADES.map((g) => (
                    <button key={g} onClick={() => applyGrade(g)} className="h-6 w-7 rounded border bg-background font-mono text-[11px] font-bold hover:bg-muted">{g}</button>
                  ))}
                  <button onClick={() => setSelected(new Set())} aria-label="Clear selection" className="ml-auto flex h-6 items-center gap-1 rounded px-1.5 text-[10px] font-bold uppercase text-muted-foreground hover:text-foreground"><X className="size-3" /> clear</button>
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
                    aria-label={`Grade ${s.name}`}
                    className={cn(
                      "ml-auto flex h-6 w-8 items-center justify-center rounded border bg-background font-mono text-[11px] font-bold tabular-nums hover:bg-muted",
                      s.grade ? gradeTone(s.grade) : "text-muted-foreground",
                    )}
                  >
                    {s.grade ?? "—"}
                  </motion.button>
                </div>
              )}
            />
          </div>
        </section>

        {/* artefacts + publish */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Artefact inbox</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{artefacts.filter((a) => a.status !== "done").length} pending</span>
            </header>
            <div className="p-3">
              <UploadQueue files={artefacts} onRetry={() => undefined} onRemove={() => undefined} />
            </div>
          </section>
          <section className={cn("overflow-hidden rounded-lg border bg-card transition-colors", published && "border-[hsl(var(--ok)/0.5)]")}>
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Publish</header>
            <div className="space-y-1.5 p-3 text-[12px]">
              <div className="flex justify-between"><span className="text-muted-foreground">Graded</span><span className="font-mono tabular-nums">{graded.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Unmarked</span><span className="font-mono tabular-nums">{unmarked.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Late</span><span className="font-mono tabular-nums text-[hsl(var(--warn))]">{late.length}</span></div>
              <AnimatePresence>
                {published ? (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 rounded-md border border-[hsl(var(--ok)/0.5)] bg-[hsl(var(--ok)/0.08)] px-3 py-2 text-[12px] font-bold text-[hsl(var(--ok))]">
                    PUBLISHED · {published.at} to guardians
                  </motion.div>
                ) : (
                  <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-1 text-[11px] text-muted-foreground">
                    {unmarked.length > 0 ? `${unmarked.length} essays unmarked — publishing is blocked until the set is complete.` : "Set complete. Publishing notifies guardians by email."}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
