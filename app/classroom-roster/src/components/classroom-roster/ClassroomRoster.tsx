import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { GraduationCap, Mail, Printer } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, Grain } from "@/components/primitives/handcraft"
import { ActivityHeatmap, type HeatCell } from "activity-heatmap"
import { StickyGroupList, type GroupList } from "sticky-group-list"
import { PermissionMatrix, type TriState } from "permission-matrix"
import { SegmentedControl } from "segmented-control"
import { Checkbox } from "@/components/watermelon/checkbox"

// COMPOSITE SCREEN · TEACHING DESK
// composed of: activity-heatmap (per-student attendance), sticky-group-list
// (groups rail), permission-matrix (student vs staff sheet), segmented-control
// (term view) + watermelon checkbox + purpose-built enrolment table.
//
// DESIGN BAR: header strip ≤48px · labels 11px semibold uppercase 12% tracking
// · body 13px · numerics 12px mono tabular right · panels rounded-lg with 36px
// header strips · motion marks state changes only.

export type Student = { id: string; name: string; year: string; present: number; remote?: boolean }

export type ClassroomRosterProps = {
  course?: string
  term?: string
  students?: Student[]
  onPicked?: (ids: string[]) => void
  className?: string
}

const DEFAULT_STUDENTS: Student[] = [
  { id: "s1", name: "Alva Nordh", year: "Y9", present: 96 },
  { id: "s2", name: "Björn Tägt", year: "Y9", present: 88, remote: true },
  { id: "s3", name: "Cleo Marsh", year: "Y8", present: 61 },
  { id: "s4", name: "Davit Melkonyan", year: "Y9", present: 92 },
  { id: "s5", name: "Ester Quist", year: "Y8", present: 99 },
  { id: "s6", name: "Farid Azimi", year: "Y9", present: 74 },
  { id: "s7", name: "Greta Sund", year: "Y8", present: 84 },
  { id: "s8", name: "Hampus Röd", year: "Y9", present: 58 },
]

// deterministic pseudo-attendance: 10 school weeks × 5 days
const attendanceCells = (seed: string, present: number): HeatCell[] => {
  const base = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  return Array.from({ length: 50 }, (_, i) => {
    const v = Math.sin(base * 0.37 + i * 2.1) * 0.5 + 0.5
    return { count: v * 100 < present - 12 ? 0 : v * 100 < present ? 1 : 2 }
  })
}

const GROUPS: { key: string; label: string; memberIds: string[]; room: string }[] = [
  { key: "g1", label: "Reading circle A", memberIds: ["s1", "s5", "s7"], room: "room 204" },
  { key: "g2", label: "Reading circle B", memberIds: ["s2", "s4", "s8"], room: "room 204" },
  { key: "g3", label: "Lab partners", memberIds: ["s3", "s6"], room: "lab 1" },
]

const PERMS = ["grade.read", "grade.write", "roster.edit", "discipline.note", "contact.home"]
const ROLES = ["Student", "TA", "Teacher", "Admin"]

