import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB      show system health as a body, not a table
// ═══ EMOTION  calm vigilance — you can hear the heartbeat
// ═══ SIGNATURE each service carries an ECG pulse whose speed = latency;
//               degraded services pulse red and their bar shivers
//   SITE      → status/trust pages for infra brands
//   APP       → status pages; services re-tick via props
//   A11Y      aria-live on state changes; pulses decorative; reduce = static

export type Service = { name: string; state: "ok" | "degraded" | "down"; latencyMs: number; uptime90d: number }

export type OpsHeartbeatProps = {
  services?: Service[]
  className?: string
}

const DEFAULT_SERVICES: Service[] = [
  { name: "API gateway", state: "ok", latencyMs: 84, uptime90d: 99.99 },
  { name: "Postgres cluster", state: "ok", latencyMs: 12, uptime90d: 100 },
  { name: "Media encoder", state: "degraded", latencyMs: 890, uptime90d: 99.2 },
  { name: "Webhook relay", state: "ok", latencyMs: 156, uptime90d: 99.95 },
  { name: "Search index", state: "down", latencyMs: 0, uptime90d: 98.7 },
]

const STATE: Record<Service["state"], { label: string; cls: string; beat: number }> = {
  ok: { label: "Operational", cls: "text-emerald-700 dark:text-emerald-400", beat: 1100 },
  degraded: { label: "Degraded", cls: "text-amber-700 dark:text-amber-400", beat: 420 },
  down: { label: "Down", cls: "text-red-700 dark:text-red-400", beat: 0 },
}

function Ecg({ state, reduce }: { state: Service["state"]; reduce: boolean }) {
  const s = STATE[state]
  if (state === "down") {
    return <span aria-hidden className="block h-4 w-20 rounded bg-[repeating-linear-gradient(90deg,currentColor_0_6px,transparent_6px_12px)] opacity-40" />
  }
  return (
    <svg viewBox="0 0 80 16" aria-hidden className={cn("h-4 w-20", s.cls)}>
      <motion.path
        d="M0 10 H18 l3-6 3 10 3-6 H38 l3-6 3 10 3-6 H58 l3-6 3 10 3-6 H80"
        fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
        initial={reduce ? {} : { pathLength: 0 }}
        animate={reduce ? {} : { pathLength: [0, 1, 0] }}
        transition={{ duration: s.beat / 1000 + 0.6, repeat: Infinity, ease: "linear" }}
      />
    </svg>
  )
}

export function OpsHeartbeat({ services = DEFAULT_SERVICES, className }: OpsHeartbeatProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const allOk = services.every((s) => s.state === "ok")
  return (
    <SectionShell width={920} className={className}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <MonoLabel className="text-muted-foreground">OPS · HEARTBEAT</MonoLabel>
          <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-foreground">The system, alive.</h2>
        </div>
        <span aria-live="polite" className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.18em]", allOk ? "border-emerald-300 text-emerald-800 dark:border-emerald-800 dark:text-emerald-300" : "border-amber-300 text-amber-800 dark:border-amber-800 dark:text-amber-300")}>
          <motion.span animate={reduce || allOk ? {} : { opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className={cn("size-2 rounded-full", allOk ? "bg-emerald-600 dark:bg-emerald-400" : "bg-amber-500")} />
          {allOk ? "all systems nominal" : "1 degraded · 1 down"}
        </span>
      </div>

      <ul className="mt-10 divide-y divide-border border-y">
        {services.map((s, i) => (
          <InView key={s.name} once delay={i * 0.05}>
            <li className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-4 sm:grid-cols-[auto_1fr_auto_auto_auto]">
              <Ecg state={s.state} reduce={reduce} />
              <div className="min-w-0">
                <span className="block truncate font-display text-base font-bold text-foreground">{s.name}</span>
                <span className={cn("font-mono text-[10px] font-bold uppercase tracking-[0.16em]", STATE[s.state].cls)}>{STATE[s.state].label}</span>
              </div>
              <span className="hidden font-mono text-[11px] font-bold tabular-nums text-muted-foreground sm:block">{s.state === "down" ? "—" : `${s.latencyMs}ms`}</span>
              <div aria-hidden className="hidden w-40 sm:block">
                <div className="flex h-6 items-end gap-[2px]">
                  {Array.from({ length: 30 }, (_, b) => {
                    const bad = s.state !== "ok" && b > 24
                    return <span key={b} className={cn("w-1 flex-1 rounded-sm", bad ? (s.state === "down" ? "bg-red-500/80" : "bg-amber-500/80") : "bg-foreground/30")} style={{ height: `${30 + ((b * 37) % 60)}%` }} />
                  })}
                </div>
                <span className="mt-1 block font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">90d · {s.uptime90d}%</span>
              </div>
            </li>
          </InView>
        ))}
      </ul>
    </SectionShell>
  )
}
