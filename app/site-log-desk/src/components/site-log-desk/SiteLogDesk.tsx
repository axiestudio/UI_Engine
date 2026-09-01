import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { ChevronDown, ChevronRight, HardHat, MapPin, NotebookPen, UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/watermelon/table"
import { Checkbox } from "@/components/watermelon/checkbox"
import { AnnotationPinLayer, type Pin } from "annotation-pin-layer"
import { ActivityHeatmap } from "activity-heatmap"
import { UploadQueue, type UploadFile } from "upload-queue"

// COMPOSITE SCREEN · CONSTRUCTION DAILY LOG
// composed of: upload-queue (progress photo intake), annotation-pin-layer
// (snags pinned on the plan sheet), activity-heatmap (crew hours) +
// purpose-built WBS tree with sign-off checkboxes and crew notes rail.

export type WbsNode = {
  id: string
  code: string
  label: string
  unit: string
  done: number
  total: number
  kids?: WbsNode[]
}
export type CrewNote = { id: string; author: string; at: string; text: string }
export type SiteLogDeskProps = {
  site?: string
  logDate?: string
  wbs?: WbsNode[]
  photos?: UploadFile[]
  notes?: CrewNote[]
  pins?: Pin[]
  onSubmit?: (signed: number) => void
  className?: string
}

const DEFAULT_WBS: WbsNode[] = [
  {
    id: "w1", code: "03", label: "Concrete works", unit: "m³", done: 84, total: 120,
    kids: [
      { id: "w1a", code: "03.1", label: "Pile caps C1–C6", unit: "m³", done: 60, total: 60 },
      { id: "w1b", code: "03.2", label: "Core walls L2 pour", unit: "m³", done: 24, total: 60 },
    ],
  },
  {
    id: "w2", code: "05", label: "Steel structure", unit: "t", done: 41, total: 96,
    kids: [
      { id: "w2a", code: "05.1", label: "Columns grid A–D", unit: "t", done: 28, total: 44 },
      { id: "w2b", code: "05.2", label: "Beams level 2", unit: "t", done: 13, total: 52 },
    ],
  },
  { id: "w3", code: "07", label: "Envelope · west façade", unit: "m²", done: 0, total: 640 },
]

const DEFAULT_NOTES: CrewNote[] = [
  { id: "n1", author: "S. Ek, foreman", at: "07:12", text: "Crane 2 late start — permit B hoisting wind limit reached, restarted 08:40." },
  { id: "n2", author: "L. Mbeki, QC", at: "10:55", text: "Core wall pour: 3 cubes taken, slump ok. Strip-out of formwork Z-4 on hold until Thursday." },
  { id: "n3", author: "R. Diaz, delivery", at: "13:30", text: "Rebar delivery #1182 arrived short 14 bars Ø16 — claim raised with supplier." },
]

const DEFAULT_PINS: Pin[] = [
  { id: "pin1", x: 34, y: 28, author: "L. Mbeki", text: "Honeycombing at column head — chip and repair before next pour." },
  { id: "pin2", x: 62, y: 52, author: "S. Ek", text: "Temporary propping here until beam 05.2 lands." },
]

const DEFAULT_PHOTOS: UploadFile[] = [
  { id: "ph1", name: "drone-ortho-lot-042.jpg", size: 8_400_000, status: "done", progress: 100 },
  { id: "ph2", name: "core-wall-pour-11.jpg", size: 4_100_000, status: "done", progress: 100 },
  { id: "ph3", name: "rebar-shortfall-1182.jpg", size: 2_800_000, status: "uploading", progress: 45 },
  { id: "ph4", name: "west-façade-setout.jpg", size: 6_300_000, status: "waiting" },
]

// 16 weeks of daily crew hours (Mon–Sun columns, like the heatmap expects)
const HOURS: number[] = Array.from({ length: 112 }, (_, i) => {
  const day = i % 7
  const week = Math.floor(i / 7)
  if (day >= 5) return week > 9 && i % 3 === 0 ? 4 : 0 // some weekend pushes late in the job
  const wave = Math.sin((week / 16) * Math.PI) * 5
  return Math.max(0, Math.min(11, Math.round(4 + wave + ((i * 13) % 4) - 1)))
})

function leaves(n: WbsNode): WbsNode[] {
  return n.kids && n.kids.length ? n.kids.flatMap(leaves) : [n]
}

export function SiteLogDesk({
  site = "Kv. Stureverket 2",
  logDate = "Fri 28 Aug 2026",
  wbs = DEFAULT_WBS,
  photos = DEFAULT_PHOTOS,
  notes = DEFAULT_NOTES,
  pins = DEFAULT_PINS,
  onSubmit,
  className,
}: SiteLogDeskProps) {
  const [expanded, setExpanded] = React.useState<string[]>(["w1", "w2"])
  const [signed, setSigned] = React.useState<string[]>(["w1a"])
  const [photoFiles, setPhotoFiles] = React.useState<UploadFile[]>(photos)
  const [noteList, setNoteList] = React.useState<CrewNote[]>(notes)
  const [draft, setDraft] = React.useState("")
  const [pinList, setPinList] = React.useState<Pin[]>(pins)

  const allLeaves = wbs.flatMap(leaves)
  const signedLeaves = allLeaves.filter((l) => signed.includes(l.id))
  const rowState = (n: WbsNode): "checked" | "indeterminate" | "unchecked" => {
    const ls = leaves(n)
    const count = ls.filter((l) => signed.includes(l.id)).length
    return count === 0 ? "unchecked" : count === ls.length ? "checked" : "indeterminate"
  }
  const toggle = (n: WbsNode, on: boolean) => {
    const ids = leaves(n).map((l) => l.id)
    setSigned((s) => (on ? Array.from(new Set([...s, ...ids])) : s.filter((x) => !ids.includes(x))))
  }

  const visible: { n: WbsNode; depth: number }[] = []
  const walk = (nodes: WbsNode[], depth: number) => {
    for (const n of nodes) {
      visible.push({ n, depth })
      if (n.kids?.length && expanded.includes(n.id)) walk(n.kids, depth + 1)
    }
  }
  walk(wbs, 0)

  const addNote = () => {
    const text = draft.trim()
    if (!text) return
    setNoteList((ns) => [{ id: "n" + Date.now(), author: "You, site engineer", at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), text }, ...ns])
    setDraft("")
  }

  return (
    <div className={cn("flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <MotionConfig reducedMotion="user">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Site daily log</h2>
        <span className="text-[12px] text-muted-foreground">{site}</span>
        <span className="text-[12px] text-muted-foreground">· {logDate} · 11 °C, wind 9 m/s</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="font-mono text-[11px] text-muted-foreground">{signedLeaves.length}/{allLeaves.length} signed</span>
          <Button type="button" variant="ghost"
            onClick={() => onSubmit?.(signedLeaves.length)}
            disabled={signedLeaves.length === 0}
            className="flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted disabled:opacity-40"
          >
            <HardHat className="size-3.5" /> Submit day log
          </Button>
          
    </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-auto p-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_290px]">
        {/* WBS + crew notes */}
        <div className="flex min-w-0 flex-col gap-4">
          <section className="min-w-0 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">WBS · day sign-off</span>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px] text-muted-foreground">FIDIC programme rev 7</span>
            </header>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-8 w-9 px-3" />
                  <TableHead className="h-8 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Activity</TableHead>
                  <TableHead className="h-8 px-2 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map(({ n, depth }) => {
                  const st = rowState(n)
                  const pct = n.total ? Math.round((n.done / n.total) * 100) : 0
                  return (
                    <TableRow key={n.id}>
                      <TableCell className="px-3 py-1">
                        <Checkbox
                          checked={st === "indeterminate" ? "indeterminate" : st === "checked"}
                          onCheckedChange={(c) => toggle(n, c === true)}
                          aria-label={`Sign off ${n.label}`}
                        />
                      </TableCell>
                      <TableCell className="px-2 py-1" style={{ paddingLeft: `${8 + depth * 18}px` }}>
                        <Button type="button" variant="ghost"
                          onClick={() => setExpanded((x) => (x.includes(n.id) ? x.filter((i) => i !== n.id) : [...x, n.id]))}
                          className={cn("mr-1 inline-flex size-4 items-center justify-center rounded align-[-3px] hover:bg-muted", !n.kids?.length && "invisible")}
                          aria-label={expanded.includes(n.id) ? `Collapse ${n.label}` : `Expand ${n.label}`}
                        >
                          {expanded.includes(n.id) ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                        </Button>
                        <span className={cn("font-mono text-[11px] text-muted-foreground", depth > 0 && "pl-1")}>{n.code}</span>
                        <span className={cn("ml-2 text-[12px]", depth === 0 ? "font-bold" : "font-medium")}>{n.label}</span>
                      </TableCell>
                      <TableCell className="px-2 py-1.5 text-right">
                        <span className="font-mono text-[12px] tabular-nums">{n.done}/{n.total} {n.unit}</span>
                        <span className="ml-2 inline-block h-1.5 w-14 overflow-hidden rounded-full bg-muted align-middle">
                          <motion.span
                            className="block h-full rounded-full"
                            style={{ width: `${pct}%`, background: pct === 100 ? "hsl(var(--ok))" : "hsl(var(--info))" }}
                            initial={false}
                            animate={{ width: `${pct}%` }}
                          />
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">Tick a parent to sign off all its activities · progress is measured, sign-off is sworn</div>
          </section>

          <section className="flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Crew notes
            </header>
            <ul className="grid gap-2.5 p-3">
              <AnimatePresence initial={false}>
                {noteList.map((n) => (
                  <motion.li key={n.id} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-md border bg-background p-2.5">
                    <p className="text-[12px] leading-relaxed">{n.text}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{n.author} · {n.at}</p>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            <div className="flex gap-2 border-t p-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNote()}
                placeholder="Log an event for the record…"
                className="h-8 flex-1 rounded-md border bg-background px-2.5 text-[12px] outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button type="button" variant="ghost" onClick={addNote} className="flex h-8 items-center gap-1 rounded-md border bg-background px-2.5 text-[11px] font-semibold hover:bg-muted">
                <NotebookPen className="size-3.5" /> Add
              </Button>
            </div>
          </section>
        </div>

        {/* plan sheet with pins */}
        <section className="min-w-0 overflow-hidden rounded-lg border bg-card">
          <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Plan sheet A-204 · level 2</span>
            <span className="font-mono text-[10px] text-muted-foreground">{pinList.length} snags pinned</span>
          </header>
          <div className="p-3">
            <AnnotationPinLayer
              author="You, site engineer"
              pins={pinList}
              onAddPin={(p) => setPinList((ps) => [...ps, { id: "pin" + Date.now(), x: p.x, y: p.y, author: "You, site engineer", text: "New snag — describe in the daily report." }])}
              onRemove={(id) => setPinList((ps) => ps.filter((p) => p.id !== id))}
              canvas={
                <svg viewBox="0 0 400 260" className="block h-auto w-full rounded border bg-[hsl(var(--app-code))] text-foreground" role="img" aria-label="Plan sheet A-204, level 2">
                  <g stroke="currentColor" strokeWidth="1" fill="none" opacity="0.55">
                    <rect x="24" y="20" width="352" height="220" />
                    <line x1="24" y1="96" x2="376" y2="96" />
                    <line x1="150" y1="20" x2="150" y2="240" />
                    <line x1="262" y1="96" x2="262" y2="240" />
                    <rect x="40" y="36" width="70" height="44" />
                    <rect x="280" y="112" width="76" height="52" />
                  </g>
                  <g fontSize="9" fill="currentColor" opacity="0.6" fontFamily="var(--font-mono)">
                    <text x="30" y="14">GRID 1-6 / A-D · LVL +7.200</text>
                    <text x="30" y="252">STAIR CORE 2</text>
                    <text x="336" y="252">LIFT SHAFT</text>
                  </g>
                  <g stroke="hsl(var(--info))" strokeWidth="2" fill="none" opacity="0.7">
                    <polyline points="150,96 150,150 262,150" />
                  </g>
                </svg>
              }
            />
          </div>
          <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">Click the sheet to pin a snag · pins sync to the QA register</div>
        </section>

        {/* photos + hours */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Progress photos</span>
              <UploadCloud className="size-3.5 text-muted-foreground" />
            </header>
            <div className="p-3">
              <UploadQueue files={photoFiles} onRetry={(id) => setPhotoFiles((fs) => fs.map((f) => (f.id === id ? { ...f, status: "uploading", progress: 5 } : f)))} onRemove={(id) => setPhotoFiles((fs) => fs.filter((f) => f.id !== id))} />
            </div>
          </section>
          <section className="flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Crew hours</span>
              <MapPin className="size-3.5 text-muted-foreground" />
            </header>
            <div className="p-3">
              <ActivityHeatmap cells={HOURS.map((h) => ({ count: h }))} weeks={16} levelOf={(h) => (h === 0 ? 0 : h <= 4 ? 1 : h <= 7 ? 2 : h <= 9 ? 3 : 4)} />
              <p className="mt-2 text-[11px] text-muted-foreground">Gate clock-in totals per trade · Saturday pushes need a permit note</p>
            </div>
          </section>
        </aside>
      </div>
          </MotionConfig>
    </div>
  )
}
