import * as React from "react"
import { Activity, CircleCheck, RefreshCw, TriangleAlert, Wrench } from "lucide-react"
import Noise from "@/components/primitives/noise"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type ServiceStatus = "operational" | "degraded" | "outage" | "maintenance"

export type StatusService = {
  name: string
  /** Optional explicit uptime percentage; defaults are derived from history. */
  uptime?: string
  status?: ServiceStatus
  /** 45-day history as "1" (ok) or "0" (incident), oldest first. Defaults to a deterministic healthy bar. */
  history?: string
  note?: string
}

export type StatusIncident = {
  date: string
  title: string
  duration: string
  resolved?: boolean
}

export type StatusBoardProps = {
  eyebrow?: string
  /** Headline of the overall banner, e.g. "All systems operational". */
  headline?: string
  description?: string
  services?: StatusService[]
  incidents?: StatusIncident[]
  /** Label of the refresh hint in the banner, e.g. "Checked 12s ago". */
  refreshLabel?: string
  tone?: "paper" | "ink"
  className?: string
}

// ── StatusBoard ──────────────────────────────────────────────────────────────
// Design decisions (hand-tuned):
// · JOB: prove reliability · EMOTION: calm confidence.
// · SIGNATURE: the 45-day uptime bar per service — hairline day cells (2px
//   rounded sticks) rendered like a printed seismograph; incidents are the
//   only marks that break the rhythm. A status is legible from across the
//   room.
// · The overall banner carries a breathing beacon + live refresh hint; the
//   incident ledger below reads like a maintenance log with mono timestamps.
// · Status accents are token-safe: operational uses foreground ticks, trouble
//   states use destructive — never raw greens/reds that break dark mode.
export function StatusBoard({
  eyebrow = "System status",
  headline,
  description,
  services,
  incidents,
  refreshLabel = "Checked 12s ago",
  tone = "paper",
  className,
}: StatusBoardProps) {
  const ink = tone === "ink"

  const list: StatusService[] = services ?? [
    { name: "Booking engine", history: "111110111111111111111111111111111111111111111", note: "99.98% uptime" },
    { name: "Payments", status: "degraded", history: "111111111111111111111011111111111111111111011", note: "Elevated latency" },
    { name: "Notifications", history: "111111111111111111111111111111111111111111111", note: "99.99% uptime" },
    { name: "Dashboard", history: "111111111111111111111111111111111111111111111", note: "99.99% uptime" },
  ]
  const worst = list.some((s) => (s.status ?? "operational") === "outage")
    ? "outage"
    : list.some((s) => (s.status ?? "operational") === "degraded" || (s.status ?? "operational") === "maintenance")
      ? list.find((s) => s.status === "maintenance")
        ? "maintenance"
        : "degraded"
      : "operational"
  const defaultHeadline =
    worst === "outage" ? "Partial outage — we're on it" : worst === "degraded" ? "Degraded performance" : worst === "maintenance" ? "Scheduled maintenance underway" : "All systems operational"

  const bannerCls =
    worst === "operational"
      ? cn("border", ink ? "border-background/20 bg-background/[0.04]" : "border-border bg-secondary/50")
      : "border border-destructive/30 bg-destructive/10"

  return (
    <section
      className={cn(ink && "bg-foreground", "relative isolate w-full overflow-hidden", className)}
      aria-label={headline ?? defaultHeadline}
    >
      <Noise patternAlpha={ink ? 12 : 6} patternSize={240} patternRefreshInterval={3} />

      <div className="relative mx-auto w-full max-w-[920px] px-4 py-20 sm:px-6 sm:py-24">
        {(eyebrow || refreshLabel) && (
          <div className="flex items-center justify-between gap-4">
            <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", ink ? "text-background/55" : "text-muted-foreground")}>
              <span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />
              {eyebrow}
            </span>
            <span className={cn("font-mono text-[10px] font-bold uppercase tracking-[0.18em]", ink ? "text-background/40" : "text-muted-foreground/70")}>
              {refreshLabel}
            </span>
          </div>
        )}

        {/* overall banner */}
        <InView
          variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          viewOptions={{ once: true, margin: "-60px" }}
        >
          <div className={cn("mt-6 flex flex-wrap items-center gap-4 rounded-2xl border px-6 py-5", bannerCls)}>
            <span aria-hidden className={cn("relative flex size-2.5 shrink-0", worst === "operational" ? (ink ? "text-background" : "text-foreground") : "text-destructive")}>
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex size-2.5 rounded-full bg-current" />
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn("font-display text-lg font-extrabold tracking-[-0.02em]", ink ? "text-background" : "text-foreground")}>
                {headline ?? defaultHeadline}
              </p>
              {description && (
                <p className={cn("mt-1 text-sm font-medium", worst === "operational" ? (ink ? "text-background/55" : "text-muted-foreground") : "text-destructive/80")}>
                  {description}
                </p>
              )}
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em]",
                worst === "operational" ? (ink ? "border-background/15 text-background/60" : "border-border text-muted-foreground") : "border-destructive/30 text-destructive",
              )}
            >
              {worst === "operational" ? <CircleCheck className="size-3" aria-hidden /> : worst === "maintenance" ? <Wrench className="size-3" aria-hidden /> : <Activity className="size-3" aria-hidden />}
              {worst === "operational" ? "stable" : worst === "maintenance" ? "in progress" : "watching"}
            </span>
          </div>
        </InView>

        {/* service ledger */}
        <div className="mt-10">
          <div className={cn("flex items-baseline justify-between border-b pb-3", ink ? "border-background/10" : "border-border")}>
            <p className={cn("font-mono text-[10px] font-bold uppercase tracking-[0.2em]", ink ? "text-background/45" : "text-muted-foreground")}>Service</p>
            <p className={cn("font-mono text-[10px] font-bold uppercase tracking-[0.2em]", ink ? "text-background/45" : "text-muted-foreground")}>Uptime — last 45 days</p>
          </div>
          <ul>
            {list.map((s, i) => (
              <InView
                key={s.name}
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                viewOptions={{ once: true, margin: "-40px" }}
              >
                <li className={cn("flex flex-col gap-3 border-b py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8", ink ? "border-background/[0.08]" : "border-border/60")}>
                  <div className="min-w-0 sm:w-56 sm:shrink-0">
                    <p className={cn("text-sm font-bold", ink ? "text-background" : "text-foreground")}>{s.name}</p>
                    {s.note && <p className={cn("mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em]", ink ? "text-background/40" : "text-muted-foreground/80")}>{s.note}</p>}
                  </div>
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    {/* the seismograph */}
                    <div className="flex min-w-0 flex-1 items-end gap-[3px]" aria-hidden>
                      {(s.history ?? deterministicHistory(s.name)).split("").slice(-45).map((d, j) => (
                        <span
                          key={j}
                          className={cn(
                            "h-4 w-full max-w-[6px] flex-1 rounded-[1px] transition-opacity",
                            d === "0"
                              ? "bg-destructive"
                              : (s.status ?? "operational") === "degraded" && j === (s.history ?? deterministicHistory(s.name)).length - 1
                                ? "bg-destructive/50"
                                : ink
                                  ? "bg-background/35"
                                  : "bg-foreground/70",
                          )}
                        />
                      ))}
                    </div>
                    <StatusPill status={s.status ?? "operational"} ink={ink} />
                  </div>
                </li>
              </InView>
            ))}
          </ul>
        </div>

        {/* incident log */}
        {incidents && incidents.length > 0 && (
          <div className="mt-12">
            <p className={cn("font-mono text-[10px] font-bold uppercase tracking-[0.2em]", ink ? "text-background/45" : "text-muted-foreground")}>Past incidents</p>
            <ul className="mt-4">
              {incidents.map((inc, i) => (
                <li
                  key={i}
                  className={cn(
                    "flex flex-col gap-1 rounded-xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6",
                    i > 0 && "mt-2",
                    ink ? "border-background/10 bg-background/[0.03]" : "border-border bg-card",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className={cn("mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full", inc.resolved === false ? "bg-destructive/15 text-destructive" : ink ? "bg-background/10 text-background/70" : "bg-secondary text-muted-foreground")}>
                      {inc.resolved === false ? <TriangleAlert className="size-3" aria-hidden /> : <CircleCheck className="size-3" aria-hidden />}
                    </span>
                    <div>
                      <p className={cn("text-sm font-bold", ink ? "text-background" : "text-foreground")}>{inc.title}</p>
                      <p className={cn("mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em]", ink ? "text-background/40" : "text-muted-foreground/80")}>
                        {inc.date} · {inc.duration}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "w-fit shrink-0 rounded-full px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em]",
                      inc.resolved === false ? "bg-destructive/15 text-destructive" : ink ? "bg-background/10 text-background/60" : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {inc.resolved === false ? "monitoring" : "resolved"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className={cn("mt-12 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em]", ink ? "text-background/35" : "text-muted-foreground/60")}>
          <RefreshCw className="size-3" aria-hidden />
          end of status log
        </p>
      </div>
    </section>
  )
}

// ── StatusPill ───────────────────────────────────────────────────────────────
function StatusPill({ status, ink }: { status: ServiceStatus; ink: boolean }) {
  const map: Record<ServiceStatus, { label: string; cls: string }> = {
    operational: { label: "Operational", cls: ink ? "bg-background/10 text-background/70" : "bg-secondary text-muted-foreground" },
    degraded: { label: "Degraded", cls: "bg-destructive/15 text-destructive" },
    outage: { label: "Outage", cls: "bg-destructive text-primary-foreground" },
    maintenance: { label: "Maintenance", cls: ink ? "bg-background/15 text-background/80" : "bg-foreground/85 text-background" },
  }
  return (
    <span className={cn("w-fit shrink-0 rounded-full px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em]", map[status].cls)}>
      {map[status].label}
    </span>
  )
}

// deterministic pseudo-history so SSR/CSR agree — no Math.random
function deterministicHistory(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  const cells: string[] = []
  for (let i = 0; i < 45; i++) {
    h = (h * 1103515245 + 12345) >>> 0
    cells.push(i === 12 || (h % 97 === 0 && i > 2) ? "0" : "1")
  }
  return cells.join("")
}
