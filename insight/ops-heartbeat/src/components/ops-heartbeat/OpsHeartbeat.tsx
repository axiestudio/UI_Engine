import * as React from "react"
import { motion } from "motion/react"
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"


export type Service = { name: string; state: "ok" | "degraded" | "down"; latencyMs: number; uptime90d: number }

export type OpsHeartbeatProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
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

const STATE: Record<Service["state"], { label: string; cls: string; badge: string }> = {
  ok: { label: "Operational", cls: "text-success", badge: "border-success/20 bg-success-muted text-success" },
  degraded: { label: "Degraded", cls: "text-warning-foreground", badge: "border-warning/20 bg-warning-muted text-warning-foreground" },
  down: { label: "Down", cls: "text-destructive", badge: "border-destructive/20 bg-destructive/10 text-destructive" },
}

function Ecg({ state, reduce }: { state: Service["state"]; reduce: boolean }) {
  const s = STATE[state]
  if (state === "down") {
    return <span aria-hidden className="block h-4 w-20 rounded bg-[repeating-linear-gradient(90deg,currentColor_0_6px,transparent_6px_12px)] opacity-25" />
  }
  return (
    <svg viewBox="0 0 80 16" aria-hidden className={cn("h-4 w-20", s.cls)}>
      <motion.path
        d="M0 10 H18 l3-6 3 10 3-6 H38 l3-6 3 10 3-6 H58 l3-6 3 10 3-6 H80"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={reduce ? undefined : { pathLength: 0, opacity: 0.6 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  )
}

export function OpsHeartbeat({
  eyebrow = "OPS · HEARTBEAT",
  title = "Service health",
  subtitle = "Five services. 90-day uptime, one-minute median latency.",
  services = DEFAULT_SERVICES,
  className,
}: OpsHeartbeatProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const counts = React.useMemo(() => {
    const ok = services.filter((s) => s.state === "ok").length
    const degraded = services.filter((s) => s.state === "degraded").length
    const down = services.filter((s) => s.state === "down").length
    return { ok, degraded, down, allOk: down === 0 && degraded === 0 }
  }, [services])

  return (
    <section className={cn("relative isolate w-full overflow-hidden", className)}>
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>
          <h2 className="mt-3 font-display text-[28px] font-semibold leading-[1.05] tracking-[-0.022em] text-foreground sm:text-[34px]">{title}</h2>
          <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{subtitle}</p>
        </div>

        <div
          aria-live="polite"
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] shadow-sm",
            counts.allOk
              ? "border-success/20 bg-success-muted text-success"
              : counts.down > 0
                ? "border-destructive/20 bg-destructive/10 text-destructive"
                : "border-warning/20 bg-warning-muted text-warning-foreground",
          )}
        >
          <span className={cn("size-2 rounded-full", counts.allOk ? "bg-success" : counts.down ? "bg-destructive" : "bg-warning")} aria-hidden />
          {counts.allOk ? "All systems nominal" : `${counts.degraded ? `${counts.degraded} degraded` : ""}${counts.degraded && counts.down ? " · " : ""}${counts.down ? `${counts.down} down` : ""}`}
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border bg-card shadow-sm">
        <ul className="divide-y divide-border/60">
          {services.map((s, i) => (
            <motion.li
              key={s.name}
              initial={reduce ? undefined : { opacity: 0, y: 4 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-[88px_1fr_auto] items-center gap-4 px-4 py-4 sm:grid-cols-[88px_1fr_auto_160px] sm:px-5"
            >
              <Ecg state={s.state} reduce={reduce} />

              <div className="min-w-0">
                <span className="block truncate text-[13px] font-semibold leading-5 text-foreground">{s.name}</span>
                <Badge variant="outline" className={cn("mt-1 gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em]", STATE[s.state].badge)}>
                  {s.state === "ok" ? <CheckCircle2 className="size-3" aria-hidden /> : s.state === "degraded" ? <AlertTriangle className="size-3" aria-hidden /> : <XCircle className="size-3" aria-hidden />}
                  {STATE[s.state].label}
                </Badge>
              </div>

              <span className="text-right font-mono text-[12px] font-semibold tabular-nums text-foreground sm:text-center">
                <span className="hidden text-muted-foreground sm:inline">latency </span>
                {s.state === "down" ? "—" : `${s.latencyMs}ms`}
              </span>

              <div className="hidden sm:block" aria-hidden>
                <div className="flex h-6 items-end gap-[2px]">
                  {Array.from({ length: 28 }, (_, b) => {
                    const bad = s.state !== "ok" && b > 21
                    return (
                      <span
                        key={b}
                        className={cn(
                          "w-1 flex-1 rounded-sm",
                          bad
                            ? s.state === "down"
                              ? "bg-destructive/70"
                              : "bg-warning/75"
                            : "bg-foreground/20",
                        )}
                        style={{ height: `${28 + ((b * 37) % 56)}%` }}
                      />
                    )
                  })}
                </div>
                <span className="mt-1 block text-right font-mono text-[10px] font-medium tabular-nums tracking-wide text-muted-foreground">90d · {s.uptime90d.toFixed(2)}%</span>
              </div>
            </motion.li>
          ))}
        </ul>
        <div className="border-t bg-muted/20 px-4 py-2.5 font-mono text-[11px] font-medium tracking-wide text-muted-foreground sm:px-5">
          Uptime is trailing 90 days · Latency is last-minute median
        </div>
      </div>
    
  </div>
</section>
  )
}
