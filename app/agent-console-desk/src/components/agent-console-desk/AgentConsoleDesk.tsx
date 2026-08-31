import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { CheckCheck, CircleStop, Cpu, FileText, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, Grain } from "@/components/primitives/handcraft"
import { AiPromptComposer } from "ai-prompt-composer"
import { AiChangeReview, type Hunk } from "ai-change-review"
import { CitationHoverCard, type Source } from "citation-hover-card"
import { JobTray, type Job } from "job-tray"
import { RadialGauge } from "radial-gauge"

// COMPOSITE SCREEN · AI OPERATIONS COCKPIT
// composed of: ai-prompt-composer (operator prompt), radial-gauge (context
// budget ring), citation-hover-card (streamed answer cites), ai-change-review
// (approval hunks), job-tray (agent jobs) + purpose-built session ledger.
//
// DESIGN BAR: header strip ≤48px · labels 11px semibold uppercase 12% tracking
// · body 13px · numerics 12px mono tabular right · panels rounded-lg with 36px
// header strips · motion marks state changes only.

export type AgentConsoleDeskProps = {
  session?: string
  model?: string
  className?: string
}

type Segment = { text: string; cite?: number }

const ANSWER_SEGMENTS: Segment[] = [
  { text: "Retention dipped 3.1pp in the cohort that hit the new rate limit on 12 Aug. " },
  { text: "The limit change shipped in release 2026.32 without a changelog entry, so support had no script for the tickets that followed. ", cite: 1 },
  { text: "Affected accounts cluster in the EU sandbox tenancy and renew inside 45 days. ", cite: 2 },
  { text: "Recommended action: grandfather the limit for renewals inside 30 days and backfill the changelog before the next release train." },
]

const SOURCES: Source[] = [
  { n: 1, title: "Release 2026.32 — platform notes", domain: "wiki.internal", snippet: "rate-limit 60→30 req/min for sandbox tenancies, shipped 12 Aug 18:04 UTC, changelog backlog" },
  { n: 2, title: "Support macro audit · wk33", domain: "desk.internal", snippet: "214 tickets tagged rate-limit; median first response 9h40m, 61% from EU sandbox accounts" },
]

const DEFAULT_HUNKS: Hunk[] = [
  { id: "h1", file: "src/limits/rate-limit.ts", title: "Grandfather renewals inside 30 days", from: "if (plan.sandbox) return 30", to: "if (plan.sandbox && !renewsWithin(plan, 30)) return 30" },
  { id: "h2", file: "changelog/2026.32.md", title: "Backfill changelog entry", from: "## Unreleased\n(no entries)", to: "## Unreleased\n- sandbox rate limit 60→30 req/min" },
  { id: "h3", file: "src/notify/support-macro.ts", title: "Add rate-limit macro hint", from: "macros: [billing, quota]", to: "macros: [billing, quota, rateLimit]" },
]

const DEFAULT_JOBS: Job[] = [
  { id: "a1", label: "reindex · support corpus", status: "running", progress: 78 },
  { id: "a2", label: "draft · renewal playbook v2", status: "queued" },
  { id: "a3", label: "eval · macro regression suite", status: "done", progress: 100 },
]

const MODELS = [
  { id: "opus-frontier", label: "frontier · long ctx" },
  { id: "flash-cheap", label: "flash · fast" },
]

