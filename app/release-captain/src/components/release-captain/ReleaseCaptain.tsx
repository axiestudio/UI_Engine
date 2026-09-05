// release-captain — ship control desk. One deterministic pipeline simulation
// feeds the run graph (rerun-failed replays with a fresh seed and can pass),
// the config diff, the install snippet, the maintenance cron, and a gate that
// only opens when the run is green, the diff is approved and a window is
// locked. StatusHealthStrip watches the rollout from the top rail.
import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { Check, GitBranch, Lock, Rocket, RotateCcw, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { BorderTrail } from "@/components/primitives/border-trail"
import { PipelineRunGraph, type Stage } from "pipeline-run-graph"
import { DiffPaneSplit, type DiffLine } from "diff-pane-split"
import { CodeSnippetPanel } from "code-snippet-panel"
import { CronPreview } from "cron-preview"
import { StatusHealthStrip, type Service } from "status-health-strip"

export type ReleaseCaptainProps = {
  /** release tag shown across the desk */
  tag?: string
  className?: string
}

// ── deterministic PRNG (mulberry32, seeded from a string signature) ────────
function hashSeed(input: string) {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SEEDED_SERVICES: Service[] = [
  { name: "api gateway", state: "operational", region: "eu-west" },
  { name: "edge cache", state: "degraded", region: "us-east", note: "p95 +180ms since 02:10" },
  { name: "release bot", state: "operational", region: "us-east" },
  { name: "primary db", state: "operational", region: "eu-west" },
  { name: "webhooks fanout", state: "operational", region: "global" },
]

// seeded run #4187 — integration is red, so "rerun failed" is live at first paint
const SEEDED_STAGES: Stage[] = [
  {
    id: "build", label: "build", status: "pass", duration: "38s",
    log: ["$ turbo build --filter=web", "→ 532 modules transformed", "✓ built in 21.9s"],
  },
  {
    id: "unit", label: "unit tests", status: "pass", duration: "1m 52s",
    log: ["vitest run …", "✓ 418 passed (418)", "coverage 91.2%"],
  },
  {
    id: "integration", label: "integration", status: "fail", duration: "3m 04s",
    log: ["▸ checkout.spec.ts", "✓ cart renders", "✗ promo code applies tier discount", "  expected −10% · received −15%", "  at applyPromo (pricing.ts:88)"],
  },
  {
    id: "package", label: "package", status: "skip",
    log: ["skipped — upstream stage failed"],
  },
  {
    id: "deploy", label: "deploy", status: "idle",
    log: [],
  },
]

const INSTALL_SNIPPET = `# pull the desk from the registry
npx shadcn@latest add "https://registry.component.sh/r/release-captain.json"

# or pin it in package.json
npm i @registry/release-captain@2.14`

export function ReleaseCaptain({ tag = "v2.14.0", className }: ReleaseCaptainProps) {
  const reduce = useReducedMotion()

  // ── state ────────────────────────────────────────────────────────────────
  const RUN_NO = 4187
  const [reruns, setReruns] = React.useState(0)
  const [stages, setStages] = React.useState<Stage[]>(SEEDED_STAGES)
  const [applied, setApplied] = React.useState(false)
  const [cron, setCron] = React.useState("0 3 * * 1")
  const [locked, setLocked] = React.useState(false)
  const [shipping, setShipping] = React.useState(false)
  const [shipped, setShipped] = React.useState(false)
  const [region, setRegion] = React.useState("")
  const [services, setServices] = React.useState<Service[]>(SEEDED_SERVICES)
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])
  const addTimer = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms))
  React.useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // ── run maths ────────────────────────────────────────────────────────────
  const running = stages.some((s) => s.status === "running")
  const failed = stages.filter((s) => s.status === "fail")
  const allPass = stages.length > 0 && stages.every((s) => s.status === "pass")

  const rerunFailed = () => {
    if (shipping || shipped) return
    setStages((st) => st.map((s) => (s.status === "fail" ? { ...s, status: "running", log: [`replaying ${s.id} (attempt ${reruns + 2})…`] } : s)))
    const next = reruns + 1
    setReruns(next)
    addTimer(() => {
      // fresh seed per attempt — 80% of seeds pass, so retries can succeed
      const roll = mulberry32(hashSeed(`rerun-${RUN_NO}-${next}`))()
      const ok = roll < 0.8
      const dur = ok ? `${1 + Math.floor(roll * 20)}s` : "2m 41s"
      const log = ok
        ? [`replaying ${failed.map((f) => f.id).join(", ")}…`, "✓ promo tier discount −10%", `✓ green in ${dur}`]
        : ["replayed — still flaky", "✗ promo code applies tier discount", "  same assertion, new dice"]
      setStages((st) =>
        st.map((s) =>
          s.status === "running" && s.id !== "deploy"
            ? { ...s, status: ok ? "pass" : "fail", duration: dur, log }
            : s.id === "package" && ok
              ? { ...s, status: "pass", duration: "12s", log: ["tarball + sbom built", "✓ signed keyless"] }
              : s,
        )
      )
    }, reduce ? 300 : 1200)
  }

  // ── gate ─────────────────────────────────────────────────────────────────
  const blockers: string[] = []
  if (!shipped) {
    if (running) blockers.push("run in progress")
    else if (!allPass) blockers.push(`rerun ${failed.length} failed stage${failed.length > 1 ? "s" : ""}`)
    if (!applied) blockers.push("diff not approved")
    if (!locked) blockers.push("window not locked")
  }
  const gateOpen = shipped || blockers.length === 0

  const ship = () => {
    if (!gateOpen || shipping) return
    setShipping(true)
    setStages((st) => st.map((s) => ({ ...s, status: "running", log: [`shipping ${tag} — ${s.id}…`] })))
    addTimer(() => {
      // ship run replays every stage deterministically green
      setStages([
        { id: "build", label: "build", status: "pass", duration: "41s", log: [`$ turbo build — ${tag}`, "→ 532 modules transformed", "✓ built in 22.4s"] },
        { id: "unit", label: "unit tests", status: "pass", duration: "1m 58s", log: ["vitest run …", "✓ 420 passed (420)", "coverage 91.4%"] },
        { id: "integration", label: "integration", status: "pass", duration: "2m 47s", log: ["✓ promo tier discount −10%", "✓ canary smoke suite", `✓ green — ${tag} cleared`] },
        { id: "package", label: "package", status: "pass", duration: "12s", log: ["tarball + sbom built", "✓ signed keyless"] },
        { id: "deploy", label: "deploy", status: "pass", duration: "4m 12s", log: ["canary 5% → 25% → 100%", `${tag} live in all regions`, "✓ health strip nominal"] },
      ])
    }, reduce ? 400 : 1400)
    addTimer(() => {
      setShipping(false)
      setShipped(true)
      setServices((sv) => sv.map((s) => (s.name === "edge cache" ? { ...s, state: "operational", note: "cache warmed by rollout" } : s)))
    }, reduce ? 800 : 2600)
  }

  const revertApproval = () => setApplied(false)

  // ── config diff — current vs next, derived from live state ──────────────
  const diffLines: DiffLine[] = React.useMemo(
    () => [
      { kind: "hunk", text: "@@ ops/release.toml · rollout" },
      { kind: "ctx", text: 'owner = "release-eng"' },
      { kind: "del", text: 'channel = "canary"' },
      { kind: "add", text: 'channel = "stable"' },
      { kind: "ctx", text: "retry_limit = 3" },
      { kind: "del", text: "retry_limit = 3" },
      { kind: "add", text: "retry_limit = 5" },
      { kind: "ctx", text: 'maintenance_window = "unset"' },
      ...(locked ? [{ kind: "add", text: `maintenance_window = "${cron}"` } as DiffLine] : []),
      { kind: "ctx", text: 'signing = "keyless"' },
    ],
    [cron, locked],
  )

  const gateTone = shipped ? "ok" : gateOpen ? "ready" : "blocked"

  return (
    <div className={cn("relative isolate flex min-h-[620px] w-full flex-col overflow-hidden font-sans text-foreground", className)}>
      <StatusHealthStrip services={services} region={region} onRegion={setRegion} />

      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-border/70 px-4 py-3 sm:px-5 sm:py-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground sm:text-[11px]">
            <GitBranch aria-hidden className="size-3.5" /> ship · {tag} · a3f19c2
          </p>
          <h2 className="mt-0.5 font-display text-xl font-bold tracking-tight sm:text-2xl">Release captain</h2>
        </div>
        <div className="flex min-w-0 flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <Badge variant={shipped ? "default" : gateOpen ? "secondary" : "outline"} className="gap-1.5">
              <ShieldCheck aria-hidden className="size-3.5" />
              {shipped ? "shipped" : gateOpen ? "gate open" : "blocked"}
            </Badge>
            <Button size="sm" disabled={!gateOpen || shipping} aria-describedby="ship-gate-status" onClick={ship} className="sm:h-9 sm:px-4">
              {shipping ? <RotateCcw aria-hidden className="animate-spin" /> : <Rocket aria-hidden />}
              {shipped ? `${tag} shipped` : shipping ? "rolling out…" : `Ship ${tag}`}
            </Button>
          </div>
          <p id="ship-gate-status" aria-live="polite" className="hidden max-w-[44ch] text-right text-[10px] leading-snug text-muted-foreground sm:block sm:text-[11px]">
            {shipped ? `${tag} is live.` : shipping ? "Rolling out…" : blockers.length ? `Blocked: ${blockers.join(" · ")}` : "All clear."}
          </p>
        </div>
      </header>

      <div className="grid min-w-0 grid-cols-12 items-start gap-4 px-4 py-4 sm:gap-5 sm:px-5 sm:py-5">
        <div className="col-span-12 min-w-0 space-y-5 lg:col-span-7">
        <section aria-label="Run graph" className={cn("relative", running && "rounded-xl")}>
          {running && !reduce && <BorderTrail className="bg-[hsl(var(--info))] rounded-xl" size={44} />}
          <div className={cn("rounded-xl border border-border/70 bg-card p-4 shadow-sm", !running && "h-full")}>
            <header className="mb-3 flex items-baseline justify-between px-1">
              <h3 className="font-display text-lg font-semibold">Run graph</h3>
              <p className="font-mono text-[11px] font-medium text-muted-foreground">
                #{RUN_NO} · attempt {reruns + 1} · {shipped ? "ship run ✓" : running ? "rolling" : allPass ? "green" : "red"}
              </p>
            </header>
            <PipelineRunGraph run={`#${RUN_NO}`} stages={stages} onRerunFailed={rerunFailed} />
          </div>
        </section>

        <section aria-label="Install snippet">
          <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Install</p>
          <CodeSnippetPanel code={INSTALL_SNIPPET} language="bash" title="registry install" />
        </section>
        </div>

        <div className="col-span-12 min-w-0 space-y-5 lg:col-span-5">

          <section aria-label="Maintenance window" className="rounded-xl border border-dashed border-border bg-card/50 p-4">
            <header className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Lock aria-hidden className={cn("size-4", locked ? "text-[hsl(var(--ok))]" : "text-muted-foreground")} />
                Maintenance window
              </h3>
              <span className={cn("font-mono text-[11px] font-bold uppercase tracking-wider", locked ? "text-[hsl(var(--ok))]" : "text-muted-foreground")}>
                {locked ? "locked" : "open"}
              </span>
            </header>
            <CronPreview expr={cron} onChange={setCron} />
            <label className="mt-4 flex items-center justify-between border-t border-dashed border-border/80 pt-3">
              <span className="text-sm font-medium">
                Ship only inside this window
                <span className="ml-2 font-mono text-[11px] font-medium text-muted-foreground">
                  {locked ? `next run ${cron}` : "unset"}
                </span>
              </span>
              <Switch checked={locked} onCheckedChange={setLocked} aria-label="Ship only inside the maintenance window" />
            </label>
          </section>
        </div>

        <section aria-label="Config diff" className="col-span-12 min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="font-display text-base font-semibold sm:text-lg">Config diff</h3>
            <p className="hidden text-xs text-muted-foreground sm:inline sm:text-sm">current → next</p>
            <div className="ml-auto flex items-center gap-2">
              {applied && (
                <motion.span
                  initial={reduce ? false : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--ok)/0.1)] px-2.5 py-1 text-xs font-semibold text-[hsl(var(--ok))]"
                >
                  <Check aria-hidden className="size-3.5" /> applied to rollout
                </motion.span>
              )}
              {applied ? (
                <Button variant="ghost" size="sm" onClick={revertApproval}>
                  <RotateCcw aria-hidden /> Revert approval
                </Button>
              ) : (
                <Button size="sm" onClick={() => setApplied(true)}>
                  <Check aria-hidden /> Approve diff
                </Button>
              )}
            </div>
          </div>
          <DiffPaneSplit lines={diffLines} file="ops/release.toml" />
        </section>
      </div>
    </div>
  )
}
