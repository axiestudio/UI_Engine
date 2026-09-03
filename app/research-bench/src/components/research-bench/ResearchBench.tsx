import * as React from "react"
import { useState } from "react"
import { MotionConfig } from "motion/react"
import { FlaskConical, NotebookPen, Play, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CodeBlock, CodeBlockCopyButton } from "@/components/ai-elements/code-block"
import { Sources, SourcesTrigger, SourcesContent } from "@/components/ai-elements/sources"
import { Shimmer } from "@/components/ai-elements/shimmer"
import { Loader } from "@/components/ai-elements/loader"
import { UndoHistorySlider, type Version } from "undo-history-slider"

// COMPOSITE SCREEN · LAB NOTEBOOK
// ROUND 2: run cells render through AI Elements CodeBlock (shiki-highlighted,
// registry copy button); the loading states are real — "run" walks
// idle→running→result with Shimmer label lines that explain what the cell is
// doing; entry cites open AI Elements Sources collapsibles driven by the [n]
// chips. Version scrub stays honest (restore stages + updates head).
// composed of: ai-elements code-block/sources/shimmer/loader,
// undo-history-slider (version scrub) + purpose-built dataset groups rail
// and entry cite footnotes.
//
// DESIGN BAR: header strip ≤48px · label 11px semibold uppercase 12% tracking
// · body 13px · numerics 12px tabular right-aligned · panels rounded-lg
// bordered with a 36px header strip · functional copy only · motion marks
// state changes, never decorates.

export type DatasetGroup = { id: string; label: string; rows: number; note: string }

export type ResearchBenchProps = {
  bench?: string
  researcher?: string
  groups?: DatasetGroup[]
  className?: string
}

const DEFAULT_GROUPS: DatasetGroup[] = [
  { id: "cohort-a", label: "Cohort A", rows: 1204, note: "treatment, enrol 2026-04" },
  { id: "cohort-b", label: "Cohort B", rows: 980, note: "matched control" },
  { id: "controls", label: "Controls", rows: 512, note: "sensor-only weeks" },
  { id: "pilot", label: "Pilot", rows: 88, note: "excluded from headline stats" },
]

const ENTRIES: { id: string; at: string; title: string; body: string; cites: { ref: string; label: string; note: string }[] }[] = [
  {
    id: "e214",
    at: "14:02",
    title: "Adherence dip is a sensor artifact, not behaviour",
    body:
      "Week 12 shows a 14 % drop in wrist-wear minutes. Before touching the model, I split the dip by device batch — the fall concentrates in batch B2 [1] and disappears when we condition on strap revision [2]. Treating it as churn would bias the effect estimate.",
    cites: [
      { ref: "[1]", label: "device_manifest.csv", note: "batch B2 firmware 3.1.0 clocks drift > 40 s/day above 28 °C" },
      { ref: "[2]", label: "strap_revision.patch", note: "2026-06-30 change to clasp mould, rel. humidity interaction" },
    ],
  },
  {
    id: "e213",
    at: "11:20",
    title: "Controls window extends two weeks",
    body:
      "Sensor-only control weeks extended to w13–w14 [1]; cohort B enrollment now trails cohort A by exactly 14 days, so the difference-in-differences window lines up [2].",
    cites: [
      { ref: "[1]", label: "protocol_amend_2.pdf", note: "approved 2026-08-19" },
      { ref: "[2]", label: "did_window.ipynb", note: "cell 4, lead-lag check passes at ±1 day" },
    ],
  },
]

const EXCERPTS: Record<string, string> = {
  v1: "Initial capture — wrist minutes by batch, raw parquet, no filters.",
  v2: "Added strap-revision conditioning after the batch B2 split.",
  v3: "Excluded pilot from headline stats; DiD window widened to ±14 d.",
  v4: "Final wording: dip attributed to sensor artifact, not behaviour.",
}

const CODE = `import duckdb

con = duckdb.connect()
rows = con.sql("""
  select strap_rev,
         avg(wear_minutes) as wear,
         count(*)          as n
  from read_parquet('s3://lab/bench-07/{group}/*.parquet')
  where week between 11 and 14
  group by 1 order by 1
""").fetchall()

for strap_rev, wear, n in rows:
    print(f"{strap_rev:>4}  {wear:7.1f}  {n:6d}")`

// the run-cell state machine: what each phase says while it works
type RunPhase = "idle" | "compile" | "scan" | "result"
const PHASE_LABEL: Record<Exclude<RunPhase, "idle" | "result">, string> = {
  compile: "planning query — folding partition filters",
  scan: "cold storage — hydrating parquet shards for this group",
}

