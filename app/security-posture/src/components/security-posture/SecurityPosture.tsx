import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { Check, CircleAlert, FileSearch, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/primitives/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/watermelon/table"
import { StatusHealthStrip, type Service } from "status-health-strip"
import { CopySecretField } from "copy-secret-field"
import { RadialGauge } from "radial-gauge"
import { RadarChart } from "radar-chart"
import { Waveform } from "waveform"

// COMPOSITE SCREEN · SECOPS REVIEW
// composed of: status-health-strip (perimeter strip → opens the posture
// dialog), radar-chart (posture hero over six control dimensions), radial-gauge
// (compact credential-hygiene gauge strip feeding the radar axes), waveform
// (live audit-ingest signal), copy-secret-field (rotated keys) + purpose-built
// tri-state role matrix and audit pipeline.
//
// Single source of truth: role standing, key staleness, remediations and
// service state feed BOTH the radar hero and the gauge strip — cycle a role,
// rotate a key or remediate a finding and the whole hero recomputes.

export type RoleRow = {
  id: string
  role: string
  scopes: string[]
  members: number
  standing: "clean" | "drift" | "violation"
}
export type KeyRecord = {
  id: string
  label: string
  secret: string
  rotated: string
  due: string
  stale?: boolean
}
export type AuditStage = {
  id: string
  label: string
  detail: string
  state: "passed" | "running" | "blocked" | "queued"
}
export type Finding = {
  id: string
  severity: "high" | "medium" | "low"
  title: string
  control: string
  fixed?: boolean
}
export type SecurityPostureProps = {
  env?: string
  region?: string
  services?: Service[]
  roles?: RoleRow[]
  keys?: KeyRecord[]
  stages?: AuditStage[]
  findings?: Finding[]
  onRotated?: (id: string) => void
  className?: string
}

const DEFAULT_SERVICES: Service[] = [
  { name: "SSO gateway", state: "operational", region: "eu-north-1" },
  { name: "Vault replication", state: "degraded", region: "eu-north-1", note: "lag 14 min" },
  { name: "SCIM provisioning", state: "operational", region: "global" },
  { name: "Audit ingest", state: "operational", region: "global" },
]

const DEFAULT_ROLES: RoleRow[] = [
  { id: "r1", role: "On-call responder", scopes: ["secrets:read", "incidents:write", "runbooks:run"], members: 6, standing: "clean" },
  { id: "r2", role: "Compliance auditor", scopes: ["audit:read", "evidence:export"], members: 3, standing: "clean" },
  { id: "r3", role: "Platform admin", scopes: ["secrets:rotate", "roles:write", "sso:write", "audit:read"], members: 2, standing: "drift" },
  { id: "r4", role: "Contractor deploy", scopes: ["deploy:run", "secrets:read", "audit:read"], members: 4, standing: "violation" },
]

const DEFAULT_KEYS: KeyRecord[] = [
  { id: "k1", label: "prod · ci deploy key", secret: "sk_live_9f2c4b71ae", rotated: "2 d ago", due: "in 28 d" },
  { id: "k2", label: "prod · vault unseal", secret: "vt_live_5d08aae3c1", rotated: "41 d ago", due: "in 4 d", stale: true },
  { id: "k3", label: "staging · service token", secret: "st_stg_c31b7f90d2", rotated: "6 h ago", due: "in 89 d" },
]

const DEFAULT_STAGES: AuditStage[] = [
  { id: "a1", label: "Collect", detail: "412 events from 6 sources", state: "passed" },
  { id: "a2", label: "Normalise", detail: "OTEL + syslog mapped", state: "passed" },
  { id: "a3", label: "Rule engine", detail: "39 rules · 2 hits", state: "running" },
  { id: "a4", label: "Evidence pack", detail: "waits on rule engine", state: "queued" },
  { id: "a5", label: "Reviewer sign-off", detail: "blocked — drift on platform admin", state: "blocked" },
]

const DEFAULT_FINDINGS: Finding[] = [
  { id: "f1", severity: "high", title: "Contractor role holds audit:read", control: "AC-3 least privilege" },
  { id: "f2", severity: "medium", title: "Vault unseal key 41 d old", control: "SC-12 key rotation" },
  { id: "f3", severity: "low", title: "2 break-glass accounts without expiry note", control: "AC-2 account mgmt" },
]

const METER_ZONES = [
  { to: 60, color: "hsl(var(--err))" },
  { to: 82, color: "hsl(var(--warn))" },
  { to: 100, color: "hsl(var(--ok))" },
]

const STANDING_CYCLE: RoleRow["standing"][] = ["clean", "drift", "violation"]

export function SecurityPosture({
  env = "production",
  region = "eu-north-1",
  services = DEFAULT_SERVICES,
  roles = DEFAULT_ROLES,
  keys = DEFAULT_KEYS,
  stages = DEFAULT_STAGES,
  findings = DEFAULT_FINDINGS,
  onRotated,
  className,
}: SecurityPostureProps) {
  const [review, setReview] = React.useState<null | { service?: string }>(null)
  const [keyRows, setKeyRows] = React.useState(keys)
  const [roleRows, setRoleRows] = React.useState(roles)
  const [rotating, setRotating] = React.useState<string | null>(null)
  const [rotatedCount, setRotatedCount] = React.useState(0)
  const [fixed, setFixed] = React.useState<string[]>([])

  const rotate = (id: string) => {
    setRotating(id)
    window.setTimeout(() => {
      setKeyRows((ks) =>
        ks.map((k) =>
          k.id === id
            ? { ...k, secret: k.secret.slice(0, 7) + Math.random().toString(36).slice(2, 12), rotated: "just now", due: "in 90 d", stale: false }
            : k,
        ),
      )
      setRotating(null)
      setRotatedCount((c) => c + 1)
      onRotated?.(id)
    }, 900)
  }

  const cycleStanding = (id: string) =>
    setRoleRows((rs) =>
      rs.map((r) =>
        r.id === id ? { ...r, standing: STANDING_CYCLE[(STANDING_CYCLE.indexOf(r.standing) + 1) % 3] } : r,
      ),
    )

  // ── posture axes — one state pool drives the radar hero, the gauge strip
  //    and the review dialog score ──────────────────────────────────────────
  const stale = keyRows.filter((k) => k.stale).length
  const openFindings = findings.filter((f) => !fixed.includes(f.id))
  const openHigh = openFindings.filter((f) => f.severity === "high").length
  const openMedium = openFindings.filter((f) => f.severity === "medium").length
  const violations = roleRows.filter((r) => r.standing === "violation").length
  const drifts = roleRows.filter((r) => r.standing === "drift").length
  const degraded = services.filter((s) => s.state !== "operational").length

  const freshness = Math.max(35, 94 - stale * 23)
  const mfaCoverage = Math.max(55, 96 - violations * 5)
  const leastPrivilege = Math.max(20, Math.min(99, 71 + fixed.length * 10 - violations * 6))
  const patchLevel = Math.max(30, 90 - openHigh * 9 - openMedium * 4)
  const backupHealth = Math.max(30, 94 - degraded * 14)
  const driftControl = Math.max(15, 100 - drifts * 12 - violations * 26)

  const POSTURE_AXES: { label: string; value: number }[] = [
    { label: "MFA coverage", value: mfaCoverage },
    { label: "Key freshness", value: freshness },
    { label: "Least privilege", value: leastPrivilege },
    { label: "Patch level", value: patchLevel },
    { label: "Backup health", value: backupHealth },
    { label: "Drift", value: driftControl },
  ]
  const radarData = POSTURE_AXES.map((a) => ({ axisLabel: a.label, current: Math.round(a.value), target: 90 }))
  const postureScore = Math.round(POSTURE_AXES.reduce((s, a) => s + a.value, 0) / POSTURE_AXES.length)
  const weakest = [...POSTURE_AXES].sort((a, b) => a.value - b.value)[0]

  const pipelineSettled = stages.every((s) => s.state === "passed")

  return (
    <div className={cn("flex min-h-[560px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <MotionConfig reducedMotion="user">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Security posture</h2>
        <Badge variant="outline" className="font-mono text-[10px] uppercase">{env}</Badge>
        <span className="text-[12px] text-muted-foreground">· {region} · SOC 2 window closes in 12 d</span>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setReview({})}>
            <FileSearch className="size-3.5" /> Posture review
          </Button>
          <Button variant="outline" size="sm" disabled={!stale} onClick={() => keyRows.filter((k) => k.stale).forEach((k) => rotate(k.id))}>
            <KeyRound className="size-3.5" /> Rotate stale {stale ? `(${stale})` : ""}
          </Button>
          
    </div>
      </header>

      <div className="border-b bg-background px-4 py-3">
        <StatusHealthStrip services={services} region={region} onRegion={() => setReview({ service: "Vault replication" })} />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-auto p-4 lg:grid-cols-12">
        {/* hero — posture radar over six control dimensions, with the gauge strip that feeds it */}
        <section className="col-span-1 overflow-hidden rounded-lg border bg-card shadow-sm lg:col-span-12">
          <div className="grid gap-0 lg:grid-cols-12">
            <div className="flex items-start justify-center border-b p-3 lg:col-span-5 lg:border-b-0 lg:border-r">
              <RadarChart
                data={radarData}
                series={[
                  { key: "current", label: "current" },
                  { key: "target", label: "target 90", color: "hsl(var(--muted-foreground))" },
                ]}
                label="POSTURE"
                title="Control-plane posture radar"
                description={`Weakest axis: ${weakest.label.toLowerCase()} · ${weakest.value < 60 ? "remediate before sign-off" : "above sign-off floor"}`}
                className="w-full max-w-[340px] rounded-none border-0"
              />
            </div>
            <div className="flex flex-col lg:col-span-7">
              <div className="grid grid-cols-3 gap-2 p-3">
                <RadialGauge value={freshness} label="Key freshness" unit="%" precision={0} size={84} zones={METER_ZONES} orientation="arc" showCenterValue />
                <RadialGauge value={mfaCoverage} label="MFA coverage" unit="%" precision={0} size={84} zones={METER_ZONES} orientation="arc" showCenterValue />
                <RadialGauge value={leastPrivilege} label="Least privilege" unit="%" precision={0} size={84} zones={METER_ZONES} orientation="arc" showCenterValue />
              </div>
              <div className="mt-auto border-t px-3 py-2.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Composite score</span>
                  <motion.span key={postureScore} initial={{ scale: 1.08 }} animate={{ scale: 1 }} className="font-mono text-[20px] font-black tabular-nums">
                    {postureScore}
                    <span className="text-[11px] text-muted-foreground">/100</span>
                  </motion.span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Recomputed live from the role matrix, key rotation and remediations · gauges feed the radar axes · targets ≥ 90
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* role matrix — tri-state standing cycles clean → drift → violation */}
        <section className="col-span-1 flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card lg:col-span-7">
          <header className="flex h-10 items-center justify-between border-b px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Role matrix · {roleRows.length} roles</span>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px] text-muted-foreground">click standing to cycle tri-state</span>
          </header>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-8 px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Role</TableHead>
                <TableHead className="h-8 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Scopes</TableHead>
                <TableHead className="h-8 px-2 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Members</TableHead>
                <TableHead className="h-8 px-3 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Standing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roleRows.map((r) => (
                <TableRow key={r.id} className={cn(r.standing === "violation" && "bg-[hsl(var(--err)/0.04)]")}>
                  <TableCell className="px-3 py-1.5 text-[12px] font-bold">{r.role}</TableCell>
                  <TableCell className="px-2 py-1.5">
                    <div className="flex flex-wrap gap-1">
                      {r.scopes.map((s) => (
                        <span key={s} className="rounded border bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{s}</span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-1.5 text-right font-mono text-[12px] tabular-nums">{r.members}</TableCell>
                  <TableCell className="px-3 py-1.5 text-right">
                    <Button type="button" variant="ghost"
                      onClick={() => cycleStanding(r.id)}
                      title="Cycle standing: clean → drift → violation"
                      aria-label={`${r.role} standing: ${r.standing}. Click to cycle.`}
                      className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                    >
                      <Badge
                        variant={r.standing === "clean" ? "secondary" : r.standing === "drift" ? "outline" : "destructive"}
                        className={cn("uppercase transition-colors", r.standing === "drift" && "border-[hsl(var(--warn))] text-[hsl(var(--warn))]")}
                      >
                        {r.standing}
                      </Badge>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="mt-auto border-t px-3 py-2 text-[11px] text-muted-foreground">
            Drift = extra scopes vs role baseline · violations page the on-call responder and dent the drift + least-privilege axes
          </p>
        </section>

        {/* rotated keys */}
        <section className="col-span-1 flex flex-col overflow-hidden rounded-lg border bg-card lg:col-span-5">
          <header className="flex h-10 shrink-0 items-center justify-between border-b px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Rotated keys</span>
            <span className="font-mono text-[10px] text-muted-foreground">{rotatedCount} this shift</span>
          </header>
          <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
            {keyRows.map((k) => (
              <div key={k.id}>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-[12px] font-bold">{k.label}</span>
                  <span className={cn("font-mono text-[10px]", k.stale ? "font-bold text-[hsl(var(--err))]" : "text-muted-foreground")}>
                    {k.stale ? `DUE ${k.due.toUpperCase()}` : k.due}
                  </span>
                </div>
                <CopySecretField
                  value={k.secret}
                  label={`rotated ${k.rotated}`}
                  mono
                  rotating={rotating === k.id}
                  onRotate={() => rotate(k.id)}
                />
              </div>
            ))}
          </div>
          <p className="mt-auto border-t px-3 py-2 text-[11px] text-muted-foreground">Rotation lifts the key-freshness axis and the gauge above.</p>
        </section>

        {/* audit pipeline — horizontal stage band with live ingest signal */}
        <section className="col-span-1 overflow-hidden rounded-lg border bg-card lg:col-span-12">
          <div className="flex flex-col lg:flex-row">
            <div className="shrink-0 border-b p-3 lg:w-[236px] lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Audit pipeline</span>
                <span className="font-mono text-[10px] text-muted-foreground">{pipelineSettled ? "settled" : "streaming"}</span>
              </div>
              <Waveform
                label="INGEST"
                samples={72}
                speed={0.5}
                amplitude={0.32}
                height={44}
                showCenterline={false}
                paused={pipelineSettled}
              />
            </div>
            <ol className="grid flex-1 grid-cols-1 sm:grid-cols-3 xl:grid-cols-5">
              {stages.map((s) => (
                <li key={s.id} className="border-t p-3 first:border-t-0 sm:border-l sm:border-t-0 sm:first:border-l-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "grid size-[19px] shrink-0 place-items-center rounded-full border bg-background",
                        s.state === "passed" && "border-[hsl(var(--ok)/0.5)] text-[hsl(var(--ok))]",
                        s.state === "running" && "border-[hsl(var(--info)/0.5)] text-[hsl(var(--info))]",
                        s.state === "blocked" && "border-[hsl(var(--err)/0.5)] text-[hsl(var(--err))]",
                        s.state === "queued" && "text-muted-foreground",
                      )}
                    >
                      {s.state === "passed" ? <Check className="size-3" /> : s.state === "running" ? <LoaderCircle className="size-3 motion-safe:motion-safe:motion-safe:animate-spin" /> : s.state === "blocked" ? <CircleAlert className="size-3" /> : <span className="size-1.5 rounded-full bg-current" />}
                    </span>
                    <p className="truncate text-[12px] font-bold">{s.label}</p>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-muted-foreground" title={s.detail}>{s.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>

      {/* posture review dialog — opened from the strip or the header action */}
      <Dialog open={review !== null} onOpenChange={(o) => !o && setReview(null)}>
        <DialogContent className="max-w-[560px] p-0">
          <div className="border-b bg-muted/20 px-5 py-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[15px] font-bold">
                <ShieldCheck className="size-4 text-[hsl(var(--info))]" />
                Posture review{review?.service ? ` — ${review.service}` : ""}
              </DialogTitle>
              <DialogDescription className="text-[12px]">
                {env} · {region} · review closes the SOC 2 evidence window
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Score</span>
            <motion.span key={postureScore} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="font-mono text-[22px] font-black tabular-nums">
              {postureScore}
              <span className="text-[12px] text-muted-foreground">/100</span>
            </motion.span>
          </div>
          <ul className="max-h-[280px] space-y-2 overflow-auto px-5 pb-4">
            <AnimatePresence initial={false}>
              {findings.map((f) => {
                const done = fixed.includes(f.id)
                return (
                  <motion.li
                    key={f.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={cn("flex items-start justify-between gap-3 rounded-lg border p-3", done && "border-[hsl(var(--ok)/0.5)] bg-[hsl(var(--ok)/0.06)]")}
                  >
                    <div className="min-w-0">
                      <p className={cn("text-[12px] font-bold", done && "line-through opacity-60")}>{f.title}</p>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{f.control}</p>
                    </div>
                    {done ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[hsl(var(--ok))]"><Check className="size-3.5" /> fixed</span>
                    ) : (
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant={f.severity === "high" ? "destructive" : "outline"} className={cn("text-[10px] uppercase", f.severity === "medium" && "border-[hsl(var(--warn))] text-[hsl(var(--warn))]")}>
                          {f.severity}
                        </Badge>
                        <Button variant="outline" size="xs" onClick={() => setFixed((xs) => [...xs, f.id])}>
                          Remediate
                        </Button>
                      </div>
                    )}
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>
          <div className="flex items-center justify-between border-t px-5 py-3">
            <p className="text-[11px] text-muted-foreground">{openFindings.length} findings remaining · pack attaches to evidence vault</p>
            <DialogClose className="static top-auto right-auto flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-accent hover:text-accent-foreground">
              Close review
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
          </MotionConfig>
    </div>
  )
}