export function AgentConsoleDesk({ session = "OPS-4417", model: defaultModel = "opus-frontier", className }: AgentConsoleDeskProps) {
  const [prompt, setPrompt] = React.useState("")
  const [model, setModel] = React.useState(defaultModel)
  const [busy, setBusy] = React.useState(false)
  const [step, setStep] = React.useState(ANSWER_SEGMENTS.length)
  const streamTimer = React.useRef<number | null>(null)
  const [hunks, setHunks] = React.useState<Hunk[]>(DEFAULT_HUNKS)
  const [applied, setApplied] = React.useState<string[]>([])
  const [rejected, setRejected] = React.useState<string[]>([])
  const [jobs, setJobs] = React.useState<Job[]>(DEFAULT_JOBS)
  const [tokens, setTokens] = React.useState(41_280)

  React.useEffect(() => {
    return () => {
      if (streamTimer.current) window.clearInterval(streamTimer.current)
    }
  }, [])

  const streamAnswer = () => {
    if (busy) return
    if (streamTimer.current) window.clearInterval(streamTimer.current)
    setBusy(true)
    setStep(0)
    streamTimer.current = window.setInterval(() => {
      setStep((s) => {
        const next = s + 1
        if (next >= ANSWER_SEGMENTS.length) {
          if (streamTimer.current) window.clearInterval(streamTimer.current)
          setBusy(false)
          setTokens((t) => t + 1_842)
          setJobs((js) => [...js, { id: "a" + Date.now(), label: "apply · rate-limit patch", status: "queued" }])
        }
        return Math.min(next, ANSWER_SEGMENTS.length)
      })
    }, 700)
  }

  const stopStream = () => {
    if (streamTimer.current) window.clearInterval(streamTimer.current)
    setBusy(false)
  }

  const accept = (id: string) => {
    setApplied((a) => [...a, id])
    setHunks((hs) => hs.filter((h) => h.id !== id))
  }
  const reject = (id: string) => {
    setRejected((r) => [...r, id])
    setHunks((hs) => hs.filter((h) => h.id !== id))
  }

  const contextPct = (tokens / 200_000) * 100

  return (
    <div className={cn("relative isolate flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <Grain opacity={0.03} />

      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Agent console</h2>
        <span className="text-[12px] text-muted-foreground">{session}</span>
        <span className="text-[12px] text-muted-foreground">· sandbox tenancy · operator on shift</span>
        {busy && <span className="inline-flex items-center gap-1 rounded border bg-[hsl(var(--info)/0.08)] px-1.5 py-0.5 text-[10px] font-semibold text-[hsl(var(--info))]">streaming…</span>}
        <button onClick={() => { setHunks(DEFAULT_HUNKS); setApplied([]); setRejected([]) }} className="ml-auto flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted"><Trash2 className="size-3.5" /> Reset approvals</button>
        <button onClick={stopStream} disabled={!busy} className="flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted disabled:opacity-40"><CircleStop className="size-3.5" /> Stop</button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[290px_minmax(0,1fr)_330px]">
        {/* left rail — session budget + agent jobs */}
        <aside className="flex min-w-0 flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Context budget</span>
              <Cpu className="size-3.5 text-muted-foreground" />
            </header>
            <div className="flex items-center gap-3 p-3">
              <RadialGauge value={tokens} max={200_000} label="ctx" unit="tok" precision={0} size={92} zones={[{ to: 60, color: "hsl(var(--ok))" }, { to: 85, color: "hsl(var(--warn))" }, { to: 100, color: "hsl(var(--err))" }]} className="shrink-0" />
              <div className="min-w-0 space-y-1 text-[12px]">
                <div className="flex justify-between gap-2"><span className="text-muted-foreground">used</span><span className="font-mono tabular-nums">{tokens.toLocaleString()}</span></div>
                <div className="flex justify-between gap-2"><span className="text-muted-foreground">window</span><span className="font-mono tabular-nums">200,000</span></div>
                <div className="flex justify-between gap-2"><span className="text-muted-foreground">spend / sesh</span><span className="font-mono tabular-nums">kr 12.40</span></div>
              </div>
            </div>
            <p className="border-t px-3 py-2 text-[11px] text-muted-foreground">Auto-compaction compiles the transcript at 90% of window.</p>
          </section>

          <section className="min-h-0 flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Agent jobs</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{jobs.filter((j) => j.status !== "done").length} open</span>
            </header>
            <div className="p-3">
              <JobTray
                jobs={jobs}
                onCancel={(j) => setJobs((js) => js.map((x) => (x.id === j.id ? { ...x, status: "error", log: ["cancelled by operator"] } : x)))}
                onDismiss={(id) => setJobs((js) => js.filter((j) => j.id !== id))}
              />
            </div>
          </section>
        </aside>

        {/* centre — streamed answer + composer */}
        <section className="flex min-w-0 flex-col gap-4">
          <section className="min-h-0 flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Answer · why did sandbox retention dip</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{ANSWER_SEGMENTS.slice(0, step).length} / {ANSWER_SEGMENTS.length} blocks</span>
            </header>
            <div className="space-y-2.5 p-4 text-[13px] leading-relaxed">
              <AnimatePresence initial={false}>
                {ANSWER_SEGMENTS.slice(0, step).map((seg, i) => (
                  <motion.p key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }} className="flex items-start gap-2">
                    <span className="mt-1.5 inline-block size-[5px] shrink-0 rotate-45 bg-muted-foreground/50" aria-hidden />
                    <span>{seg.cite ? <CitationHoverCard sources={SOURCES} className="decoration-dotted underline-offset-4">{seg.text}</CitationHoverCard> : seg.text}</span>
                  </motion.p>
                ))}
              </AnimatePresence>
              {step === 0 && <p className="text-[12px] text-muted-foreground">No answer streamed for this prompt yet. Ask below or re-run the saved task.</p>}
              <div className="flex flex-wrap gap-1.5 border-t pt-2.5">
                {SOURCES.map((s) => (
                  <span key={s.n} className="inline-flex items-center gap-1 rounded border bg-muted/40 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground"><FileText className="size-3" /> [{s.n}] {s.domain}</span>
                ))}
              </div>
            </div>
          </section>

          <AiPromptComposer
            value={prompt}
            onChange={setPrompt}
            onSend={streamAnswer}
            busy={busy}
            models={MODELS}
            model={model}
            onModel={setModel}
            contextLimit={200_000}
          />
        </section>

        {/* right rail — change approvals */}
        <aside className="flex min-w-0 flex-col gap-4">
          <section className="min-h-0 flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Change approvals</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{applied.length} applied · {rejected.length} rejected</span>
            </header>
            <div className="p-3">
              {hunks.length ? (
                <AiChangeReview hunks={hunks} onAccept={accept} onReject={reject} />
              ) : (
                <div className="flex flex-col items-center gap-2 rounded-md border border-dashed px-3 py-6 text-center">
                  <CheckCheck className="size-4 text-muted-foreground" />
                  <p className="text-[12px] font-semibold">Queue clear</p>
                  <p className="text-[11px] text-muted-foreground">{applied.length} of {DEFAULT_HUNKS.length} hunks applied to the working tree. Commit window opens 16:00.</p>
                </div>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Guardrails</header>
            <div className="grid gap-1.5 p-3 text-[12px]">
              {[["writes to src/", "hunks only"], ["secrets access", "deny"], ["deploy", "ask operator"]].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between rounded-md border bg-background px-2.5 py-1.5">
                  <span className="font-mono text-[11px]">{k}</span>
                  <MonoLabel tick={false} className="text-[10px] text-muted-foreground">{v}</MonoLabel>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