export function ResearchBench({ bench = "BENCH-07", researcher = "H. Osei", groups = DEFAULT_GROUPS, className }: ResearchBenchProps) {
  const [activeGroup, setActiveGroup] = useState("cohort-a")
  const [openCite, setOpenCite] = useState<string | null>(null)
  const [phase, setPhase] = useState<RunPhase>("idle")
  const [hasRun, setHasRun] = useState(false)
  const [head, setHead] = useState("v4")
  const [restored, setRestored] = useState<string | null>(null)
  const timers = React.useRef<number[]>([])

  React.useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  const group = groups.find((g: DatasetGroup) => g.id === activeGroup) ?? groups[0]

  const run = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    setRestored(null)
    setPhase("compile")
    timers.current.push(window.setTimeout(() => setPhase("scan"), 900))
    timers.current.push(window.setTimeout(() => { setPhase("result"); setHasRun(true) }, 2100))
  }

  const running = phase === "compile" || phase === "scan"

  return (
    <div className={cn("relative isolate flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      {/* screen header */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Lab notebook</h2>
        <span className="text-[12px] text-muted-foreground">{bench}</span>
        <span className="text-[12px] text-muted-foreground">· {researcher} · entry 214</span>
        <span className="ml-auto rounded border bg-muted/40 px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">auto-save on</span>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
        {/* dataset groups rail */}
        <aside className="flex min-w-0 flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Dataset groups</header>
            <ul className="p-1.5">
              {groups.map((g: DatasetGroup, i: number) => (
                <li key={g.id}>
                  <Button type="button" variant="ghost"
                    onClick={() => setActiveGroup(g.id)}
                    aria-pressed={activeGroup === g.id}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left",
                      activeGroup === g.id ? "bg-accent text-accent-foreground" : "hover:bg-muted/50",
                    )}
                  >
                    <span className="shrink-0 font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">{String(i + 1).padStart(2, "0")}<span className="opacity-50"> / {String(groups.length).padStart(2, "0")}</span></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-semibold">{g.label}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">{g.note}</span>
                    </span>
                    <span className="font-mono text-[12px] tabular-nums text-muted-foreground">{g.rows.toLocaleString("sv-SE")}</span>
                  </Button>
                </li>
              ))}
            </ul>
            <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">Groups scope every run cell below — one group at a time, cited per entry.</div>
          </section>
        </aside>

        {/* entries + run cell */}
        <div className="flex min-w-0 flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center gap-2 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <NotebookPen className="size-3.5" /> Entries · w11–w14
            </header>
            <div className="divide-y divide-border">
              {ENTRIES.map((e) => (
                <article key={e.id} className="px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[13px] font-bold">{e.title}</h3>
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">{e.at}</span>
                  </div>
                  <p className="mt-1 text-[13px] leading-[1.55] text-foreground/90">
                    {e.body.split(/(\[\d\])/).map((part: string, i: number) =>
                      /^\[\d\]$/.test(part) ? (
                        <Button type="button" variant="ghost"
                          key={i}
                          aria-expanded={openCite === e.id}
                          onClick={() => setOpenCite((c: string | null) => (c === e.id ? null : e.id))}
                          className={cn(
                            "mx-0.5 inline-flex size-4 items-center justify-center rounded align-super font-mono text-[9px] font-bold",
                            openCite === e.id ? "bg-foreground text-background" : "border bg-muted/60 text-muted-foreground hover:bg-muted",
                          )}
                        >
                          {part.slice(1, -1)}
                        </Button>
                      ) : (
                        <span key={i}>{part}</span>
                      ),
                    )}
                  </p>
                  {/* cites = AI Elements Sources collapsible, opened by the [n] chips */}
                  <Sources open={openCite === e.id} onOpenChange={(o) => setOpenCite(o ? e.id : null)} className="mb-0 mt-1 text-[12px]">
                    <SourcesTrigger count={e.cites.length} className="hidden" />
                    <SourcesContent className="w-full gap-1">
                      {e.cites.map((c) => (
                        <div key={c.ref} className="flex items-start gap-2 rounded-md border bg-[hsl(var(--app-code))] px-2.5 py-1.5">
                          <Quote className="mt-0.5 size-3 shrink-0 text-muted-foreground" aria-hidden />
                          <p className="font-mono text-[11px] leading-[1.5] text-muted-foreground">
                            <span className="font-bold text-foreground">{c.ref.replace(/[\[\]]/g, "")} {c.label}</span> · {c.note}
                          </p>
                        </div>
                      ))}
                    </SourcesContent>
                  </Sources>
                </article>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Run cell · {group?.label}</span>
              <Button type="button" variant="ghost" onClick={run} disabled={running} className="flex h-7 items-center gap-1.5 rounded-md border bg-background px-2.5 text-[11px] font-semibold hover:bg-muted disabled:opacity-40">
                {running ? <Loader size={11} className="motion-reduce:animate-none" /> : <Play className="size-3" />} {running ? "Running…" : hasRun ? "Re-run" : "Run"}
              </Button>
            </header>
            <div className="p-3">
              <CodeBlock code={CODE.replace("{group}", group?.id ?? "")} language="python" showLineNumbers>
                <CodeBlockCopyButton aria-label="Copy cell code" onClick={() => {}} className="bg-background" />
              </CodeBlock>
              <div className="mt-3" aria-live="polite">
                {running ? (
                  <MotionConfig reducedMotion="user">
                  <div className="flex items-start gap-2.5 rounded-md border border-dashed px-3 py-3">
                    <Loader size={14} className="mt-0.5 motion-reduce:animate-none" />
                    <div className="min-w-0">
                      <Shimmer as="p" duration={1.8} className="text-[12px] font-semibold">{PHASE_LABEL[phase as "compile" | "scan"]}</Shimmer>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">cell 214-δ · {group?.id} · weeks 11–14 · will land its result here</p>
                    </div>
                  </div>
                  </MotionConfig>
                ) : phase === "result" ? (
                  <div className="overflow-hidden rounded-md border">
                    <table className="w-full border-collapse text-[12px]">
                      <caption className="sr-only">Query result: wear minutes by strap revision for {group?.label}</caption>
                      <thead>
                        <tr className="border-b bg-muted/30 text-left text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                          <th className="px-3 py-1.5 font-semibold">strap_rev</th>
                          <th className="px-2 py-1.5 text-right font-semibold">wear_min</th>
                          <th className="px-3 py-1.5 text-right font-semibold">n</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border/60"><td className="px-3 py-1 font-mono">v2.4</td><td className="px-2 py-1 text-right font-mono tabular-nums">742.1</td><td className="px-3 py-1 text-right font-mono tabular-nums">1 204</td></tr>
                        <tr className="border-b border-border/60"><td className="px-3 py-1 font-mono">v3.0</td><td className="px-2 py-1 text-right font-mono tabular-nums">709.8</td><td className="px-3 py-1 text-right font-mono tabular-nums">611</td></tr>
                        <tr><td className="px-3 py-1 font-mono">v3.1</td><td className="px-2 py-1 text-right font-mono tabular-nums">638.2</td><td className="px-3 py-1 text-right font-mono tabular-nums">371</td></tr>
                      </tbody>
                    </table>
                    <p className="border-t bg-muted/20 px-3 py-1.5 text-[11px] text-muted-foreground">3 rows · 2.1 s · scanned 2 784 / {group?.rows.toLocaleString("sv-SE")} rows · {group?.id}</p>
                  </div>
                ) : (
                  <p className="rounded-md border border-dashed px-3 py-4 text-center text-[11px] text-muted-foreground">Press Run to query this group — the cell will tell you what it is doing, then land results here with their row counts.</p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* version scrub */}
        <aside className="flex min-w-0 flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center gap-2 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <FlaskConical className="size-3.5" /> Version scrub · entry 214
            </header>
            <div className="p-3">
              <UndoHistorySlider
                versions={[
                  { id: "v1", at: "09:41", label: "initial capture" },
                  { id: "v2", at: "11:05", label: "strap conditioning" },
                  { id: "v3", at: "13:12", label: "pilot excluded" },
                  { id: "v4", at: "14:02", label: "final wording" },
                ]}
                head={head}
                render={(v: Version) => (
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{v.id} · {v.at}</p>
                    <p className="mt-1 text-[12px] leading-[1.5]">{EXCERPTS[v.id]}</p>
                  </div>
                )}
                onRestore={(id: string) => {
                  setHead(id)
                  setRestored(id)
                }}
              />
              <p className="mt-3 border-t pt-2 text-[11px] text-muted-foreground">
                {restored ? (
                  <>
                    <span className="font-semibold text-[hsl(var(--warn))]">Restored {restored}</span> — staged only. Commit writes a new version, it never erases {head === restored ? "v4" : "history"}.
                  </>
                ) : (
                  "Scrub to any version to read it; restoring stages the text for commit."
                )}
              </p>
            </div>
          </section>
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Storage</header>
            <div className="space-y-1.5 p-3 text-[12px]">
              <div className="flex justify-between"><span className="text-muted-foreground">raw parquet</span><span className="font-mono tabular-nums">148 GB</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">cited outputs</span><span className="font-mono tabular-nums">2.1 GB</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">retention</span><span className="font-mono tabular-nums">7 y · IRB-2026-114</span></div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
