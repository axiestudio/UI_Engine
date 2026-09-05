import * as React from "react"
import { motion, MotionConfig } from "motion/react"
import { RadioTower } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { GlowEffect } from "@/components/primitives/glow-effect"
import { StatusHealthStrip } from "status-health-strip"
import { ChatThreadVirtual } from "chat-thread-virtual"
import { JobTray } from "job-tray"
import { PipelineRunGraph, type Stage } from "pipeline-run-graph"
import { OfflineQueueBanner } from "offline-queue-banner"
import { RadialGauge } from "radial-gauge"
import { ToastStack } from "toast-stack"

// COMPOSITE — status-health-strip + chat-thread-virtual + job-tray +
// pipeline-run-graph + offline-queue-banner + radial-gauge + toast-stack (+ glow-effect)
// JOB      run the 2 a.m. page without the pager feeling like paperwork
// MOVE     severity gauge is the room's heartbeat — crossing 80% tints the
//          panel with GlowEffect and fires an escalation toast

export type IncidentCommandProps = { incident?: string; onEscalate?: () => void; className?: string }

export function IncidentCommand({ incident = "INC-226 — checkout latency climbing", onEscalate, className }: IncidentCommandProps) {
  const [sev, setSev] = React.useState(64)
  const [msgs, setMsgs] = React.useState([
    { id: "a", author: "dispatch-bot", at: new Date(Date.now() - 800e3).toISOString(), text: "p95 up 40% in eu — auto page fired" },
    { id: "b", me: true, at: new Date(Date.now() - 700e3).toISOString(), text: "ack, rolling back the payment proxy" },
    { id: "c", author: "Klara (SRE)", at: new Date(Date.now() - 120e3).toISOString(), text: "queue draining on 2/3 nodes" },
  ])
  const [toasts, setToasts] = React.useState<{ id: string; title: string; tone?: "ok" | "warn" | "err" }[]>([])
  const [jobs, setJobs] = React.useState<{ id: string; label: string; status: "running" | "done" | "error" | "queued"; progress?: number; log?: string[]; error?: string }[]>([{ id: "j1", label: "proxy rollback", status: "running", progress: 40, log: ["draining…", "node-3 ok"] }])
  const [stages, setStages] = React.useState<Stage[]>([
    { id: "s1", label: "Detect", status: "pass" as const, duration: "12s" },
    { id: "s2", label: "Rollback", status: "running" as const, log: ["proxy v9 → v8"] },
    { id: "s3", label: "Verify", status: "queued" as const },
  ])
  const push = (title: string, tone: "ok" | "warn" | "err" = "warn") => setToasts((t) => [...t.slice(-3), { id: String(Date.now() + Math.random()), title, tone }])

  React.useEffect(() => { const iv = setInterval(() => setSev((s) => Math.max(12, Math.min(96, s + (Math.random() * 16 - 8)))), 2400); return () => clearInterval(iv) }, [])
  React.useEffect(() => { if (sev >= 80) { push("SEV1 threshold — on-call 3 is now in", "err"); onEscalate?.() } }, [sev >= 80]) // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    const iv = setInterval(() => {
      setJobs((js) => js.map((j) => { if (j.status === "running") { const p = Math.min(100, (j.progress ?? 0) + 18); return p >= 100 ? { ...j, progress: 100, status: "done", log: [...(j.log ?? []), "all nodes green ✓"] } : { ...j, progress: p } } return j }))
      setStages((s) => { const i = s.findIndex((x) => x.status === "running"); return i >= 0 ? s.map((x, j) => (j === i ? { ...x, status: "pass", duration: "2m" } : j === i + 1 && x.status === "queued" ? { ...x, status: "running" } : x)) : s })
    }, 2600)
    return () => clearInterval(iv)
  }, [])
  const hot = sev >= 80

  return (
    <div className={cn("relative isolate min-h-[600px] overflow-hidden rounded-2xl border bg-background font-sans", hot && "border-[hsl(var(--err)/0.6)]", className)}>
      <MotionConfig reducedMotion="user">
      {hot && <GlowEffect colors={["hsl(var(--hot-1))", "hsl(var(--hot-2))"]} mode="pulse" blur="strong" />}
      <OfflineQueueBanner online={true} queued={0} />
      <StatusHealthStrip services={[
        { name: "Checkout API", state: hot ? "degraded" : "operational", region: "eu" }, { name: "Payments", state: hot ? "down" : "operational", region: "eu", note: hot ? "proxy rollback mid-flight" : undefined }, { name: "Board websockets", state: "operational", region: "eu" },
      ]} />
      <header className="flex flex-wrap items-center gap-3 border-b bg-card px-5 py-4">
        <RadioTower aria-hidden className={"size-4 " + (hot ? "motion-safe:motion-safe:motion-safe:animate-pulse text-[hsl(var(--err))]" : "text-[hsl(var(--warn))]")} />
        <h2 className="font-display text-lg font-black tracking-tight">{incident}</h2>
        <Badge className={cn("ml-auto font-mono text-[9px]", hot ? "bg-[hsl(var(--err))] text-primary-foreground" : "bg-[hsl(var(--warn)/0.15)] text-[hsl(var(--warn))] border border-current")}>SEV {hot ? 1 : 2} · ack 700s</Badge>
      </header>

      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_300px]">
        <div className="grid gap-5 sm:grid-rows-[minmax(0,1fr)_auto]">
          <div className="rounded-xl border bg-card p-1">
            <ChatThreadVirtual messages={msgs.map((m) => ({ ...m }))} canEdit={() => false} scene={false} />
          
    </div>
          <div className="rounded-xl border bg-card"><PipelineRunGraph run="rollback 226" stages={stages} onRerunFailed={() => setStages((s) => s.map((x) => x.status === "fail" ? { ...x, status: "running", log: ["manual retry"] } : x))} /></div>
        </div>
        <aside className="flex flex-col items-center gap-4 rounded-xl border bg-card p-5">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] self-start text-muted-foreground">SEVERITY (live)</span>
          <RadialGauge value={Math.round(sev)} label="SEVERITY" unit="" zones={[{ to: 0.55, color: "hsl(var(--ok))", label: "watch" }, { to: 0.8, color: "hsl(var(--warn))", label: "page" }, { to: 1, color: "hsl(var(--err))", label: "esc-1" }]} />
          <Input aria-label="Simulate severity" type="range" min={0} max={100} value={sev} onChange={(e) => setSev(+e.target.value)} className="w-44 accent-[hsl(var(--err))]" />
          <div className="w-full rounded-lg border bg-[hsl(var(--app-code))] p-3 text-[11px] leading-relaxed text-muted-foreground">
            <b className="text-foreground">who's on:</b> you (ack), Klara SRE, dispatch-bot. Jobs roll bottom-right — the tray tail is live.
          </div>
        </aside>
      </div>
      <JobTray jobs={jobs} onCancel={(j) => setJobs((x) => x.map((y) => y.id === j.id ? { ...y, status: "error", error: "cancelled", progress: undefined } : y))} onDismiss={(id) => setJobs((x) => x.filter((y) => y.id !== id))} />
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} pos="tr" />
          </MotionConfig>
    </div>
  )
}