export function ClassroomRoster({ course = "Swedish 8–9", term = "HT26", students = DEFAULT_STUDENTS, onPicked, className }: ClassroomRosterProps) {
  const [roster, setRoster] = React.useState(students)
  const [picked, setPicked] = React.useState<string[]>(["s1", "s4"])
  const [termView, setTermView] = React.useState(term)
  const [matrix, setMatrix] = React.useState<Record<string, Record<string, TriState>>>({
    Student: Object.fromEntries(PERMS.map((p): [string, TriState] => [p, p === "grade.read" ? "allow" : "deny"])),
    TA: { "grade.read": "allow", "grade.write": "ask", "roster.edit": "deny", "discipline.note": "allow", "contact.home": "deny" },
    Teacher: Object.fromEntries(PERMS.map((p): [string, TriState] => [p, "allow"])),
    Admin: Object.fromEntries(PERMS.map((p): [string, TriState] => [p, "allow"])),
  })

  const togglePick = (id: string, on: boolean) => {
    setPicked((p) => (on ? [...p, id] : p.filter((x) => x !== id)))
    if (on) onPicked?.([...picked, id])
  }

  const groups: GroupList<Student>[] = GROUPS.map((g) => ({
    key: g.key,
    header: (
      <span className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {g.label}<span className="font-mono normal-case tracking-normal">{g.room}</span>
      </span>
    ),
    rows: g.memberIds.map((id) => roster.find((s) => s.id === id)).filter((s): s is Student => Boolean(s)),
  }))

  const atRisk = roster.filter((s) => s.present < 70).length

  return (
    <div className={cn("relative isolate flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <Grain opacity={0.03} />

      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Classroom roster</h2>
        <span className="text-[12px] text-muted-foreground">{course}</span>
        <span className="text-[12px] text-muted-foreground">· {atRisk} attendance risk</span>
        <SegmentedControl size="sm" className="ml-2" value={termView} onChange={setTermView} options={[{ value: "HT26", label: "HT26" }, { value: "VT26", label: "VT26" }]} />
        <button className="ml-auto flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted"><Printer className="size-3.5" /> Seating plan</button>
        <button className="flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted"><Mail className="size-3.5" /> Message picked ({picked.length})</button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[270px_minmax(0,1fr)_330px]">
        {/* left rail — groups */}
        <aside className="flex min-w-0 flex-col gap-4">
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 shrink-0 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Groups · {GROUPS.length}</span>
              <GraduationCap className="size-3.5 text-muted-foreground" />
            </header>
            <div className="min-h-0 flex-1">
              <StickyGroupList<Student>
                groups={groups}
                height="100%"
                renderRow={(s) => (
                  <button
                    onClick={() => togglePick(s.id, !picked.includes(s.id))}
                    className={cn("flex w-full items-center justify-between px-3 py-1.5 text-left text-[12px] hover:bg-muted/50", picked.includes(s.id) && "bg-accent/50")}
                  >
                    <span className="font-medium">{s.name}</span>
                    <span className="font-mono tabular-nums text-muted-foreground">{s.present}%</span>
                  </button>
                )}
              />
            </div>
          </section>
          <p className="px-1 text-[11px] text-muted-foreground">Sticky rail keeps each circle's header pinned while you scan for gaps.</p>
        </aside>

        {/* centre — enrolment table */}
        <section className="min-h-0 overflow-hidden rounded-lg border bg-card">
          <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Enrolment · {roster.length} students</span>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{picked.length} picked for parent night</span>
          </header>
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b text-left text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="w-8 px-3 py-1.5" />
                <th className="px-2 py-1.5 font-semibold">Student</th>
                <th className="w-16 px-2 py-1.5 font-semibold">Year</th>
                <th className="px-2 py-1.5 font-semibold">Attendance · last 10 wks</th>
                <th className="w-16 px-3 py-1.5 text-right font-semibold">Rate</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((s) => (
                <tr key={s.id} className={cn("border-b border-app-line/60 last:border-0", picked.includes(s.id) && "bg-accent/40", s.present < 70 && "bg-[hsl(var(--warn)/0.07)]")}>
                  <td className="px-3 py-1.5">
                    <Checkbox checked={picked.includes(s.id)} onCheckedChange={(v: boolean) => togglePick(s.id, v)} aria-label={`pick ${s.name}`} />
                  </td>
                  <td className="px-2 py-1.5 font-medium">
                    {s.name}
                    {s.remote && <span className="ml-1.5 rounded bg-muted px-1 py-px text-[9px] font-bold uppercase text-muted-foreground">remote</span>}
                  </td>
                  <td className="px-2 py-1.5 text-muted-foreground">{s.year}</td>
                  <td className="px-2 py-1.5">
                    <ActivityHeatmap cells={attendanceCells(s.id, s.present)} weeks={10} className="scale-[0.72]" />
                  </td>
                  <td className={cn("px-3 py-1.5 text-right font-mono tabular-nums", s.present < 70 && "font-bold text-[hsl(var(--warn))]")}>{s.present}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">Below 70% flags amber and letters home queue for the office · tick to add to parent night</div>
        </section>

        {/* right rail — permission sheet */}
        <aside className="flex min-w-0 flex-col gap-4">
          <section className="min-h-0 flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Student vs staff sheet</span>
              <MonoLabel tick={false} className="text-[10px] text-muted-foreground">click cycles</MonoLabel>
            </header>
            <div className="p-3">
              <PermissionMatrix perms={PERMS} roles={ROLES} value={matrix} onSet={(row, col, v) => setMatrix((m) => ({ ...m, [row]: { ...m[row], [col]: v } }))} />
            </div>
          </section>
          <AnimatePresence>
            {picked.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="overflow-hidden rounded-lg border bg-card">
                <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Picked queue</header>
                <div className="flex flex-wrap gap-1.5 p-3">
                  {picked.map((id) => {
                    const s = roster.find((x) => x.id === id)
                    return s ? <span key={id} className="rounded border bg-muted/40 px-1.5 py-0.5 text-[10px] font-semibold">{s.name}</span> : null
                  })}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </div>
  )
}
