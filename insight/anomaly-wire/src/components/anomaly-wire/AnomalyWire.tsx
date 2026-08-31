import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { AlertTriangle, AlertCircle, ChevronDown, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"

export type Anomaly = { id: string; at: string; severity: "critical" | "warn"; signal: string; metric: string; value: string }

export type AnomalyWireProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  anomalies?: Anomaly[]
  className?: string
}

const DEFAULTS: Anomaly[] = [
  { id: "a1", at: "09:41", severity: "critical", signal: "Checkout conversion dropped 38% vs 7-day floor", metric: "checkout.conv", value: "1.9% (floor 3.1%)" },
  { id: "a2", at: "09:12", severity: "warn", signal: "p95 latency drifting up on /search", metric: "api.p95", value: "820ms (+34%)" },
  { id: "a3", at: "08:57", severity: "warn", signal: "Signup source mix shifted: paid → organic", metric: "signup.mix", value: "-22pp paid" },
]

const SEV: Record<Anomaly["severity"], { label: string; icon: typeof AlertTriangle; chip: string; dot: string }> = {
  critical: {
    label: "Critical",
    icon: AlertTriangle,
    chip: "border-destructive/20 bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
  warn: {
    label: "Warning",
    icon: AlertCircle,
    chip: "border-warning/20 bg-warning-muted text-warning-foreground",
    dot: "bg-warning",
  },
}

export function AnomalyWire({
  eyebrow = "ANOMALY WIRE · LAST HOUR",
  title = "Anomaly feed — last 60 minutes",
  subtitle = "Thresholds compare to 7-day baselines. Expand any row for detector context.",
  anomalies = DEFAULTS,
  className,
}: AnomalyWireProps) {
  const [open, setOpen] = React.useState<string | null>(null)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  return (
    <SectionShell width={920} className={className}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <MonoLabel className="text-muted-foreground">{eyebrow}</MonoLabel>
          <h2 className="mt-3 font-display text-[28px] font-semibold leading-[1.05] tracking-[-0.022em] text-foreground sm:text-[34px]">{title}</h2>
          <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{subtitle}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground shadow-sm">
          <span className="relative flex size-2">
            <span className={cn("absolute inline-flex size-2 animate-ping rounded-full opacity-40", reduce ? "hidden" : "bg-success")} />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          Live · {anomalies.length} signals · 41 metrics watched
        </div>
      </div>

      <ul className="mt-8 space-y-3" aria-label="Anomaly feed">
        {anomalies.map((a, i) => {
          const S = SEV[a.severity]
          const Icon = S.icon
          const isOpen = open === a.id
          return (
            <motion.li
              key={a.id}
              initial={reduce ? undefined : { opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden rounded-xl border bg-card shadow-sm"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`anomaly-${a.id}`}
                onClick={() => setOpen(isOpen ? null : a.id)}
                className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-5"
              >
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-full border", S.chip)}>
                  <Icon className="size-4" aria-hidden />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={cn("size-1.5 rounded-full", S.dot)} aria-hidden />
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{S.label}</span>
                    <span className="hidden items-center gap-1 font-mono text-[11px] text-muted-foreground sm:inline-flex">
                      <Clock className="size-3" aria-hidden /> {a.at}
                    </span>
                  </span>
                  <span className="mt-1 block truncate text-[14px] font-semibold leading-5 text-foreground">{a.signal}</span>
                  <span className="font-mono text-[11px] font-medium tracking-wide text-muted-foreground">{a.metric}</span>
                </span>

                <span className="hidden shrink-0 items-center gap-3 sm:flex">
                  <span className="rounded-full border bg-muted px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums text-foreground">{a.value}</span>
                  <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", isOpen && "rotate-180 text-foreground")} aria-hidden />
                </span>
                <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground sm:hidden", isOpen && "rotate-180 text-foreground")} aria-hidden />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`anomaly-${a.id}`}
                    initial={reduce ? undefined : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduce ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden border-t border-dashed bg-muted/20"
                  >
                    <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
                      <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                        <span className="rounded bg-background px-2 py-1 font-semibold text-foreground shadow-sm">{a.metric} · {a.value}</span>
                        <span className="text-muted-foreground">7-day baseline · seasonal-adjusted · detector v3</span>
                      </div>
                      <div className="ml-auto flex gap-2">
                        <button type="button" className="rounded-full bg-foreground px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-background shadow-sm transition-colors hover:bg-foreground/90">
                          Acknowledge
                        </button>
                        <button type="button" className="rounded-full border bg-background px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-muted">
                          Assign
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          )
        })}
      </ul>

      {/* polite live region — only announces count, not the whole list */}
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {anomalies.length} anomalies shown, {anomalies.filter((a) => a.severity === "critical").length} critical.
      </p>
    </SectionShell>
  )
}
