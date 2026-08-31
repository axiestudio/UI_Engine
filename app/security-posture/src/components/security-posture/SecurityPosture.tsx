import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, CircleAlert, FileSearch, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel } from "@/components/primitives/handcraft"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/primitives/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/watermelon/table"
import { StatusHealthStrip, type Service } from "status-health-strip"
import { CopySecretField } from "copy-secret-field"
import { RadialGauge } from "radial-gauge"

// COMPOSITE SCREEN · SECOPS REVIEW
// composed of: status-health-strip (perimeter strip → opens the posture
// dialog), copy-secret-field (rotated keys), radial-gauge (credential
// hygiene meters) + purpose-built role matrix and audit pipeline.

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
  const [rotating, setRotating] = React.useState<string | null>(null)
  const [rotatedCount, setRotatedCount] = React.useState(0)
  const [fixed, setFixed] = React.useState<string[]>([])

  const stale = keyRows.filter((k) => k.stale).length
  const freshness = Math.max(35, 94 - stale * 23)
  const openFindings = findings.filter((f) => !fixed.includes(f.id))
  const postureScore = Math.min(99, 62 + rotatedCount * 9 + fixed.length * 11)

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

  return (
    <div className={cn("flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Security posture</h2>
        <Badge variant="outline" className="font-mono text-[10px] uppercase">{env}</Badge>
        <span className="text-[12px] text-muted-foreground">· {region} · SOC 2 window closes in 12 d</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setReview({})}
            className="flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted"
          >
            <FileSearch className="size-3.5" /> Posture review
          </button>
          <button
            disabled={!stale}
            onClick={() => keyRows.filter((k) => k.stale).forEach((k) => rotate(k.id))}
            className="flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted disabled:opacity-40"
          >
            <KeyRound className="size-3.5" /> Rotate stale {stale ? `(${stale})` : ""}
          </button>
        </div>
      </header>

      <div className="border-b bg-background px-4 py-3">
        <StatusHealthStrip services={services} region={region} onRegion={() => setReview({ service: "Vault replication" })} />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-auto p-4 lg:grid-cols-[300px_minmax(0,1fr)_320px]">
        {/* credential hygiene */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Credential hygiene
              <span className="font-mono text-[10px] normal-case tracking-normal">{openFindings.length} open</span>
            </header>
            <div className="grid grid-cols-3 gap-2 p-3">
              <RadialGauge value={freshness} label="Key freshness" unit="%" precision={0} size={76} zones={METER_ZONES} />
              <RadialGauge value={96} label="MFA coverage" unit="%" precision={0} size={76} zones={METER_ZONES} />
              <RadialGauge value={Math.min(99, 71 + fixed.length * 10)} label="Least privilege" unit="%" precision={0} size={76} zones={METER_ZONES} />
            </div>
            <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">
              Meters recompute on rotation and remediation · targets ≥ 90 %
            </div>
          </section>

          <section className="flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Audit pipeline
            </header>
            <ol className="p-3">
              {stages.map((s, i) => (
                <li key={s.id} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < stages.length - 1 && <span aria-hidden className="absolute left-[9px] top-5 h-full w-px bg-border" />}
                  <span
                    className={cn(
                      "relative z-10 mt-0.5 grid size-[19px] shrink-0 place-items-center rounded-full border bg-background",
                      s.state === "passed" && "border-[hsl(var(--ok)/0.5)] text-[hsl(var(--ok))]",
                      s.state === "running" && "border-[hsl(var(--info)/0.5)] text-[hsl(var(--info))]",
                      s.state === "blocked" && "border-[hsl(var(--err)/0.5)] text-[hsl(var(--err))]",
                      s.state === "queued" && "text-muted-foreground",
                    )}
                  >
                    {s.state === "passed" ? <Check className="size-3" /> : s.state === "running" ? <LoaderCircle className="size-3 animate-spin" /> : s.state === "blocked" ? <CircleAlert className="size-3" /> : <span className="size-1.5 rounded-full bg-current" />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold">{s.label}</p>
                    <p className="text-[11px] text-muted-foreground">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </aside>

        {/* role matrix */}
        <section className="min-w-0 overflow-hidden rounded-lg border bg-card">
          <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Role matrix · {roles.length} roles</span>
            <MonoLabel className="text-[10px] text-muted-foreground" tick={false}>least-privilege diff vs baseline</MonoLabel>
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
              {roles.map((r) => (
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
                    <Badge
                      variant={r.standing === "clean" ? "secondary" : r.standing === "drift" ? "outline" : "destructive"}
                      className={cn("text-[10px] uppercase", r.standing === "drift" && "border-[hsl(var(--warn))] text-[hsl(var(--warn))]")}
                    >
                      {r.standing}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">
            Drift = extra scopes vs role baseline · violations page the on-call responder
          </div>
        </section>

        {/* keys */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Rotated keys
              <span className="font-mono text-[10px] normal-case tracking-normal">{rotatedCount} this shift</span>
            </header>
            <div className="grid gap-3 p-3">
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
          </section>
        </aside>
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
                        <button onClick={() => setFixed((xs) => [...xs, f.id])} className="rounded-md border bg-background px-2 py-1 text-[11px] font-semibold hover:bg-muted">
                          Remediate
                        </button>
                      </div>
                    )}
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>
          <div className="flex items-center justify-between border-t px-5 py-3">
            <p className="text-[11px] text-muted-foreground">{openFindings.length} findings remaining · pack attaches to evidence vault</p>
            <DialogClose className="h-8 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted">
              Close review
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
